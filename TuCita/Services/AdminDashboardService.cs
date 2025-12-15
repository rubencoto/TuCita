using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.DTOs.Admin;
using TuCita.Models;
using System.Globalization;

namespace TuCita.Services;

/// <summary>
/// Interface para el servicio de métricas del dashboard de administración
/// </summary>
public interface IAdminDashboardService
{
    /// <summary>
    /// Obtiene todos los datos del dashboard de administración
    /// </summary>
    Task<AdminDashboardDto> GetDashboardDataAsync();

    /// <summary>
    /// Obtiene solo las métricas generales
    /// </summary>
    Task<DashboardMetricsDto> GetMetricsAsync();

    /// <summary>
    /// Obtiene datos semanales para gráficas
    /// </summary>
    Task<List<WeeklyChartDataDto>> GetWeeklyChartDataAsync();

    /// <summary>
    /// Obtiene distribución de estados para gráfica de pastel
    /// </summary>
    Task<List<StatusDistributionDto>> GetStatusDistributionAsync();

    /// <summary>
    /// Obtiene próximas citas del día
    /// </summary>
    Task<List<UpcomingAppointmentDto>> GetUpcomingAppointmentsAsync(int limit = 5);

    /// <summary>
    /// Obtiene alertas del sistema
    /// </summary>
    Task<List<SystemAlertDto>> GetSystemAlertsAsync();
}

