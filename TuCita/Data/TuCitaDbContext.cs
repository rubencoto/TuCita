using Microsoft.EntityFrameworkCore;
using TuCita.Models;

namespace TuCita.Data;

public class TuCitaDbContext : DbContext
{
    public TuCitaDbContext(DbContextOptions<TuCitaDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<Rol> Roles { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<RolUsuario> RolesUsuarios { get; set; }
    public DbSet<Especialidad> Especialidades { get; set; }
    public DbSet<PerfilPaciente> PerfilesPacientes { get; set; }
    public DbSet<PerfilMedico> PerfilesMedicos { get; set; }
    public DbSet<MedicoEspecialidad> MedicosEspecialidades { get; set; }
    public DbSet<AgendaTurno> AgendaTurnos { get; set; }
    public DbSet<Cita> Citas { get; set; }
    public DbSet<Notificacion> Notificaciones { get; set; }
    public DbSet<NotaClinica> NotasClinicas { get; set; }
    public DbSet<Diagnostico> Diagnosticos { get; set; }
    public DbSet<Receta> Recetas { get; set; }
    public DbSet<RecetaItem> RecetaItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ============================================================
        // CONFIGURACIÓN DE CLAVES COMPUESTAS
        // ============================================================
        
        modelBuilder.Entity<RolUsuario>()
            .HasKey(ru => new { ru.UsuarioId, ru.RolId });

        modelBuilder.Entity<MedicoEspecialidad>()
            .HasKey(me => new { me.MedicoId, me.EspecialidadId });

        // ============================================================
        // CONFIGURACIÓN DE ENUMS COMO STRINGS
        // ============================================================
        
        modelBuilder.Entity<AgendaTurno>()
            .Property(e => e.Estado)
            .HasConversion<string>();

        modelBuilder.Entity<Cita>()
            .Property(e => e.Estado)
            .HasConversion<string>();

        modelBuilder.Entity<Notificacion>()
            .Property(e => e.Canal)
            .HasConversion<string>();

        modelBuilder.Entity<Notificacion>()
            .Property(e => e.Tipo)
            .HasConversion<string>();

        // ============================================================
        // CONFIGURACIÓN ESPECÍFICA PARA SQL SERVER
        // ============================================================

        // Computed column para email normalizado (SQL Server syntax)
        modelBuilder.Entity<Usuario>()
            .Property(e => e.EmailNormalizado)
            .HasComputedColumnSql("LOWER([email])", stored: true);

        // Configuración de tipos de columna específicos de SQL Server
        modelBuilder.Entity<Usuario>()
            .Property(e => e.Id)
            .HasColumnType("bigint");

        // Configuración de precisión para DateTime en SQL Server (datetime2 es más preciso)
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                // datetime2(6) proporciona precisión de microsegundos (similar a MySQL datetime(6))
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetColumnType("datetime2(6)");
                }
            }
        }

        // Configuración de tipos TEXT para SQL Server (usar NVARCHAR(MAX))
        modelBuilder.Entity<NotaClinica>()
            .Property(e => e.Nota)
            .HasColumnType("NVARCHAR(MAX)");

        modelBuilder.Entity<PerfilMedico>()
            .Property(e => e.Biografia)
            .HasColumnType("NVARCHAR(MAX)");

        modelBuilder.Entity<Receta>()
            .Property(e => e.Indicaciones)
            .HasColumnType("NVARCHAR(MAX)");

        // Configuración de JSON para SQL Server (NVARCHAR(MAX) hasta SQL Server 2016+)
        modelBuilder.Entity<Notificacion>()
            .Property(e => e.Contenido)
            .HasColumnType("NVARCHAR(MAX)");

        // ============================================================
        // CONFIGURACIÓN DE ÍNDICES
        // ============================================================

        // Índice único en email normalizado
        modelBuilder.Entity<Usuario>()
            .HasIndex(e => e.EmailNormalizado)
            .IsUnique();

        // Índice único en nombre de rol
        modelBuilder.Entity<Rol>()
            .HasIndex(e => e.Nombre)
            .IsUnique();

        // Índice único en nombre de especialidad
        modelBuilder.Entity<Especialidad>()
            .HasIndex(e => e.Nombre)
            .IsUnique();

        // Índices para mejorar rendimiento de búsquedas
        modelBuilder.Entity<AgendaTurno>()
            .HasIndex(e => new { e.MedicoId, e.Inicio, e.Estado })
            .HasDatabaseName("IX_AgendaTurnos_Medico_Inicio_Estado");

        modelBuilder.Entity<Cita>()
            .HasIndex(e => new { e.PacienteId, e.Inicio })
            .HasDatabaseName("IX_Citas_Paciente_Inicio");

        modelBuilder.Entity<Cita>()
            .HasIndex(e => new { e.MedicoId, e.Inicio })
            .HasDatabaseName("IX_Citas_Medico_Inicio");

        // ============================================================
        // CONFIGURACIÓN DE RELACIONES CON RESTRICCIONES DE ELIMINACIÓN
        // ============================================================
        
        // Relación Usuario-RolUsuario (Cascade en usuario, Restrict en rol)
        modelBuilder.Entity<RolUsuario>()
            .HasOne(ru => ru.Usuario)
            .WithMany(u => u.RolesUsuarios)
            .HasForeignKey(ru => ru.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolUsuario>()
            .HasOne(ru => ru.Rol)
            .WithMany(r => r.RolesUsuarios)
            .HasForeignKey(ru => ru.RolId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relación Cita-Turno (Restrict para evitar eliminación accidental de turnos con citas)
        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Turno)
            .WithMany(t => t.Citas)
            .HasForeignKey(c => c.TurnoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relación Notificación-Cita (SetNull cuando se elimina la cita)
        modelBuilder.Entity<Notificacion>()
            .HasOne(n => n.Cita)
            .WithMany()
            .HasForeignKey(n => n.CitaId)
            .OnDelete(DeleteBehavior.SetNull);

        // Relaciones uno a uno para perfiles
        modelBuilder.Entity<PerfilPaciente>()
            .HasOne(pp => pp.Usuario)
            .WithOne(u => u.PerfilPaciente)
            .HasForeignKey<PerfilPaciente>(pp => pp.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PerfilMedico>()
            .HasOne(pm => pm.Usuario)
            .WithOne(u => u.PerfilMedico)
            .HasForeignKey<PerfilMedico>(pm => pm.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relaciones muchos a muchos (Médico-Especialidad)
        modelBuilder.Entity<MedicoEspecialidad>()
            .HasOne(me => me.Medico)
            .WithMany(m => m.EspecialidadesMedico)
            .HasForeignKey(me => me.MedicoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MedicoEspecialidad>()
            .HasOne(me => me.Especialidad)
            .WithMany(e => e.MedicosEspecialidades)
            .HasForeignKey(me => me.EspecialidadId)
            .OnDelete(DeleteBehavior.Cascade);

        // Otras relaciones estándar (todas con Cascade por defecto)
        // EF Core las configura automáticamente, pero las hacemos explícitas para claridad

        modelBuilder.Entity<AgendaTurno>()
            .HasOne(at => at.Medico)
            .WithMany(pm => pm.AgendaTurnos)
            .HasForeignKey(at => at.MedicoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Medico)
            .WithMany(pm => pm.Citas)
            .HasForeignKey(c => c.MedicoId)
            .OnDelete(DeleteBehavior.NoAction); // ?? Cambiado a NoAction para evitar ciclos

        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Paciente)
            .WithMany(pp => pp.Citas)
            .HasForeignKey(c => c.PacienteId)
            .OnDelete(DeleteBehavior.NoAction); // ?? Cambiado a NoAction para evitar ciclos

        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Creador)
            .WithMany()
            .HasForeignKey(c => c.CreadoPor)
            .OnDelete(DeleteBehavior.NoAction); // ?? Cambiado a NoAction para evitar ciclos

        modelBuilder.Entity<NotaClinica>()
            .HasOne(nc => nc.Cita)
            .WithMany(c => c.NotasClinicas)
            .HasForeignKey(nc => nc.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NotaClinica>()
            .HasOne(nc => nc.Medico)
            .WithMany()
            .HasForeignKey(nc => nc.MedicoId)
            .OnDelete(DeleteBehavior.NoAction); // ?? Cambiado a NoAction para evitar ciclos

        modelBuilder.Entity<NotaClinica>()
            .HasOne(nc => nc.Paciente)
            .WithMany()
            .HasForeignKey(nc => nc.PacienteId)
            .OnDelete(DeleteBehavior.NoAction); // ?? Cambiado a NoAction para evitar ciclos

        modelBuilder.Entity<Diagnostico>()
            .HasOne(d => d.Cita)
            .WithMany(c => c.Diagnosticos)
            .HasForeignKey(d => d.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Receta>()
            .HasOne(r => r.Cita)
            .WithMany(c => c.Recetas)
            .HasForeignKey(r => r.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RecetaItem>()
            .HasOne(ri => ri.Receta)
            .WithMany(r => r.Items)
            .HasForeignKey(ri => ri.RecetaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}