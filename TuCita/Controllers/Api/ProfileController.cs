using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Profile;
using System.Security.Claims;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(
        IProfileService profileService,
        ILogger<ProfileController> logger)
    {
        _profileService = profileService;
        _logger = logger;
    }

    /// <summary>
    /// Obtener información del perfil del usuario autenticado
    /// </summary>
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
    /// Actualizar información del perfil
    /// </summary>
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
    /// Cambiar contraseña del usuario
    /// </summary>
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
    /// Obtener el ID del usuario autenticado desde el token JWT
    /// </summary>
    private ulong? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (ulong.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }
}
