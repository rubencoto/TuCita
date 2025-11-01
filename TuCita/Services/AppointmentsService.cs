using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.Appointments;
using Microsoft.Extensions.Logging;

namespace TuCita.Services;

public interface IAppointmentsService
{
    Task<IEnumerable<CitaDto>> GetAppointmentsByPatientAsync(long pacienteId);
    Task<CitaDto?> CreateAppointmentAsync(long pacienteId, CreateAppointmentRequest request);
    Task<bool> CancelAppointmentAsync(long citaId, long usuarioId);
    Task<bool> UpdateAppointmentAsync(long citaId, long usuarioId, UpdateAppointmentRequest request);
    Task<CitaDto?> RescheduleAppointmentAsync(long citaId, long usuarioId, long newTurnoId);
}

public class AppointmentsService : IAppointmentsService
{
    private readonly TuCitaDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<AppointmentsService> _logger;

    public AppointmentsService(
        TuCitaDbContext context,
        IEmailService emailService,
        ILogger<AppointmentsService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<IEnumerable<CitaDto>> GetAppointmentsByPatientAsync(long pacienteId)
    {
        try
        {
            var citas = await _context.Citas
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .Where(c => c.PacienteId == pacienteId)
                .OrderByDescending(c => c.Inicio)
                .ToListAsync();

            return citas.Select(c => new CitaDto
            {
                Id = c.Id,
                MedicoId = c.MedicoId,
                NombreMedico = c.Medico?.Usuario != null 
                    ? $"Dr. {c.Medico.Usuario.Nombre} {c.Medico.Usuario.Apellido}" 
                    : "Médico no disponible",
                Especialidad = c.Medico?.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre ?? "General",
                DireccionMedico = c.Medico?.Direccion,
                Inicio = c.Inicio,
                Fin = c.Fin,
                Estado = c.Estado.ToString(),
                Motivo = c.Motivo
            }).ToList();
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            Console.WriteLine($"Error en GetAppointmentsByPatientAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<CitaDto?> CreateAppointmentAsync(long pacienteId, CreateAppointmentRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            Console.WriteLine($"?? [1/7] Buscando turno: TurnoId={request.TurnoId}");
            
            // Verificar que el turno existe y está disponible
            // NO validamos MedicoId porque request.DoctorId es el UsuarioId, no el MedicoId del turno
            var turno = await _context.AgendaTurnos
                .Include(t => t.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(t => t.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(t => t.Id == request.TurnoId && 
                                         t.Estado == EstadoTurno.DISPONIBLE);

            if (turno == null)
            {
                Console.WriteLine($"? [2/7] Turno no encontrado o no disponible: TurnoId={request.TurnoId}");
                
                // Debug adicional: verificar si existe pero no está disponible
                var turnoExists = await _context.AgendaTurnos
                    .Where(t => t.Id == request.TurnoId)
                    .Select(t => new { t.Id, t.Estado, t.MedicoId })
                    .FirstOrDefaultAsync();
                
                if (turnoExists != null)
                {
                    Console.WriteLine($"?? [2/7] El turno existe pero está en estado: {turnoExists.Estado}");
                    Console.WriteLine($"?? [2/7] MedicoId del turno: {turnoExists.MedicoId}");
                }
                else
                {
                    Console.WriteLine($"?? [2/7] El turno con Id={request.TurnoId} NO EXISTE en la base de datos");
                }
                
                return null;
            }

            Console.WriteLine($"? [2/7] Turno encontrado: MedicoId={turno.MedicoId}, Estado={turno.Estado}");
            Console.WriteLine($"?? [3/7] Validando DoctorId: request.DoctorId={request.DoctorId}, turno.Medico.UsuarioId={turno.Medico?.UsuarioId}");

            // Verificar que el DoctorId del request coincide con el Usuario del médico del turno
            if (turno.Medico == null)
            {
                Console.WriteLine($"? [3/7] El turno no tiene médico asociado (Medico is null)");
                return null;
            }

            if (turno.Medico.UsuarioId != request.DoctorId)
            {
                Console.WriteLine($"? [3/7] El turno pertenece al doctor con UsuarioId={turno.Medico.UsuarioId}, pero se solicitó DoctorId={request.DoctorId}");
                Console.WriteLine($"?? [3/7] Médico del turno: {turno.Medico.Usuario?.Nombre} {turno.Medico.Usuario?.Apellido}");
                return null;
            }

            Console.WriteLine($"? [3/7] Doctor validado correctamente");

            // Crear la cita
            var cita = new Cita
            {
                TurnoId = turno.Id,
                MedicoId = turno.MedicoId, // Usar el MedicoId del turno
                PacienteId = pacienteId,
                Estado = EstadoCita.PENDIENTE,
                Motivo = request.Motivo,
                Inicio = turno.Inicio,
                Fin = turno.Fin,
                CreadoPor = pacienteId,
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.Citas.Add(cita);
            Console.WriteLine($"?? [4/7] Cita creada en memoria: TurnoId={cita.TurnoId}, MedicoId={cita.MedicoId}, PacienteId={cita.PacienteId}");

            // Actualizar el estado del turno
            turno.Estado = EstadoTurno.RESERVADO;
            turno.ActualizadoEn = DateTime.UtcNow;
            Console.WriteLine($"?? [5/7] Turno marcado como RESERVADO");

            await _context.SaveChangesAsync();
            Console.WriteLine($"?? [6/7] Cambios guardados en BD");
            
            await transaction.CommitAsync();
            Console.WriteLine($"? [7/7] Transacción completada exitosamente: CitaId={cita.Id}");

            // ?? Enviar notificación de cita creada (directo por email, sin BD)
            try
            {
                _logger.LogInformation("?? Enviando email de cita creada: CitaId={CitaId}", cita.Id);
                
                var paciente = await _context.Usuarios.FindAsync(cita.PacienteId);
                var medico = turno.Medico.Usuario;
                var especialidad = turno.Medico.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre ?? "General";
                
                if (paciente != null)
                {
                    await _emailService.EnviarCitaCreadaAsync(
                        paciente.Email,
                        $"{paciente.Nombre} {paciente.Apellido}",
                        $"{medico.Nombre} {medico.Apellido}",
                        cita.Inicio,
                        cita.Motivo ?? "Consulta general",
                        especialidad
                    );
                }
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "? Error al enviar email para CitaId={CitaId}", cita.Id);
                // No fallar la creación de la cita por error en email
            }

            return new CitaDto
            {
                Id = cita.Id,
                MedicoId = cita.MedicoId,
                NombreMedico = turno.Medico?.Usuario != null 
                    ? $"Dr. {turno.Medico.Usuario.Nombre} {turno.Medico.Usuario.Apellido}" 
                    : "Médico no disponible",
                Especialidad = turno.Medico?.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre ?? "General",
                DireccionMedico = turno.Medico?.Direccion,
                Inicio = cita.Inicio,
                Fin = cita.Fin,
                Estado = cita.Estado.ToString(),
                Motivo = cita.Motivo
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"? Error en CreateAppointmentAsync: {ex.Message}");
            Console.WriteLine($"?? StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"?? Inner Exception: {ex.InnerException.Message}");
            }
            return null;
        }
    }

    public async Task<bool> CancelAppointmentAsync(long citaId, long usuarioId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var cita = await _context.Citas
                .Include(c => c.Turno)
                .FirstOrDefaultAsync(c => c.Id == citaId && c.PacienteId == usuarioId);

            if (cita == null || cita.Estado == EstadoCita.CANCELADA)
                return false;

            // Actualizar estado de la cita
            cita.Estado = EstadoCita.CANCELADA;
            cita.ActualizadoEn = DateTime.UtcNow;

            // Liberar el turno
            if (cita.Turno != null)
            {
                cita.Turno.Estado = EstadoTurno.DISPONIBLE;
                cita.Turno.ActualizadoEn = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // ?? Enviar email de cancelación (directo, sin BD)
            try
            {
                _logger.LogInformation("?? Enviando email de cita cancelada: CitaId={CitaId}", citaId);
                
                await _context.Entry(cita).Reference(c => c.Paciente).LoadAsync();
                await _context.Entry(cita.Paciente).Reference(p => p.Usuario).LoadAsync();
                await _context.Entry(cita).Reference(c => c.Medico).LoadAsync();
                await _context.Entry(cita.Medico).Reference(m => m.Usuario).LoadAsync();
                await _context.Entry(cita.Medico).Collection(m => m.EspecialidadesMedico).LoadAsync();
                
                var paciente = cita.Paciente.Usuario;
                var medico = cita.Medico.Usuario;
                var especialidad = cita.Medico.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre ?? "General";
                
                await _emailService.EnviarCitaCanceladaAsync(
                    paciente.Email,
                    $"{paciente.Nombre} {paciente.Apellido}",
                    $"{medico.Nombre} {medico.Apellido}",
                    cita.Inicio,
                    especialidad
                );
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "? Error al enviar email de cancelación para CitaId={CitaId}", citaId);
            }

            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"Error en CancelAppointmentAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return false;
        }
    }

    public async Task<bool> UpdateAppointmentAsync(long citaId, long usuarioId, UpdateAppointmentRequest request)
    {
        try
        {
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == citaId && c.PacienteId == usuarioId);

            if (cita == null)
                return false;

            if (!string.IsNullOrEmpty(request.Estado) && Enum.TryParse<EstadoCita>(request.Estado, out var nuevoEstado))
            {
                cita.Estado = nuevoEstado;
            }

            if (!string.IsNullOrEmpty(request.Motivo))
            {
                cita.Motivo = request.Motivo;
            }

            cita.ActualizadoEn = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en UpdateAppointmentAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return false;
        }
    }

    public async Task<CitaDto?> RescheduleAppointmentAsync(long citaId, long usuarioId, long newTurnoId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            Console.WriteLine($"?? [1/9] Iniciando reagendamiento: CitaId={citaId}, UsuarioId={usuarioId}, NewTurnoId={newTurnoId}");

            // 1. Buscar la cita actual
            var citaActual = await _context.Citas
                .Include(c => c.Turno)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(c => c.Id == citaId && c.PacienteId == usuarioId);

            if (citaActual == null)
            {
                Console.WriteLine($"? [2/9] Cita no encontrada o no pertenece al usuario");
                return null;
            }

            Console.WriteLine($"? [2/9] Cita actual encontrada: TurnoId={citaActual.TurnoId}, Estado={citaActual.Estado}");

            // 2. Verificar que la cita no esté ya cancelada o completada
            if (citaActual.Estado == EstadoCita.CANCELADA || citaActual.Estado == EstadoCita.ATENDIDA)
            {
                Console.WriteLine($"? [3/9] No se puede reagendar una cita en estado {citaActual.Estado}");
                return null;
            }

            Console.WriteLine($"? [3/9] Estado de la cita válido para reagendamiento");

            // 3. Buscar el nuevo turno
            var nuevoTurno = await _context.AgendaTurnos
                .Include(t => t.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(t => t.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(t => t.Id == newTurnoId && 
                                         t.Estado == EstadoTurno.DISPONIBLE);

            if (nuevoTurno == null)
            {
                Console.WriteLine($"? [4/9] Nuevo turno no encontrado o no disponible");
                return null;
            }

            Console.WriteLine($"? [4/9] Nuevo turno encontrado y disponible");

            // 4. Verificar que el nuevo turno pertenece al mismo médico
            if (nuevoTurno.MedicoId != citaActual.MedicoId)
            {
                Console.WriteLine($"? [5/9] El nuevo turno no pertenece al mismo médico");
                return null;
            }

            Console.WriteLine($"? [5/9] El nuevo turno pertenece al mismo médico");

            // 5. Liberar el turno anterior
            if (citaActual.Turno != null)
            {
                citaActual.Turno.Estado = EstadoTurno.DISPONIBLE;
                citaActual.Turno.ActualizadoEn = DateTime.UtcNow;
                Console.WriteLine($"?? [6/9] Turno anterior liberado: TurnoId={citaActual.TurnoId}");
            }

            // 6. Reservar el nuevo turno
            nuevoTurno.Estado = EstadoTurno.RESERVADO;
            nuevoTurno.ActualizadoEn = DateTime.UtcNow;
            Console.WriteLine($"?? [7/9] Nuevo turno reservado: TurnoId={newTurnoId}");

            // 7. Actualizar la cita con el nuevo turno
            citaActual.TurnoId = newTurnoId;
            citaActual.Inicio = nuevoTurno.Inicio;
            citaActual.Fin = nuevoTurno.Fin;
            citaActual.Estado = EstadoCita.CONFIRMADA; // Cambiado a CONFIRMADA en lugar de REPROGRAMADA
            citaActual.ActualizadoEn = DateTime.UtcNow;

            Console.WriteLine($"?? [8/9] Cita actualizada con nuevo turno");

            // 8. Guardar cambios
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            Console.WriteLine($"? [9/9] Reagendamiento completado exitosamente");

            // ?? Enviar email de cita reprogramada (directo, sin BD)
            try
            {
                _logger.LogInformation("?? Enviando email de cita reprogramada: CitaId={CitaId}", citaId);
                
                await _context.Entry(citaActual).Reference(c => c.Paciente).LoadAsync();
                await _context.Entry(citaActual.Paciente).Reference(p => p.Usuario).LoadAsync();
                
                var paciente = citaActual.Paciente.Usuario;
                var medico = citaActual.Medico.Usuario;
                var especialidad = citaActual.Medico.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre ?? "General";
                
                // Usar la fecha del turno anterior guardada
                var fechaAnterior = citaActual.Turno?.Inicio ?? citaActual.Inicio;
                
                await _emailService.EnviarCitaReprogramadaAsync(
                    paciente.Email,
                    $"{paciente.Nombre} {paciente.Apellido}",
                    $"{medico.Nombre} {medico.Apellido}",
                    fechaAnterior,
                    citaActual.Inicio,
                    especialidad
                );
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "? Error al enviar email de reprogramación para CitaId={CitaId}", citaId);
            }

            // 9. Retornar la cita actualizada
            return new CitaDto
            {
                Id = citaActual.Id,
                MedicoId = citaActual.MedicoId,
                NombreMedico = citaActual.Medico?.Usuario != null 
                    ? $"Dr. {citaActual.Medico.Usuario.Nombre} {citaActual.Medico.Usuario.Apellido}" 
                    : "Médico no disponible",
                Especialidad = citaActual.Medico?.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre ?? "General",
                DireccionMedico = citaActual.Medico?.Direccion,
                Inicio = citaActual.Inicio,
                Fin = citaActual.Fin,
                Estado = citaActual.Estado.ToString(),
                Motivo = citaActual.Motivo
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"? Error en RescheduleAppointmentAsync: {ex.Message}");
            Console.WriteLine($"?? StackTrace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"?? Inner Exception: {ex.InnerException.Message}");
            }
            return null;
        }
    }
}