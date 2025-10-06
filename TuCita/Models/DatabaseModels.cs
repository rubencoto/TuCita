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
    public ulong Id { get; set; }

    [Required]
    [StringLength(30)]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public virtual ICollection<RolUsuario> RolesUsuarios { get; set; } = new List<RolUsuario>();
}

[Table("usuarios")]
[Index(nameof(EmailNormalizado), IsUnique = true)]
public class Usuario
{
    [Key]
    [Column("id")]
    public ulong Id { get; set; }

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

    [StringLength(255)]
    [Column("token_recuperacion")]
    public string? TokenRecuperacion { get; set; }

    [Column("token_recuperacion_expira")]
    public DateTime? TokenRecuperacionExpira { get; set; }

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
    public ulong UsuarioId { get; set; }

    [Column("rol_id")]
    public ulong RolId { get; set; }

    [Column("asignado_en")]
    public DateTime AsignadoEn { get; set; } = DateTime.UtcNow;

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
    public uint Id { get; set; }

    [Required]
    [StringLength(120)]
    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public virtual ICollection<MedicoEspecialidad> MedicosEspecialidades { get; set; } = new List<MedicoEspecialidad>();
}

// === Perfiles ===
[Table("perfil_paciente")]
public class PerfilPaciente
{
    [Key]
    [Column("usuario_id")]
    public ulong UsuarioId { get; set; }

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
    public ulong UsuarioId { get; set; }

    [StringLength(60)]
    [Column("numero_licencia")]
    public string? NumeroLicencia { get; set; }

    [Column("biografia", TypeName = "TEXT")]
    public string? Biografia { get; set; }

    [StringLength(200)]
    [Column("direccion")]
    public string? Direccion { get; set; }

    [StringLength(100)]
    [Column("ciudad")]
    public string? Ciudad { get; set; }

    [StringLength(100)]
    [Column("provincia")]
    public string? Provincia { get; set; }

    [StringLength(100)]
    [Column("pais")]
    public string? Pais { get; set; }

    [Column("longitud")]
    public double? Longitud { get; set; }

    [Column("latitud")]
    public double? Latitud { get; set; }

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
    public ulong MedicoId { get; set; }

    [Column("especialidad_id")]
    public uint EspecialidadId { get; set; }

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
    CANCELADA,
    REPROGRAMADA,
    ATENDIDA,
    NO_ASISTE
}

[Table("agenda_turnos")]
public class AgendaTurno
{
    [Key]
    [Column("id")]
    public ulong Id { get; set; }

    [Column("medico_id")]
    public ulong MedicoId { get; set; }

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
    public ulong Id { get; set; }

    [Column("turno_id")]
    public ulong TurnoId { get; set; }

    [Column("medico_id")]
    public ulong MedicoId { get; set; }

    [Column("paciente_id")]
    public ulong PacienteId { get; set; }

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
    public ulong CreadoPor { get; set; }

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
}

// === Notificaciones ===
public enum CanalNotificacion
{
    CORREO,
    SMS,
    PUSH,
    WEBHOOK
}

public enum TipoNotificacion
{
    CREADA,
    CONFIRMADA,
    CANCELADA,
    REPROGRAMADA
}

[Table("notificaciones")]
public class Notificacion
{
    [Key]
    [Column("id")]
    public ulong Id { get; set; }

    [Column("usuario_id")]
    public ulong UsuarioId { get; set; }

    [Column("cita_id")]
    public ulong? CitaId { get; set; }

    [Column("canal")]
    public CanalNotificacion Canal { get; set; } = CanalNotificacion.CORREO;

    [Column("tipo")]
    public TipoNotificacion Tipo { get; set; }

    [Column("contenido", TypeName = "JSON")]
    public string? Contenido { get; set; }

    [Column("enviada")]
    public bool Enviada { get; set; } = false;

    [StringLength(300)]
    [Column("error")]
    public string? Error { get; set; }

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    [Column("enviada_en")]
    public DateTime? EnviadaEn { get; set; }

    // Navegación
    [ForeignKey("UsuarioId")]
    public virtual Usuario Usuario { get; set; } = null!;

    [ForeignKey("CitaId")]
    public virtual Cita? Cita { get; set; }
}

// === Clínico ===
[Table("notas_clinicas")]
public class NotaClinica
{
    [Key]
    [Column("id")]
    public ulong Id { get; set; }

    [Column("cita_id")]
    public ulong CitaId { get; set; }

    [Column("medico_id")]
    public ulong MedicoId { get; set; }

    [Column("paciente_id")]
    public ulong PacienteId { get; set; }

    [Required]
    [Column("nota", TypeName = "TEXT")]
    public string Nota { get; set; } = string.Empty;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("CitaId")]
    public virtual Cita Cita { get; set; } = null!;

    [ForeignKey("MedicoId")]
    public virtual PerfilMedico Medico { get; set; } = null!;

    [ForeignKey("PacienteId")]
    public virtual PerfilPaciente Paciente { get; set; } = null!;
}

[Table("diagnosticos")]
public class Diagnostico
{
    [Key]
    [Column("id")]
    public ulong Id { get; set; }

    [Column("cita_id")]
    public ulong CitaId { get; set; }

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
    public ulong Id { get; set; }

    [Column("cita_id")]
    public ulong CitaId { get; set; }

    [Column("indicaciones", TypeName = "TEXT")]
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
    public ulong Id { get; set; }

    [Column("receta_id")]
    public ulong RecetaId { get; set; }

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