using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.DTOs.Admin;
using TuCita.Models;
using TuCita.Services;

namespace TuCita.Services;

/// <summary>
/// Interface para el servicio de gestión de citas desde el panel de administración
/// </summary>
public interface IAdminCitasService
{
    /// <summary>
    /// Busca pacientes por nombre, email o identificación
    /// </summary>
    Task<List<PacienteSearchDto>> SearchPacientesAsync(string search);

    /// <summary>
    /// Obtiene todos los doctores con sus especialidades
    /// </summary>
    Task<List<DoctorConEspecialidadDto>> GetDoctoresAsync();

    /// <summary>
    /// Obtiene doctores filtrados por especialidad
    /// </summary>
    Task<List<DoctorConEspecialidadDto>> GetDoctoresByEspecialidadAsync(int especialidadId);

    /// <summary>
    /// Obtiene slots disponibles de un doctor para una fecha específica
    /// </summary>
    Task<List<SlotDisponibleDto>> GetSlotsDisponiblesAsync(long medicoId, DateTime fecha);

    /// <summary>
    /// Crea una nueva cita desde el panel de administración
    /// </summary>
    Task<CitaCreadaDto> CreateCitaAsync(CreateCitaAdminRequest request, long adminUserId);

    /// <summary>
    /// Obtiene todas las citas con filtros y paginación
    /// </summary>
    Task<CitasPaginadasDto> GetCitasPaginadasAsync(CitasFilterDto filtros);

    /// <summary>
    /// Actualiza el estado de una cita
    /// </summary>
    Task<bool> UpdateEstadoCitaAsync(long citaId, UpdateEstadoCitaRequest request, long adminUserId);

    /// <summary>
    /// Elimina (cancela) una cita
    /// </summary>
    Task<bool> DeleteCitaAsync(long citaId, long adminUserId);

    /// <summary>
    /// Obtiene detalle completo de una cita
    /// </summary>
    Task<AdminCitaListDto?> GetCitaDetalleAsync(long citaId);
}

/// <summary>
/// Servicio para gestionar citas desde el panel de administración
/// </summary>
public class AdminCitasService : IAdminCitasService
{
    private readonly TuCitaDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<AdminCitasService> _logger;

    public AdminCitasService(
        TuCitaDbContext context,
        IEmailService emailService,
        ILogger<AdminCitasService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Busca pacientes por nombre, email o identificación
    /// </summary>
    public async Task<List<PacienteSearchDto>> SearchPacientesAsync(string search)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(search) || search.Length < 2)
                return new List<PacienteSearchDto>();

            var searchLower = search.ToLower();

            var pacientes = await _context.PerfilesPacientes
                .Include(p => p.Usuario)
                .Where(p => p.Usuario.Activo && (
                    p.Usuario.Nombre.ToLower().Contains(searchLower) ||
                    p.Usuario.Apellido.ToLower().Contains(searchLower) ||
                    p.Usuario.Email.ToLower().Contains(searchLower) ||
                    (p.Identificacion != null && p.Identificacion.Contains(search))
                ))
                .Take(10)
                .Select(p => new PacienteSearchDto
                {
                    Id = p.UsuarioId,
                    Nombre = p.Usuario.Nombre,
                    Apellido = p.Usuario.Apellido,
                    Email = p.Usuario.Email,
                    Telefono = p.Usuario.Telefono,
                    Identificacion = p.Identificacion
                })
                .ToListAsync();

