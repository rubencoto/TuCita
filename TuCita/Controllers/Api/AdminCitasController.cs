using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuCita.DTOs.Admin;
using TuCita.Services;
using System.Security.Claims;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestión de citas desde el panel de administración
/// </summary>
[ApiController]
[Route("api/admin/citas")]
[Authorize(Roles = "ADMIN")]
public class AdminCitasController : ControllerBase
{
    private readonly IAdminCitasService _citasService;
    private readonly ILogger<AdminCitasController> _logger;

    public AdminCitasController(
        IAdminCitasService citasService,
        ILogger<AdminCitasController> logger)
    {
        _citasService = citasService;
        _logger = logger;
    }

    /// <summary>
    /// Busca pacientes por nombre, email o identificación
    /// </summary>
    /// <param name="q">Término de búsqueda (mínimo 2 caracteres)</param>
    /// <returns>Lista de pacientes que coinciden con la búsqueda</returns>
    [HttpGet("pacientes/search")]
    [ProducesResponseType(typeof(List<PacienteSearchDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<PacienteSearchDto>>> SearchPacientes([FromQuery] string q)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
                return BadRequest(new { error = "El término de búsqueda debe tener al menos 2 caracteres" });

            var pacientes = await _citasService.SearchPacientesAsync(q);
            return Ok(pacientes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al buscar pacientes");
            return StatusCode(500, new { error = "Error al buscar pacientes" });
        }
    }

    /// <summary>
    /// Obtiene todos los doctores activos con sus especialidades
    /// </summary>
    /// <returns>Lista de doctores</returns>
    [HttpGet("doctores")]
    [ProducesResponseType(typeof(List<DoctorConEspecialidadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<DoctorConEspecialidadDto>>> GetDoctores()
    {
        try
        {
            var doctores = await _citasService.GetDoctoresAsync();
            return Ok(doctores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener doctores");
            return StatusCode(500, new { error = "Error al obtener doctores" });
        }
    }

    /// <summary>
    /// Obtiene doctores filtrados por especialidad
    /// </summary>
    /// <param name="especialidadId">ID de la especialidad</param>
    /// <returns>Lista de doctores con la especialidad especificada</returns>
    [HttpGet("doctores/especialidad/{especialidadId}")]
    [ProducesResponseType(typeof(List<DoctorConEspecialidadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<DoctorConEspecialidadDto>>> GetDoctoresByEspecialidad(int especialidadId)
    {
        try
        {
            var doctores = await _citasService.GetDoctoresByEspecialidadAsync(especialidadId);
            return Ok(doctores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener doctores por especialidad {EspecialidadId}", especialidadId);
            return StatusCode(500, new { error = "Error al obtener doctores" });
        }
    }

    /// <summary>
    /// Obtiene slots disponibles de un doctor para una fecha específica
    /// </summary>
    /// <param name="medicoId">ID del médico</param>
    /// <param name="fecha">Fecha en formato yyyy-MM-dd</param>
    /// <returns>Lista de slots disponibles</returns>
    [HttpGet("doctores/{medicoId}/slots")]
    [ProducesResponseType(typeof(List<SlotDisponibleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<SlotDisponibleDto>>> GetSlotsDisponibles(
        long medicoId, 
        [FromQuery] string fecha)
    {
        try
        {
            if (!DateTime.TryParse(fecha, out var fechaDate))
                return BadRequest(new { error = "Formato de fecha inválido. Use yyyy-MM-dd" });

            var slots = await _citasService.GetSlotsDisponiblesAsync(medicoId, fechaDate);
            return Ok(slots);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener slots para médico {MedicoId} en fecha {Fecha}", medicoId, fecha);
            return StatusCode(500, new { error = "Error al obtener slots disponibles" });
        }
    }

    /// <summary>
    /// Crea una nueva cita desde el panel de administración
    /// </summary>
    /// <param name="request">Datos de la cita a crear</param>
    /// <returns>Datos de la cita creada</returns>
    [HttpPost]
    [ProducesResponseType(typeof(CitaCreadaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CitaCreadaDto>> CreateCita([FromBody] CreateCitaAdminRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserIdClaim) || !long.TryParse(adminUserIdClaim, out var adminUserId))
                return Unauthorized(new { error = "Usuario no autenticado" });

            var cita = await _citasService.CreateCitaAsync(request, adminUserId);

            _logger.LogInformation("Cita {CitaId} creada por admin {AdminId}", cita.CitaId, adminUserId);

            return CreatedAtAction(nameof(GetCitaDetalle), new { id = cita.CitaId }, cita);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error de validación al crear cita");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear cita");
            return StatusCode(500, new { error = "Error al crear la cita" });
        }
    }

    /// <summary>
    /// Obtiene todas las citas con filtros y paginación
    /// </summary>
    /// <param name="filtros">Filtros de búsqueda</param>
    /// <returns>Citas paginadas</returns>
    [HttpGet]
    [ProducesResponseType(typeof(CitasPaginadasDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CitasPaginadasDto>> GetCitas([FromQuery] CitasFilterDto filtros)
    {
        try
        {
            var citas = await _citasService.GetCitasPaginadasAsync(filtros);
            return Ok(citas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener citas paginadas");
            return StatusCode(500, new { error = "Error al obtener citas" });
        }
    }

    /// <summary>
    /// Obtiene el detalle de una cita específica
    /// </summary>
    /// <param name="id">ID de la cita</param>
    /// <returns>Detalle de la cita</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AdminCitaListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminCitaListDto>> GetCitaDetalle(long id)
    {
        try
        {
            var cita = await _citasService.GetCitaDetalleAsync(id);
            
            if (cita == null)
                return NotFound(new { error = "Cita no encontrada" });

            return Ok(cita);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener detalle de cita {CitaId}", id);
            return StatusCode(500, new { error = "Error al obtener detalle de la cita" });
        }
    }

    /// <summary>
    /// Actualiza el estado de una cita
    /// </summary>
    /// <param name="id">ID de la cita</param>
    /// <param name="request">Datos de actualización</param>
    /// <returns>Resultado de la operación</returns>
    [HttpPatch("{id}/estado")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEstadoCita(long id, [FromBody] UpdateEstadoCitaRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserIdClaim) || !long.TryParse(adminUserIdClaim, out var adminUserId))
                return Unauthorized(new { error = "Usuario no autenticado" });

            var success = await _citasService.UpdateEstadoCitaAsync(id, request, adminUserId);

            if (!success)
                return NotFound(new { error = "Cita no encontrada" });

            return Ok(new { message = "Estado de cita actualizado exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error de validación al actualizar estado de cita {CitaId}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar estado de cita {CitaId}", id);
            return StatusCode(500, new { error = "Error al actualizar estado de la cita" });
        }
    }

    /// <summary>
    /// Cancela (elimina) una cita
    /// </summary>
    /// <param name="id">ID de la cita</param>
    /// <returns>Resultado de la operación</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCita(long id)
    {
        try
        {
            var adminUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminUserIdClaim) || !long.TryParse(adminUserIdClaim, out var adminUserId))
                return Unauthorized(new { error = "Usuario no autenticado" });

            var success = await _citasService.DeleteCitaAsync(id, adminUserId);

            if (!success)
                return NotFound(new { error = "Cita no encontrada" });

            return Ok(new { message = "Cita cancelada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cancelar cita {CitaId}", id);
            return StatusCode(500, new { error = "Error al cancelar la cita" });
        }
    }
}
