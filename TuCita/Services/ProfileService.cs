using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.Profile;
using TuCita.DTOs.Auth;

namespace TuCita.Services;

public interface IProfileService
{
    Task<ProfileResult> GetProfileAsync(ulong userId);
    Task<ProfileResult> UpdateProfileAsync(ulong userId, UpdateProfileDto request);
    Task<ProfileResult> ChangePasswordAsync(ulong userId, ChangePasswordDto request);
}

public class ProfileService : IProfileService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<ProfileService> _logger;

    public ProfileService(
        TuCitaDbContext context,
        ILogger<ProfileService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ProfileResult> GetProfileAsync(ulong userId)
    {
        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.PerfilPaciente)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (usuario == null)
            {
                return new ProfileResult 
                { 
                    Success = false, 
                    Message = "Usuario no encontrado" 
                };
            }

            var profileDto = new ProfileResponseDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Email = usuario.Email,
                Telefono = usuario.Telefono,
                FechaNacimiento = usuario.PerfilPaciente?.FechaNacimiento,
                Identificacion = usuario.PerfilPaciente?.Identificacion,
                TelefonoEmergencia = usuario.PerfilPaciente?.TelefonoEmergencia,
                CreadoEn = usuario.CreadoEn,
                ActualizadoEn = usuario.ActualizadoEn
            };

            return new ProfileResult
            {
                Success = true,
                Profile = profileDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener perfil del usuario {UserId}", userId);
            return new ProfileResult
            {
                Success = false,
                Message = "Error al obtener el perfil"
            };
        }
    }

    public async Task<ProfileResult> UpdateProfileAsync(ulong userId, UpdateProfileDto request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var usuario = await _context.Usuarios
                .Include(u => u.PerfilPaciente)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (usuario == null)
            {
                return new ProfileResult 
                { 
                    Success = false, 
                    Message = "Usuario no encontrado" 
                };
            }

            // Verificar si el email ya existe en otro usuario
            if (usuario.Email.ToLower() != request.Email.ToLower())
            {
                var emailExists = await _context.Usuarios
                    .AnyAsync(u => u.EmailNormalizado == request.Email.ToLower() && u.Id != userId);

                if (emailExists)
                {
                    return new ProfileResult
                    {
                        Success = false,
                        Message = "El email ya está registrado por otro usuario"
                    };
                }
            }

            // Actualizar datos del usuario
            usuario.Nombre = request.Nombre;
            usuario.Apellido = request.Apellido;
            usuario.Email = request.Email;
            usuario.EmailNormalizado = request.Email.ToLower();
            usuario.Telefono = request.Telefono;
            usuario.ActualizadoEn = DateTime.UtcNow;

            // Actualizar o crear perfil de paciente
            if (usuario.PerfilPaciente == null)
            {
                usuario.PerfilPaciente = new PerfilPaciente
                {
                    UsuarioId = userId,
                    FechaNacimiento = request.FechaNacimiento,
                    Identificacion = request.Identificacion,
                    TelefonoEmergencia = request.TelefonoEmergencia,
                    CreadoEn = DateTime.UtcNow,
                    ActualizadoEn = DateTime.UtcNow
                };
                _context.PerfilesPacientes.Add(usuario.PerfilPaciente);
            }
            else
            {
                usuario.PerfilPaciente.FechaNacimiento = request.FechaNacimiento;
                usuario.PerfilPaciente.Identificacion = request.Identificacion;
                usuario.PerfilPaciente.TelefonoEmergencia = request.TelefonoEmergencia;
                usuario.PerfilPaciente.ActualizadoEn = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Perfil actualizado exitosamente para usuario {UserId}", userId);

            var profileDto = new ProfileResponseDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Email = usuario.Email,
                Telefono = usuario.Telefono,
                FechaNacimiento = usuario.PerfilPaciente?.FechaNacimiento,
                Identificacion = usuario.PerfilPaciente?.Identificacion,
                TelefonoEmergencia = usuario.PerfilPaciente?.TelefonoEmergencia,
                CreadoEn = usuario.CreadoEn,
                ActualizadoEn = usuario.ActualizadoEn
            };

            // También devolvemos el AuthResponse actualizado para el frontend
            var authResponse = new AuthResponseDto
            {
                Id = usuario.Id,
                Name = $"{usuario.Nombre} {usuario.Apellido}",
                Email = usuario.Email,
                Phone = usuario.Telefono,
                Token = string.Empty // El token se mantiene igual en el cliente
            };

            return new ProfileResult
            {
                Success = true,
                Message = "Perfil actualizado exitosamente",
                Profile = profileDto,
                User = authResponse
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error al actualizar perfil del usuario {UserId}", userId);
            return new ProfileResult
            {
                Success = false,
                Message = "Error al actualizar el perfil"
            };
        }
    }

    public async Task<ProfileResult> ChangePasswordAsync(ulong userId, ChangePasswordDto request)
    {
        try
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (usuario == null)
            {
                return new ProfileResult 
                { 
                    Success = false, 
                    Message = "Usuario no encontrado" 
                };
            }

            // Verificar contraseña actual
            if (!VerifyPassword(request.CurrentPassword, usuario.PasswordHash))
            {
                return new ProfileResult
                {
                    Success = false,
                    Message = "La contraseña actual es incorrecta"
                };
            }

            // Actualizar contraseña
            usuario.PasswordHash = HashPassword(request.NewPassword);
            usuario.ActualizadoEn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Contraseña cambiada exitosamente para usuario {UserId}", userId);

            return new ProfileResult
            {
                Success = true,
                Message = "Contraseña actualizada exitosamente"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar contraseña del usuario {UserId}", userId);
            return new ProfileResult
            {
                Success = false,
                Message = "Error al cambiar la contraseña"
            };
        }
    }

    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}

public class ProfileResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public ProfileResponseDto? Profile { get; set; }
    public AuthResponseDto? User { get; set; }
}
