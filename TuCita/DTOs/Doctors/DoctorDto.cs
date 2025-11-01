namespace TuCita.DTOs.Doctors;

public class DoctorDto
{
    public long Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public List<string> Especialidades { get; set; } = new();
    public string? NumeroLicencia { get; set; }
    public string? Biografia { get; set; }
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string ExperienceYears { get; set; } = string.Empty;
    public decimal Rating { get; set; } = 4.5m;
    public int ReviewCount { get; set; } = 0;
    public string Hospital { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int AvailableSlots { get; set; } = 0;
    public string NextAvailable { get; set; } = string.Empty;
}
