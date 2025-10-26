using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.MedicalHistory;

public class RecetaDto
{
    public long Id { get; set; }
    public long CitaId { get; set; }
    public string? Indicaciones { get; set; }
    public DateTime Fecha { get; set; }
    public List<RecetaItemDto> Medicamentos { get; set; } = new List<RecetaItemDto>();
}

public class RecetaItemDto
{
    public long Id { get; set; }
    public string Medicamento { get; set; } = string.Empty;
    public string? Dosis { get; set; }
    public string? Frecuencia { get; set; }
    public string? Duracion { get; set; }
    public string? Notas { get; set; }
}

public class CreateRecetaRequest
{
    [Required(ErrorMessage = "El ID de la cita es requerido")]
    public long CitaId { get; set; }

    public string? Indicaciones { get; set; }

    [Required(ErrorMessage = "Debe incluir al menos un medicamento")]
    [MinLength(1, ErrorMessage = "Debe incluir al menos un medicamento")]
    public List<CreateRecetaItemRequest> Medicamentos { get; set; } = new List<CreateRecetaItemRequest>();
}

public class CreateRecetaItemRequest
{
    [Required(ErrorMessage = "El nombre del medicamento es requerido")]
    [StringLength(150, ErrorMessage = "El nombre del medicamento no puede exceder 150 caracteres")]
    public string Medicamento { get; set; } = string.Empty;

    [StringLength(80, ErrorMessage = "La dosis no puede exceder 80 caracteres")]
    public string? Dosis { get; set; }

    [StringLength(80, ErrorMessage = "La frecuencia no puede exceder 80 caracteres")]
    public string? Frecuencia { get; set; }

    [StringLength(80, ErrorMessage = "La duración no puede exceder 80 caracteres")]
    public string? Duracion { get; set; }

    [StringLength(200, ErrorMessage = "Las notas no pueden exceder 200 caracteres")]
    public string? Notas { get; set; }
}
