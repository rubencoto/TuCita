using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.Doctors;

namespace TuCita.Services;

public interface IDoctorsService
{
    Task<IEnumerable<DoctorDto>> GetDoctorsAsync(string? especialidad = null, string? ciudad = null);
    Task<DoctorDetailDto?> GetDoctorByIdAsync(ulong id);
    Task<IEnumerable<string>> GetSpecialtiesAsync();
    Task<IEnumerable<AgendaTurnoDto>> GetAvailableSlotsAsync(ulong doctorId, DateTime fecha);
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
                query = query.Where(pm => pm.Ciudad != null && pm.Ciudad.Contains(ciudad));
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
                    .Select(me => me.Especialidad.Nombre)
                    .ToList() ?? new List<string>(),
                NumeroLicencia = pm.NumeroLicencia,
                Biografia = pm.Biografia,
                Direccion = pm.Direccion,
                Ciudad = pm.Ciudad,
                Provincia = pm.Provincia,
                Pais = pm.Pais,
                Location = BuildLocationString(pm),
                Telefono = pm.Usuario?.Telefono,
                Rating = CalculateRating(),
                ReviewCount = CalculateReviewCount(),
                ImageUrl = pm.Usuario != null 
                    ? GetDoctorImageUrl(pm.Usuario.Nombre, pm.Usuario.Apellido) 
                    : GetDoctorImageUrl("Doctor", "Default"),
                ExperienceYears = CalculateExperienceYears(pm.CreadoEn)
            }).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorsAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<DoctorDetailDto?> GetDoctorByIdAsync(ulong id)
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
                    .Select(me => me.Especialidad.Nombre)
                    .ToList() ?? new List<string>(),
                NumeroLicencia = medico.NumeroLicencia,
                Biografia = medico.Biografia,
                Direccion = medico.Direccion,
                Ciudad = medico.Ciudad,
                Provincia = medico.Provincia,
                Pais = medico.Pais,
                Location = BuildLocationString(medico),
                Telefono = medico.Usuario?.Telefono,
                Email = medico.Usuario?.Email,
                Rating = CalculateRating(),
                ReviewCount = CalculateReviewCount(),
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

    public async Task<IEnumerable<AgendaTurnoDto>> GetAvailableSlotsAsync(ulong doctorId, DateTime fecha)
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
    private static string BuildLocationString(PerfilMedico medico)
    {
        var parts = new List<string>();
        
        if (!string.IsNullOrEmpty(medico.Ciudad))
            parts.Add(medico.Ciudad);
            
        if (!string.IsNullOrEmpty(medico.Provincia))
            parts.Add(medico.Provincia);

        if (!string.IsNullOrEmpty(medico.Pais))
            parts.Add(medico.Pais);
            
        return string.Join(", ", parts);
    }

    private static double CalculateRating()
    {
        // TODO: Implementar cálculo real basado en reviews
        var random = new Random();
        return Math.Round(random.NextDouble() * (5.0 - 4.0) + 4.0, 1);
    }

    private static int CalculateReviewCount()
    {
        // TODO: Implementar conteo real de reviews
        var random = new Random();
        return random.Next(15, 150);
    }

    private static string CalculateExperienceYears(DateTime creadoEn)
    {
        var years = DateTime.UtcNow.Year - creadoEn.Year;
        if (DateTime.UtcNow < creadoEn.AddYears(years))
            years--;
            
        return years <= 0 ? "Nuevo" : $"{years} año{(years == 1 ? "" : "s")} de experiencia";
    }

    private static string GetDoctorImageUrl(string nombre, string apellido)
    {
        // Generar URL de imagen basada en el nombre del doctor
        return $"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    }
}