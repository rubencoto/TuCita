using Microsoft.EntityFrameworkCore;
using TuCita.Models;

namespace TuCita.Data;

/// <summary>
/// Clase para inicializar datos b�sicos de la base de datos
/// </summary>
public static class DbInitializer
{
    /// <summary>
    /// Inicializa los roles b�sicos del sistema
    /// </summary>
    public static async Task InitializeRolesAsync(TuCitaDbContext context)
    {
        // Verificar si ya existen roles
        if (await context.Roles.AnyAsync())
        {
            return; // Ya hay roles, no hacer nada
        }

        // Crear roles b�sicos
        var roles = new[]
        {
            new Rol { Nombre = "PACIENTE", CreadoEn = DateTime.UtcNow, ActualizadoEn = DateTime.UtcNow },
            new Rol { Nombre = "MEDICO", CreadoEn = DateTime.UtcNow, ActualizadoEn = DateTime.UtcNow },
            new Rol { Nombre = "RECEPCION", CreadoEn = DateTime.UtcNow, ActualizadoEn = DateTime.UtcNow },
            new Rol { Nombre = "ADMIN", CreadoEn = DateTime.UtcNow, ActualizadoEn = DateTime.UtcNow }
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
                Nombre = "PACIENTE",
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };
            
            context.Roles.Add(rolPaciente);
            await context.SaveChangesAsync();
        }

        return rolPaciente;
    }

    /// <summary>
    /// Inicializa especialidades m�dicas comunes
    /// </summary>
    public static async Task InitializeEspecialidadesAsync(TuCitaDbContext context)
    {
        if (await context.Especialidades.AnyAsync())
        {
            return; // Ya hay especialidades
        }

        var especialidades = new[]
        {
            new Especialidad { Nombre = "Cardiolog�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Dermatolog�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Pediatr�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Medicina General", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Traumatolog�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Ginecolog�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Oftalmolog�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Odontolog�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Psiquiatr�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Neurolog�a", CreadoEn = DateTime.UtcNow }
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
            Console.WriteLine("?? No se pudo conectar a la base de datos. Verifica las credenciales y la configuraci�n de red.");
            return;
        }

        // Aplicar migraciones pendientes (mejor que EnsureCreated)
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            Console.WriteLine($"?? Aplicando {pendingMigrations.Count()} migraci�n(es) pendiente(s)...");
            await context.Database.MigrateAsync();
        }
        
        // Inicializar roles
        await InitializeRolesAsync(context);
        
        // Inicializar especialidades
        await InitializeEspecialidadesAsync(context);
        
        Console.WriteLine("? Base de datos inicializada correctamente");
    }
}
