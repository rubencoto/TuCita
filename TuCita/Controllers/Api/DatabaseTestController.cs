using Microsoft.AspNetCore.Mvc;
using TuCita.Services;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class DatabaseTestController : ControllerBase
{
    private readonly IDatabaseTestService _testService;
    private readonly ILogger<DatabaseTestController> _logger;

    public DatabaseTestController(
        IDatabaseTestService testService,
        ILogger<DatabaseTestController> logger)
    {
        _testService = testService;
        _logger = logger;
    }

    /// <summary>
    /// Prueba de conexión completa a la base de datos
    /// </summary>
    [HttpGet("full-test")]
    public async Task<IActionResult> FullDatabaseTest()
    {
        _logger.LogInformation("?? Iniciando prueba completa de base de datos...");

        var results = new
        {
            timestamp = DateTime.UtcNow,
            connection = await _testService.TestConnectionAsync(),
            tables = new DatabaseTablesTestResult(),
            data = new DatabaseDataTestResult()
        };

        // Solo probar tablas y datos si la conexión fue exitosa
        if (results.connection.Success && results.connection.CanConnect)
        {
            results = results with
            {
                tables = await _testService.TestTablesAsync(),
                data = await _testService.TestInitialDataAsync()
            };
        }

        var overallSuccess = results.connection.Success 
            && results.tables.Success 
            && results.data.Success;

        _logger.LogInformation(overallSuccess 
            ? "? Prueba completa exitosa" 
            : "?? Algunas pruebas fallaron");

        return overallSuccess ? Ok(results) : StatusCode(500, results);
    }

    /// <summary>
    /// Prueba solo la conexión a la base de datos
    /// </summary>
    [HttpGet("connection")]
    public async Task<IActionResult> TestConnection()
    {
        _logger.LogInformation("?? Probando conexión a base de datos...");

        var result = await _testService.TestConnectionAsync();

        return result.Success 
            ? Ok(result) 
            : StatusCode(500, result);
    }

    /// <summary>
    /// Verifica que todas las tablas existen
    /// </summary>
    [HttpGet("tables")]
    public async Task<IActionResult> TestTables()
    {
        _logger.LogInformation("?? Verificando estructura de tablas...");

        // Primero verificar conexión
        var connectionTest = await _testService.TestConnectionAsync();
        if (!connectionTest.Success)
        {
            return StatusCode(500, new 
            { 
                error = "No hay conexión a la base de datos",
                details = connectionTest
            });
        }

        var result = await _testService.TestTablesAsync();

        return result.Success 
            ? Ok(result) 
            : StatusCode(500, result);
    }

    /// <summary>
    /// Verifica los datos iniciales (roles, especialidades, etc.)
    /// </summary>
    [HttpGet("data")]
    public async Task<IActionResult> TestData()
    {
        _logger.LogInformation("?? Verificando datos iniciales...");

        // Primero verificar conexión
        var connectionTest = await _testService.TestConnectionAsync();
        if (!connectionTest.Success)
        {
            return StatusCode(500, new 
            { 
                error = "No hay conexión a la base de datos",
                details = connectionTest
            });
        }

        var result = await _testService.TestInitialDataAsync();

        return result.Success 
            ? Ok(result) 
            : StatusCode(500, result);
    }

    /// <summary>
    /// Endpoint de salud simple para Azure Health Checks
    /// </summary>
    [HttpGet("health")]
    public async Task<IActionResult> HealthCheck()
    {
        try
        {
            var result = await _testService.TestConnectionAsync();
            
            if (result.Success && result.CanConnect)
            {
                return Ok(new 
                { 
                    status = "Healthy",
                    database = result.DatabaseName,
                    server = result.DataSource,
                    responseTime = $"{result.ResponseTime.TotalMilliseconds:F2}ms",
                    timestamp = DateTime.UtcNow
                });
            }

            return StatusCode(503, new 
            { 
                status = "Unhealthy",
                message = result.Message,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Health check failed");
            return StatusCode(503, new 
            { 
                status = "Unhealthy",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Información resumida del estado de la base de datos
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> DatabaseStatus()
    {
        try
        {
            var connection = await _testService.TestConnectionAsync();
            
            if (!connection.Success)
            {
                return Ok(new 
                {
                    status = "Disconnected",
                    message = connection.Message,
                    canConnect = false,
                    timestamp = DateTime.UtcNow
                });
            }

            var data = await _testService.TestInitialDataAsync();

            return Ok(new 
            {
                status = "Connected",
                database = connection.DatabaseName,
                server = connection.DataSource,
                version = connection.ServerVersion,
                responseTime = $"{connection.ResponseTime.TotalMilliseconds:F2}ms",
                statistics = new 
                {
                    roles = data.RolesCount,
                    usuarios = data.UsuariosCount,
                    especialidades = data.EspecialidadesCount,
                    medicos = data.MedicosCount,
                    pacientes = data.PacientesCount,
                    citas = data.CitasCount
                },
                initialized = data.HasBasicRoles,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting database status");
            return StatusCode(500, new 
            { 
                status = "Error",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
