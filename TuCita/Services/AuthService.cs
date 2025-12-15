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
    Task<DoctorAuthResult> LoginDoctorAsync(LoginRequestDto request);
    Task<AdminAuthResult> LoginAdminAsync(LoginRequestDto request);
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
            return new AuthResult { Success = false, Message = "Credenciales inválidas" };
        }

        if (!VerifyPassword(request.Password, usuario.PasswordHash))
        {
            return new AuthResult { Success = false, Message = "Credenciales inválidas" };
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

    public async Task<DoctorAuthResult> LoginDoctorAsync(LoginRequestDto request)
    {
        // Buscar usuario con perfil médico y especialidades
        var usuario = await _context.Usuarios
            .Include(u => u.RolesUsuarios)
                .ThenInclude(ru => ru.Rol)
            .Include(u => u.PerfilMedico)
                .ThenInclude(pm => pm!.EspecialidadesMedico)
                    .ThenInclude(me => me.Especialidad)
            .FirstOrDefaultAsync(u => u.EmailNormalizado == request.Email.ToLower());

        if (usuario == null || !usuario.Activo)
        {
            _logger.LogWarning("Intento de login de doctor fallido: usuario no encontrado o inactivo - {Email}", request.Email);
            return new DoctorAuthResult 
            { 
                Success = false, 
                Message = "Credenciales inválidas o usuario no autorizado como médico" 
            };
        }

        if (!VerifyPassword(request.Password, usuario.PasswordHash))
        {
            _logger.LogWarning("Intento de login de doctor fallido: contraseña incorrecta - {Email}", request.Email);
            return new DoctorAuthResult 
            { 
                Success = false, 
                Message = "Credenciales inválidas" 
            };
        }

        // Verificar que el usuario tiene rol de MEDICO (cambiar de DOCTOR a MEDICO)
        var esMedico = usuario.RolesUsuarios.Any(ru => ru.Rol.Nombre == "MEDICO");
        if (!esMedico)
        {
            _logger.LogWarning("Intento de login de doctor fallido: usuario sin rol MEDICO - {Email}", request.Email);
            return new DoctorAuthResult 
            { 
                Success = false, 
                Message = "Usuario no autorizado como médico" 
            };
        }

        // Verificar que tiene perfil médico
        if (usuario.PerfilMedico == null)
        {
            _logger.LogWarning("Login de doctor: usuario tiene rol MEDICO pero no perfil médico - {Email}", request.Email);
            return new DoctorAuthResult 
            { 
                Success = false, 
                Message = "Perfil médico no configurado. Contacta al administrador." 
            };
        }

        var token = GenerateJwtToken(usuario);
        
        // Obtener especialidades
        var especialidades = usuario.PerfilMedico.EspecialidadesMedico
            .Select(me => me.Especialidad.Nombre)
            .ToList();

        _logger.LogInformation("Login exitoso de doctor: {Email} - {DoctorId}", request.Email, usuario.Id);

        return new DoctorAuthResult
        {
            Success = true,
            Token = token,
            Doctor = new DoctorAuthResponseDto
            {
                Id = usuario.Id,
                Name = $"{usuario.Nombre} {usuario.Apellido}",
                Email = usuario.Email,
                Phone = usuario.Telefono,
                Token = token,
                Role = "DOCTOR",
                Especialidad = especialidades.FirstOrDefault(),
                NumeroLicencia = usuario.PerfilMedico.NumeroLicencia,
                Biografia = usuario.PerfilMedico.Biografia,
                Direccion = usuario.PerfilMedico.Direccion,
                Especialidades = especialidades
            }
        };
    }

    public async Task<AdminAuthResult> LoginAdminAsync(LoginRequestDto request)
    {
        // Buscar usuario con rol de administrador
        var usuario = await _context.Usuarios
            .Include(u => u.RolesUsuarios)
                .ThenInclude(ru => ru.Rol)
            .FirstOrDefaultAsync(u => u.EmailNormalizado == request.Email.ToLower());

        if (usuario == null || !usuario.Activo)
        {
            _logger.LogWarning("Intento de login de admin fallido: usuario no encontrado o inactivo - {Email}", request.Email);
            return new AdminAuthResult 
            { 
                Success = false, 
                Message = "Credenciales inválidas o usuario no autorizado como administrador" 
            };
        }

        if (!VerifyPassword(request.Password, usuario.PasswordHash))
        {
            _logger.LogWarning("Intento de login de admin fallido: contraseña incorrecta - {Email}", request.Email);
            return new AdminAuthResult 
            { 
                Success = false, 
                Message = "Credenciales inválidas" 
            };
        }

        // Verificar que el usuario tiene rol de ADMIN (ID = 3)
        var esAdmin = usuario.RolesUsuarios.Any(ru => ru.Rol.Nombre == "ADMIN" || ru.RolId == 3);
        if (!esAdmin)
        {
            _logger.LogWarning("Intento de login de admin fallido: usuario sin rol ADMIN - {Email}", request.Email);
            return new AdminAuthResult 
            { 
                Success = false, 
                Message = "Usuario no autorizado como administrador" 
            };
        }

        var token = GenerateJwtToken(usuario);

        _logger.LogInformation("Login exitoso de administrador: {Email} - {AdminId}", request.Email, usuario.Id);

        return new AdminAuthResult
        {
            Success = true,
            Token = token,
            Admin = new AdminAuthResponseDto
            {
                Id = usuario.Id,
                Name = $"{usuario.Nombre} {usuario.Apellido}",
                Email = usuario.Email,
                Phone = usuario.Telefono,
                Token = token,
                Role = "ADMIN"
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

            // Asignar el rol al usuario con relaciones de navegación
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

            // Confirmar la transacción
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
                _logger.LogWarning("Intento de recuperación para email no existente: {Email}", email);
                return new AuthResult { Success = true };
            }

            // Generar token JWT con expiración de 60 minutos
            var token = GeneratePasswordResetToken(usuario.Id, usuario.Email);
            
            // Enviar email con el enlace
            await _emailService.SendPasswordResetLinkAsync(usuario.Email, token, usuario.Nombre);

            _logger.LogInformation("Enlace de recuperación enviado a: {Email} (User ID: {UserId})", email, usuario.Id);

            return new AuthResult { Success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en RequestPasswordResetAsync para email: {Email}", email);
            return new AuthResult { Success = false, Message = "Error al procesar solicitud de recuperación" };
        }
    }

    public async Task<AuthResult> ValidateResetTokenAsync(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
                ?? throw new InvalidOperationException("JWT_KEY no configurada en .env");
            var key = Encoding.ASCII.GetBytes(jwtKey);

            // Validar el token
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false, // No validamos issuer para tokens de reset
                ValidateAudience = false, // No validamos audience para tokens de reset
                ValidateLifetime = true, // Importante: validar que no haya expirado
                ClockSkew = TimeSpan.Zero // Sin tolerancia adicional
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            
            // Verificar que es un token de tipo "password-reset"
            var tokenTypeClaim = principal.FindFirst("token_type");
            if (tokenTypeClaim?.Value != "password-reset")
            {
                _logger.LogWarning("Token inválido: no es de tipo password-reset");
                return new AuthResult { Success = false, Message = "Token inválido" };
            }

            // Extraer el email del token
            var emailClaim = principal.FindFirst(ClaimTypes.Email);
            var email = emailClaim?.Value;

            _logger.LogInformation("Token de reset validado correctamente para email: {Email}", email);
            
            return new AuthResult 
            { 
                Success = true,
                Message = "Token válido"
            };
        }
        catch (SecurityTokenExpiredException)
        {
            _logger.LogWarning("Token de reset expirado");
            return new AuthResult { Success = false, Message = "El enlace ha expirado. Por favor, solicita uno nuevo." };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al validar token de reset");
            return new AuthResult { Success = false, Message = "Token inválido o expirado" };
        }
    }

    public async Task<AuthResult> ResetPasswordAsync(ResetPasswordDto request)
    {
        try
        {
            // Validar el token primero
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
                ?? throw new InvalidOperationException("JWT_KEY no configurada en .env");
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(request.Token, validationParameters, out var validatedToken);
            
            // Verificar que es un token de tipo "password-reset"
            var tokenTypeClaim = principal.FindFirst("token_type");
            if (tokenTypeClaim?.Value != "password-reset")
            {
                return new AuthResult { Success = false, Message = "Token inválido" };
            }

            // Extraer el user ID del token
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
            {
                return new AuthResult { Success = false, Message = "Token inválido" };
            }

            // Buscar el usuario
            var usuario = await _context.Usuarios.FindAsync(userId);
            if (usuario == null || !usuario.Activo)
            {
                _logger.LogWarning("Intento de reset para usuario no existente o inactivo: {UserId}", userId);
                return new AuthResult { Success = false, Message = "Usuario no encontrado" };
            }

            // Actualizar la contraseña
            usuario.PasswordHash = HashPassword(request.NuevaPassword);
            usuario.ActualizadoEn = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            _logger.LogInformation("Contraseña actualizada exitosamente para usuario: {UserId} ({Email})", userId, usuario.Email);

            return new AuthResult { Success = true, Message = "Contraseña actualizada exitosamente" };
        }
        catch (SecurityTokenExpiredException)
        {
            _logger.LogWarning("Intento de reset con token expirado");
            return new AuthResult { Success = false, Message = "El enlace ha expirado. Por favor, solicita uno nuevo." };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en ResetPasswordAsync");
            return new AuthResult { Success = false, Message = "Error al restablecer contraseña" };
        }
    }

    private string GeneratePasswordResetToken(long userId, string email)
    {
        var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
            ?? throw new InvalidOperationException("JWT_KEY no configurada en .env");
        
        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim("token_type", "password-reset") // Identificador para este tipo de token
        };

        // Token expira en 60 minutos
        var token = new JwtSecurityToken(
            issuer: null,
            audience: null,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateJwtToken(Usuario usuario)
    {
        // Leer configuración desde variables de entorno
        var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
            ?? throw new InvalidOperationException("JWT_KEY no configurada en .env");
        var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "TuCita";
        var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "TuCitaUsers";
        var jwtExpiryMinutes = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES") ?? "60");

        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Build claims list
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, $"{usuario.Nombre} {usuario.Apellido}")
        };

        // Add role claims - CRITICAL for authorization
        foreach (var rolUsuario in usuario.RolesUsuarios)
        {
            claims.Add(new Claim(ClaimTypes.Role, rolUsuario.Rol.Nombre));
        }

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
        // Usar BCrypt para hashing de contraseñas
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

// Clase auxiliar para el resultado de autenticación de doctor
public class DoctorAuthResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Token { get; set; }
    public DoctorAuthResponseDto? Doctor { get; set; }
}

// Clase auxiliar para el resultado de autenticación de administrador
public class AdminAuthResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Token { get; set; }
    public AdminAuthResponseDto? Admin { get; set; }
}