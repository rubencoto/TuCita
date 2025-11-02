using System.ComponentModel.DataAnnotations;

namespace TuCita.Shared.DTOs.MedicalHistory;

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

    [StringLength(20, ErrorMessage = "El código ICD no puede exceder 20 caracteres")]
    public string? Codigo { get; set; }

    [Required(ErrorMessage = "La descripción es requerida")]
    [StringLength(300, ErrorMessage = "La descripción no puede exceder 300 caracteres")]
    public string Descripcion { get; set; } = string.Empty;
}
