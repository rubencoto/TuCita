using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TuCita.Models;

// === Seguridad / Identidad ===
[Table("roles")]
[Index(nameof(Nombre), IsUnique = true)]
public class Rol
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [StringLength(30)]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    // Navegación
    public virtual ICollection<RolUsuario> RolesUsuarios { get; set; } = new List<RolUsuario>();
}

[Table("usuarios")]
[Index(nameof(EmailNormalizado), IsUnique = true)]
public class Usuario
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [StringLength(150)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [StringLength(150)]
    [Column("email_normalizado")]
    public string EmailNormalizado { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [StringLength(80)]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [StringLength(80)]
    [Column("apellido")]
    public string Apellido { get; set; } = string.Empty;

    [StringLength(30)]
    [Column("telefono")]
    public string? Telefono { get; set; }

    [Column("activo")]
    public bool Activo { get; set; } = true;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public virtual ICollection<RolUsuario> RolesUsuarios { get; set; } = new List<RolUsuario>();
    public virtual PerfilPaciente? PerfilPaciente { get; set; }
    public virtual PerfilMedico? PerfilMedico { get; set; }
}

[Table("roles_usuarios")]
public class RolUsuario
{
    [Column("usuario_id")]
    public long UsuarioId { get; set; }

    [Column("rol_id")]
    public long RolId { get; set; }

    // Navegación
    [ForeignKey("UsuarioId")]
    public virtual Usuario Usuario { get; set; } = null!;

    [ForeignKey("RolId")]
    public virtual Rol Rol { get; set; } = null!;
}

// === Catálogos ===
[Table("especialidades")]
[Index(nameof(Nombre), IsUnique = true)]
public class Especialidad
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [StringLength(120)]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    // Navegación
    public virtual ICollection<MedicoEspecialidad> MedicosEspecialidades { get; set; } = new List<MedicoEspecialidad>();
}

// === Perfiles ===
[Table("perfil_paciente")]
public class PerfilPaciente
{
    [Key]
    [Column("usuario_id")]
    public long UsuarioId { get; set; }

    [Column("fecha_nacimiento")]
    public DateOnly? FechaNacimiento { get; set; }

    [StringLength(30)]
    [Column("identificacion")]
    public string? Identificacion { get; set; }

    [StringLength(30)]
    [Column("telefono_emergencia")]
    public string? TelefonoEmergencia { get; set; }

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("UsuarioId")]
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual ICollection<Cita> Citas { get; set; } = new List<Cita>();
}

[Table("perfil_medico")]
public class PerfilMedico
{
    [Key]
    [Column("usuario_id")]
    public long UsuarioId { get; set; }

    [StringLength(60)]
    [Column("numero_licencia")]
    public string? NumeroLicencia { get; set; }

    [Column("biografia")]
    public string? Biografia { get; set; }

    [StringLength(200)]
    [Column("direccion")]
    public string? Direccion { get; set; }

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("UsuarioId")]
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual ICollection<MedicoEspecialidad> EspecialidadesMedico { get; set; } = new List<MedicoEspecialidad>();
    public virtual ICollection<AgendaTurno> AgendaTurnos { get; set; } = new List<AgendaTurno>();
    public virtual ICollection<Cita> Citas { get; set; } = new List<Cita>();
}

[Table("medico_especialidad")]
public class MedicoEspecialidad
{
    [Column("medico_id")]
    public long MedicoId { get; set; }

    [Column("especialidad_id")]
    public int EspecialidadId { get; set; }

    // Navegación
    [ForeignKey("MedicoId")]
    public virtual PerfilMedico Medico { get; set; } = null!;

    [ForeignKey("EspecialidadId")]
    public virtual Especialidad Especialidad { get; set; } = null!;
}

// === Agenda y Citas ===
public enum EstadoTurno
{
    DISPONIBLE,
    RESERVADO,
    BLOQUEADO
}

public enum EstadoCita
{
    PENDIENTE,
    CONFIRMADA,
    RECHAZADA,
    CANCELADA,
    ATENDIDA
}

