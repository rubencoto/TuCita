using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Appointments;

public class CreateAppointmentRequest
{
    [Required(ErrorMessage = "El ID del turno es requerido")]
    public long TurnoId { get; set; }

    [Required(ErrorMessage = "El ID del médico es requerido")]
    public long DoctorId { get; set; }

    [StringLength(200, ErrorMessage = "El motivo no puede exceder 200 caracteres")]
    public string? Motivo { get; set; }
}
