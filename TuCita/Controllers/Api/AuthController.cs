using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Auth;
using System.Security.Claims;
using TuCita.Data;
using Microsoft.EntityFrameworkCore;

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

    [HttpPost("register-doctor")]
    public async Task<IActionResult> RegisterDoctor([FromBody] TuCita.DTOs.Auth.RegisterDoctorRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Get DbContext from DI
            var db = (TuCita.Data.TuCitaDbContext)HttpContext.RequestServices.GetService(typeof(TuCita.Data.TuCitaDbContext))!;

            // Ensure role exists
            var roleName = string.IsNullOrEmpty(request.Role) ? "MEDICO" : request.Role.ToUpper();
            var role = await db.Roles.FirstOrDefaultAsync(r => r.Nombre == roleName);
            if (role == null)
            {
                role = roleName == "MEDICO" ? await TuCita.Data.DbInitializer.EnsureMedicoRoleExistsAsync(db) : new TuCita.Models.Rol { Nombre = roleName };
                if (role.Id == 0) // newly created via EnsureMedicoRoleExistsAsync saves changes
                {
                    db.Roles.Add(role);
                    await db.SaveChangesAsync();
                }
            }

            // Use AuthService to create base user (as patient-like flow) but then assign role/profile
            var baseRegister = new TuCita.DTOs.Auth.RegisterRequestDto
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                Password = request.Password,
                ConfirmPassword = request.ConfirmPassword
            };

            var result = await _authService.RegisterAsync(baseRegister);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            var createdUser = await _authService.GetUserByIdAsync(result.User!.Id);
            if (createdUser == null)
                return StatusCode(500, new { message = "Error al recuperar usuario creado" });

            // Assign desired role
            db.RolesUsuarios.Add(new TuCita.Models.RolUsuario { UsuarioId = createdUser.Id, RolId = role.Id });
            await db.SaveChangesAsync();

            if (role.Nombre == "MEDICO")
            {
                var perfil = new TuCita.Models.PerfilMedico
                {
                    UsuarioId = createdUser.Id,
                    NumeroLicencia = request.NumeroLicencia,
                    Direccion = request.Direccion,
                    CreadoEn = DateTime.UtcNow,
                    ActualizadoEn = DateTime.UtcNow
                };
                db.PerfilesMedicos.Add(perfil);
                await db.SaveChangesAsync();
            }

            return Ok(result.User);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno al registrar doctor", error = ex.Message });
        }
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
