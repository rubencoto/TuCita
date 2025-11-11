namespace TuCita.DTOs.Auth;

/// <summary>
/// DTO de respuesta específico para autenticación de doctores
/// Incluye información adicional del perfil médico
/// </summary>
public class DoctorAuthResponseDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = "DOCTOR";
    
    // Información específica del doctor
    public string? Especialidad { get; set; }
    public string? NumeroLicencia { get; set; }
    public string? Biografia { get; set; }
    public string? Direccion { get; set; }
    public List<string> Especialidades { get; set; } = new();
}
