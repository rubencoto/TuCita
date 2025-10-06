namespace TuCita.DTOs.Doctors;

public class DoctorDto
{
    public ulong Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public List<string> Especialidades { get; set; } = new();
    public string? NumeroLicencia { get; set; }
    public string? Biografia { get; set; }
    public string? Direccion { get; set; }
    public string? Ciudad { get; set; }
    public string? Provincia { get; set; }
    public string? Pais { get; set; }
    public string? Location { get; set; }
    public string? Telefono { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string ExperienceYears { get; set; } = string.Empty;
}
