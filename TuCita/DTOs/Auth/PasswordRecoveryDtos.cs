using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Auth;

/// <summary>
/// DTO para solicitar recuperación de contraseña
/// </summary>
public class RequestPasswordResetDto
{
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    public required string Email { get; set; }
}

/// <summary>
/// DTO para validar token de recuperación
/// </summary>
public class ValidateResetTokenDto
{
    [Required(ErrorMessage = "El token es requerido")]
    public required string Token { get; set; }
}

/// <summary>
/// DTO para restablecer contraseña con token
/// </summary>
public class ResetPasswordDto
{
    [Required(ErrorMessage = "El token es requerido")]
    public required string Token { get; set; }

    [Required(ErrorMessage = "La nueva contraseña es requerida")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 100 caracteres")]
    public required string NuevaPassword { get; set; }

    [Required(ErrorMessage = "La confirmación de contraseña es requerida")]
    [Compare(nameof(NuevaPassword), ErrorMessage = "Las contraseñas no coinciden")]
    public required string ConfirmarPassword { get; set; }
}
