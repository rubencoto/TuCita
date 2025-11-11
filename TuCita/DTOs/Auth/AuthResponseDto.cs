namespace TuCita.DTOs.Auth;

public class AuthResponseDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public string? NumeroLicencia { get; set; }
    public List<string> Especialidades { get; set; } = new();
}
