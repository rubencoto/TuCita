using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.Appointments;

namespace TuCita.Services;

public interface IAppointmentsService
{
    Task<IEnumerable<CitaDto>> GetAppointmentsByPatientAsync(ulong pacienteId);
    Task<CitaDto?> CreateAppointmentAsync(ulong pacienteId, CreateAppointmentRequest request);
    Task<bool> CancelAppointmentAsync(ulong citaId, ulong usuarioId);
    Task<bool> UpdateAppointmentAsync(ulong citaId, ulong usuarioId, UpdateAppointmentRequest request);
}

public class AppointmentsService : IAppointmentsService
{
    private readonly TuCitaDbContext _context;

    public AppointmentsService(TuCitaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CitaDto>> GetAppointmentsByPatientAsync(ulong pacienteId)
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

    public async Task<CitaDto?> CreateAppointmentAsync(ulong pacienteId, CreateAppointmentRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Verificar que el turno existe y está disponible
            var turno = await _context.AgendaTurnos
                .Include(t => t.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(t => t.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(t => t.Id == request.TurnoId && 
                                         t.MedicoId == request.DoctorId &&
                                         t.Estado == EstadoTurno.DISPONIBLE);

            if (turno == null)
                return null;

            // Crear la cita
            var cita = new Cita
            {
                TurnoId = turno.Id,
                MedicoId = request.DoctorId,
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

            // Actualizar el estado del turno
            turno.Estado = EstadoTurno.RESERVADO;
            turno.ActualizadoEn = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new CitaDto
            {
                Id = cita.Id,
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
            Console.WriteLine($"Error en CreateAppointmentAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    public async Task<bool> CancelAppointmentAsync(ulong citaId, ulong usuarioId)
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

    public async Task<bool> UpdateAppointmentAsync(ulong citaId, ulong usuarioId, UpdateAppointmentRequest request)
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
}