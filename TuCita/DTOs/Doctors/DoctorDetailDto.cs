namespace TuCita.DTOs.Doctors;

public class DoctorDetailDto
{
    public ulong Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public List<string> Especialidades { get; set; } = new();
    public string? NumeroLicencia { get; set; }
    public string? Biografia { get; set; }
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string ExperienceYears { get; set; } = string.Empty;
    public string About { get; set; } = string.Empty;
}
