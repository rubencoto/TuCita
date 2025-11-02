namespace TuCita.Shared.DTOs.Appointments;

public class UpdateAppointmentRequest
{
    public string? Estado { get; set; }
    public DateTime? Inicio { get; set; }
    public DateTime? Fin { get; set; }
    public string? Motivo { get; set; }
}
