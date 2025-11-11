namespace TuCita.DTOs.Appointments;

/// <summary>
/// DTO completo con toda la información de una cita incluyendo datos del paciente y médico
/// </summary>
public class AppointmentDetailDto
{
    public long Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Hora { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public string? Observaciones { get; set; }
    public string Tipo { get; set; } = "PRESENCIAL";
    public string? Ubicacion { get; set; }
    
    // Información del paciente
    public PatientDetailDto Paciente { get; set; } = new();
    
    // Información del médico
    public string NombreMedico { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    
    public DateTime Inicio { get; set; }
    public DateTime Fin { get; set; }
}

public class PatientDetailDto
{
    public long IdPaciente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? FechaNacimiento { get; set; }
    public int? Edad { get; set; }
    public string? Foto { get; set; }
}
