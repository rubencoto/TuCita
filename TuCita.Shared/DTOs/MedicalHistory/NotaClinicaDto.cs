using System.ComponentModel.DataAnnotations;

namespace TuCita.Shared.DTOs.MedicalHistory;

public class NotaClinicaDto
{
    public long Id { get; set; }
    public long CitaId { get; set; }
    public string Contenido { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}

public class CreateNotaClinicaRequest
{
    [Required(ErrorMessage = "El ID de la cita es requerido")]
    public long CitaId { get; set; }

    [Required(ErrorMessage = "El contenido de la nota es requerido")]
    public string Contenido { get; set; } = string.Empty;
}
