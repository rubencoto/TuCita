using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El email no es v�lido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contrase�a es requerida")]
    public string Password { get; set; } = string.Empty;
}
