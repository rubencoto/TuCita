using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Auth;
using System.Security.Claims;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.LoginAsync(request);

        if (!result.Success)
        {
            return Unauthorized(new { message = result.Message });
        }

        return Ok(result.User);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.RegisterAsync(request);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(result.User);
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // En JWT, el logout es manejado por el cliente eliminando el token
        return Ok(new { message = "Logout exitoso" });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!ulong.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var usuario = await _authService.GetUserByIdAsync(userId);
        
        if (usuario == null)
        {
            return NotFound();
        }

        var userInfo = new AuthResponseDto
        {
            Id = usuario.Id,
            Name = $"{usuario.Nombre} {usuario.Apellido}",
            Email = usuario.Email,
            Phone = usuario.Telefono,
            Token = string.Empty // No devolvemos el token en el perfil
        };

        return Ok(userInfo);
    }

    [HttpPost("request-password-reset")]
    public async Task<IActionResult> RequestPasswordReset([FromBody] RequestPasswordResetDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.RequestPasswordResetAsync(request.Email);

        // Por seguridad, siempre devolver 200 aunque el email no exista
        return Ok(new { message = "Si el correo está registrado, recibirás un enlace de recuperación" });
    }

    [HttpPost("validate-reset-token")]
    public async Task<IActionResult> ValidateResetToken([FromBody] ValidateResetTokenDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.ValidateResetTokenAsync(request.Token);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { valid = true, email = result.User?.Email, message = result.Message });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.ResetPasswordAsync(request);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = "Contraseña restablecida exitosamente" });
    }
}
