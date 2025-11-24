using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.DTOs.Admin;
using TuCita.Models;

namespace TuCita.Services;

/// <summary>
/// Interface para el servicio de administración de especialidades
/// </summary>
public interface IAdminEspecialidadesService
{
    /// <summary>
    /// Obtiene todas las especialidades con información de doctores asignados
    /// </summary>
    Task<List<EspecialidadDto>> GetAllEspecialidadesAsync();

    /// <summary>
    /// Obtiene una especialidad por ID
    /// </summary>
    Task<EspecialidadDto?> GetEspecialidadByIdAsync(int id);

    /// <summary>
    /// Crea una nueva especialidad
    /// </summary>
    Task<EspecialidadDto> CreateEspecialidadAsync(CrearEspecialidadDto dto);

    /// <summary>
    /// Actualiza una especialidad existente
    /// </summary>
    Task<EspecialidadDto> UpdateEspecialidadAsync(int id, ActualizarEspecialidadDto dto);

    /// <summary>
    /// Elimina una especialidad (solo si no tiene doctores asignados)
    /// </summary>
    Task<bool> DeleteEspecialidadAsync(int id);

    /// <summary>
    /// Verifica si existe una especialidad con el mismo nombre
    /// </summary>
    Task<bool> ExisteEspecialidadAsync(string nombre, int? excludeId = null);
}

/// <summary>
/// Servicio para gestionar especialidades desde el panel de administración
/// </summary>
public class AdminEspecialidadesService : IAdminEspecialidadesService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<AdminEspecialidadesService> _logger;

    public AdminEspecialidadesService(
        TuCitaDbContext context,
        ILogger<AdminEspecialidadesService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todas las especialidades con contador de doctores
    /// </summary>
    public async Task<List<EspecialidadDto>> GetAllEspecialidadesAsync()
    {
        try
        {
            var especialidades = await _context.Especialidades
                .Include(e => e.MedicosEspecialidades)
                .OrderBy(e => e.Nombre)
                .Select(e => new EspecialidadDto
                {
                    Id = e.Id,
                    Nombre = e.Nombre,
                    DoctoresAsignados = e.MedicosEspecialidades.Count
                })
                .ToListAsync();

            return especialidades;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener lista de especialidades");
            throw;
        }
    }

    /// <summary>
    /// Obtiene una especialidad específica por ID
    /// </summary>
    public async Task<EspecialidadDto?> GetEspecialidadByIdAsync(int id)
    {
        try
        {
            var especialidad = await _context.Especialidades
                .Include(e => e.MedicosEspecialidades)
                .Where(e => e.Id == id)
                .Select(e => new EspecialidadDto
                {
                    Id = e.Id,
                    Nombre = e.Nombre,
                    DoctoresAsignados = e.MedicosEspecialidades.Count
                })
                .FirstOrDefaultAsync();

            return especialidad;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener especialidad con ID {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Crea una nueva especialidad
    /// </summary>
    public async Task<EspecialidadDto> CreateEspecialidadAsync(CrearEspecialidadDto dto)
    {
        try
        {
            // Validar que no exista duplicado
            var existe = await ExisteEspecialidadAsync(dto.Nombre);
            if (existe)
            {
                throw new InvalidOperationException("Ya existe una especialidad con el mismo nombre");
            }

            var especialidad = new Especialidad
            {
                Nombre = dto.Nombre.Trim()
            };

            _context.Especialidades.Add(especialidad);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Especialidad creada: {Nombre} (ID: {Id})", especialidad.Nombre, especialidad.Id);

            return new EspecialidadDto
            {
                Id = especialidad.Id,
                Nombre = especialidad.Nombre,
                DoctoresAsignados = 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear especialidad");
            throw;
        }
    }

    /// <summary>
    /// Actualiza una especialidad existente
    /// </summary>
    public async Task<EspecialidadDto> UpdateEspecialidadAsync(int id, ActualizarEspecialidadDto dto)
    {
        try
        {
            var especialidad = await _context.Especialidades
                .Include(e => e.MedicosEspecialidades)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (especialidad == null)
            {
                throw new InvalidOperationException("Especialidad no encontrada");
            }

            // Validar duplicados (excluyendo la especialidad actual)
            var existe = await ExisteEspecialidadAsync(dto.Nombre, id);
            if (existe)
            {
                throw new InvalidOperationException("Ya existe otra especialidad con el mismo nombre");
            }

            especialidad.Nombre = dto.Nombre.Trim();

            await _context.SaveChangesAsync();

            _logger.LogInformation("Especialidad actualizada: {Id} - {Nombre}", id, especialidad.Nombre);

            return new EspecialidadDto
            {
                Id = especialidad.Id,
                Nombre = especialidad.Nombre,
                DoctoresAsignados = especialidad.MedicosEspecialidades.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar especialidad {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Elimina una especialidad (solo si no tiene doctores asignados)
    /// </summary>
    public async Task<bool> DeleteEspecialidadAsync(int id)
    {
        try
        {
            var especialidad = await _context.Especialidades
                .Include(e => e.MedicosEspecialidades)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (especialidad == null)
            {
                throw new InvalidOperationException("Especialidad no encontrada");
            }

            // No permitir eliminar si tiene doctores asignados
            if (especialidad.MedicosEspecialidades.Any())
            {
                throw new InvalidOperationException(
                    $"No se puede eliminar la especialidad porque tiene {especialidad.MedicosEspecialidades.Count} doctor(es) asignado(s)");
            }

            _context.Especialidades.Remove(especialidad);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Especialidad eliminada: {Id} - {Nombre}", id, especialidad.Nombre);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar especialidad {Id}", id);
            throw;
        }
    }

    /// <summary>
    /// Verifica si existe una especialidad con el mismo nombre
    /// </summary>
    public async Task<bool> ExisteEspecialidadAsync(string nombre, int? excludeId = null)
    {
        try
        {
            var query = _context.Especialidades
                .Where(e => e.Nombre.ToLower() == nombre.ToLower().Trim());

            if (excludeId.HasValue)
            {
                query = query.Where(e => e.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar existencia de especialidad");
            throw;
        }
    }
}
