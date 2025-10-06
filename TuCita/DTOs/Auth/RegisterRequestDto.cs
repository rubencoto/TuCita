using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Auth;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(80, ErrorMessage = "El nombre no puede exceder 80 caracteres")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido")]
    [StringLength(80, ErrorMessage = "El apellido no puede exceder 80 caracteres")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El email no es válido")]
    [StringLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
    public string Email { get; set; } = string.Empty;

    [StringLength(30, ErrorMessage = "El teléfono no puede exceder 30 caracteres")]
    public string? Phone { get; set; }

    [Required(ErrorMessage = "La contraseña es requerida")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 100 caracteres")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe confirmar la contraseña")]
    [Compare("Password", ErrorMessage = "Las contraseñas no coinciden")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