[Table("agenda_turnos")]
public class AgendaTurno
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("medico_id")]
    public long MedicoId { get; set; }

    [Column("inicio")]
    public DateTime Inicio { get; set; }

    [Column("fin")]
    public DateTime Fin { get; set; }

    [Column("estado")]
    public EstadoTurno Estado { get; set; } = EstadoTurno.DISPONIBLE;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("MedicoId")]
    public virtual PerfilMedico Medico { get; set; } = null!;

    public virtual ICollection<Cita> Citas { get; set; } = new List<Cita>();
}

[Table("citas")]
public class Cita
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("turno_id")]
    public long TurnoId { get; set; }

    [Column("medico_id")]
    public long MedicoId { get; set; }

    [Column("paciente_id")]
    public long PacienteId { get; set; }

    [Column("estado")]
    public EstadoCita Estado { get; set; } = EstadoCita.PENDIENTE;

    [StringLength(200)]
    [Column("motivo")]
    public string? Motivo { get; set; }

    [Column("inicio")]
    public DateTime Inicio { get; set; }

    [Column("fin")]
    public DateTime Fin { get; set; }

    [Column("creado_por")]
    public long CreadoPor { get; set; }

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("TurnoId")]
    public virtual AgendaTurno Turno { get; set; } = null!;

    [ForeignKey("MedicoId")]
    public virtual PerfilMedico Medico { get; set; } = null!;

    [ForeignKey("PacienteId")]
    public virtual PerfilPaciente Paciente { get; set; } = null!;

    [ForeignKey("CreadoPor")]
    public virtual Usuario Creador { get; set; } = null!;

    public virtual ICollection<NotaClinica> NotasClinicas { get; set; } = new List<NotaClinica>();
    public virtual ICollection<Diagnostico> Diagnosticos { get; set; } = new List<Diagnostico>();
    public virtual ICollection<Receta> Recetas { get; set; } = new List<Receta>();
    public virtual ICollection<DocumentoClinico> Documentos { get; set; } = new List<DocumentoClinico>();
}

// === Clínico ===
[Table("notas_clinicas")]
public class NotaClinica
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("cita_id")]
    public long CitaId { get; set; }

    [Required]
    [Column("nota")]
    public string Nota { get; set; } = string.Empty;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("CitaId")]
    public virtual Cita Cita { get; set; } = null!;
}

[Table("diagnosticos")]
public class Diagnostico
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("cita_id")]
    public long CitaId { get; set; }

    [StringLength(20)]
    [Column("codigo")]
    public string? Codigo { get; set; }

    [Required]
    [StringLength(300)]
    [Column("descripcion")]
    public string Descripcion { get; set; } = string.Empty;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("CitaId")]
    public virtual Cita Cita { get; set; } = null!;
}

[Table("recetas")]
public class Receta
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("cita_id")]
    public long CitaId { get; set; }

    [Column("indicaciones")]
    public string? Indicaciones { get; set; }

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("CitaId")]
    public virtual Cita Cita { get; set; } = null!;

    public virtual ICollection<RecetaItem> Items { get; set; } = new List<RecetaItem>();
}

[Table("receta_items")]
public class RecetaItem
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("receta_id")]
    public long RecetaId { get; set; }

    [Required]
    [StringLength(150)]
    [Column("medicamento")]
    public string Medicamento { get; set; } = string.Empty;

    [StringLength(80)]
    [Column("dosis")]
    public string? Dosis { get; set; }

    [StringLength(80)]
    [Column("frecuencia")]
    public string? Frecuencia { get; set; }

    [StringLength(80)]
    [Column("duracion")]
    public string? Duracion { get; set; }

    [StringLength(200)]
    [Column("notas")]
    public string? Notas { get; set; }

    // Navegación
    [ForeignKey("RecetaId")]
    public virtual Receta Receta { get; set; } = null!;
}

