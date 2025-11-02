using System.ComponentModel.DataAnnotations;

namespace TuCita.Shared.DTOs.Appointments;

public class RescheduleAppointmentRequest
{
    [Required(ErrorMessage = "El ID del nuevo turno es requerido")]
    public long NewTurnoId { get; set; }
}
