using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuCita.Data;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar especialidades médicas
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EspecialidadesController : ControllerBase
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<EspecialidadesController> _logger;

    public EspecialidadesController(
        TuCitaDbContext context,
        ILogger<EspecialidadesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtener todas las especialidades disponibles
    /// GET /api/especialidades
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var especialidades = await _context.Set<Models.Especialidad>()
                .OrderBy(e => e.Nombre)
                .Select(e => new
                {
                    Id = e.Id,
                    Nombre = e.Nombre
                })
                .ToListAsync();

            return Ok(especialidades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener especialidades");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtener una especialidad por ID
    /// GET /api/especialidades/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var especialidad = await _context.Set<Models.Especialidad>()
                .Where(e => e.Id == id)
                .Select(e => new
                {
                    Id = e.Id,
                    Nombre = e.Nombre
                })
                .FirstOrDefaultAsync();

            if (especialidad == null)
            {
                return NotFound(new { message = "Especialidad no encontrada" });
            }

            return Ok(especialidad);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener especialidad {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
