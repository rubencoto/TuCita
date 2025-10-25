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
    public DbSet<NotaClinica> NotasClinicas { get; set; }
    public DbSet<Diagnostico> Diagnosticos { get; set; }
    public DbSet<Receta> Recetas { get; set; }
    public DbSet<RecetaItem> RecetaItems { get; set; }
    public DbSet<AzureAlmacenConfig> AzureAlmacenConfigs { get; set; }
    public DbSet<DocumentoClinico> DocumentosClinicos { get; set; }
    public DbSet<DocumentoEtiqueta> DocumentoEtiquetas { get; set; }
    public DbSet<DocumentoDescarga> DocumentoDescargas { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de claves compuestas
        modelBuilder.Entity<RolUsuario>()
            .HasKey(ru => new { ru.UsuarioId, ru.RolId });

        modelBuilder.Entity<MedicoEspecialidad>()
            .HasKey(me => new { me.MedicoId, me.EspecialidadId });

        modelBuilder.Entity<DocumentoEtiqueta>()
            .HasKey(de => new { de.DocumentoId, de.Etiqueta });

        // Configuración de enums como strings
        modelBuilder.Entity<AgendaTurno>()
            .Property(e => e.Estado)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<Cita>()
            .Property(e => e.Estado)
            .HasConversion<string>()
            .HasMaxLength(50);

        // Configuración específica para SQL Server - columna computada
        modelBuilder.Entity<Usuario>()
            .Property(e => e.EmailNormalizado)
            .HasComputedColumnSql("LOWER(LTRIM(RTRIM([email])))", stored: true);

        // Configuración de precisión para DateTime en SQL Server (datetime2(6))
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetColumnType("datetime2(6)");
                }
            }
        }

        // Configuración de columnas NVARCHAR(MAX) para campos de texto largo
        modelBuilder.Entity<PerfilMedico>()
            .Property(e => e.Biografia)
            .HasColumnType("NVARCHAR(MAX)");

        modelBuilder.Entity<NotaClinica>()
            .Property(e => e.Nota)
            .HasColumnType("NVARCHAR(MAX)");

        modelBuilder.Entity<Receta>()
            .Property(e => e.Indicaciones)
            .HasColumnType("NVARCHAR(MAX)");

        // Configuración de relaciones con restricciones de eliminación según el schema
        
        // roles_usuarios
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

        // perfil_paciente y perfil_medico (CASCADE)
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

        // medico_especialidad (CASCADE)
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

        // agenda_turnos (CASCADE desde perfil_medico)
        modelBuilder.Entity<AgendaTurno>()
            .HasOne(at => at.Medico)
            .WithMany(m => m.AgendaTurnos)
            .HasForeignKey(at => at.MedicoId)
            .OnDelete(DeleteBehavior.Cascade);

        // citas (NO ACTION para evitar múltiples rutas de cascada)
        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Turno)
            .WithMany(t => t.Citas)
            .HasForeignKey(c => c.TurnoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Medico)
            .WithMany(m => m.Citas)
            .HasForeignKey(c => c.MedicoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Paciente)
            .WithMany(p => p.Citas)
            .HasForeignKey(c => c.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Creador)
            .WithMany()
            .HasForeignKey(c => c.CreadoPor)
            .OnDelete(DeleteBehavior.Restrict);

        // notas_clinicas, diagnosticos, recetas (CASCADE desde citas)
        modelBuilder.Entity<NotaClinica>()
            .HasOne(nc => nc.Cita)
            .WithMany(c => c.NotasClinicas)
            .HasForeignKey(nc => nc.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

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

        // receta_items (CASCADE desde recetas)
        modelBuilder.Entity<RecetaItem>()
            .HasOne(ri => ri.Receta)
            .WithMany(r => r.Items)
            .HasForeignKey(ri => ri.RecetaId)
            .OnDelete(DeleteBehavior.Cascade);

        // documentos_clinicos (CASCADE desde citas, NO ACTION para médico/paciente/creador/storage)
        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(dc => dc.Cita)
            .WithMany(c => c.Documentos)
            .HasForeignKey(dc => dc.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(dc => dc.Medico)
            .WithMany()
            .HasForeignKey(dc => dc.MedicoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(dc => dc.Paciente)
            .WithMany()
            .HasForeignKey(dc => dc.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(dc => dc.Creador)
            .WithMany()
            .HasForeignKey(dc => dc.CreadoPor)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(dc => dc.Storage)
            .WithMany(s => s.Documentos)
            .HasForeignKey(dc => dc.StorageId)
            .OnDelete(DeleteBehavior.Restrict);

        // documento_etiquetas (CASCADE desde documentos_clinicos)
        modelBuilder.Entity<DocumentoEtiqueta>()
            .HasOne(de => de.Documento)
            .WithMany(d => d.Etiquetas)
            .HasForeignKey(de => de.DocumentoId)
            .OnDelete(DeleteBehavior.Cascade);

        // documentos_descargas (CASCADE desde documentos_clinicos, NO ACTION para usuario)
        modelBuilder.Entity<DocumentoDescarga>()
            .HasOne(dd => dd.Documento)
            .WithMany(d => d.Descargas)
            .HasForeignKey(dd => dd.DocumentoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DocumentoDescarga>()
            .HasOne(dd => dd.Usuario)
            .WithMany()
            .HasForeignKey(dd => dd.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices adicionales para performance
        modelBuilder.Entity<AgendaTurno>()
            .HasIndex(at => new { at.MedicoId, at.Inicio });

        modelBuilder.Entity<Cita>()
            .HasIndex(c => new { c.MedicoId, c.Estado, c.Inicio });

        modelBuilder.Entity<Cita>()
            .HasIndex(c => new { c.PacienteId, c.Inicio });

        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(dc => new { dc.CitaId, dc.CreadoEn });

        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(dc => new { dc.PacienteId, dc.CreadoEn });

        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(dc => new { dc.MedicoId, dc.CreadoEn });

        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(dc => dc.Categoria);

        modelBuilder.Entity<DocumentoEtiqueta>()
            .HasIndex(de => de.Etiqueta);

        modelBuilder.Entity<DocumentoDescarga>()
            .HasIndex(dd => new { dd.DocumentoId, dd.CreadoEn });

        modelBuilder.Entity<DocumentoDescarga>()
            .HasIndex(dd => new { dd.UsuarioId, dd.CreadoEn });

        modelBuilder.Entity<AzureAlmacenConfig>()
            .HasIndex(aac => aac.Activo);

        // Restricciones de CHECK (verificaciones adicionales)
        modelBuilder.Entity<AgendaTurno>()
            .ToTable(t => t.HasCheckConstraint("CK_agenda_turnos_intervalo", "[fin] > [inicio]"));

        modelBuilder.Entity<AgendaTurno>()
            .ToTable(t => t.HasCheckConstraint("CK_agenda_turnos_estado", "[estado] IN (N'DISPONIBLE', N'RESERVADO', N'BLOQUEADO')"));

        modelBuilder.Entity<Cita>()
            .ToTable(t => t.HasCheckConstraint("CK_citas_intervalo", "[fin] > [inicio]"));

        modelBuilder.Entity<Cita>()
            .ToTable(t => t.HasCheckConstraint("CK_citas_estado", "[estado] IN (N'PENDIENTE', N'CONFIRMADA', N'RECHAZADA', N'CANCELADA', N'ATENDIDA')"));

        modelBuilder.Entity<DocumentoClinico>()
            .ToTable(t => t.HasCheckConstraint("CK_doc_categoria", "[categoria] IN (N'LAB', N'IMAGEN', N'REFERENCIA', N'CONSTANCIA', N'OTRO')"));
    }
}