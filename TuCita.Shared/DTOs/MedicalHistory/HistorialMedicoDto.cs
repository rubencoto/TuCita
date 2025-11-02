namespace TuCita.Shared.DTOs.MedicalHistory;

public class HistorialMedicoDto
{
    public long CitaId { get; set; }
    public DateTime FechaCita { get; set; }
    public string NombreMedico { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    public string EstadoCita { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public List<DiagnosticoDto> Diagnosticos { get; set; } = new();
    public List<NotaClinicaDto> NotasClinicas { get; set; } = new();
    public List<RecetaDto> Recetas { get; set; } = new();
}

public class CitaDetalleDto
{
    public long Id { get; set; }
    public DateTime Inicio { get; set; }
    public DateTime Fin { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public string NombreMedico { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    public string? DireccionMedico { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public string? Identificacion { get; set; }
    public List<DiagnosticoDto> Diagnosticos { get; set; } = new();
    public List<NotaClinicaDto> NotasClinicas { get; set; } = new();
    public List<RecetaDto> Recetas { get; set; } = new();
}
