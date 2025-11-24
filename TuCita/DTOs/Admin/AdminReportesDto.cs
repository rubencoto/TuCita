using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Admin;

/// <summary>
/// DTO para filtros de generación de reportes
/// </summary>
public class ReporteFilterDto
{
    /// <summary>
    /// Tipo de reporte a generar
    /// </summary>
    [Required]
    public TipoReporte TipoReporte { get; set; }

    /// <summary>
    /// Fecha de inicio del periodo del reporte
    /// </summary>
    [Required]
    public DateTime FechaInicio { get; set; }

    /// <summary>
    /// Fecha de fin del periodo del reporte
    /// </summary>
    [Required]
    public DateTime FechaFin { get; set; }

    /// <summary>
    /// ID del médico (opcional, para filtrar por doctor específico)
    /// </summary>
    public long? MedicoId { get; set; }

    /// <summary>
    /// ID de la especialidad (opcional, para filtrar por especialidad)
    /// </summary>
    public int? EspecialidadId { get; set; }

    /// <summary>
    /// Estado de las citas a incluir (opcional)
    /// </summary>
    public string? Estado { get; set; }

    /// <summary>
    /// Formato de exportación (PDF, Excel, CSV)
    /// </summary>
    public FormatoExportacion? Formato { get; set; }
}

/// <summary>
/// Tipos de reportes disponibles
/// </summary>
public enum TipoReporte
{
    CitasPorPeriodo,
    CitasPorDoctor,
    CitasPorEspecialidad,
    CitasPorEstado,
    PacientesFrecuentes,
    DoctoresRendimiento,
    NoShowAnalisis,
    IngresosPorPeriodo
}

/// <summary>
/// Formatos de exportación disponibles
/// </summary>
public enum FormatoExportacion
{
    PDF,
    Excel,
    CSV
}

/// <summary>
/// DTO principal del reporte generado
/// </summary>
public class ReporteGeneradoDto
{
    /// <summary>
    /// Tipo de reporte generado
    /// </summary>
    public string TipoReporte { get; set; } = string.Empty;

    /// <summary>
    /// Título del reporte
    /// </summary>
    public string Titulo { get; set; } = string.Empty;

    /// <summary>
    /// Fecha de inicio del periodo
    /// </summary>
    public DateTime FechaInicio { get; set; }

    /// <summary>
    /// Fecha de fin del periodo
    /// </summary>
    public DateTime FechaFin { get; set; }

    /// <summary>
    /// Fecha y hora de generación del reporte
    /// </summary>
    public DateTime FechaGeneracion { get; set; } = DateTime.Now;

    /// <summary>
    /// Resumen ejecutivo del reporte
    /// </summary>
    public ResumenEjecutivoDto Resumen { get; set; } = new();

    /// <summary>
    /// Datos detallados del reporte
    /// </summary>
    public List<object> Datos { get; set; } = new();

    /// <summary>
    /// Datos para gráficas
    /// </summary>
    public List<object> DatosGraficas { get; set; } = new();

    /// <summary>
    /// Filtros aplicados al reporte
    /// </summary>
    public Dictionary<string, string> FiltrosAplicados { get; set; } = new();
}

/// <summary>
/// DTO para resumen ejecutivo del reporte
/// </summary>
public class ResumenEjecutivoDto
{
    public int TotalCitas { get; set; }
    public int CitasAtendidas { get; set; }
    public int CitasCanceladas { get; set; }
    public int CitasNoShow { get; set; }
    public decimal TasaAsistencia { get; set; }
    public decimal TasaCancelacion { get; set; }
    public decimal TasaNoShow { get; set; }
    public int TotalPacientes { get; set; }
    public int TotalDoctores { get; set; }
}

/// <summary>
/// DTO para estadísticas de citas por periodo
/// </summary>
public class CitasPorPeriodoDto
{
    public string Periodo { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public int Total { get; set; }
    public int Programadas { get; set; }
    public int Atendidas { get; set; }
    public int Canceladas { get; set; }
    public int NoShow { get; set; }
}

/// <summary>
/// DTO para estadísticas de citas por doctor
/// </summary>
public class CitasPorDoctorDto
{
    public long DoctorId { get; set; }
    public string NombreDoctor { get; set; } = string.Empty;
    public string Especialidad { get; set; } = string.Empty;
    public int TotalCitas { get; set; }
    public int CitasAtendidas { get; set; }
    public int CitasCanceladas { get; set; }
    public int CitasNoShow { get; set; }
    public decimal TasaAsistencia { get; set; }
    public decimal PromedioCalificacion { get; set; }
}

/// <summary>
/// DTO para estadísticas de citas por especialidad
/// </summary>
public class CitasPorEspecialidadDto
{
    public int EspecialidadId { get; set; }
    public string NombreEspecialidad { get; set; } = string.Empty;
    public int TotalCitas { get; set; }
    public int NumDoctores { get; set; }
    public decimal PromedioCtasPorDoctor { get; set; }
    public decimal TasaAsistencia { get; set; }
}

/// <summary>
/// DTO para análisis de pacientes frecuentes
/// </summary>
public class PacienteFrecuenteDto
{
    public long PacienteId { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public int TotalCitas { get; set; }
    public int CitasAtendidas { get; set; }
    public int CitasCanceladas { get; set; }
    public int CitasNoShow { get; set; }
    public DateTime UltimaCita { get; set; }
}

/// <summary>
/// DTO para análisis de NO_SHOW
/// </summary>
public class NoShowAnalisisDto
{
    public string Periodo { get; set; } = string.Empty;
    public int TotalNoShow { get; set; }
    public int TotalCitas { get; set; }
    public decimal Porcentaje { get; set; }
    public List<NoShowPorDoctorDto> PorDoctor { get; set; } = new();
    public List<NoShowPorEspecialidadDto> PorEspecialidad { get; set; } = new();
}

/// <summary>
/// DTO para NO_SHOW por doctor
/// </summary>
public class NoShowPorDoctorDto
{
    public long DoctorId { get; set; }
    public string NombreDoctor { get; set; } = string.Empty;
    public int NoShowCount { get; set; }
    public decimal Porcentaje { get; set; }
}

/// <summary>
/// DTO para NO_SHOW por especialidad
/// </summary>
public class NoShowPorEspecialidadDto
{
    public string Especialidad { get; set; } = string.Empty;
    public int NoShowCount { get; set; }
    public decimal Porcentaje { get; set; }
}

/// <summary>
/// DTO para rendimiento de doctores
/// </summary>
public class DoctorRendimientoDto
{
    public long DoctorId { get; set; }
    public string NombreDoctor { get; set; } = string.Empty;
    public string Especialidad { get; set; } = string.Empty;
    public int TotalCitas { get; set; }
    public int CitasAtendidas { get; set; }
    public decimal TasaAsistencia { get; set; }
    public decimal TiempoPromedioAtencion { get; set; }
    public int PacientesUnicos { get; set; }
    public decimal CalificacionPromedio { get; set; }
    public int SlotsDisponibles { get; set; }
    public int SlotsOcupados { get; set; }
    public decimal TasaOcupacion { get; set; }
}

/// <summary>
/// DTO para respuesta de exportación de archivo
/// </summary>
public class ReporteExportadoDto
{
    /// <summary>
    /// Nombre del archivo generado
    /// </summary>
    public string NombreArchivo { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de contenido (MIME type)
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Datos del archivo en Base64
    /// </summary>
    public string ArchivoBase64 { get; set; } = string.Empty;

    /// <summary>
    /// Tamaño del archivo en bytes
    /// </summary>
    public long TamanoBytes { get; set; }
}
