using Microsoft.AspNetCore.Mvc;
using TuCita.Services;
using TuCita.DTOs.Doctors;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorsService _doctorsService;

    public DoctorsController(IDoctorsService doctorsService)
    {
        _doctorsService = doctorsService;
    }

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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDoctor(string id)
    {
        try
        {
            if (!ulong.TryParse(id, out var doctorId))
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

    [HttpGet("{doctorId}/slots")]
    public async Task<IActionResult> GetAvailableSlots(
        string doctorId, 
        [FromQuery] string? fecha = null)
    {
        try
        {
            if (!ulong.TryParse(doctorId, out var docId))
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