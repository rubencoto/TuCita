using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuCita.Data;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(TuCitaDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            // Probar conexión básica
            var canConnect = await _context.Database.CanConnectAsync();

            if (!canConnect)
            {
                return StatusCode(500, new
                {
                    status = "Error",
                    message = "No se puede conectar a la base de datos"
                });
            }

            // Probar si existen las tablas principales
            var rolesCount = await _context.Roles.CountAsync();
            var usuariosCount = await _context.Usuarios.CountAsync();
            var especialidadesCount = await _context.Especialidades.CountAsync();

            return Ok(new
            {
                status = "OK",
                message = "Conexión exitosa a la base de datos",
                database = "DigitalOcean MySQL",
                tables = new
                {
                    roles = rolesCount,
                    usuarios = usuariosCount,
                    especialidades = especialidadesCount
                },
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar salud de la base de datos");
            return StatusCode(500, new
            {
                status = "Error",
                message = "Error al conectar con la base de datos",
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("database-info")]
    public async Task<IActionResult> GetDatabaseInfo()
    {
        try
        {
            // Obtener información de la base de datos
            var connectionString = _context.Database.GetConnectionString();
            var providerName = _context.Database.ProviderName;

            return Ok(new
            {
                provider = providerName,
                connectionInfo = new
                {
                    server = "DigitalOcean MySQL",
                    database = "tco_db",
                    port = 25060,
                    ssl = "Required"
                },
                efVersion = typeof(DbContext).Assembly.GetName().Version?.ToString(),
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener información de la base de datos");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("test-connection")]
    public async Task<IActionResult> TestConnection()
    {
        var result = new
        {
            timestamp = DateTime.UtcNow,
            tests = new List<object>()
        };

        try
        {
            _logger.LogInformation("Iniciando prueba de conexión a base de datos");

            // Test 1: CanConnect
            var test1Start = DateTime.UtcNow;
            var canConnect = await _context.Database.CanConnectAsync();
            var test1Duration = (DateTime.UtcNow - test1Start).TotalMilliseconds;

            ((List<object>)result.tests).Add(new
            {
                name = "CanConnect",
                success = canConnect,
                durationMs = test1Duration,
                message = canConnect ? "Conexión establecida" : "No se pudo conectar"
            });

            if (!canConnect)
            {
                return StatusCode(503, new
                {
                    status = "Error",
                    message = "No se puede conectar a la base de datos",
                    result
                });
            }

            // Test 2: Read Roles
            try
            {
                var test2Start = DateTime.UtcNow;
                var rolesCount = await _context.Roles.CountAsync();
                var test2Duration = (DateTime.UtcNow - test2Start).TotalMilliseconds;

                ((List<object>)result.tests).Add(new
                {
                    name = "ReadRoles",
                    success = true,
                    durationMs = test2Duration,
                    count = rolesCount,
                    message = $"Tabla Roles accesible ({rolesCount} registros)"
                });
            }
            catch (Exception ex)
            {
                ((List<object>)result.tests).Add(new
                {
                    name = "ReadRoles",
                    success = false,
                    error = ex.Message,
                    message = "Error al leer tabla Roles"
                });
            }

            // Test 3: Read Usuarios
            try
            {
                var test3Start = DateTime.UtcNow;
                var usuariosCount = await _context.Usuarios.CountAsync();
                var test3Duration = (DateTime.UtcNow - test3Start).TotalMilliseconds;

                ((List<object>)result.tests).Add(new
                {
                    name = "ReadUsuarios",
                    success = true,
                    durationMs = test3Duration,
                    count = usuariosCount,
                    message = $"Tabla Usuarios accesible ({usuariosCount} registros)"
                });
            }
            catch (Exception ex)
            {
                ((List<object>)result.tests).Add(new
                {
                    name = "ReadUsuarios",
                    success = false,
                    error = ex.Message,
                    message = "Error al leer tabla Usuarios"
                });
            }

            // Test 4: Read Especialidades
            try
            {
                var test4Start = DateTime.UtcNow;
                var especialidadesCount = await _context.Especialidades.CountAsync();
                var test4Duration = (DateTime.UtcNow - test4Start).TotalMilliseconds;

                ((List<object>)result.tests).Add(new
                {
                    name = "ReadEspecialidades",
                    success = true,
                    durationMs = test4Duration,
                    count = especialidadesCount,
                    message = $"Tabla Especialidades accesible ({especialidadesCount} registros)"
                });
            }
            catch (Exception ex)
            {
                ((List<object>)result.tests).Add(new
                {
                    name = "ReadEspecialidades",
                    success = false,
                    error = ex.Message,
                    message = "Error al leer tabla Especialidades"
                });
            }

            // Test 5: Read PerfilesMedicos
            try
            {
                var test5Start = DateTime.UtcNow;
                var medicosCount = await _context.PerfilesMedicos.CountAsync();
                var test5Duration = (DateTime.UtcNow - test5Start).TotalMilliseconds;

                ((List<object>)result.tests).Add(new
                {
                    name = "ReadPerfilesMedicos",
                    success = true,
                    durationMs = test5Duration,
                    count = medicosCount,
                    message = $"Tabla PerfilesMedicos accesible ({medicosCount} registros)"
                });
            }
            catch (Exception ex)
            {
                ((List<object>)result.tests).Add(new
                {
                    name = "ReadPerfilesMedicos",
                    success = false,
                    error = ex.Message,
                    message = "Error al leer tabla PerfilesMedicos"
                });
            }

            // Test 6: Read Citas
            try
            {
                var test6Start = DateTime.UtcNow;
                var citasCount = await _context.Citas.CountAsync();
                var test6Duration = (DateTime.UtcNow - test6Start).TotalMilliseconds;

                ((List<object>)result.tests).Add(new
                {
                    name = "ReadCitas",
                    success = true,
                    durationMs = test6Duration,
                    count = citasCount,
                    message = $"Tabla Citas accesible ({citasCount} registros)"
                });
            }
            catch (Exception ex)
            {
                ((List<object>)result.tests).Add(new
                {
                    name = "ReadCitas",
                    success = false,
                    error = ex.Message,
                    message = "Error al leer tabla Citas"
                });
            }

            var allTestsPassed = ((List<object>)result.tests).All(t =>
            {
                var dict = t as IDictionary<string, object>;
                return dict != null && dict.ContainsKey("success") && (bool)dict["success"];
            });

            return Ok(new
            {
                status = allTestsPassed ? "OK" : "Warning",
                message = allTestsPassed ? "Todas las pruebas pasaron" : "Algunas pruebas fallaron",
                result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error crítico al probar conexión");
            return StatusCode(500, new
            {
                status = "Error",
                message = "Error crítico al probar la conexión",
                error = ex.Message,
                innerError = ex.InnerException?.Message,
                result
            });
        }
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new
        {
            status = "OK",
            message = "API está funcionando",
            timestamp = DateTime.UtcNow
        });
    }
}