using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.MedicalHistory;

public class DocumentoDto
{
    public long Id { get; set; }
    public long CitaId { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string NombreArchivo { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long TamanoBytes { get; set; }
    public string? Notas { get; set; }
    public DateTime FechaSubida { get; set; }
    public List<string> Etiquetas { get; set; } = new List<string>();
}

public class CreateDocumentoRequest
{
    [Required(ErrorMessage = "El ID de la cita es requerido")]
    public long CitaId { get; set; }

    [Required(ErrorMessage = "La categoría es requerida")]
    [StringLength(40, ErrorMessage = "La categoría no puede exceder 40 caracteres")]
    [RegularExpression("^(LAB|IMAGEN|REFERENCIA|CONSTANCIA|OTRO)$", ErrorMessage = "Categoría no válida. Debe ser: LAB, IMAGEN, REFERENCIA, CONSTANCIA, u OTRO")]
    public string Categoria { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre del archivo es requerido")]
    [StringLength(255, ErrorMessage = "El nombre del archivo no puede exceder 255 caracteres")]
    public string NombreArchivo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo MIME es requerido")]
    [StringLength(100, ErrorMessage = "El tipo MIME no puede exceder 100 caracteres")]
    public string MimeType { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tamaño del archivo es requerido")]
    [Range(1, 52428800, ErrorMessage = "El tamaño del archivo debe estar entre 1 byte y 50MB")]
    public long TamanoBytes { get; set; }

    [Required(ErrorMessage = "El ID de storage es requerido")]
    public int StorageId { get; set; }

    // AWS S3 fields (replacing Azure Blob fields)
    [Required(ErrorMessage = "La clave del objeto S3 es requerida")]
    [StringLength(1024, ErrorMessage = "La clave del objeto S3 no puede exceder 1024 caracteres")]
    public string S3ObjectKey { get; set; } = string.Empty; // Full S3 object key (includes prefix/folder structure)

    [StringLength(256, ErrorMessage = "El version ID de S3 no puede exceder 256 caracteres")]
    public string? S3VersionId { get; set; } // S3 version ID if versioning is enabled

    [StringLength(256, ErrorMessage = "El ETag de S3 no puede exceder 256 caracteres")]
    public string? S3ETag { get; set; } // S3 ETag for integrity verification

    [StringLength(300, ErrorMessage = "Las notas no pueden exceder 300 caracteres")]
    public string? Notas { get; set; }

    public List<string>? Etiquetas { get; set; }
}
