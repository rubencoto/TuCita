using System.ComponentModel.DataAnnotations;

namespace TuCita.DTOs.Admin;

/// <summary>
/// DTO para buscar pacientes
/// </summary>
public class PacienteSearchDto
{
    public long Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string NombreCompleto => $"{Nombre} {Apellido}";
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Identificacion { get; set; }
}

/// <summary>
/// DTO para doctores con especialidades
/// </summary>
public class DoctorConEspecialidadDto
{
    public long Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string NombreCompleto => $"Dr. {Nombre} {Apellido}";
    public List<string> Especialidades { get; set; } = new();
}

/// <summary>
/// DTO para slots disponibles de un doctor
/// </summary>
public class SlotDisponibleDto
{
    public long TurnoId { get; set; }
    public DateTime Inicio { get; set; }
    public DateTime Fin { get; set; }
    public string Hora => Inicio.ToString("HH:mm");
    public string HoraFin => Fin.ToString("HH:mm");
}

/// <summary>
/// Request para crear una cita desde el panel de administración
/// </summary>
public class CreateCitaAdminRequest
{
    [Required(ErrorMessage = "El ID del paciente es requerido")]
    public long PacienteId { get; set; }

    [Required(ErrorMessage = "El ID del doctor es requerido")]
    public long MedicoId { get; set; }

    [Required(ErrorMessage = "El ID del turno es requerido")]
    public long TurnoId { get; set; }

    [StringLength(200, ErrorMessage = "El motivo no puede exceder 200 caracteres")]
    public string? Motivo { get; set; }

    [StringLength(500, ErrorMessage = "Las notas internas no pueden exceder 500 caracteres")]
    public string? NotasInternas { get; set; }

    /// <summary>
    /// Indica si se debe enviar email de confirmación al paciente
    /// </summary>
    public bool EnviarEmail { get; set; } = true;
}

/// <summary>
/// Response de cita creada
/// </summary>
public class CitaCreadaDto
{
    public long CitaId { get; set; }
    public long PacienteId { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public long MedicoId { get; set; }
    public string NombreMedico { get; set; } = string.Empty;
    public DateTime Inicio { get; set; }
    public DateTime Fin { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public bool EmailEnviado { get; set; }
}

/// <summary>
/// DTO para listar todas las citas en el admin
/// </summary>
public class AdminCitaListDto
{
    public long Id { get; set; }
    public string Paciente { get; set; } = string.Empty;
    public long PacienteId { get; set; }
    public string Doctor { get; set; } = string.Empty;
    public long MedicoId { get; set; }
    public string Especialidad { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string FechaStr => Fecha.ToString("dd/MM/yyyy");
    public string Hora => Fecha.ToString("HH:mm");
    public string Estado { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public string Origen { get; set; } = string.Empty; // "PACIENTE" o "ADMIN"
}

/// <summary>
/// Request para actualizar estado de cita
/// </summary>
public class UpdateEstadoCitaRequest
{
    [Required(ErrorMessage = "El estado es requerido")]
    public string Estado { get; set; } = string.Empty;

    [StringLength(300, ErrorMessage = "Las notas no pueden exceder 300 caracteres")]
    public string? Notas { get; set; }
}

/// <summary>
/// Filtros para búsqueda de citas
/// </summary>
public class CitasFilterDto
{
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
    public long? MedicoId { get; set; }
    public long? PacienteId { get; set; }
    public string? Estado { get; set; }
    public string? Busqueda { get; set; } // Búsqueda general
    public int Pagina { get; set; } = 1;
    public int TamanoPagina { get; set; } = 20;
}

/// <summary>
/// Response paginado de citas
/// </summary>
public class CitasPaginadasDto
{
    public List<AdminCitaListDto> Citas { get; set; } = new();
    public int TotalRegistros { get; set; }
    public int PaginaActual { get; set; }
    public int TotalPaginas { get; set; }
    public int TamanoPagina { get; set; }
}
