using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Admin;

/// <summary>
/// DTO para métricas generales del dashboard de administración
/// </summary>
public class DashboardMetricsDto
{
    /// <summary>
    /// Número total de citas programadas para hoy
    /// </summary>
    public int CitasHoy { get; set; }

    /// <summary>
    /// Cambio porcentual respecto al día anterior
    /// </summary>
    public decimal CambioVsAyer { get; set; }

    /// <summary>
    /// Número de citas atendidas esta semana
    /// </summary>
    public int CitasAtendidas { get; set; }

    /// <summary>
    /// Número de citas con estado NO_SHOW
    /// </summary>
    public int CitasNoShow { get; set; }

    /// <summary>
    /// Porcentaje de NO_SHOW respecto al total
    /// </summary>
    public decimal PorcentajeNoShow { get; set; }

    /// <summary>
    /// Número total de doctores activos en el sistema
    /// </summary>
    public int DoctoresActivos { get; set; }

    /// <summary>
    /// Número de doctores con sesión activa actualmente
    /// </summary>
    public int DoctoresConectados { get; set; }
}

/// <summary>
/// DTO para datos de gráficas semanales por estado
/// </summary>
public class WeeklyChartDataDto
{
    /// <summary>
    /// Nombre del día (Lun, Mar, Mié, etc.)
    /// </summary>
    [Required]
    public string Dia { get; set; } = string.Empty;

    /// <summary>
    /// Fecha del día representado
    /// </summary>
    public DateTime Fecha { get; set; }

    /// <summary>
    /// Número de citas programadas
    /// </summary>
    public int Programada { get; set; }

    /// <summary>
    /// Número de citas atendidas
    /// </summary>
    public int Atendida { get; set; }

    /// <summary>
    /// Número de citas canceladas
    /// </summary>
    public int Cancelada { get; set; }

    /// <summary>
    /// Número de citas con NO_SHOW
    /// </summary>
    public int NoShow { get; set; }
}

/// <summary>
/// DTO para distribución por estado de citas (gráfica de pastel)
/// </summary>
public class StatusDistributionDto
{
    /// <summary>
    /// Nombre del estado (PROGRAMADA, ATENDIDA, CANCELADA, NO_SHOW)
    /// </summary>
    [Required]
    public string Estado { get; set; } = string.Empty;

    /// <summary>
    /// Número total de citas en ese estado
    /// </summary>
    public int Cantidad { get; set; }

    /// <summary>
    /// Color hexadecimal para la visualización
    /// </summary>
    public string Color { get; set; } = string.Empty;
}

/// <summary>
/// DTO para próximas citas del día
/// </summary>
public class UpcomingAppointmentDto
{
    /// <summary>
    /// Hora de la cita (formato HH:mm)
    /// </summary>
    [Required]
    public string Hora { get; set; } = string.Empty;

    /// <summary>
    /// Nombre completo del paciente
    /// </summary>
    [Required]
    public string Paciente { get; set; } = string.Empty;

    /// <summary>
    /// Nombre completo del doctor
    /// </summary>
    [Required]
    public string Doctor { get; set; } = string.Empty;

    /// <summary>
    /// Estado actual de la cita
    /// </summary>
    [Required]
    public string Estado { get; set; } = string.Empty;

    /// <summary>
    /// ID de la cita
    /// </summary>
    public long CitaId { get; set; }
}

/// <summary>
/// Tipos de alerta del sistema
/// </summary>
public enum AlertType
{
    Info,
    Warning,
    Error
}

/// <summary>
/// DTO para alertas del sistema
/// </summary>
public class SystemAlertDto
{
    /// <summary>
    /// Tipo de alerta (info, warning, error)
    /// </summary>
    [Required]
    public string Tipo { get; set; } = string.Empty;

    /// <summary>
    /// Mensaje descriptivo de la alerta
    /// </summary>
    [Required]
    public string Mensaje { get; set; } = string.Empty;

    /// <summary>
    /// Tiempo relativo desde que se generó la alerta (Ej: "Hace 1 hora")
    /// </summary>
    public string TiempoRelativo { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora exacta de la alerta
    /// </summary>
    public DateTime FechaHora { get; set; }
}

/// <summary>
/// DTO principal que contiene todos los datos del dashboard
/// </summary>
public class AdminDashboardDto
{
    /// <summary>
    /// Métricas generales del dashboard
    /// </summary>
    public DashboardMetricsDto Metricas { get; set; } = new();

    /// <summary>
    /// Datos para gráfica semanal (últimos 7 días)
    /// </summary>
    public List<WeeklyChartDataDto> DatosSemanales { get; set; } = new();

    /// <summary>
    /// Distribución de citas por estado
    /// </summary>
    public List<StatusDistributionDto> DistribucionEstados { get; set; } = new();

    /// <summary>
    /// Próximas 5 citas del día actual
    /// </summary>
    public List<UpcomingAppointmentDto> ProximasCitas { get; set; } = new();

    /// <summary>
    /// Alertas del sistema
    /// </summary>
    public List<SystemAlertDto> Alertas { get; set; } = new();
}
