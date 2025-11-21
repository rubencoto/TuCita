using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuCita.Data;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar el catálogo de especialidades médicas
/// No requiere autenticación
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EspecialidadesController : ControllerBase
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<EspecialidadesController> _logger;

    /// <summary>
    /// Constructor del controlador de especialidades
    /// </summary>
    /// <param name="context">Contexto de base de datos inyectado por DI</param>
    /// <param name="logger">Logger para registro de eventos</param>
    public EspecialidadesController(
        TuCitaDbContext context,
        ILogger<EspecialidadesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene el catálogo completo de especialidades médicas disponibles
    /// </summary>
    /// <returns>Lista de todas las especialidades ordenadas alfabéticamente</returns>
    /// <response code="200">Catálogo obtenido exitosamente</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Endpoint: GET /api/especialidades
    /// 
    /// Retorna todas las especialidades médicas registradas en el sistema.
    /// Útil para poblar filtros de búsqueda y formularios de registro de doctores.
    /// Las especialidades se retornan ordenadas alfabéticamente por nombre.
    /// </remarks>
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
    /// Obtiene una especialidad médica específica por su ID
    /// </summary>
    /// <param name="id">ID de la especialidad a consultar</param>
    /// <returns>Información de la especialidad solicitada</returns>
    /// <response code="200">Especialidad obtenida exitosamente</response>
    /// <response code="404">Especialidad no encontrada</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Endpoint: GET /api/especialidades/{id}
    /// 
    /// Retorna los detalles de una especialidad médica específica.
    /// </remarks>
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
