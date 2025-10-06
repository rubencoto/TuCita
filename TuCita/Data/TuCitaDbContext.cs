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

        // Configuración de claves compuestas
        modelBuilder.Entity<RolUsuario>()
            .HasKey(ru => new { ru.UsuarioId, ru.RolId });

        modelBuilder.Entity<MedicoEspecialidad>()
            .HasKey(me => new { me.MedicoId, me.EspecialidadId });

        // Configuración de enums como strings para MySQL
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

        // Configuración específica para MySQL
        modelBuilder.Entity<Usuario>()
            .Property(e => e.EmailNormalizado)
            .HasComputedColumnSql("LOWER(email)", stored: true);

        // Configuración de precisión para DateTime en MySQL
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetColumnType("datetime(6)");
                }
            }
        }

        // Configuración de relaciones con restricciones de eliminación
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

        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Turno)
            .WithMany(t => t.Citas)
            .HasForeignKey(c => c.TurnoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notificacion>()
            .HasOne(n => n.Cita)
            .WithMany()
            .HasForeignKey(n => n.CitaId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configuraciones adicionales para relaciones uno a uno
        modelBuilder.Entity<PerfilPaciente>()
            .HasOne(pp => pp.Usuario)
            .WithOne(u => u.PerfilPaciente)
            .HasForeignKey<PerfilPaciente>(pp => pp.UsuarioId);

        modelBuilder.Entity<PerfilMedico>()
            .HasOne(pm => pm.Usuario)
            .WithOne(u => u.PerfilMedico)
            .HasForeignKey<PerfilMedico>(pm => pm.UsuarioId);
    }
}