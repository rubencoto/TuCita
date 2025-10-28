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

        // Crear roles b�sicos (seg�n el schema de Azure SQL)
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
    /// Asegura que el rol MEDICO existe en la base de datos
    /// </summary>
    public static async Task<Rol> EnsureMedicoRoleExistsAsync(TuCitaDbContext context)
    {
        var rolMedico = await context.Roles
            .FirstOrDefaultAsync(r => r.Nombre == "MEDICO");

        if (rolMedico == null)
        {
            rolMedico = new Rol 
            { 
                Nombre = "MEDICO",
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };
            
            context.Roles.Add(rolMedico);
            await context.SaveChangesAsync();
        }

        return rolMedico;
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

        // Especialidades seg�n el schema de Azure SQL
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
            new Especialidad { Nombre = "Neurolog�a", CreadoEn = DateTime.UtcNow },
            new Especialidad { Nombre = "Ortopedia", CreadoEn = DateTime.UtcNow }
        };

        await context.Especialidades.AddRangeAsync(especialidades);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Inicializa m�dicos de prueba con sus especialidades y turnos
    /// </summary>
    public static async Task InitializeSampleDoctorsAsync(TuCitaDbContext context)
    {
        // Verificar si ya hay m�dicos
        if (await context.PerfilesMedicos.AnyAsync())
        {
            Console.WriteLine("? Ya existen m�dicos en la base de datos. Omitiendo seeding de doctores.");
            return;
        }

        Console.WriteLine("?? Creando m�dicos de prueba...");

        var rolMedico = await EnsureMedicoRoleExistsAsync(context);
        
        // Obtener especialidades
        var especialidades = await context.Especialidades.ToListAsync();
        if (!especialidades.Any())
        {
            Console.WriteLine("? No hay especialidades disponibles. Ejecutando InitializeEspecialidadesAsync...");
            await InitializeEspecialidadesAsync(context);
            especialidades = await context.Especialidades.ToListAsync();
        }

        var doctoresData = new[]
        {
            new { Nombre = "Mar�a", Apellido = "Gonz�lez", Email = "maria.gonzalez@tucita.com", Licencia = "LIC-2018-0001", Especialidad = "Cardiolog�a", Direccion = "Ciudad de M�xico", Telefono = "+52 55 1234 5001", CreatedYearsAgo = 5 },
            new { Nombre = "Carlos", Apellido = "Ruiz", Email = "carlos.ruiz@tucita.com", Licencia = "LIC-2019-0002", Especialidad = "Neurolog�a", Direccion = "Ciudad de M�xico", Telefono = "+52 55 1234 5002", CreatedYearsAgo = 4 },
            new { Nombre = "Ana", Apellido = "Mart�nez", Email = "ana.martinez@tucita.com", Licencia = "LIC-2020-0003", Especialidad = "Pediatr�a", Direccion = "Guadalajara", Telefono = "+52 33 1234 5003", CreatedYearsAgo = 3 },
            new { Nombre = "Roberto", Apellido = "L�pez", Email = "roberto.lopez@tucita.com", Licencia = "LIC-2017-0004", Especialidad = "Ortopedia", Direccion = "Monterrey", Telefono = "+52 81 1234 5004", CreatedYearsAgo = 6 },
            new { Nombre = "Elena", Apellido = "Vargas", Email = "elena.vargas@tucita.com", Licencia = "LIC-2021-0005", Especialidad = "Dermatolog�a", Direccion = "Ciudad de M�xico", Telefono = "+52 55 1234 5005", CreatedYearsAgo = 2 },
            new { Nombre = "Fernando", Apellido = "Silva", Email = "fernando.silva@tucita.com", Licencia = "LIC-2016-0006", Especialidad = "Medicina General", Direccion = "Puebla", Telefono = "+52 22 1234 5006", CreatedYearsAgo = 7 }
        };

        foreach (var doctorData in doctoresData)
        {
            // Crear usuario
            var usuario = new Usuario
            {
                Nombre = doctorData.Nombre,
                Apellido = doctorData.Apellido,
                Email = doctorData.Email,
                EmailNormalizado = doctorData.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                Telefono = doctorData.Telefono,
                Activo = true,
                CreadoEn = DateTime.UtcNow.AddYears(-doctorData.CreatedYearsAgo),
                ActualizadoEn = DateTime.UtcNow
            };

            context.Usuarios.Add(usuario);
            await context.SaveChangesAsync();

            // Asignar rol de m�dico
            var rolUsuario = new RolUsuario
            {
                UsuarioId = usuario.Id,
                RolId = rolMedico.Id,
                AsignadoEn = DateTime.UtcNow
            };
            context.RolesUsuarios.Add(rolUsuario);

            // Crear perfil m�dico
            var perfilMedico = new PerfilMedico
            {
                UsuarioId = usuario.Id,
                NumeroLicencia = doctorData.Licencia,
                Biografia = $"M�dico especialista en {doctorData.Especialidad} con amplia experiencia en el tratamiento y diagn�stico de pacientes. Comprometido con brindar atenci�n de calidad y calidez humana.",
                Direccion = doctorData.Direccion,
                CreadoEn = usuario.CreadoEn,
                ActualizadoEn = DateTime.UtcNow
            };
            context.PerfilesMedicos.Add(perfilMedico);
            await context.SaveChangesAsync();

            // Asignar especialidad
            var especialidad = especialidades.FirstOrDefault(e => e.Nombre == doctorData.Especialidad);
            if (especialidad != null)
            {
                var medicoEspecialidad = new MedicoEspecialidad
                {
                    MedicoId = usuario.Id,
                    EspecialidadId = especialidad.Id
                };
                context.Set<MedicoEspecialidad>().Add(medicoEspecialidad);
            }

            // Crear turnos disponibles para los pr�ximos 7 d�as
            await CreateAvailableSlotsForDoctorAsync(context, usuario.Id);

            await context.SaveChangesAsync();
            Console.WriteLine($"? Doctor creado: Dr. {usuario.Nombre} {usuario.Apellido} - {doctorData.Especialidad}");
        }

        Console.WriteLine($"? Se crearon {doctoresData.Length} m�dicos de prueba con sus turnos");
    }

    /// <summary>
    /// Crea turnos disponibles para un m�dico
    /// </summary>
    private static async Task CreateAvailableSlotsForDoctorAsync(TuCitaDbContext context, ulong medicoId)
    {
        var today = DateTime.Today;
        var turnos = new List<AgendaTurno>();

        // Crear turnos para los pr�ximos 7 d�as (lunes a viernes)
        for (int day = 0; day < 14; day++)
        {
            var fecha = today.AddDays(day);
            
            // Solo d�as laborables (lunes a viernes)
            if (fecha.DayOfWeek == DayOfWeek.Saturday || fecha.DayOfWeek == DayOfWeek.Sunday)
                continue;

            // Turnos de ma�ana: 9:00 AM - 1:00 PM (cada 30 minutos)
            for (int hour = 9; hour < 13; hour++)
            {
                for (int minute = 0; minute < 60; minute += 30)
                {
                    var inicio = new DateTime(fecha.Year, fecha.Month, fecha.Day, hour, minute, 0, DateTimeKind.Utc);
                    var fin = inicio.AddMinutes(30);

                    turnos.Add(new AgendaTurno
                    {
                        MedicoId = medicoId,
                        Inicio = inicio,
                        Fin = fin,
                        Estado = EstadoTurno.DISPONIBLE,
                        CreadoEn = DateTime.UtcNow,
                        ActualizadoEn = DateTime.UtcNow
                    });
                }
            }

            // Turnos de tarde: 3:00 PM - 6:00 PM (cada 30 minutos)
            for (int hour = 15; hour < 18; hour++)
            {
                for (int minute = 0; minute < 60; minute += 30)
                {
                    var inicio = new DateTime(fecha.Year, fecha.Month, fecha.Day, hour, minute, 0, DateTimeKind.Utc);
                    var fin = inicio.AddMinutes(30);

                    turnos.Add(new AgendaTurno
                    {
                        MedicoId = medicoId,
                        Inicio = inicio,
                        Fin = fin,
                        Estado = EstadoTurno.DISPONIBLE,
                        CreadoEn = DateTime.UtcNow,
                        ActualizadoEn = DateTime.UtcNow
                    });
                }
            }
        }

        await context.AgendaTurnos.AddRangeAsync(turnos);
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
            Console.WriteLine("? No se pudo conectar a la base de datos. Verifica las credenciales y la configuraci�n de red.");
            return;
        }

        // Aplicar migraciones pendientes (mejor que EnsureCreated)
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            Console.WriteLine($"? Aplicando {pendingMigrations.Count()} migraci�n(es) pendiente(s)...");
            await context.Database.MigrateAsync();
        }
        
        // Inicializar roles si no existen
        await InitializeRolesAsync(context);
        
        // Inicializar especialidades si no existen
        await InitializeEspecialidadesAsync(context);
        
        // Inicializar m�dicos de prueba (solo en desarrollo)
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment == "Development" || string.IsNullOrEmpty(environment))
        {
            await InitializeSampleDoctorsAsync(context);
        }
        
        Console.WriteLine("? Base de datos inicializada correctamente");
    }
}
