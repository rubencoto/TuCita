using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Appointments;

public class CreateAppointmentRequest
{
    [Required(ErrorMessage = "El ID del turno es requerido")]
    public ulong TurnoId { get; set; }

    [Required(ErrorMessage = "El ID del médico es requerido")]
    public ulong DoctorId { get; set; }

    [StringLength(200, ErrorMessage = "El motivo no puede exceder 200 caracteres")]
    public string? Motivo { get; set; }
}
