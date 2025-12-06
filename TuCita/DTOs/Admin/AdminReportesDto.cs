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

/// <summary>
/// DTO de resumen simplificado para consumo frontend
/// </summary>
public class SummaryReportDto
{
    public int Total { get; set; }
    public int Atendidas { get; set; }
    public int Canceladas { get; set; }
    public int NoShow { get; set; }
    public decimal? Ingresos { get; set; }
}

/// <summary>
/// Punto de serie para gráficos en frontend
/// </summary>
public class SeriesPointDto
{
    public string Fecha { get; set; } = string.Empty; // yyyy-MM-dd
    public int Programada { get; set; }
    public int Confirmada { get; set; }
    public int Atendida { get; set; }
    public int Cancelada { get; set; }
    public int NoShow { get; set; }
}

/// <summary>
/// Item simplificado para listado en frontend
/// </summary>
public class ReportItemDto
{
    public long Id { get; set; }
    public string Fecha { get; set; } = string.Empty; // yyyy-MM-dd
    public string Hora { get; set; } = string.Empty; // HH:mm
    public string Paciente { get; set; } = string.Empty;
    public string Doctor { get; set; } = string.Empty;
    public string? Especialidad { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Origen { get; set; }
    public string? AgendadoPor { get; set; }
}

/// <summary>
/// Resultado paginado genérico
/// </summary>
public class PagedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalRegistros { get; set; }
    public int TotalPaginas { get; set; }
}

// Existing more detailed DTOs used by internal report generation (kept below)
public class ReporteGeneradoDto
{
    public string TipoReporte { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public DateTime FechaGeneracion { get; set; } = DateTime.Now;
    public ResumenEjecutivoDto Resumen { get; set; } = new();
    public List<object> Datos { get; set; } = new();
    public List<object> DatosGraficas { get; set; } = new();
    public Dictionary<string, string> FiltrosAplicados { get; set; } = new();
}

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

public class CitasPorEspecialidadDto
{
    public int EspecialidadId { get; set; }
    public string NombreEspecialidad { get; set; } = string.Empty;
    public int TotalCitas { get; set; }
    public int NumDoctores { get; set; }
    public decimal PromedioCtasPorDoctor { get; set; }
    public decimal TasaAsistencia { get; set; }
}

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

public class NoShowAnalisisDto
{
    public string Periodo { get; set; } = string.Empty;
    public int TotalNoShow { get; set; }
    public int TotalCitas { get; set; }
    public decimal Porcentaje { get; set; }
    public List<NoShowPorDoctorDto> PorDoctor { get; set; } = new();
    public List<NoShowPorEspecialidadDto> PorEspecialidad { get; set; } = new();
}

public class NoShowPorDoctorDto
{
    public long DoctorId { get; set; }
    public string NombreDoctor { get; set; } = string.Empty;
    public int NoShowCount { get; set; }
    public decimal Porcentaje { get; set; }
}

public class NoShowPorEspecialidadDto
{
    public string Especialidad { get; set; } = string.Empty;
    public int NoShowCount { get; set; }
    public decimal Porcentaje { get; set; }
}

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
