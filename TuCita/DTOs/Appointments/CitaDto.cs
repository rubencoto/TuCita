namespace TuCita.DTOs.Appointments;

public class CitaDto
{
    public ulong Id { get; set; }
    public string NombreMedico { get; set; } = string.Empty;
    public string Especialidad { get; set; } = string.Empty;
    public string? DireccionMedico { get; set; }
    public DateTime Inicio { get; set; }
    public DateTime Fin { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Motivo { get; set; }
}
