namespace TuCita.DTOs.Auth;

/// <summary>
/// DTO de respuesta para autenticación de administradores
/// </summary>
public class AdminAuthResponseDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = "ADMIN";
}
