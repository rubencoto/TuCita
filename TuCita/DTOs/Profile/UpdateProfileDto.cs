using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Profile;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(80, ErrorMessage = "El nombre no puede exceder 80 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido")]
    [StringLength(80, ErrorMessage = "El apellido no puede exceder 80 caracteres")]
    public string Apellido { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El email no es válido")]
    [StringLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
    public string Email { get; set; } = string.Empty;

    [StringLength(30, ErrorMessage = "El teléfono no puede exceder 30 caracteres")]
    public string? Telefono { get; set; }

    // Campos del perfil de paciente
    public DateOnly? FechaNacimiento { get; set; }
    
    [StringLength(30, ErrorMessage = "La identificación no puede exceder 30 caracteres")]
    public string? Identificacion { get; set; }
    
    [StringLength(30, ErrorMessage = "El teléfono de emergencia no puede exceder 30 caracteres")]
    public string? TelefonoEmergencia { get; set; }
}