// === Azure Blob Storage ===
[Table("azure_almacen_config")]
[Index(nameof(Nombre), IsUnique = true)]
public class AzureAlmacenConfig
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [StringLength(60)]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    [Column("storage_account")]
    public string StorageAccount { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    [Column("container")]
    public string Container { get; set; } = string.Empty;

    [StringLength(200)]
    [Column("ruta_base")]
    public string? RutaBase { get; set; }

    [Column("sas_ttl_min")]
    public int SasTtlMin { get; set; } = 5;

    [Column("versionado")]
    public bool Versionado { get; set; } = false;

    [Column("activo")]
    public bool Activo { get; set; } = true;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public virtual ICollection<DocumentoClinico> Documentos { get; set; } = new List<DocumentoClinico>();
}

[Table("documentos_clinicos")]
public class DocumentoClinico
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("cita_id")]
    public long CitaId { get; set; }

    [Column("medico_id")]
    public long MedicoId { get; set; }

    [Column("paciente_id")]
    public long PacienteId { get; set; }

    [Required]
    [StringLength(40)]
    [Column("categoria")]
    public string Categoria { get; set; } = string.Empty; // LAB, IMAGEN, REFERENCIA, CONSTANCIA, OTRO

    [Required]
    [StringLength(255)]
    [Column("nombre_archivo")]
    public string NombreArchivo { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    [Column("mime_type")]
    public string MimeType { get; set; } = string.Empty;

    [Column("tamano_bytes")]
    public long TamanoBytes { get; set; }

    [Column("hash_sha256")]
    public byte[]? HashSha256 { get; set; }

    [Column("storage_id")]
    public int StorageId { get; set; }

    [Required]
    [StringLength(100)]
    [Column("blob_container")]
    public string BlobContainer { get; set; } = string.Empty;

    [StringLength(300)]
    [Column("blob_carpeta")]
    public string? BlobCarpeta { get; set; }

    [Required]
    [StringLength(300)]
    [Column("blob_nombre")]
    public string BlobNombre { get; set; } = string.Empty;

    [StringLength(128)]
    [Column("blob_version_id")]
    public string? BlobVersionId { get; set; }

    [StringLength(128)]
    [Column("blob_etag")]
    public string? BlobETag { get; set; }

    [StringLength(300)]
    [Column("notas")]
    public string? Notas { get; set; }

    [Column("creado_por")]
    public long CreadoPor { get; set; }

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("CitaId")]
    public virtual Cita Cita { get; set; } = null!;

    [ForeignKey("MedicoId")]
    public virtual PerfilMedico Medico { get; set; } = null!;

    [ForeignKey("PacienteId")]
    public virtual PerfilPaciente Paciente { get; set; } = null!;

    [ForeignKey("CreadoPor")]
    public virtual Usuario Creador { get; set; } = null!;

    [ForeignKey("StorageId")]
    public virtual AzureAlmacenConfig Storage { get; set; } = null!;

    public virtual ICollection<DocumentoEtiqueta> Etiquetas { get; set; } = new List<DocumentoEtiqueta>();
    public virtual ICollection<DocumentoDescarga> Descargas { get; set; } = new List<DocumentoDescarga>();
}

[Table("documento_etiquetas")]
public class DocumentoEtiqueta
{
    [Column("documento_id")]
    public long DocumentoId { get; set; }

    [Required]
    [StringLength(40)]
    [Column("etiqueta")]
    public string Etiqueta { get; set; } = string.Empty;

    // Navegación
    [ForeignKey("DocumentoId")]
    public virtual DocumentoClinico Documento { get; set; } = null!;
}

[Table("documentos_descargas")]
public class DocumentoDescarga
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("documento_id")]
    public long DocumentoId { get; set; }

    [Column("usuario_id")]
    public long UsuarioId { get; set; }

    [StringLength(45)]
    [Column("ip_cliente")]
    public string? IpCliente { get; set; }

    [StringLength(255)]
    [Column("user_agent")]
    public string? UserAgent { get; set; }

    [Column("exito")]
    public bool Exito { get; set; }

    [StringLength(200)]
    [Column("motivo_error")]
    public string? MotivoError { get; set; }

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("DocumentoId")]
    public virtual DocumentoClinico Documento { get; set; } = null!;

    [ForeignKey("UsuarioId")]
    public virtual Usuario Usuario { get; set; } = null!;
}

// NO usaremos sistema de notificaciones con base de datos
// Solo emails directos desde EmailService