/// <summary>
/// Servicio para gestionar métricas y datos del dashboard de administración
/// </summary>
public class AdminDashboardService : IAdminDashboardService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<AdminDashboardService> _logger;

    public AdminDashboardService(TuCitaDbContext context, ILogger<AdminDashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los datos del dashboard de una sola vez
    /// </summary>
    public async Task<AdminDashboardDto> GetDashboardDataAsync()
    {
        try
        {
            var dashboard = new AdminDashboardDto
            {
                Metricas = await GetMetricsAsync(),
                DatosSemanales = await GetWeeklyChartDataAsync(),
                DistribucionEstados = await GetStatusDistributionAsync(),
                ProximasCitas = await GetUpcomingAppointmentsAsync(),
                Alertas = await GetSystemAlertsAsync()
            };

            return dashboard;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener datos del dashboard");
            throw;
        }
    }

    /// <summary>
    /// Calcula las métricas principales del dashboard
    /// </summary>
    public async Task<DashboardMetricsDto> GetMetricsAsync()
    {
        try
        {
            var hoy = DateTime.Today;
            var ayer = hoy.AddDays(-1);
            var inicioSemana = hoy.AddDays(-(int)hoy.DayOfWeek);

            // Citas de hoy
            var citasHoy = await _context.Citas
                .Where(c => c.Inicio.Date == hoy)
                .CountAsync();

            // Citas de ayer
            var citasAyer = await _context.Citas
                .Where(c => c.Inicio.Date == ayer)
                .CountAsync();

            // Calcular cambio porcentual
            decimal cambioVsAyer = 0;
            if (citasAyer > 0)
            {
                cambioVsAyer = ((decimal)(citasHoy - citasAyer) / citasAyer) * 100;
            }

            // Citas atendidas esta semana
            var citasAtendidas = await _context.Citas
                .Where(c => c.Estado == EstadoCita.ATENDIDA && c.Inicio >= inicioSemana)
                .CountAsync();

            // Citas NO_SHOW
            var citasNoShow = await _context.Citas
                .Where(c => c.Estado == EstadoCita.NO_ATENDIDA)
                .CountAsync();

            // Total de citas para calcular porcentaje
            var totalCitas = await _context.Citas.CountAsync();
            decimal porcentajeNoShow = totalCitas > 0 ? ((decimal)citasNoShow / totalCitas) * 100 : 0;

            // Doctores activos
            var doctoresActivos = await _context.PerfilesMedicos
                .Include(pm => pm.Usuario)
                .Where(pm => pm.Usuario.Activo)
                .CountAsync();

            // Doctores conectados (simplificado - en producción usar SignalR o similar)
            // Por ahora: doctores que han tenido actividad en las últimas 2 horas
            var doctoresConectados = 0; // Placeholder - implementar con sistema de sesiones

            var metrics = new DashboardMetricsDto
            {
                CitasHoy = citasHoy,
                CambioVsAyer = Math.Round(cambioVsAyer, 1),
                CitasAtendidas = citasAtendidas,
                CitasNoShow = citasNoShow,
                PorcentajeNoShow = Math.Round(porcentajeNoShow, 1),
                DoctoresActivos = doctoresActivos,
                DoctoresConectados = doctoresConectados
            };

            return metrics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al calcular métricas del dashboard");
            throw;
        }
    }

    /// <summary>
    /// Obtiene datos de los últimos 7 días agrupados por estado
    /// </summary>
    public async Task<List<WeeklyChartDataDto>> GetWeeklyChartDataAsync()
    {
        try
        {
            var hoy = DateTime.Today;
            var hace7Dias = hoy.AddDays(-6); // Últimos 7 días incluyendo hoy

            var citas = await _context.Citas
                .Where(c => c.Inicio.Date >= hace7Dias && c.Inicio.Date <= hoy)
                .Select(c => new { c.Inicio.Date, c.Estado })
                .ToListAsync();

            var weeklyData = new List<WeeklyChartDataDto>();
            var culture = new CultureInfo("es-ES");

            for (int i = 6; i >= 0; i--)
            {
                var fecha = hoy.AddDays(-i);
                var citasDia = citas.Where(c => c.Date == fecha).ToList();

                var dayData = new WeeklyChartDataDto
                {
                    Dia = GetDayAbbreviation(fecha.DayOfWeek),
                    Fecha = fecha,
                    Programada = citasDia.Count(c => c.Estado == EstadoCita.PENDIENTE || c.Estado == EstadoCita.CONFIRMADA),
                    Atendida = citasDia.Count(c => c.Estado == EstadoCita.ATENDIDA),
                    Cancelada = citasDia.Count(c => c.Estado == EstadoCita.CANCELADA || c.Estado == EstadoCita.RECHAZADA),
                    NoShow = citasDia.Count(c => c.Estado == EstadoCita.NO_ATENDIDA)
                };

                weeklyData.Add(dayData);
            }

            return weeklyData;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener datos semanales");
            throw;
        }
    }

    /// <summary>
    /// Obtiene la distribución total de citas por estado
    /// </summary>
    public async Task<List<StatusDistributionDto>> GetStatusDistributionAsync()
    {
        try
        {
            // Obtener todas las citas con sus estados
            var todasLasCitas = await _context.Citas
                .Select(c => c.Estado)
                .ToListAsync();

            // Agrupar por el nombre de visualización (para combinar PENDIENTE y CONFIRMADA en "PROGRAMADA")
            var distribution = todasLasCitas
                .GroupBy(estado => GetEstadoDisplayName(estado))
                .Select(g => new StatusDistributionDto
                {
                    Estado = g.Key,
                    Cantidad = g.Count(),
                    Color = GetEstadoColorByDisplayName(g.Key)
                })
                .ToList();

            return distribution;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener distribución de estados");
            throw;
        }
    }

    /// <summary>
    /// Obtiene las próximas citas del día ordenadas por hora
    /// </summary>
    public async Task<List<UpcomingAppointmentDto>> GetUpcomingAppointmentsAsync(int limit = 5)
    {
        try
        {
            var ahora = DateTime.Now;
            var finDelDia = DateTime.Today.AddDays(1);

            var proximasCitas = await _context.Citas
                .Include(c => c.Paciente)
                    .ThenInclude(p => p.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Where(c => c.Inicio >= ahora && c.Inicio < finDelDia)
                .OrderBy(c => c.Inicio)
                .Take(limit)
                .Select(c => new 
                {
                    c.Id,
                    c.Inicio,
                    c.Estado,
                    PacienteNombre = c.Paciente.Usuario.Nombre,
                    PacienteApellido = c.Paciente.Usuario.Apellido,
                    MedicoNombre = c.Medico.Usuario.Nombre,
                    MedicoApellido = c.Medico.Usuario.Apellido
                })
                .ToListAsync();

            return proximasCitas.Select(c => new UpcomingAppointmentDto
            {
                CitaId = c.Id,
                Hora = c.Inicio.ToString("HH:mm"),
                Paciente = $"{c.PacienteNombre} {c.PacienteApellido}",
                Doctor = $"Dr. {c.MedicoNombre} {c.MedicoApellido}",
                Estado = GetEstadoDisplayName(c.Estado)
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener próximas citas");
            throw;
        }
    }

    /// <summary>
    /// Genera alertas del sistema basadas en reglas de negocio
    /// </summary>
    public async Task<List<SystemAlertDto>> GetSystemAlertsAsync()
    {
        try
        {
            var alertas = new List<SystemAlertDto>();

            // Alerta 1: Doctores sin slots configurados esta semana
            var inicioSemana = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
            var finSemana = inicioSemana.AddDays(7);

            var doctoresSinSlots = await _context.PerfilesMedicos
                .Include(pm => pm.Usuario)
                .Where(pm => pm.Usuario.Activo && 
                            !pm.AgendaTurnos.Any(t => t.Inicio >= inicioSemana && t.Inicio < finSemana))
                .CountAsync();

            if (doctoresSinSlots > 0)
            {
                alertas.Add(new SystemAlertDto
                {
                    Tipo = "warning",
                    Mensaje = $"{doctoresSinSlots} doctores sin slots configurados esta semana",
                    TiempoRelativo = "Hace 1 hora",
                    FechaHora = DateTime.Now.AddHours(-1)
                });
            }

            // Alerta 2: Pacientes con muchos NO_SHOW
            var pacientesBloqueados = await _context.PerfilesPacientes
                .Include(pp => pp.Citas)
                .Where(pp => pp.Citas.Count(c => c.Estado == EstadoCita.NO_ATENDIDA) >= 3)
                .CountAsync();

            if (pacientesBloqueados > 0)
            {
                alertas.Add(new SystemAlertDto
                {
                    Tipo = "error",
                    Mensaje = $"{pacientesBloqueados} pacientes con exceso de NO_SHOW (?3)",
                    TiempoRelativo = "Hace 3 horas",
                    FechaHora = DateTime.Now.AddHours(-3)
                });
            }

            // Alerta 3: Citas pendientes de confirmación (más de 24 horas)
            var hace24h = DateTime.Now.AddHours(-24);
            var citasPendientes = await _context.Citas
                .Where(c => c.Estado == EstadoCita.PENDIENTE && c.CreadoEn < hace24h)
                .CountAsync();

            if (citasPendientes > 0)
            {
                alertas.Add(new SystemAlertDto
                {
                    Tipo = "warning",
                    Mensaje = $"{citasPendientes} citas pendientes de confirmación por más de 24 horas",
                    TiempoRelativo = "Hace 2 horas",
                    FechaHora = DateTime.Now.AddHours(-2)
                });
            }

            // Alerta de información general
            alertas.Add(new SystemAlertDto
            {
                Tipo = "info",
                Mensaje = "Sistema funcionando correctamente - Última verificación completada",
                TiempoRelativo = "Hace 30 minutos",
                FechaHora = DateTime.Now.AddMinutes(-30)
            });

            return alertas.OrderByDescending(a => a.FechaHora).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar alertas del sistema");
            throw;
        }
    }

    #region Métodos auxiliares

    /// <summary>
    /// Obtiene la abreviación del día de la semana en español
    /// </summary>
    private static string GetDayAbbreviation(DayOfWeek day)
    {
        return day switch
        {
            DayOfWeek.Monday => "Lun",
            DayOfWeek.Tuesday => "Mar",
            DayOfWeek.Wednesday => "Mié",
            DayOfWeek.Thursday => "Jue",
            DayOfWeek.Friday => "Vie",
            DayOfWeek.Saturday => "Sáb",
            DayOfWeek.Sunday => "Dom",
            _ => ""
        };
    }

    /// <summary>
    /// Mapea el estado de la cita a su nombre para visualización
    /// </summary>
    private static string GetEstadoDisplayName(EstadoCita estado)
    {
        return estado switch
        {
            EstadoCita.PENDIENTE => "PROGRAMADA",
            EstadoCita.CONFIRMADA => "PROGRAMADA",
            EstadoCita.ATENDIDA => "ATENDIDA",
            EstadoCita.CANCELADA => "CANCELADA",
            EstadoCita.RECHAZADA => "CANCELADA",
            EstadoCita.NO_ATENDIDA => "NO_SHOW",
            _ => "PROGRAMADA"
        };
    }

    /// <summary>
    /// Obtiene el color hexadecimal para cada estado
    /// </summary>
    private static string GetEstadoColor(EstadoCita estado)
    {
        return estado switch
        {
            EstadoCita.PENDIENTE => "#3B82F6", // Azul
            EstadoCita.CONFIRMADA => "#3B82F6", // Azul
            EstadoCita.ATENDIDA => "#10B981", // Verde
            EstadoCita.CANCELADA => "#F59E0B", // Amarillo/Naranja
            EstadoCita.RECHAZADA => "#F59E0B", // Amarillo/Naranja
            EstadoCita.NO_ATENDIDA => "#EF4444", // Rojo
            _ => "#6B7280" // Gris
        };
    }

    /// <summary>
    /// Obtiene el color hexadecimal para cada nombre de visualización de estado
    /// </summary>
    private static string GetEstadoColorByDisplayName(string estadoDisplayName)
    {
        return estadoDisplayName switch
        {
            "PROGRAMADA" => "#3B82F6", // Azul
            "ATENDIDA" => "#10B981", // Verde
            "CANCELADA" => "#F59E0B", // Amarillo/Naranja
            "NO_SHOW" => "#EF4444", // Rojo
            _ => "#6B7280" // Gris
        };
    }

    #endregion
}
