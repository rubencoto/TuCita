using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.MedicalHistory;

public class DiagnosticoDto
{
    public long Id { get; set; }
    public long CitaId { get; set; }
    public string? Codigo { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}

public class CreateDiagnosticoRequest
{
    [Required(ErrorMessage = "El ID de la cita es requerido")]
    public long CitaId { get; set; }

    [StringLength(20, ErrorMessage = "El c�digo ICD no puede exceder 20 caracteres")]
    public string? Codigo { get; set; }

    [Required(ErrorMessage = "La descripci�n es requerida")]
    [StringLength(300, ErrorMessage = "La descripci�n no puede exceder 300 caracteres")]
    public string Descripcion { get; set; } = string.Empty;
}
