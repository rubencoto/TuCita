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
    
    // AWS S3 Storage configuration
    public DbSet<S3AlmacenConfig> S3AlmacenConfigs { get; set; }
    
    public DbSet<DocumentoClinico> DocumentosClinicos { get; set; }
    public DbSet<DocumentoEtiqueta> DocumentoEtiquetas { get; set; }
    public DbSet<DocumentoDescarga> DocumentoDescargas { get; set; }
    // NO usaremos tablas de notificaciones - solo emails directos

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

        modelBuilder.Entity<DocumentoEtiqueta>()
            .HasKey(de => new { de.DocumentoId, de.Etiqueta });

        // ============================================================
        // CONFIGURACIÓN DE ENUMS COMO STRINGS
        // ============================================================
        
        modelBuilder.Entity<AgendaTurno>()
            .Property(e => e.Estado)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<Cita>()
            .Property(e => e.Estado)
            .HasConversion<string>()
            .HasMaxLength(50);

        // ============================================================
        // CONFIGURACIÓN PARA TABLAS CON TRIGGERS
        // ============================================================
        // Las tablas con triggers no pueden usar OUTPUT clause
        // Ver: https://aka.ms/efcore-docs-sqlserver-save-changes-and-output-clause
        
        modelBuilder.Entity<AgendaTurno>()
            .ToTable(tb => tb.UseSqlOutputClause(false));
        
        modelBuilder.Entity<Cita>()
            .ToTable(tb => tb.UseSqlOutputClause(false));

        modelBuilder.Entity<PerfilMedico>()
            .ToTable(tb => tb.UseSqlOutputClause(false));

        modelBuilder.Entity<Usuario>()
            .ToTable(tb => tb.UseSqlOutputClause(false));

        // ============================================================
        // CONFIGURACIÓN ESPECÍFICA PARA SQL SERVER
        // ============================================================

        // Email normalizado - comentado porque no existe como columna computada en AWS RDS
        // Si necesitas columna computada, debes crearla en la base de datos primero
        // modelBuilder.Entity<Usuario>()
        //     .Property(e => e.EmailNormalizado)
        //     .HasComputedColumnSql("LOWER(LTRIM(RTRIM([email])))", stored: true);

        // Por ahora, EmailNormalizado se maneja en el código C# (ver AuthService)
        modelBuilder.Entity<Usuario>()
            .Property(e => e.EmailNormalizado)
            .HasMaxLength(300)
            .IsRequired(false); // Permitir NULL temporalmente para compatibilidad

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

        // ============================================================
        // CONFIGURACIÓN DE ÍNDICES
        // ============================================================

        // ============================================================
        // ÍNDICES CRÍTICOS - TABLA USUARIOS
        // ============================================================

        // Índice único en email normalizado (idx_usuarios_email_normalizado en SQL)
        modelBuilder.Entity<Usuario>()
            .HasIndex(e => e.EmailNormalizado)
            .IsUnique()
            .HasFilter("[email_normalizado] IS NOT NULL")
            .HasDatabaseName("idx_usuarios_email_normalizado");

        // Índice para búsqueda por nombre/apellido (AdminUsuarios)
        modelBuilder.Entity<Usuario>()
            .HasIndex(e => new { e.Nombre, e.Apellido })
            .IncludeProperties(e => new { e.Email, e.Activo, e.CreadoEn })
            .HasDatabaseName("idx_usuarios_nombre_apellido");

        // Índice para filtro por estado activo
        modelBuilder.Entity<Usuario>()
            .HasIndex(e => new { e.Activo, e.CreadoEn })
            .IsDescending(false, true)
            .HasDatabaseName("idx_usuarios_activo_creado");

        // ============================================================
        // ÍNDICES CRÍTICOS - TABLA ROLES
        // ============================================================

        // Índice único en nombre de rol
        modelBuilder.Entity<Rol>()
            .HasIndex(e => e.Nombre)
            .IsUnique()
            .HasDatabaseName("UQ_roles_nombre");

        // ============================================================
        // ÍNDICES CRÍTICOS - TABLA ESPECIALIDADES
        // ============================================================

        // Índice único en nombre de especialidad
        modelBuilder.Entity<Especialidad>()
            .HasIndex(e => e.Nombre)
            .IsUnique()
            .HasDatabaseName("UQ_especialidades_nombre");

        // ============================================================
        // ÍNDICES CRÍTICOS - TABLA S3_ALMACEN_CONFIG (AWS)
        // ============================================================

        // Índice único en nombre de almacen S3
        modelBuilder.Entity<S3AlmacenConfig>()
            .HasIndex(e => e.Nombre)
            .IsUnique()
            .HasDatabaseName("UQ_s3_almacen_nombre");

        // Índice de activo en almacen S3
        modelBuilder.Entity<S3AlmacenConfig>()
            .HasIndex(e => e.Activo)
            .HasDatabaseName("IX_s3_almacen_activo");

        // ============================================================
        // ÍNDICES CRÍTICOS - TABLA ROLES_USUARIOS
        // ============================================================

        // Índice para filtros por rol
        modelBuilder.Entity<RolUsuario>()
            .HasIndex(e => new { e.RolId, e.UsuarioId })
            .HasDatabaseName("idx_roles_usuarios_rol");

        // Índice para consultas por usuario
        modelBuilder.Entity<RolUsuario>()
            .HasIndex(e => new { e.UsuarioId, e.RolId })
            .HasDatabaseName("idx_roles_usuarios_usuario");

        // ============================================================
        // ÍNDICES CRÍTICOS - TABLA MEDICO_ESPECIALIDAD
        // ============================================================

        // Índice para búsqueda de médicos por especialidad
        modelBuilder.Entity<MedicoEspecialidad>()
            .HasIndex(e => new { e.EspecialidadId, e.MedicoId })
            .HasDatabaseName("idx_medico_especialidad_especialidad");

        // Índice para consultas por médico
        modelBuilder.Entity<MedicoEspecialidad>()
            .HasIndex(e => new { e.MedicoId, e.EspecialidadId })
            .HasDatabaseName("idx_medico_especialidad_medico");

        // ============================================================
        // ÍNDICES CRÍTICOS - TABLA AGENDA_TURNOS
        // ============================================================

        // Índice para búsqueda de disponibilidad (crítico para calendario)
        modelBuilder.Entity<AgendaTurno>()
            .HasIndex(e => new { e.MedicoId, e.Inicio, e.Estado })
            .HasFilter("[estado] = N'DISPONIBLE'")
            .IncludeProperties(e => e.Fin)
            .HasDatabaseName("idx_agenda_turnos_medico_disponible");

        // Índice para consultas por rango de fechas
        modelBuilder.Entity<AgendaTurno>()
            .HasIndex(e => new { e.Inicio, e.Fin })
            .HasDatabaseName("idx_agenda_turnos_inicio_fin");

        // ============================================================
        // ÍNDICES CRÍTICOS - TABLA CITAS
        // ============================================================

        // Índice para filtros por estado y fecha (AdminCitas.loadCitas)
        modelBuilder.Entity<Cita>()
            .HasIndex(e => new { e.Estado, e.Inicio })
            .IncludeProperties(e => new { e.MedicoId, e.PacienteId, e.Fin, e.Motivo })
            .HasDatabaseName("idx_citas_estado_inicio");

        // Índice para agenda del médico (DoctorDashboard.getTodayAppointments)
        modelBuilder.Entity<Cita>()
            .HasIndex(e => new { e.MedicoId, e.Inicio })
            .IncludeProperties(e => new { e.Estado, e.PacienteId, e.Motivo, e.Fin })
            .HasDatabaseName("idx_citas_medico_inicio");

        // Índice para historial del paciente (AppointmentsService.getMyAppointments)
        modelBuilder.Entity<Cita>()
            .HasIndex(e => new { e.PacienteId, e.Inicio })
            .IsDescending(false, true)
            .IncludeProperties(e => new { e.Estado, e.MedicoId, e.Motivo })
            .HasDatabaseName("idx_citas_paciente_inicio");

        // Índice para relación con turnos
        modelBuilder.Entity<Cita>()
            .HasIndex(e => e.TurnoId)
            .HasDatabaseName("idx_citas_turno_id");

        // Índice para consultas por rango de fechas
        modelBuilder.Entity<Cita>()
            .HasIndex(e => new { e.Inicio, e.Fin })
            .HasDatabaseName("idx_citas_inicio_fin");

        // Índices adicionales de FK (para compatibilidad con EF)
        modelBuilder.Entity<Cita>()
            .HasIndex(e => e.MedicoId)
            .HasDatabaseName("IX_citas_medico_id");

        modelBuilder.Entity<Cita>()
            .HasIndex(e => e.PacienteId)
            .HasDatabaseName("IX_citas_paciente_id");

        modelBuilder.Entity<Cita>()
            .HasIndex(e => e.CreadoPor)
            .HasDatabaseName("IX_citas_creado_por");

        // ============================================================
        // ÍNDICES CRÍTICOS - HISTORIAL MÉDICO
        // ============================================================

        // Notas clínicas por cita
        modelBuilder.Entity<NotaClinica>()
            .HasIndex(e => new { e.CitaId, e.CreadoEn })
            .IsDescending(false, true)
            .HasDatabaseName("idx_notas_clinicas_cita");

        // Diagnósticos por cita
        modelBuilder.Entity<Diagnostico>()
            .HasIndex(e => new { e.CitaId, e.CreadoEn })
            .IsDescending(false, true)
            .HasDatabaseName("idx_diagnosticos_cita");

        // Recetas por cita
        modelBuilder.Entity<Receta>()
            .HasIndex(e => new { e.CitaId, e.CreadoEn })
            .IsDescending(false, true)
            .HasDatabaseName("idx_recetas_cita");

        // Índice para receta_items
        modelBuilder.Entity<RecetaItem>()
            .HasIndex(e => e.RecetaId)
            .HasDatabaseName("IX_receta_items_receta_id");

        // ============================================================
        // ÍNDICES CRÍTICOS - DOCUMENTOS CLÍNICOS
        // ============================================================

        // Documentos clínicos por cita
        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(e => new { e.CitaId, e.CreadoEn })
            .IsDescending(false, true)
            .HasDatabaseName("idx_documentos_cita");

        // Documentos clínicos por paciente
        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(e => new { e.PacienteId, e.CreadoEn })
            .IsDescending(false, true)
            .IncludeProperties(e => new { e.Categoria, e.NombreArchivo })
            .HasDatabaseName("idx_documentos_paciente");

        // Índice para documentos por médico
        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(e => new { e.MedicoId, e.CreadoEn })
            .IsDescending(false, true)
            .HasDatabaseName("IX_documentos_medico");

        // Índice para categoría
        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(e => e.Categoria)
            .HasDatabaseName("IX_documentos_categoria");

        // Índice único de ubicación para documentos (AWS S3)
        modelBuilder.Entity<DocumentoClinico>()
            .HasIndex(e => new { e.StorageId, e.S3ObjectKey, e.S3VersionId })
            .IsUnique()
            .HasDatabaseName("UX_doc_s3_location");

        // Índices para documento_etiquetas
        modelBuilder.Entity<DocumentoEtiqueta>()
            .HasIndex(e => e.Etiqueta)
            .HasDatabaseName("IX_documento_etiquetas_tag");

        // Índices para documentos_descargas
        modelBuilder.Entity<DocumentoDescarga>()
            .HasIndex(e => new { e.DocumentoId, e.CreadoEn })
            .IsDescending(false, true)
            .HasDatabaseName("IX_descargas_doc_fecha");

        modelBuilder.Entity<DocumentoDescarga>()
            .HasIndex(e => new { e.UsuarioId, e.CreadoEn })
            .IsDescending(false, true)
            .HasDatabaseName("IX_descargas_usuario");

        // ============================================================
        // CONFIGURACIÓN DE RELACIONES CON RESTRICCIONES DE ELIMINACIÓN
        // ============================================================
        
        // Relación Usuario-RolUsuario (Cascade en usuario, NO ACTION en rol)
        modelBuilder.Entity<RolUsuario>()
            .HasOne(ru => ru.Usuario)
            .WithMany(u => u.RolesUsuarios)
            .HasForeignKey(ru => ru.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolUsuario>()
            .HasOne(ru => ru.Rol)
            .WithMany(r => r.RolesUsuarios)
            .HasForeignKey(ru => ru.RolId)
            .OnDelete(DeleteBehavior.NoAction);

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

        // Relación AgendaTurno-Medico (Cascade)
        modelBuilder.Entity<AgendaTurno>()
            .HasOne(at => at.Medico)
            .WithMany(pm => pm.AgendaTurnos)
            .HasForeignKey(at => at.MedicoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación Cita-Turno (NO ACTION para evitar eliminación accidental)
        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Turno)
            .WithMany(t => t.Citas)
            .HasForeignKey(c => c.TurnoId)
            .OnDelete(DeleteBehavior.NoAction);

        // Relación Cita-Medico (NO ACTION para evitar ciclos)
        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Medico)
            .WithMany(pm => pm.Citas)
            .HasForeignKey(c => c.MedicoId)
            .OnDelete(DeleteBehavior.NoAction);

        // Relación Cita-Paciente (NO ACTION para evitar ciclos)
        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Paciente)
            .WithMany(pp => pp.Citas)
            .HasForeignKey(c => c.PacienteId)
            .OnDelete(DeleteBehavior.NoAction);

        // Relación Cita-Creador (NO ACTION para evitar ciclos)
        modelBuilder.Entity<Cita>()
            .HasOne(c => c.Creador)
            .WithMany()
            .HasForeignKey(c => c.CreadoPor)
            .OnDelete(DeleteBehavior.NoAction);

        // Relación NotaClinica-Cita (CASCADE)
        modelBuilder.Entity<NotaClinica>()
            .HasOne(nc => nc.Cita)
            .WithMany(c => c.NotasClinicas)
            .HasForeignKey(nc => nc.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación Diagnostico-Cita (CASCADE)
        modelBuilder.Entity<Diagnostico>()
            .HasOne(d => d.Cita)
            .WithMany(c => c.Diagnosticos)
            .HasForeignKey(d => d.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación Receta-Cita (CASCADE)
        modelBuilder.Entity<Receta>()
            .HasOne(r => r.Cita)
            .WithMany(c => c.Recetas)
            .HasForeignKey(r => r.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación RecetaItem-Receta (CASCADE)
        modelBuilder.Entity<RecetaItem>()
            .HasOne(ri => ri.Receta)
            .WithMany(r => r.Items)
            .HasForeignKey(ri => ri.RecetaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación DocumentoClinico-Cita (CASCADE)
        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(d => d.Cita)
            .WithMany(c => c.Documentos)
            .HasForeignKey(d => d.CitaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación DocumentoClinico-Medico (NO ACTION para evitar ciclos)
        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(d => d.Medico)
            .WithMany()
            .HasForeignKey(d => d.MedicoId)
            .OnDelete(DeleteBehavior.NoAction);

        // Relación DocumentoClinico-Paciente (NO ACTION para evitar ciclos)
        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(d => d.Paciente)
            .WithMany()
            .HasForeignKey(d => d.PacienteId)
            .OnDelete(DeleteBehavior.NoAction);

        // Relación DocumentoClinico-Creador (NO ACTION)
        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(d => d.Creador)
            .WithMany()
            .HasForeignKey(d => d.CreadoPor)
            .OnDelete(DeleteBehavior.NoAction);

        // Relación DocumentoClinico-Storage (NO ACTION)
        modelBuilder.Entity<DocumentoClinico>()
            .HasOne(d => d.Storage)
            .WithMany(s => s.Documentos)
            .HasForeignKey(d => d.StorageId)
            .OnDelete(DeleteBehavior.NoAction);

        // Relación DocumentoEtiqueta-Documento (CASCADE)
        modelBuilder.Entity<DocumentoEtiqueta>()
            .HasOne(de => de.Documento)
            .WithMany(d => d.Etiquetas)
            .HasForeignKey(de => de.DocumentoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación DocumentoDescarga-Documento (CASCADE)
        modelBuilder.Entity<DocumentoDescarga>()
            .HasOne(dd => dd.Documento)
            .WithMany(d => d.Descargas)
            .HasForeignKey(dd => dd.DocumentoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relación DocumentoDescarga-Usuario (NO ACTION)
        modelBuilder.Entity<DocumentoDescarga>()
            .HasOne(dd => dd.Usuario)
            .WithMany()
            .HasForeignKey(dd => dd.UsuarioId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}