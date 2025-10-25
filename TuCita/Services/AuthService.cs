using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.Auth;

namespace TuCita.Services;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequestDto request);
    Task<AuthResult> RegisterAsync(RegisterRequestDto request);
    Task<Usuario?> GetUserByIdAsync(long userId);
    Task<AuthResult> RequestPasswordResetAsync(string email);
    Task<AuthResult> ValidateResetTokenAsync(string token);
    Task<AuthResult> ResetPasswordAsync(ResetPasswordDto request);
}

public class AuthService : IAuthService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<AuthService> _logger;
    private readonly IEmailService _emailService;
    // TODO: Implement distributed cache for password reset tokens
    // private readonly IDistributedCache _cache;

    public AuthService(
        TuCitaDbContext context,
        ILogger<AuthService> logger,
        IEmailService emailService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
    }

    public async Task<AuthResult> LoginAsync(LoginRequestDto request)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.RolesUsuarios)
            .ThenInclude(ru => ru.Rol)
            .FirstOrDefaultAsync(u => u.EmailNormalizado == request.Email.ToLower());

        if (usuario == null || !usuario.Activo)
        {
            return new AuthResult { Success = false, Message = "Credenciales inv�lidas" };
        }

        if (!VerifyPassword(request.Password, usuario.PasswordHash))
        {
            return new AuthResult { Success = false, Message = "Credenciales inv�lidas" };
        }

        var token = GenerateJwtToken(usuario);
        var roles = usuario.RolesUsuarios.Select(ru => ru.Rol.Nombre).ToList();

        return new AuthResult
        {
            Success = true,
            Token = token,
            User = new AuthResponseDto
            {
                Id = usuario.Id,
                Name = $"{usuario.Nombre} {usuario.Apellido}",
                Email = usuario.Email,
                Phone = usuario.Telefono,
                Token = token
            }
        };
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequestDto request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _logger.LogInformation("Iniciando registro de usuario: {Email}", request.Email);

            // Verificar si el usuario ya existe
            var existingUser = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.EmailNormalizado == request.Email.ToLower());

            if (existingUser != null)
            {
                _logger.LogWarning("Intento de registro con email ya existente: {Email}", request.Email);
                return new AuthResult { Success = false, Message = "El usuario ya existe" };
            }

            // Asegurar que el rol PACIENTE existe
            var rolPaciente = await DbInitializer.EnsurePacienteRoleExistsAsync(_context);
            _logger.LogInformation("Rol PACIENTE verificado/creado con ID: {RolId}", rolPaciente.Id);

            // Crear nuevo usuario
            var usuario = new Usuario
            {
                Email = request.Email,
                EmailNormalizado = request.Email.ToLower(),
                PasswordHash = HashPassword(request.Password),
                Nombre = request.FirstName,
                Apellido = request.LastName,
                Telefono = request.Phone,
                Activo = true,
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Usuario creado con ID: {UsuarioId}", usuario.Id);

            // Asignar el rol al usuario con relaciones de navegaci�n
            var rolUsuario = new RolUsuario
            {
                UsuarioId = usuario.Id,
                RolId = rolPaciente.Id,
                Usuario = usuario,
                Rol = rolPaciente
            };

            _context.RolesUsuarios.Add(rolUsuario);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Rol PACIENTE asignado al usuario {UsuarioId}", usuario.Id);

            // Crear perfil de paciente
            var perfilPaciente = new PerfilPaciente
            {
                UsuarioId = usuario.Id,
                Usuario = usuario,
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.PerfilesPacientes.Add(perfilPaciente);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Perfil de paciente creado para usuario {UsuarioId}", usuario.Id);

            // Confirmar la transacci�n
            await transaction.CommitAsync();
            _logger.LogInformation("Registro completado exitosamente para: {Email}", request.Email);

            // Recargar usuario con roles para el token
            usuario = await _context.Usuarios
                .Include(u => u.RolesUsuarios)
                .ThenInclude(ru => ru.Rol)
                .FirstOrDefaultAsync(u => u.Id == usuario.Id);

            var token = GenerateJwtToken(usuario!);

            return new AuthResult
            {
                Success = true,
                Token = token,
                User = new AuthResponseDto
                {
                    Id = usuario!.Id,
                    Name = $"{usuario.Nombre} {usuario.Apellido}",
                    Email = usuario.Email,
                    Phone = usuario.Telefono,
                    Token = token
                }
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error en RegisterAsync para email: {Email}", request.Email);

            return new AuthResult
            {
                Success = false,
                Message = $"Error al registrar usuario: {ex.Message}"
            };
        }
    }

    public async Task<Usuario?> GetUserByIdAsync(long userId)
    {
        return await _context.Usuarios
            .Include(u => u.RolesUsuarios)
            .ThenInclude(ru => ru.Rol)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<AuthResult> RequestPasswordResetAsync(string email)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.EmailNormalizado == email.ToLower());

            if (usuario == null)
            {
                // Por seguridad, no revelamos si el usuario existe o no
                _logger.LogWarning("Intento de recuperaci�n para email no existente: {Email}", email);
                return new AuthResult { Success = true };
            }

            // Generar token �nico con GUID
            var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"); // Token m�s largo y seguro
            
            // TODO: Store token in distributed cache (Redis/Memory Cache) with expiration
            // For now, we'll use a workaround or implement a separate password_reset_tokens table
            // Example: await _cache.SetStringAsync($"reset:{token}", usuario.Id.ToString(), 
            //          new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) });

            // Enviar email con el enlace
            await _emailService.SendPasswordResetLinkAsync(usuario.Email, token, usuario.Nombre);

            _logger.LogInformation("Enlace de recuperaci�n enviado a: {Email}", email);

            return new AuthResult { Success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en RequestPasswordResetAsync para email: {Email}", email);
            return new AuthResult { Success = false, Message = "Error al procesar solicitud de recuperaci�n" };
        }
    }

    public async Task<AuthResult> ValidateResetTokenAsync(string token)
    {
        try
        {
            // TODO: Validate token from distributed cache
            // Example: var userId = await _cache.GetStringAsync($"reset:{token});
            // if (string.IsNullOrEmpty(userId)) return invalid result

            // For now, return a generic message
            _logger.LogWarning("Password reset token validation not fully implemented. Token: {Token}", token.Substring(0, Math.Min(token.Length, 10)));
            
            return new AuthResult 
            { 
                Success = false, 
                Message = "La funcionalidad de recuperaci�n de contrase�a requiere configuraci�n adicional (Redis/Cache)"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en ValidateResetTokenAsync");
            return new AuthResult { Success = false, Message = "Error al validar token" };
        }
    }

    public async Task<AuthResult> ResetPasswordAsync(ResetPasswordDto request)
    {
        try
        {
            // TODO: Implement with distributed cache
            // Example:
            // var userIdStr = await _cache.GetStringAsync($"reset:{request.Token});
            // if (string.IsNullOrEmpty(userIdStr)) return invalid result
            // var userId = long.Parse(userIdStr);
            // var usuario = await _context.Usuarios.FindAsync(userId);
            // ... update password
            // await _cache.RemoveAsync($"reset:{request.Token}");

            _logger.LogWarning("Password reset not fully implemented");
            return new AuthResult { Success = false, Message = "La funcionalidad de recuperaci�n de contrase�a requiere configuraci�n adicional (Redis/Cache)" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en ResetPasswordAsync");
            return new AuthResult { Success = false, Message = "Error al restablecer contrase�a" };
        }
    }

    private string GenerateJwtToken(Usuario usuario)
    {
        // Leer configuraci�n desde variables de entorno
        var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
            ?? throw new InvalidOperationException("JWT_KEY no configurada en .env");
        var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "TuCita";
        var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "TuCitaUsers";
        var jwtExpiryMinutes = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES") ?? "60");

        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, $"{usuario.Nombre} {usuario.Apellido}")
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtExpiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        // Usar BCrypt para hashing de contrase�as
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}

// Clase auxiliar para el resultado
public class AuthResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Token { get; set; }
    public AuthResponseDto? User { get; set; }
}