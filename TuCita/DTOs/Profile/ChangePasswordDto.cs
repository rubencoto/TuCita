using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Profile;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "La contrase�a actual es requerida")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "La nueva contrase�a es requerida")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "La contrase�a debe tener entre 8 y 100 caracteres")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirmar contrase�a es requerida")]
    [Compare("NewPassword", ErrorMessage = "Las contrase�as no coinciden")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
