using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TuCita.Data;

namespace TuCita.Services;

/// <summary>
/// Servicio de fondo para limpiar turnos vencidos automáticamente.
/// Se ejecuta cada 24 horas.
/// Ideal para AWS RDS Express/Web donde SQL Server Agent no está disponible.
/// </summary>
public class ExpiredSlotsCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ExpiredSlotsCleanupService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(24); // Ejecutar cada 24 horas
    private readonly TimeSpan _firstRunDelay = TimeSpan.FromMinutes(5); // Primera ejecución a los 5 minutos

    public ExpiredSlotsCleanupService(
        IServiceProvider serviceProvider,
        ILogger<ExpiredSlotsCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("?? Servicio de limpieza de turnos vencidos iniciado");
        _logger.LogInformation("? Se ejecutará cada {Hours} horas", _interval.TotalHours);

        // Esperar antes de la primera ejecución
        await Task.Delay(_firstRunDelay, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredSlotsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "? Error al ejecutar limpieza de turnos vencidos");
            }

            // Esperar hasta la próxima ejecución
            try
            {
                await Task.Delay(_interval, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                // Normal cuando se detiene la aplicación
                _logger.LogInformation("?? Servicio de limpieza detenido");
            }
        }
    }

    private async Task CleanupExpiredSlotsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<TuCitaDbContext>();

        try
        {
            _logger.LogInformation("?? Iniciando limpieza de turnos vencidos...");

            // Ejecutar el procedimiento almacenado
            await context.Database.ExecuteSqlRawAsync(
                "EXEC sp_CleanupExpiredSlots", 
                cancellationToken
            );

            _logger.LogInformation("? Limpieza de turnos vencidos completada");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error durante la limpieza de turnos vencidos");
            throw;
        }
    }
}
