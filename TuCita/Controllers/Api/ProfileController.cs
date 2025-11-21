using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Profile;
using System.Security.Claims;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar el perfil de usuario (datos personales y credenciales)
/// Permite consultar, actualizar información personal y cambiar contraseña
/// Requiere autenticación
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly ILogger<ProfileController> _logger;

    /// <summary>
    /// Constructor del controlador de perfil de usuario
    /// </summary>
    /// <param name="profileService">Servicio de gestión de perfiles inyectado por DI</param>
    /// <param name="logger">Logger para registro de eventos</param>
    public ProfileController(
        IProfileService profileService,
        ILogger<ProfileController> logger)
    {
        _profileService = profileService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene la información del perfil del usuario autenticado
    /// </summary>
    /// <returns>Datos personales del usuario (nombre, apellido, email, teléfono, etc.)</returns>
    /// <response code="200">Perfil obtenido exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de usuario no encontrado</response>
    /// <remarks>
    /// Retorna la información personal del usuario extraída del token JWT.
    /// Incluye datos básicos del perfil de paciente si aplica.
    /// </remarks>
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Usuario no autenticado" });
        }

        var result = await _profileService.GetProfileAsync(userId.Value);

        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        return Ok(result.Profile);
    }

    /// <summary>
    /// Actualiza la información del perfil del usuario autenticado
    /// </summary>
    /// <param name="request">Datos actualizados (nombre, apellido, teléfono, etc.)</param>
    /// <returns>Perfil actualizado y datos de usuario para refrescar el contexto del cliente</returns>
    /// <response code="200">Perfil actualizado exitosamente</response>
    /// <response code="400">Datos inválidos o error en la actualización</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <remarks>
    /// Permite actualizar:
    /// - Nombre y apellido
    /// - Teléfono
    /// - Otros datos personales del perfil de paciente
    /// 
    /// No permite actualizar el email (requiere proceso de verificación separado).
    /// Retorna los datos actualizados para que el cliente sincronice su contexto.
    /// </remarks>
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Usuario no autenticado" });
        }

        var result = await _profileService.UpdateProfileAsync(userId.Value, request);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new 
        { 
            message = result.Message,
            profile = result.Profile,
            user = result.User // Para actualizar los datos en el contexto del cliente
        });
    }

    /// <summary>
    /// Cambia la contraseña del usuario autenticado
    /// </summary>
    /// <param name="request">Contraseña actual y nueva contraseña</param>
    /// <returns>Mensaje de confirmación del cambio</returns>
    /// <response code="200">Contraseña cambiada exitosamente</response>
    /// <response code="400">Contraseña actual incorrecta o datos inválidos</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <remarks>
    /// Requiere validación de la contraseña actual antes de permitir el cambio.
    /// La nueva contraseña debe cumplir con los requisitos de seguridad:
    /// - Longitud mínima de 6 caracteres
    /// - Máximo 100 caracteres
    /// </remarks>
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "Usuario no autenticado" });
        }

        var result = await _profileService.ChangePasswordAsync(userId.Value, request);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Obtiene el ID del usuario autenticado desde el token JWT
    /// </summary>
    /// <returns>ID del usuario o null si no se puede obtener</returns>
    private long? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (long.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }
}
