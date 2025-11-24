namespace TuCita.DTOs.Admin;

/// <summary>
/// DTO para listar especialidades en el panel de administración
/// </summary>
public class EspecialidadDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int DoctoresAsignados { get; set; }
}

/// <summary>
/// DTO para crear una nueva especialidad
/// </summary>
public class CrearEspecialidadDto
{
    public string Nombre { get; set; } = string.Empty;
}

/// <summary>
/// DTO para actualizar una especialidad existente
/// </summary>
public class ActualizarEspecialidadDto
{
    public string Nombre { get; set; } = string.Empty;
}
