using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Auth;
using System.Security.Claims;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador de autenticación que gestiona el login, registro y recuperación de contraseñas
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    /// <summary>
    /// Constructor del controlador de autenticación
    /// </summary>
    /// <param name="authService">Servicio de autenticación inyectado por DI</param>
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Autentica a un usuario general (paciente o doctor) en el sistema
    /// </summary>
    /// <param name="request">Credenciales de inicio de sesión (email y contraseña)</param>
    /// <returns>Información del usuario autenticado con token JWT si las credenciales son válidas</returns>
    /// <response code="200">Login exitoso, retorna datos del usuario y token JWT</response>
    /// <response code="400">Modelo de datos inválido</response>
    /// <response code="401">Credenciales incorrectas o usuario no autorizado</response>
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

    /// <summary>
    /// Endpoint específico para autenticación de doctores
    /// Retorna información adicional del perfil médico
    /// </summary>
    /// <param name="request">Credenciales de inicio de sesión (email y contraseña)</param>
    /// <returns>Información completa del doctor incluyendo especialidades, licencia médica y biografía</returns>
    /// <response code="200">Login exitoso, retorna datos extendidos del doctor con token JWT</response>
    /// <response code="400">Modelo de datos inválido</response>
    /// <response code="401">Credenciales incorrectas o el usuario no es un doctor</response>
    [HttpPost("doctor/login")]
    public async Task<IActionResult> DoctorLogin([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.LoginDoctorAsync(request);

        if (!result.Success)
        {
            return Unauthorized(new { message = result.Message });
        }

        return Ok(result.Doctor);
    }

    /// <summary>
    /// Endpoint específico para autenticación de administradores
    /// Retorna información del perfil de administrador
    /// </summary>
    /// <param name="request">Credenciales de inicio de sesión (email y contraseña)</param>
    /// <returns>Información del administrador con token JWT</returns>
    /// <response code="200">Login exitoso, retorna datos del administrador con token JWT</response>
    /// <response code="400">Modelo de datos inválido</response>
    /// <response code="401">Credenciales incorrectas o el usuario no es un administrador</response>
    [HttpPost("admin/login")]
    public async Task<IActionResult> AdminLogin([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.LoginAdminAsync(request);

        if (!result.Success)
        {
            return Unauthorized(new { message = result.Message });
        }

        return Ok(result.Admin);
    }

    /// <summary>
    /// Registra un nuevo usuario en el sistema
    /// </summary>
    /// <param name="request">Información del nuevo usuario (nombre, apellido, email, teléfono, contraseña)</param>
    /// <returns>Información del usuario creado con token JWT para inicio de sesión automático</returns>
    /// <response code="200">Registro exitoso, retorna datos del usuario y token JWT</response>
    /// <response code="400">Datos inválidos o email ya registrado en el sistema</response>
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

    /// <summary>
    /// Cierra la sesión del usuario actual
    /// </summary>
    /// <returns>Mensaje de confirmación de logout</returns>
    /// <response code="200">Logout exitoso</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <remarks>
    /// En JWT, el logout es manejado por el cliente eliminando el token.
    /// Este endpoint sirve principalmente para auditoría y confirmar la acción al cliente.
    /// </remarks>
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // En JWT, el logout es manejado por el cliente eliminando el token
        return Ok(new { message = "Logout exitoso" });
    }

    /// <summary>
    /// Obtiene el perfil del usuario autenticado actualmente
    /// </summary>
    /// <returns>Información del perfil del usuario (sin token)</returns>
    /// <response code="200">Retorna los datos del perfil del usuario</response>
    /// <response code="401">Token JWT inválido o no proporcionado</response>
    /// <response code="404">Usuario no encontrado en la base de datos</response>
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!long.TryParse(userIdClaim, out var userId))
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

    /// <summary>
    /// Solicita un restablecimiento de contraseña para un email registrado
    /// </summary>
    /// <param name="request">Email del usuario que solicita recuperar su contraseña</param>
    /// <returns>Mensaje genérico de confirmación</returns>
    /// <response code="200">Solicitud procesada (siempre retorna 200 por seguridad)</response>
    /// <response code="400">Modelo de datos inválido</response>
    /// <remarks>
    /// Por razones de seguridad, siempre retorna 200 OK aunque el email no exista en el sistema.
    /// Si el email está registrado, se envía un correo con el enlace de recuperación.
    /// </remarks>
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

    /// <summary>
    /// Valida si un token de recuperación de contraseña es válido y no ha expirado
    /// </summary>
    /// <param name="request">Token de recuperación a validar</param>
    /// <returns>Estado de validez del token y email asociado si es válido</returns>
    /// <response code="200">Token válido, retorna el email del usuario</response>
    /// <response code="400">Token inválido, expirado o modelo de datos inválido</response>
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

    /// <summary>
    /// Restablece la contraseña de un usuario usando un token de recuperación válido
    /// </summary>
    /// <param name="request">Token de recuperación y nueva contraseña</param>
    /// <returns>Confirmación del restablecimiento de contraseña</returns>
    /// <response code="200">Contraseña restablecida exitosamente</response>
    /// <response code="400">Token inválido, expirado, modelo de datos inválido o contraseñas no coinciden</response>
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
