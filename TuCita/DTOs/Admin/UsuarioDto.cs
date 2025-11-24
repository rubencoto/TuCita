namespace TuCita.DTOs.Admin;

/// <summary>
/// DTO para listar usuarios en el panel de administración
/// </summary>
public class UsuarioDto
{
    public long Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string NombreCompleto => $"{Nombre} {Apellido}";
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public bool Activo { get; set; }
    public List<string> Roles { get; set; } = new();
    public DateTime CreadoEn { get; set; }
    public DateTime ActualizadoEn { get; set; }
    
    // Información adicional para doctores
    public string? NumeroLicencia { get; set; }
    public List<string> Especialidades { get; set; } = new();
    
    // Información adicional para pacientes
    public string? Identificacion { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
}

/// <summary>
/// DTO para crear un nuevo usuario
/// </summary>
public class CrearUsuarioDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public List<string> Roles { get; set; } = new();
    
    // Campos opcionales para doctores
    public string? NumeroLicencia { get; set; }
    public string? Biografia { get; set; }
    public string? Direccion { get; set; }
    public List<int> EspecialidadesIds { get; set; } = new();
    
    // Campos opcionales para pacientes
    public string? Identificacion { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
    public string? TelefonoEmergencia { get; set; }
}

/// <summary>
/// DTO para actualizar un usuario existente
/// </summary>
public class ActualizarUsuarioDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool Activo { get; set; }
    
    // Campos opcionales para doctores
    public string? NumeroLicencia { get; set; }
    public string? Biografia { get; set; }
    public string? Direccion { get; set; }
    public List<int> EspecialidadesIds { get; set; } = new();
    
    // Campos opcionales para pacientes
    public string? Identificacion { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
    public string? TelefonoEmergencia { get; set; }
}

/// <summary>
/// DTO para cambiar el estado de un usuario (activar/desactivar)
/// </summary>
public class CambiarEstadoUsuarioDto
{
    public bool Activo { get; set; }
}

/// <summary>
/// DTO para cambiar la contraseña de un usuario desde el admin
/// </summary>
public class CambiarPasswordAdminDto
{
    public string NuevaPassword { get; set; } = string.Empty;
}

/// <summary>
/// DTO para filtros de búsqueda de usuarios
/// </summary>
public class FiltrosUsuariosDto
{
    public string? Busqueda { get; set; }
    public string? Rol { get; set; }
    public bool? Activo { get; set; }
    public int Pagina { get; set; } = 1;
    public int TamanoPagina { get; set; } = 10;
}

/// <summary>
/// DTO para resultado paginado de usuarios
/// </summary>
public class UsuariosPaginadosDto
{
    public List<UsuarioDto> Usuarios { get; set; } = new();
    public int Total { get; set; }
    public int Pagina { get; set; }
    public int TamanoPagina { get; set; }
    public int TotalPaginas => (int)Math.Ceiling((double)Total / TamanoPagina);
}
