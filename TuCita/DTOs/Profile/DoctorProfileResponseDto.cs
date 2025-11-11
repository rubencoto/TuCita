namespace TuCita.DTOs.Profile;

/// <summary>
/// DTO de respuesta con la información completa del perfil del doctor
/// </summary>
public class DoctorProfileResponseDto
{
    public long Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Avatar { get; set; }
    
    // Información específica del doctor
    public string? NumeroLicencia { get; set; }
    public string? Biografia { get; set; }
    public string? Direccion { get; set; }
    public List<string> Especialidades { get; set; } = new();
    
    public DateTime CreadoEn { get; set; }
    public DateTime ActualizadoEn { get; set; }
}
