using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Profile;

/// <summary>
/// DTO para actualizar el perfil del doctor
/// </summary>
public class UpdateDoctorProfileDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(80, ErrorMessage = "El nombre no puede exceder 80 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio")]
    [StringLength(80, ErrorMessage = "El apellido no puede exceder 80 caracteres")]
    public string Apellido { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El formato del email no es válido")]
    [StringLength(150, ErrorMessage = "El email no puede exceder 150 caracteres")]
    public string Email { get; set; } = string.Empty;

    [Phone(ErrorMessage = "El formato del teléfono no es válido")]
    [StringLength(30, ErrorMessage = "El teléfono no puede exceder 30 caracteres")]
    public string? Telefono { get; set; }

    [StringLength(60, ErrorMessage = "El número de licencia no puede exceder 60 caracteres")]
    public string? NumeroLicencia { get; set; }

    [StringLength(1000, ErrorMessage = "La biografía no puede exceder 1000 caracteres")]
    public string? Biografia { get; set; }

    [StringLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres")]
    public string? Direccion { get; set; }

    public List<int>? EspecialidadIds { get; set; }
}