            return pacientes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al buscar pacientes con término: {Search}", search);
            throw;
        }
    }

    /// <summary>
    /// Obtiene todos los doctores activos con sus especialidades
    /// </summary>
    public async Task<List<DoctorConEspecialidadDto>> GetDoctoresAsync()
    {
        try
        {
            var doctores = await _context.PerfilesMedicos
                .Include(pm => pm.Usuario)
                .Include(pm => pm.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
                .Where(pm => pm.Usuario.Activo)
                .Select(pm => new DoctorConEspecialidadDto
                {
                    Id = pm.UsuarioId,
                    Nombre = pm.Usuario.Nombre,
                    Apellido = pm.Usuario.Apellido,
                    Especialidades = pm.EspecialidadesMedico
                        .Select(me => me.Especialidad.Nombre)
                        .ToList()
                })
                .ToListAsync();

            return doctores;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener doctores");
            throw;
        }
    }

    /// <summary>
    /// Obtiene doctores filtrados por especialidad
    /// </summary>
    public async Task<List<DoctorConEspecialidadDto>> GetDoctoresByEspecialidadAsync(int especialidadId)
    {
        try
        {
            var doctores = await _context.PerfilesMedicos
                .Include(pm => pm.Usuario)
                .Include(pm => pm.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
                .Where(pm => pm.Usuario.Activo && 
                            pm.EspecialidadesMedico.Any(me => me.EspecialidadId == especialidadId))
                .Select(pm => new DoctorConEspecialidadDto
                {
                    Id = pm.UsuarioId,
                    Nombre = pm.Usuario.Nombre,
                    Apellido = pm.Usuario.Apellido,
                    Especialidades = pm.EspecialidadesMedico
                        .Select(me => me.Especialidad.Nombre)
                        .ToList()
                })
                .ToListAsync();

            return doctores;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener doctores por especialidad {EspecialidadId}", especialidadId);
            throw;
        }
    }

    /// <summary>
    /// Obtiene slots disponibles de un doctor para una fecha específica
    /// </summary>
    public async Task<List<SlotDisponibleDto>> GetSlotsDisponiblesAsync(long medicoId, DateTime fecha)
    {
        try
        {
            var fechaInicio = fecha.Date;
            var fechaFin = fechaInicio.AddDays(1);

            var slots = await _context.AgendaTurnos
                .Where(t => t.MedicoId == medicoId &&
                           t.Inicio >= fechaInicio &&
                           t.Inicio < fechaFin &&
                           t.Estado == EstadoTurno.DISPONIBLE)
                .OrderBy(t => t.Inicio)
                .Select(t => new SlotDisponibleDto
                {
                    TurnoId = t.Id,
                    Inicio = t.Inicio,
                    Fin = t.Fin
                })
                .ToListAsync();

            return slots;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener slots disponibles para médico {MedicoId} en fecha {Fecha}", 
                medicoId, fecha);
            throw;
        }
    }

    /// <summary>
    /// Crea una nueva cita desde el panel de administración
    /// </summary>
    public async Task<CitaCreadaDto> CreateCitaAsync(CreateCitaAdminRequest request, long adminUserId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // 1. Validar que el paciente existe y está activo
            var paciente = await _context.PerfilesPacientes
                .Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.UsuarioId == request.PacienteId);

            if (paciente == null || !paciente.Usuario.Activo)
                throw new InvalidOperationException("Paciente no encontrado o inactivo");

            // 2. Validar que el médico existe y está activo
            var medico = await _context.PerfilesMedicos
                .Include(m => m.Usuario)
                .FirstOrDefaultAsync(m => m.UsuarioId == request.MedicoId);

            if (medico == null || !medico.Usuario.Activo)
                throw new InvalidOperationException("Médico no encontrado o inactivo");

            // 3. Validar que el turno existe y está disponible
            var turno = await _context.AgendaTurnos
                .FirstOrDefaultAsync(t => t.Id == request.TurnoId && 
                                         t.MedicoId == request.MedicoId);

            if (turno == null)
                throw new InvalidOperationException("Turno no encontrado");

            if (turno.Estado != EstadoTurno.DISPONIBLE)
                throw new InvalidOperationException("El turno no está disponible");

            // 4. Crear la cita
            var cita = new Cita
            {
                TurnoId = turno.Id,
                MedicoId = request.MedicoId,
                PacienteId = request.PacienteId,
                Estado = EstadoCita.CONFIRMADA, // Admin crea citas confirmadas directamente
                Motivo = request.Motivo,
                Inicio = turno.Inicio,
                Fin = turno.Fin,
                CreadoPor = adminUserId,
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.Citas.Add(cita);

            // 5. Actualizar estado del turno
            turno.Estado = EstadoTurno.RESERVADO;
            turno.ActualizadoEn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // 6. Guardar notas internas si existen (como nota clínica)
            if (!string.IsNullOrWhiteSpace(request.NotasInternas))
            {
                var notaInterna = new NotaClinica
                {
                    CitaId = cita.Id,
                    Nota = $"[NOTA ADMINISTRATIVA] {request.NotasInternas}",
                    CreadoEn = DateTime.UtcNow
                };
                _context.NotasClinicas.Add(notaInterna);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            // 7. Enviar email de confirmación si está habilitado
            bool emailEnviado = false;
            if (request.EnviarEmail)
            {
                try
                {
                    // Obtener la primera especialidad del médico
                    var especialidad = await _context.MedicosEspecialidades
                        .Include(me => me.Especialidad)
                        .Where(me => me.MedicoId == request.MedicoId)
                        .Select(me => me.Especialidad.Nombre)
                        .FirstOrDefaultAsync() ?? "General";

                    emailEnviado = await _emailService.EnviarCitaCreadaAsync(
                        paciente.Usuario.Email,
                        $"{paciente.Usuario.Nombre} {paciente.Usuario.Apellido}",
                        $"Dr. {medico.Usuario.Nombre} {medico.Usuario.Apellido}",
                        turno.Inicio,
                        request.Motivo ?? "Consulta médica",
                        especialidad
                    );
                    
                    if (emailEnviado)
                    {
                        _logger.LogInformation("Email de confirmación enviado a {Email} para cita {CitaId}",
                            paciente.Usuario.Email, cita.Id);
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Error al enviar email de confirmación para cita {CitaId}", 
                        cita.Id);
                    // No lanzamos excepción, la cita ya fue creada exitosamente
                }
            }

            // 8. Retornar datos de la cita creada
            return new CitaCreadaDto
            {
                CitaId = cita.Id,
                PacienteId = paciente.UsuarioId,
                NombrePaciente = $"{paciente.Usuario.Nombre} {paciente.Usuario.Apellido}",
                MedicoId = medico.UsuarioId,
                NombreMedico = $"Dr. {medico.Usuario.Nombre} {medico.Usuario.Apellido}",
                Inicio = cita.Inicio,
                Fin = cita.Fin,
                Estado = cita.Estado.ToString(),
                Motivo = cita.Motivo,
                EmailEnviado = emailEnviado
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error al crear cita desde admin");
            throw;
        }
    }

    /// <summary>
    /// Obtiene todas las citas con filtros y paginación
    /// </summary>
    public async Task<CitasPaginadasDto> GetCitasPaginadasAsync(CitasFilterDto filtros)
    {
        try
        {
            var query = _context.Citas
                .Include(c => c.Paciente)
                    .ThenInclude(p => p.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .AsQueryable();

            // Aplicar filtros
            if (filtros.FechaDesde.HasValue)
                query = query.Where(c => c.Inicio >= filtros.FechaDesde.Value);

            if (filtros.FechaHasta.HasValue)
                query = query.Where(c => c.Inicio <= filtros.FechaHasta.Value.AddDays(1));

            if (filtros.MedicoId.HasValue)
                query = query.Where(c => c.MedicoId == filtros.MedicoId.Value);

            if (filtros.PacienteId.HasValue)
                query = query.Where(c => c.PacienteId == filtros.PacienteId.Value);

            if (!string.IsNullOrWhiteSpace(filtros.Estado))
            {
                if (Enum.TryParse<EstadoCita>(filtros.Estado.ToUpper(), out var estadoCita))
                    query = query.Where(c => c.Estado == estadoCita);
            }

            if (!string.IsNullOrWhiteSpace(filtros.Busqueda))
            {
                var busquedaLower = filtros.Busqueda.ToLower();
                query = query.Where(c =>
                    c.Paciente.Usuario.Nombre.ToLower().Contains(busquedaLower) ||
                    c.Paciente.Usuario.Apellido.ToLower().Contains(busquedaLower) ||
                    c.Medico.Usuario.Nombre.ToLower().Contains(busquedaLower) ||
                    c.Medico.Usuario.Apellido.ToLower().Contains(busquedaLower) ||
                    (c.Motivo != null && c.Motivo.ToLower().Contains(busquedaLower))
                );
            }

            // Contar total
            var totalRegistros = await query.CountAsync();

            // Calcular paginación
            var skip = (filtros.Pagina - 1) * filtros.TamanoPagina;
            var totalPaginas = (int)Math.Ceiling(totalRegistros / (double)filtros.TamanoPagina);

            // Obtener registros paginados
            var citas = await query
                .OrderByDescending(c => c.Inicio)
                .Skip(skip)
                .Take(filtros.TamanoPagina)
                .Select(c => new AdminCitaListDto
                {
                    Id = c.Id,
                    Paciente = c.Paciente.Usuario.Nombre + " " + c.Paciente.Usuario.Apellido,
                    PacienteId = c.PacienteId,
                    Doctor = "Dr. " + c.Medico.Usuario.Nombre + " " + c.Medico.Usuario.Apellido,
                    MedicoId = c.MedicoId,
                    Especialidad = c.Medico.EspecialidadesMedico
                        .Select(me => me.Especialidad.Nombre)
                        .FirstOrDefault() ?? "General",
                    Fecha = c.Inicio,
                    Estado = c.Estado.ToString(),
                    Motivo = c.Motivo,
                    Origen = c.CreadoPor == c.PacienteId ? "PACIENTE" : "ADMIN"
                })
                .ToListAsync();

            return new CitasPaginadasDto
            {
                Citas = citas,
                TotalRegistros = totalRegistros,
                PaginaActual = filtros.Pagina,
                TotalPaginas = totalPaginas,
                TamanoPagina = filtros.TamanoPagina
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener citas paginadas");
            throw;
        }
    }

    /// <summary>
    /// Actualiza el estado de una cita
    /// </summary>
    public async Task<bool> UpdateEstadoCitaAsync(long citaId, UpdateEstadoCitaRequest request, long adminUserId)
    {
        try
        {
            var cita = await _context.Citas
                .Include(c => c.Turno)
                .FirstOrDefaultAsync(c => c.Id == citaId);

            if (cita == null)
                return false;

            // Validar estado
            if (!Enum.TryParse<EstadoCita>(request.Estado.ToUpper(), out var nuevoEstado))
                throw new InvalidOperationException("Estado inválido");

            var estadoAnterior = cita.Estado;
            cita.Estado = nuevoEstado;
            cita.ActualizadoEn = DateTime.UtcNow;

            // Si se cancela o rechaza, liberar el turno
            if (nuevoEstado == EstadoCita.CANCELADA || nuevoEstado == EstadoCita.RECHAZADA)
            {
                if (cita.Turno != null)
                {
                    cita.Turno.Estado = EstadoTurno.DISPONIBLE;
                    cita.Turno.ActualizadoEn = DateTime.UtcNow;
                }
            }

            // Agregar nota si existe
            if (!string.IsNullOrWhiteSpace(request.Notas))
            {
                var nota = new NotaClinica
                {
                    CitaId = cita.Id,
                    Nota = $"[CAMBIO DE ESTADO: {estadoAnterior} ? {nuevoEstado}] {request.Notas}",
                    CreadoEn = DateTime.UtcNow
                };
                _context.NotasClinicas.Add(nota);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Cita {CitaId} actualizada de {EstadoAnterior} a {NuevoEstado} por admin {AdminId}",
                citaId, estadoAnterior, nuevoEstado, adminUserId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar estado de cita {CitaId}", citaId);
            throw;
        }
    }

    /// <summary>
    /// Elimina (cancela) una cita
    /// </summary>
    public async Task<bool> DeleteCitaAsync(long citaId, long adminUserId)
    {
        try
        {
            var cita = await _context.Citas
                .Include(c => c.Turno)
                .FirstOrDefaultAsync(c => c.Id == citaId);

            if (cita == null)
                return false;

            // En lugar de eliminar físicamente, cancelamos la cita
            cita.Estado = EstadoCita.CANCELADA;
            cita.ActualizadoEn = DateTime.UtcNow;

            // Liberar el turno
            if (cita.Turno != null)
            {
                cita.Turno.Estado = EstadoTurno.DISPONIBLE;
                cita.Turno.ActualizadoEn = DateTime.UtcNow;
            }

            // Agregar nota de cancelación administrativa
            var nota = new NotaClinica
            {
                CitaId = cita.Id,
                Nota = $"[CANCELACIÓN ADMINISTRATIVA] Cita cancelada por el administrador (ID: {adminUserId})",
                CreadoEn = DateTime.UtcNow
            };
            _context.NotasClinicas.Add(nota);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Cita {CitaId} cancelada por admin {AdminId}", citaId, adminUserId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar cita {CitaId}", citaId);
            throw;
        }
    }

    /// <summary>
    /// Obtiene detalle completo de una cita
    /// </summary>
    public async Task<AdminCitaListDto?> GetCitaDetalleAsync(long citaId)
    {
        try
        {
            var cita = await _context.Citas
                .Include(c => c.Paciente)
                    .ThenInclude(p => p.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .Where(c => c.Id == citaId)
                .Select(c => new AdminCitaListDto
                {
                    Id = c.Id,
                    Paciente = c.Paciente.Usuario.Nombre + " " + c.Paciente.Usuario.Apellido,
                    PacienteId = c.PacienteId,
                    Doctor = "Dr. " + c.Medico.Usuario.Nombre + " " + c.Medico.Usuario.Apellido,
                    MedicoId = c.MedicoId,
                    Especialidad = c.Medico.EspecialidadesMedico
                        .Select(me => me.Especialidad.Nombre)
                        .FirstOrDefault() ?? "General",
                    Fecha = c.Inicio,
                    Estado = c.Estado.ToString(),
                    Motivo = c.Motivo,
                    Origen = c.CreadoPor == c.PacienteId ? "PACIENTE" : "ADMIN"
                })
                .FirstOrDefaultAsync();

            return cita;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener detalle de cita {CitaId}", citaId);
            throw;
        }
    }
}
