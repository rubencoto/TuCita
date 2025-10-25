using Microsoft.EntityFrameworkCore;
using TuCita.Models;

namespace TuCita.Data;

/// <summary>
/// Clase para inicializar datos básicos de la base de datos
/// </summary>
public static class DbInitializer
{
    /// <summary>
    /// Inicializa los roles básicos del sistema
    /// </summary>
    public static async Task InitializeRolesAsync(TuCitaDbContext context)
    {
        // Verificar si ya existen roles
        if (await context.Roles.AnyAsync())
        {
            return; // Ya hay roles, no hacer nada
        }

        // Crear roles básicos (según el schema de Azure SQL)
        var roles = new[]
        {
            new Rol { Nombre = "PACIENTE" },
            new Rol { Nombre = "MEDICO" },
            new Rol { Nombre = "ADMIN" }
        };

        await context.Roles.AddRangeAsync(roles);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Asegura que el rol PACIENTE existe en la base de datos
    /// </summary>
    public static async Task<Rol> EnsurePacienteRoleExistsAsync(TuCitaDbContext context)
    {
        var rolPaciente = await context.Roles
            .FirstOrDefaultAsync(r => r.Nombre == "PACIENTE");

        if (rolPaciente == null)
        {
            rolPaciente = new Rol 
            { 
                Nombre = "PACIENTE"
            };
            
            context.Roles.Add(rolPaciente);
            await context.SaveChangesAsync();
        }

        return rolPaciente;
    }

    /// <summary>
    /// Inicializa especialidades médicas comunes
    /// </summary>
    public static async Task InitializeEspecialidadesAsync(TuCitaDbContext context)
    {
        if (await context.Especialidades.AnyAsync())
        {
            return; // Ya hay especialidades
        }

        // Especialidades según el schema de Azure SQL
        var especialidades = new[]
        {
            new Especialidad { Nombre = "Medicina General" },
            new Especialidad { Nombre = "Cardiología" },
            new Especialidad { Nombre = "Neurología" },
            new Especialidad { Nombre = "Pediatría" },
            new Especialidad { Nombre = "Dermatología" },
            new Especialidad { Nombre = "Ortopedia" },
            new Especialidad { Nombre = "Oftalmología" },
            new Especialidad { Nombre = "Ginecología" },
            new Especialidad { Nombre = "Psiquiatría" },
            new Especialidad { Nombre = "Endocrinología" }
        };

        await context.Especialidades.AddRangeAsync(especialidades);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Inicializa todo el sistema con datos de prueba si es necesario
    /// </summary>
    public static async Task InitializeAsync(TuCitaDbContext context)
    {
        // Verificar si puede conectarse a la base de datos
        var canConnect = await context.Database.CanConnectAsync();
        if (!canConnect)
        {
            Console.WriteLine("?? No se pudo conectar a la base de datos. Verifica las credenciales y la configuración de red.");
            return;
        }

        Console.WriteLine("? Conexión a Azure SQL exitosa");

        // NOTA: No usar migraciones, se asume que el schema ya existe en Azure SQL
        // El script SQL debe ejecutarse manualmente en Azure SQL Database
        
        // Inicializar roles si no existen
        await InitializeRolesAsync(context);
        
        // Inicializar especialidades si no existen
        await InitializeEspecialidadesAsync(context);
        
        Console.WriteLine("? Datos iniciales verificados/insertados correctamente");
    }
}
