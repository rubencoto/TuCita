using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.Doctors;

namespace TuCita.Services;

public interface IDoctorsService
{
    Task<IEnumerable<DoctorDto>> GetDoctorsAsync(string? especialidad = null, string? ciudad = null);
    Task<DoctorDetailDto?> GetDoctorByIdAsync(long id);
    Task<IEnumerable<string>> GetSpecialtiesAsync();
    Task<IEnumerable<AgendaTurnoDto>> GetAvailableSlotsAsync(long doctorId, DateTime fecha);
}

public class DoctorsService : IDoctorsService
{
    private readonly TuCitaDbContext _context;

    public DoctorsService(TuCitaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DoctorDto>> GetDoctorsAsync(string? especialidad = null, string? ciudad = null)
    {
        try
        {
            var query = _context.PerfilesMedicos
                .Include(pm => pm.Usuario)
                .Include(pm => pm.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
                .Include(pm => pm.AgendaTurnos)
                .AsQueryable();

            // Aplicar filtros solo si el usuario está activo
            query = query.Where(pm => pm.Usuario != null && pm.Usuario.Activo);

            if (!string.IsNullOrEmpty(especialidad))
            {
                query = query.Where(pm => pm.EspecialidadesMedico
                    .Any(me => me.Especialidad != null && me.Especialidad.Nombre.Contains(especialidad)));
            }

            if (!string.IsNullOrEmpty(ciudad))
            {
                query = query.Where(pm => pm.Direccion != null && pm.Direccion.Contains(ciudad));
            }

            var medicos = await query.ToListAsync();

            return medicos.Select(pm => new DoctorDto
            {
                Id = pm.UsuarioId,
                Nombre = pm.Usuario != null 
                    ? $"Dr. {pm.Usuario.Nombre} {pm.Usuario.Apellido}" 
                    : "Médico no disponible",
                Especialidades = pm.EspecialidadesMedico?
                    .Where(me => me.Especialidad != null)
                    .Select(me => me.Especialidad!.Nombre)
                    .ToList() ?? new List<string>(),
                NumeroLicencia = pm.NumeroLicencia,
                Biografia = pm.Biografia,
                Direccion = pm.Direccion,
                Telefono = pm.Usuario?.Telefono,
                ImageUrl = pm.Usuario != null 
                    ? GetDoctorImageUrl(pm.Usuario.Nombre, pm.Usuario.Apellido) 
                    : GetDoctorImageUrl("Doctor", "Default"),
                ExperienceYears = CalculateExperienceYears(pm.CreadoEn),
                AvailableSlots = GetAvailableSlotsCount(pm.AgendaTurnos),
                NextAvailable = GetNextAvailableSlot(pm.AgendaTurnos)
            }).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorsAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<DoctorDetailDto?> GetDoctorByIdAsync(long id)
    {
        try
        {
            var medico = await _context.PerfilesMedicos
                .Include(pm => pm.Usuario)
                .Include(pm => pm.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
                .FirstOrDefaultAsync(pm => pm.UsuarioId == id && pm.Usuario != null && pm.Usuario.Activo);

            if (medico == null) return null;

            return new DoctorDetailDto
            {
                Id = medico.UsuarioId,
                Nombre = medico.Usuario != null 
                    ? $"Dr. {medico.Usuario.Nombre} {medico.Usuario.Apellido}" 
                    : "Médico no disponible",
                Especialidades = medico.EspecialidadesMedico?
                    .Where(me => me.Especialidad != null)
                    .Select(me => me.Especialidad!.Nombre)
                    .ToList() ?? new List<string>(),
                NumeroLicencia = medico.NumeroLicencia,
                Biografia = medico.Biografia,
                Direccion = medico.Direccion,
                Telefono = medico.Usuario?.Telefono,
                Email = medico.Usuario?.Email,
                ImageUrl = medico.Usuario != null 
                    ? GetDoctorImageUrl(medico.Usuario.Nombre, medico.Usuario.Apellido) 
                    : GetDoctorImageUrl("Doctor", "Default"),
                ExperienceYears = CalculateExperienceYears(medico.CreadoEn),
                About = medico.Biografia ?? "Información no disponible"
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorByIdAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    public async Task<IEnumerable<string>> GetSpecialtiesAsync()
    {
        try
        {
            return await _context.Especialidades
                .Select(e => e.Nombre)
                .OrderBy(n => n)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetSpecialtiesAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<IEnumerable<AgendaTurnoDto>> GetAvailableSlotsAsync(long doctorId, DateTime fecha)
    {
        try
        {
            var inicioDia = fecha.Date;
            var finDia = inicioDia.AddDays(1);

            var turnosDisponibles = await _context.AgendaTurnos
                .Where(t => t.MedicoId == doctorId && 
                           t.Inicio >= inicioDia && 
                           t.Inicio < finDia &&
                           t.Estado == EstadoTurno.DISPONIBLE)
                .OrderBy(t => t.Inicio)
                .ToListAsync();

            return turnosDisponibles.Select(t => new AgendaTurnoDto
            {
                Id = t.Id,
                Inicio = t.Inicio,
                Fin = t.Fin,
                Estado = t.Estado.ToString()
            }).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetAvailableSlotsAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            throw;
        }
    }

    // Helper methods
    private static string CalculateExperienceYears(DateTime creadoEn)
    {
        var years = DateTime.UtcNow.Year - creadoEn.Year;
        if (DateTime.UtcNow < creadoEn.AddYears(years))
            years--;
            
        return years <= 0 ? "Nuevo" : $"{years} año{(years == 1 ? "" : "s")} de experiencia";
    }

    private static int GetAvailableSlotsCount(ICollection<AgendaTurno> turnos)
    {
        if (turnos == null) return 0;
        
        var today = DateTime.UtcNow.Date;
        var nextWeek = today.AddDays(7);
        
        return turnos.Count(t => 
            t.Estado == EstadoTurno.DISPONIBLE && 
            t.Inicio >= today && 
            t.Inicio < nextWeek);
    }

    private static string GetNextAvailableSlot(ICollection<AgendaTurno> turnos)
    {
        if (turnos == null) return "Consultar disponibilidad";
        
        var now = DateTime.UtcNow;
        var nextSlot = turnos
            .Where(t => t.Estado == EstadoTurno.DISPONIBLE && t.Inicio > now)
            .OrderBy(t => t.Inicio)
            .FirstOrDefault();

        if (nextSlot == null) return "Consultar disponibilidad";

        var days = (nextSlot.Inicio.Date - now.Date).Days;
        
        if (days == 0) return $"Hoy {nextSlot.Inicio:HH:mm}";
        if (days == 1) return $"Mañana {nextSlot.Inicio:HH:mm}";
        if (days < 7) return nextSlot.Inicio.ToString("dddd HH:mm");
        
        return nextSlot.Inicio.ToString("dd/MM HH:mm");
    }

    private static string GetDoctorImageUrl(string nombre, string apellido)
    {
        // Generar URL de imagen basada en el nombre del doctor
        return $"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    }
}