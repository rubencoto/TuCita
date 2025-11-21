using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuCita.DTOs.Profile;
using TuCita.Services;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar el perfil profesional de los doctores
/// Permite consultar y actualizar información médica, especialidades y datos profesionales
/// Requiere autenticación con rol DOCTOR
/// </summary>
[ApiController]
[Route("api/doctor/profile")]
[Authorize] // Requiere autenticación
public class DoctorProfileManagementController : ControllerBase
{
    private readonly IDoctorProfileService _doctorProfileService;
    private readonly ILogger<DoctorProfileManagementController> _logger;

    /// <summary>
    /// Constructor del controlador de gestión de perfil de doctores
    /// </summary>
    /// <param name="doctorProfileService">Servicio de perfil de doctores inyectado por DI</param>
    /// <param name="logger">Logger para registro de eventos</param>
    public DoctorProfileManagementController(
        IDoctorProfileService doctorProfileService,
        ILogger<DoctorProfileManagementController> logger)
    {
        _doctorProfileService = doctorProfileService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene el perfil completo del doctor autenticado
    /// </summary>
    /// <returns>Información del perfil médico incluyendo especialidades, licencia, biografía y dirección</returns>
    /// <response code="200">Perfil obtenido exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de doctor no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Endpoint: GET /api/doctor/profile
    /// 
    /// Retorna toda la información profesional del doctor registrada en el sistema,
    /// incluyendo datos personales, especialidades médicas, número de licencia,
    /// biografía profesional y ubicación del consultorio.
    /// </remarks>
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var doctorId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var profile = await _doctorProfileService.GetDoctorProfileAsync(doctorId);

            if (profile == null)
            {
                return NotFound(new { message = "Perfil de doctor no encontrado" });
            }

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener perfil del doctor");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Actualiza el perfil profesional del doctor autenticado
    /// </summary>
    /// <param name="dto">Datos actualizados del perfil (biografía, especialidades, dirección, etc.)</param>
    /// <returns>Perfil actualizado con los nuevos valores</returns>
    /// <response code="200">Perfil actualizado exitosamente</response>
    /// <response code="400">Datos inválidos u operación no permitida</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de doctor no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Endpoint: PUT /api/doctor/profile
    /// 
    /// Permite al doctor actualizar su información profesional como:
    /// - Biografía y descripción profesional
    /// - Lista de especialidades médicas
    /// - Dirección del consultorio
    /// - Número de licencia médica
    /// - Años de experiencia
    /// 
    /// Validaciones aplicadas:
    /// - El número de licencia debe ser único en el sistema
    /// - Las especialidades deben existir en el catálogo
    /// </remarks>
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateDoctorProfileDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var doctorId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var updatedProfile = await _doctorProfileService.UpdateDoctorProfileAsync(doctorId, dto);

            if (updatedProfile == null)
            {
                return NotFound(new { message = "Perfil de doctor no encontrado" });
            }

            return Ok(updatedProfile);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Operación inválida al actualizar perfil");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar perfil del doctor");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
