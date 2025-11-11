namespace TuCita.DTOs.Appointments;

/// <summary>
/// DTO para listar citas desde la vista del doctor
/// Incluye información del paciente
/// </summary>
public class DoctorAppointmentDto
{
    public long Id { get; set; }
    public PacienteInfoDto Paciente { get; set; } = new();
    public DateTime Fecha { get; set; }
    public string Hora { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public string? Observaciones { get; set; }
    public DateTime Inicio { get; set; }
    public DateTime Fin { get; set; }
}

/// <summary>
/// Información básica del paciente
/// </summary>
public class PacienteInfoDto
{
    public long Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int? Edad { get; set; }
    public string? Foto { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public string? Identificacion { get; set; }
}

/// <summary>
/// Request para crear una cita manualmente (doctor)
/// </summary>
public class CreateDoctorAppointmentRequest
{
    public long PacienteId { get; set; }
    public DateTime Fecha { get; set; }
    public string Hora { get; set; } = string.Empty; // Formato HH:mm
    public string? Motivo { get; set; }
    public string? Observaciones { get; set; }
    public string Estado { get; set; } = "PENDIENTE";
}

/// <summary>
/// Request para actualizar el estado de una cita (doctor)
/// </summary>
public class UpdateAppointmentStatusRequest
{
    public string Estado { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
}

/// <summary>
/// DTO para obtener información de los pacientes del doctor
/// </summary>
public class DoctorPatientDto
{
    public long IdPaciente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
}
