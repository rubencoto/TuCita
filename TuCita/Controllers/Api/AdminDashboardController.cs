using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Admin;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para el dashboard de administración
/// Proporciona métricas, estadísticas y alertas del sistema
/// Requiere autenticación con rol ADMIN
/// </summary>
[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "ADMIN")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _dashboardService;
    private readonly ILogger<AdminDashboardController> _logger;

    /// <summary>
    /// Constructor del controlador de dashboard de administración
    /// </summary>
    /// <param name="dashboardService">Servicio de métricas del dashboard</param>
    /// <param name="logger">Logger para registro de eventos</param>
    public AdminDashboardController(
        IAdminDashboardService dashboardService,
        ILogger<AdminDashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los datos del dashboard de administración en una sola llamada
    /// </summary>
    /// <returns>Objeto completo con métricas, gráficas, citas y alertas</returns>
    /// <response code="200">Datos del dashboard obtenidos exitosamente</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Este endpoint es el más eficiente para cargar todo el dashboard de una vez.
    /// Incluye:
    /// - Métricas generales (citas hoy, atendidas, no-show, doctores activos)
    /// - Datos semanales para gráficas (últimos 7 días)
    /// - Distribución de estados para gráfica de pastel
    /// - Próximas 5 citas del día
    /// - Alertas del sistema
    /// </remarks>
    [HttpGet]
    public async Task<IActionResult> GetDashboardData()
    {
        try
        {
            var dashboard = await _dashboardService.GetDashboardDataAsync();
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener datos del dashboard de administración");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene solo las métricas generales del dashboard
    /// </summary>
    /// <returns>Métricas principales (citas hoy, atendidas, no-show, doctores)</returns>
    /// <response code="200">Métricas obtenidas exitosamente</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics()
    {
        try
        {
            var metrics = await _dashboardService.GetMetricsAsync();
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener métricas del dashboard");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene datos de los últimos 7 días para gráficas semanales
    /// </summary>
    /// <returns>Lista de 7 días con cantidades por estado (PROGRAMADA, ATENDIDA, CANCELADA, NO_SHOW)</returns>
    /// <response code="200">Datos semanales obtenidos exitosamente</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("weekly-chart")]
    public async Task<IActionResult> GetWeeklyChartData()
    {
        try
        {
            var chartData = await _dashboardService.GetWeeklyChartDataAsync();
            return Ok(chartData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener datos de gráfica semanal");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene la distribución total de citas por estado
    /// </summary>
    /// <returns>Lista de estados con cantidades y colores para gráfica de pastel</returns>
    /// <response code="200">Distribución obtenida exitosamente</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("status-distribution")]
    public async Task<IActionResult> GetStatusDistribution()
    {
        try
        {
            var distribution = await _dashboardService.GetStatusDistributionAsync();
            return Ok(distribution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener distribución de estados");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene las próximas citas del día actual
    /// </summary>
    /// <param name="limit">Número máximo de citas a retornar (por defecto 5)</param>
    /// <returns>Lista de próximas citas ordenadas por hora</returns>
    /// <response code="200">Próximas citas obtenidas exitosamente</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("upcoming-appointments")]
    public async Task<IActionResult> GetUpcomingAppointments([FromQuery] int limit = 5)
    {
        try
        {
            if (limit < 1 || limit > 50)
            {
                return BadRequest(new { message = "El límite debe estar entre 1 y 50" });
            }

            var appointments = await _dashboardService.GetUpcomingAppointmentsAsync(limit);
            return Ok(appointments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener próximas citas");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene las alertas del sistema
    /// </summary>
    /// <returns>Lista de alertas (info, warning, error) con mensajes y tiempos</returns>
    /// <response code="200">Alertas obtenidas exitosamente</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Las alertas incluyen:
    /// - Doctores sin slots configurados
    /// - Pacientes con múltiples NO_SHOW
    /// - Citas pendientes de confirmación
    /// - Estado general del sistema
    /// </remarks>
    [HttpGet("alerts")]
    public async Task<IActionResult> GetSystemAlerts()
    {
        try
        {
            var alerts = await _dashboardService.GetSystemAlertsAsync();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener alertas del sistema");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }
}
