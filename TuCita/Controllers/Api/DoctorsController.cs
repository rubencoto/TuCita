using Microsoft.AspNetCore.Mvc;
using TuCita.Services;
using TuCita.DTOs.Doctors;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador público para buscar y consultar información de doctores disponibles
/// No requiere autenticación
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorsService _doctorsService;

    /// <summary>
    /// Constructor del controlador de doctores
    /// </summary>
    /// <param name="doctorsService">Servicio de gestión de doctores inyectado por DI</param>
    public DoctorsController(IDoctorsService doctorsService)
    {
        _doctorsService = doctorsService;
    }

    /// <summary>
    /// Busca y filtra doctores disponibles en el sistema
    /// </summary>
    /// <param name="specialty">Filtro opcional por especialidad médica</param>
    /// <param name="search">Filtro opcional por nombre del doctor o especialidad (búsqueda de texto)</param>
    /// <param name="location">Filtro opcional por ubicación del consultorio</param>
    /// <returns>Lista de doctores que cumplen con los criterios de búsqueda</returns>
    /// <response code="200">Lista de doctores obtenida exitosamente</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Endpoint público que permite a pacientes buscar doctores disponibles.
    /// Los filtros se pueden combinar para refinar la búsqueda.
    /// Incluye información de próximos turnos disponibles.
    /// </remarks>
    [HttpGet]
    public async Task<IActionResult> GetDoctors(
        [FromQuery] string? specialty = null, 
        [FromQuery] string? search = null,
        [FromQuery] string? location = null)
    {
        try
        {
            var doctors = await _doctorsService.GetDoctorsAsync(specialty, location);

            // Aplicar filtro de búsqueda por nombre si se proporciona
            if (!string.IsNullOrEmpty(search))
            {
                doctors = doctors.Where(d => 
                    d.Nombre.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    d.Especialidades.Any(e => e.Contains(search, StringComparison.OrdinalIgnoreCase)));
            }

            // Formatear respuesta para compatibilidad con frontend
            var response = doctors.Select(d => new
            {
                id = d.Id,
                nombre = d.Nombre,
                especialidades = d.Especialidades,
                imageUrl = d.ImageUrl,
                experienceYears = d.ExperienceYears,
                direccion = d.Direccion ?? "No especificado",
                telefono = d.Telefono,
                biografia = d.Biografia ?? "Información no disponible",
                numeroLicencia = d.NumeroLicencia,
                availableSlots = d.AvailableSlots,
                nextAvailable = d.NextAvailable,
                // Estructura de sedes para compatibilidad con frontend
                sedes = new[]
                {
                    new
                    {
                        id = 1,
                        nombre = "Consultorio Principal",
                        direccion = d.Direccion,
                        location = d.Direccion ?? "Ubicación no disponible",
                        activa = true
                    }
                },
                rating = 4.5,
                reviewCount = 0
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene la información detallada de un doctor específico
    /// </summary>
    /// <param name="id">ID del doctor a consultar</param>
    /// <returns>Información completa del doctor incluyendo especialidades, contacto y disponibilidad</returns>
    /// <response code="200">Información del doctor obtenida exitosamente</response>
    /// <response code="400">ID de doctor inválido</response>
    /// <response code="404">Doctor no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDoctor(string id)
    {
        try
        {
            if (!long.TryParse(id, out var doctorId))
            {
                return BadRequest(new { message = "ID de doctor inválido" });
            }

            var doctor = await _doctorsService.GetDoctorByIdAsync(doctorId);

            if (doctor == null)
            {
                return NotFound(new { message = "Doctor no encontrado" });
            }

            // Formatear respuesta para compatibilidad con frontend
            var response = new
            {
                id = doctor.Id,
                nombre = doctor.Nombre,
                especialidades = doctor.Especialidades,
                imageUrl = doctor.ImageUrl,
                experienceYears = doctor.ExperienceYears,
                direccion = doctor.Direccion ?? "No especificado",
                telefono = doctor.Telefono,
                email = doctor.Email,
                biografia = doctor.About,
                numeroLicencia = doctor.NumeroLicencia,
                // Estructura de sedes para compatibilidad con frontend
                sedes = new[]
                {
                    new
                    {
                        id = 1,
                        nombre = "Consultorio Principal",
                        direccion = doctor.Direccion,
                        location = doctor.Direccion ?? "Ubicación no disponible",
                        activa = true
                    }
                },
                rating = 4.5,
                reviewCount = 0
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene el catálogo completo de especialidades médicas disponibles
    /// </summary>
    /// <returns>Lista de todas las especialidades médicas registradas en el sistema</returns>
    /// <response code="200">Catálogo de especialidades obtenido exitosamente</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("specialties")]
    public async Task<IActionResult> GetSpecialties()
    {
        try
        {
            var specialties = await _doctorsService.GetSpecialtiesAsync();
            return Ok(specialties);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene los turnos (slots) disponibles de un doctor para una fecha específica
    /// </summary>
    /// <param name="doctorId">ID del doctor</param>
    /// <param name="fecha">Fecha a consultar (formato: yyyy-MM-dd). Si no se proporciona, usa la fecha actual</param>
    /// <returns>Lista de turnos disponibles con horarios de inicio y fin</returns>
    /// <response code="200">Turnos disponibles obtenidos exitosamente</response>
    /// <response code="400">ID de doctor inválido</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Solo retorna turnos con estado DISPONIBLE que aún no han sido reservados.
    /// Útil para mostrar el calendario de disponibilidad al paciente.
    /// </remarks>
    [HttpGet("{doctorId}/slots")]
    public async Task<IActionResult> GetAvailableSlots(
        string doctorId, 
        [FromQuery] string? fecha = null)
    {
        try
        {
            if (!long.TryParse(doctorId, out var docId))
            {
                return BadRequest(new { message = "ID de doctor inválido" });
            }

            DateTime targetDate;
            if (string.IsNullOrEmpty(fecha) || !DateTime.TryParse(fecha, out targetDate))
            {
                targetDate = DateTime.Today;
            }

            var slots = await _doctorsService.GetAvailableSlotsAsync(docId, targetDate);

            var response = slots.Select(s => new
            {
                id = s.Id,
                time = s.TimeSlot,
                inicio = s.Inicio,
                fin = s.Fin,
                estado = s.Estado
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetAvailableSlots: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return StatusCode(500, new { message = "Error al obtener turnos disponibles", error = ex.Message });
        }
    }
}