using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuCita.DTOs.Profile;
using TuCita.Services;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar el perfil de los doctores
/// Requiere autenticación con rol DOCTOR
/// Rutas bajo /api/doctor/profile
/// </summary>
[ApiController]
[Route("api/doctor/profile")]
[Authorize] // Requiere autenticación
public class DoctorProfileManagementController : ControllerBase
{
    private readonly IDoctorProfileService _doctorProfileService;
    private readonly ILogger<DoctorProfileManagementController> _logger;

    public DoctorProfileManagementController(
        IDoctorProfileService doctorProfileService,
        ILogger<DoctorProfileManagementController> logger)
    {
        _doctorProfileService = doctorProfileService;
        _logger = logger;
    }

    /// <summary>
    /// Obtener el perfil del doctor autenticado
    /// GET /api/doctor/profile
    /// </summary>
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
    /// Actualizar el perfil del doctor autenticado
    /// PUT /api/doctor/profile
    /// </summary>
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
