using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Admin;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para la administración de especialidades médicas
/// Proporciona endpoints CRUD para gestionar especialidades
/// Requiere autenticación con rol ADMIN
/// </summary>
[ApiController]
[Route("api/admin/especialidades")]
[Authorize(Roles = "ADMIN")]
public class AdminEspecialidadesController : ControllerBase
{
    private readonly IAdminEspecialidadesService _especialidadesService;
    private readonly ILogger<AdminEspecialidadesController> _logger;

    /// <summary>
    /// Constructor del controlador de administración de especialidades
    /// </summary>
    public AdminEspecialidadesController(
        IAdminEspecialidadesService especialidadesService,
        ILogger<AdminEspecialidadesController> logger)
    {
        _especialidadesService = especialidadesService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todas las especialidades del sistema
    /// </summary>
    /// <returns>Lista de especialidades con información de doctores asignados</returns>
    /// <response code="200">Lista de especialidades obtenida exitosamente</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet]
    public async Task<IActionResult> GetAllEspecialidades()
    {
        try
        {
            var especialidades = await _especialidadesService.GetAllEspecialidadesAsync();
            return Ok(especialidades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener especialidades");
            return StatusCode(500, new { message = "Error al obtener especialidades", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene una especialidad específica por ID
    /// </summary>
    /// <param name="id">ID de la especialidad</param>
    /// <returns>Datos de la especialidad</returns>
    /// <response code="200">Especialidad encontrada</response>
    /// <response code="404">Especialidad no encontrada</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEspecialidadById(int id)
    {
        try
        {
            var especialidad = await _especialidadesService.GetEspecialidadByIdAsync(id);
            
            if (especialidad == null)
            {
                return NotFound(new { message = "Especialidad no encontrada" });
            }

            return Ok(especialidad);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener especialidad {Id}", id);
            return StatusCode(500, new { message = "Error al obtener especialidad", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva especialidad médica
    /// </summary>
    /// <param name="dto">Datos de la nueva especialidad</param>
    /// <returns>Especialidad creada</returns>
    /// <response code="201">Especialidad creada exitosamente</response>
    /// <response code="400">Datos inválidos o especialidad duplicada</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost]
    public async Task<IActionResult> CreateEspecialidad([FromBody] CrearEspecialidadDto dto)
    {
        try
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(dto.Nombre))
            {
                return BadRequest(new { message = "El nombre es requerido" });
            }

            if (dto.Nombre.Length > 120)
            {
                return BadRequest(new { message = "El nombre no puede exceder 120 caracteres" });
            }

            var especialidad = await _especialidadesService.CreateEspecialidadAsync(dto);
            
            return CreatedAtAction(
                nameof(GetEspecialidadById),
                new { id = especialidad.Id },
                especialidad
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear especialidad");
            return StatusCode(500, new { message = "Error al crear especialidad", error = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza una especialidad existente
    /// </summary>
    /// <param name="id">ID de la especialidad a actualizar</param>
    /// <param name="dto">Nuevos datos de la especialidad</param>
    /// <returns>Especialidad actualizada</returns>
    /// <response code="200">Especialidad actualizada exitosamente</response>
    /// <response code="400">Datos inválidos o duplicados</response>
    /// <response code="404">Especialidad no encontrada</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEspecialidad(int id, [FromBody] ActualizarEspecialidadDto dto)
    {
        try
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(dto.Nombre))
            {
                return BadRequest(new { message = "El nombre es requerido" });
            }

            if (dto.Nombre.Length > 120)
            {
                return BadRequest(new { message = "El nombre no puede exceder 120 caracteres" });
            }

            var especialidad = await _especialidadesService.UpdateEspecialidadAsync(id, dto);
            return Ok(especialidad);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("no encontrada"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar especialidad {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar especialidad", error = ex.Message });
        }
    }

    /// <summary>
    /// Elimina una especialidad (solo si no tiene doctores asignados)
    /// </summary>
    /// <param name="id">ID de la especialidad a eliminar</param>
    /// <returns>Resultado de la operación</returns>
    /// <response code="204">Especialidad eliminada exitosamente</response>
    /// <response code="400">No se puede eliminar porque tiene doctores asignados</response>
    /// <response code="404">Especialidad no encontrada</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEspecialidad(int id)
    {
        try
        {
            await _especialidadesService.DeleteEspecialidadAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("no encontrada"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar especialidad {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar especialidad", error = ex.Message });
        }
    }

    /// <summary>
    /// Verifica si existe una especialidad con el nombre especificado
    /// </summary>
    /// <param name="nombre">Nombre a verificar</param>
    /// <param name="excludeId">ID a excluir de la búsqueda (para ediciones)</param>
    /// <returns>True si existe, false si no</returns>
    /// <response code="200">Resultado de la verificación</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("existe")]
    public async Task<IActionResult> ExisteEspecialidad(
        [FromQuery] string nombre,
        [FromQuery] int? excludeId = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(nombre))
            {
                return BadRequest(new { message = "El nombre es requerido" });
            }

            var existe = await _especialidadesService.ExisteEspecialidadAsync(nombre, excludeId);
            return Ok(new { existe });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar existencia de especialidad");
            return StatusCode(500, new { message = "Error al verificar especialidad", error = ex.Message });
        }
    }
}
