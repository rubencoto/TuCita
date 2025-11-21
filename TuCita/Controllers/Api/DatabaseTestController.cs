using Microsoft.AspNetCore.Mvc;
using TuCita.Services;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para realizar pruebas de conexión y validación de la base de datos
/// Útil para diagnóstico y monitoreo de salud de la BD
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DatabaseTestController : ControllerBase
{
    private readonly IDatabaseTestService _testService;
    private readonly ILogger<DatabaseTestController> _logger;

    /// <summary>
    /// Constructor del controlador de pruebas de base de datos
    /// </summary>
    /// <param name="testService">Servicio de pruebas de base de datos inyectado por DI</param>
    /// <param name="logger">Logger para registro de eventos</param>
    public DatabaseTestController(
        IDatabaseTestService testService,
        ILogger<DatabaseTestController> logger)
    {
        _testService = testService;
        _logger = logger;
    }

    /// <summary>
    /// Ejecuta una prueba completa de la base de datos incluyendo conexión, tablas y datos
    /// </summary>
    /// <returns>Resultados detallados de todas las pruebas ejecutadas</returns>
    /// <response code="200">Todas las pruebas pasaron exitosamente</response>
    /// <response code="500">Una o más pruebas fallaron</response>
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
    /// Verifica únicamente la conectividad con la base de datos
    /// </summary>
    /// <returns>Información de conexión incluyendo servidor, base de datos y tiempo de respuesta</returns>
    /// <response code="200">Conexión exitosa</response>
    /// <response code="500">Error de conexión</response>
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
    /// Verifica que todas las tablas necesarias existan en la base de datos
    /// </summary>
    /// <returns>Lista de tablas verificadas y su estado de existencia</returns>
    /// <response code="200">Todas las tablas existen</response>
    /// <response code="500">Error de conexión o tablas faltantes</response>
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
    /// Verifica que los datos iniciales (roles, especialidades, etc.) estén presentes
    /// </summary>
    /// <returns>Conteo de registros en tablas principales y estado de inicialización</returns>
    /// <response code="200">Datos iniciales verificados exitosamente</response>
    /// <response code="500">Error de conexión o datos faltantes</response>
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
    /// Endpoint simplificado de salud para Azure Health Checks y monitoreo
    /// </summary>
    /// <returns>Estado de salud de la base de datos con información mínima</returns>
    /// <response code="200">Base de datos saludable y accesible</response>
    /// <response code="503">Base de datos no disponible o con problemas</response>
    /// <remarks>
    /// Este endpoint está optimizado para ser usado por sistemas de monitoreo
    /// y health checks automatizados de Azure.
    /// </remarks>
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
    /// Obtiene información resumida y estadísticas del estado de la base de datos
    /// </summary>
    /// <returns>Estadísticas de registros, estado de conexión y configuración del servidor</returns>
    /// <response code="200">Información obtenida exitosamente</response>
    /// <response code="500">Error al obtener información</response>
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
