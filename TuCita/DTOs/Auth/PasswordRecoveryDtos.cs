using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Auth;

/// <summary>
/// DTO para solicitar recuperaci�n de contrase�a
/// </summary>
public class RequestPasswordResetDto
{
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inv�lido")]
    public required string Email { get; set; }
}

/// <summary>
/// DTO para validar token de recuperaci�n
/// </summary>
public class ValidateResetTokenDto
{
    [Required(ErrorMessage = "El token es requerido")]
    public required string Token { get; set; }
}

/// <summary>
/// DTO para restablecer contrase�a con token
/// </summary>
public class ResetPasswordDto
{
    [Required(ErrorMessage = "El token es requerido")]
    public required string Token { get; set; }

    [Required(ErrorMessage = "La nueva contrase�a es requerida")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contrase�a debe tener entre 6 y 100 caracteres")]
    public required string NuevaPassword { get; set; }

    [Required(ErrorMessage = "La confirmaci�n de contrase�a es requerida")]
    [Compare(nameof(NuevaPassword), ErrorMessage = "Las contrase�as no coinciden")]
    public required string ConfirmarPassword { get; set; }
}
