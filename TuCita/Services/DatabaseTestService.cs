using Microsoft.EntityFrameworkCore;
using TuCita.Data;

namespace TuCita.Services;

public interface IDatabaseTestService
{
    Task<DatabaseConnectionTestResult> TestConnectionAsync();
    Task<DatabaseTablesTestResult> TestTablesAsync();
    Task<DatabaseDataTestResult> TestInitialDataAsync();
}

public class DatabaseTestService : IDatabaseTestService
{
    private readonly TuCitaDbContext _context;
    private readonly ILogger<DatabaseTestService> _logger;

    public DatabaseTestService(TuCitaDbContext context, ILogger<DatabaseTestService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DatabaseConnectionTestResult> TestConnectionAsync()
    {
        var result = new DatabaseConnectionTestResult();
        var startTime = DateTime.UtcNow;

        try
        {
            _logger.LogInformation("?? Iniciando prueba de conexión a la base de datos...");

            // Intentar abrir conexión
            var canConnect = await _context.Database.CanConnectAsync();
            result.CanConnect = canConnect;

            if (canConnect)
            {
                _logger.LogInformation("? Conexión establecida exitosamente");

                // Obtener información del servidor
                var connection = _context.Database.GetDbConnection();
                result.ServerVersion = connection.ServerVersion;
                result.DatabaseName = connection.Database;
                result.DataSource = connection.DataSource;

                _logger.LogInformation($"?? Base de datos: {result.DatabaseName}");
                _logger.LogInformation($"???  Servidor: {result.DataSource}");
                _logger.LogInformation($"?? Versión: {result.ServerVersion}");

                result.Success = true;
                result.Message = "Conexión exitosa a Azure SQL Database";
            }
            else
            {
                result.Success = false;
                result.Message = "No se pudo establecer conexión con la base de datos";
                _logger.LogError("? No se pudo conectar a la base de datos");
            }
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Error de conexión: {ex.Message}";
            result.ErrorDetails = ex.ToString();
            _logger.LogError(ex, "? Error al intentar conectar con la base de datos");
        }
        finally
        {
            result.ResponseTime = DateTime.UtcNow - startTime;
            _logger.LogInformation($"??  Tiempo de respuesta: {result.ResponseTime.TotalMilliseconds:F2}ms");
        }

        return result;
    }

    public async Task<DatabaseTablesTestResult> TestTablesAsync()
    {
        var result = new DatabaseTablesTestResult();

        try
        {
            _logger.LogInformation("?? Verificando estructura de tablas...");

            // Verificar que las tablas principales existen
            var tableTests = new Dictionary<string, Func<Task<bool>>>
            {
                ["usuarios"] = async () => await _context.Usuarios.AnyAsync() || true,
                ["roles"] = async () => await _context.Roles.AnyAsync() || true,
                ["roles_usuarios"] = async () => await _context.RolesUsuarios.AnyAsync() || true,
                ["especialidades"] = async () => await _context.Especialidades.AnyAsync() || true,
                ["perfil_paciente"] = async () => await _context.PerfilesPacientes.AnyAsync() || true,
                ["perfil_medico"] = async () => await _context.PerfilesMedicos.AnyAsync() || true,
                ["medico_especialidad"] = async () => await _context.MedicosEspecialidades.AnyAsync() || true,
                ["agenda_turnos"] = async () => await _context.AgendaTurnos.AnyAsync() || true,
                ["citas"] = async () => await _context.Citas.AnyAsync() || true,
                ["notas_clinicas"] = async () => await _context.NotasClinicas.AnyAsync() || true,
                ["diagnosticos"] = async () => await _context.Diagnosticos.AnyAsync() || true,
                ["recetas"] = async () => await _context.Recetas.AnyAsync() || true,
                ["receta_items"] = async () => await _context.RecetaItems.AnyAsync() || true,
                ["s3_almacen_config"] = async () => await _context.S3AlmacenConfigs.AnyAsync() || true,
                ["documentos_clinicos"] = async () => await _context.DocumentosClinicos.AnyAsync() || true,
                ["documento_etiquetas"] = async () => await _context.DocumentoEtiquetas.AnyAsync() || true,
                ["documentos_descargas"] = async () => await _context.DocumentoDescargas.AnyAsync() || true
            };

            foreach (var (tableName, testFunc) in tableTests)
            {
                try
                {
                    await testFunc();
                    result.ExistingTables.Add(tableName);
                    _logger.LogInformation($"  ? {tableName}");
                }
                catch (Exception ex)
                {
                    result.MissingTables.Add(tableName);
                    _logger.LogWarning($"  ? {tableName}: {ex.Message}");
                }
            }

            result.Success = result.MissingTables.Count == 0;
            result.Message = result.Success 
                ? $"Todas las tablas existen ({result.ExistingTables.Count}/17)"
                : $"Faltan {result.MissingTables.Count} tablas. Ejecuta migraciones.";

            _logger.LogInformation($"?? Tablas encontradas: {result.ExistingTables.Count}/17");
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Error al verificar tablas: {ex.Message}";
            result.ErrorDetails = ex.ToString();
            _logger.LogError(ex, "? Error al verificar estructura de tablas");
        }

        return result;
    }

    public async Task<DatabaseDataTestResult> TestInitialDataAsync()
    {
        var result = new DatabaseDataTestResult();

        try
        {
            _logger.LogInformation("?? Verificando datos iniciales...");

            // Contar registros en tablas principales
            result.RolesCount = await _context.Roles.CountAsync();
            result.UsuariosCount = await _context.Usuarios.CountAsync();
            result.EspecialidadesCount = await _context.Especialidades.CountAsync();
            result.MedicosCount = await _context.PerfilesMedicos.CountAsync();
            result.PacientesCount = await _context.PerfilesPacientes.CountAsync();
            result.CitasCount = await _context.Citas.CountAsync();

            _logger.LogInformation($"  ?? Roles: {result.RolesCount}");
            _logger.LogInformation($"  ?? Usuarios: {result.UsuariosCount}");
            _logger.LogInformation($"  ?? Especialidades: {result.EspecialidadesCount}");
            _logger.LogInformation($"  ????? Médicos: {result.MedicosCount}");
            _logger.LogInformation($"  ????? Pacientes: {result.PacientesCount}");
            _logger.LogInformation($"  ?? Citas: {result.CitasCount}");

            // Verificar roles básicos
            var rolesEsperados = new[] { "Admin", "Medico", "Paciente" };
            var rolesExistentes = await _context.Roles
                .Where(r => rolesEsperados.Contains(r.Nombre))
                .Select(r => r.Nombre)
                .ToListAsync();

            result.HasBasicRoles = rolesExistentes.Count == rolesEsperados.Length;
            
            if (result.HasBasicRoles)
            {
                _logger.LogInformation($"  ? Roles básicos configurados: {string.Join(", ", rolesExistentes)}");
            }
            else
            {
                var faltantes = rolesEsperados.Except(rolesExistentes);
                _logger.LogWarning($"  ?? Roles faltantes: {string.Join(", ", faltantes)}");
            }

            result.Success = result.HasBasicRoles;
            result.Message = result.Success
                ? "Base de datos inicializada correctamente"
                : "Faltan datos iniciales. Ejecuta DbInitializer.";

        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Error al verificar datos: {ex.Message}";
            result.ErrorDetails = ex.ToString();
            _logger.LogError(ex, "? Error al verificar datos iniciales");
        }

        return result;
    }
}

// DTOs para resultados de pruebas
public class DatabaseConnectionTestResult
{
    public bool Success { get; set; }
    public bool CanConnect { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ServerVersion { get; set; }
    public string? DatabaseName { get; set; }
    public string? DataSource { get; set; }
    public TimeSpan ResponseTime { get; set; }
    public string? ErrorDetails { get; set; }
}

public class DatabaseTablesTestResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> ExistingTables { get; set; } = new();
    public List<string> MissingTables { get; set; } = new();
    public string? ErrorDetails { get; set; }
}

public class DatabaseDataTestResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int RolesCount { get; set; }
    public int UsuariosCount { get; set; }
    public int EspecialidadesCount { get; set; }
    public int MedicosCount { get; set; }
    public int PacientesCount { get; set; }
    public int CitasCount { get; set; }
    public bool HasBasicRoles { get; set; }
    public string? ErrorDetails { get; set; }
}
