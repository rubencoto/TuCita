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
    public async Task<IActionResult> GetDoctors([FromQuery] string? specialty = null, [FromQuery] string? ciudad = null, [FromQuery] string? search = null)
    {
        try
        {
            var doctors = await _doctorsService.GetDoctorsAsync(specialty, ciudad);

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
                id = d.Id.ToString(),
                name = d.Nombre,
                specialty = string.Join(", ", d.Especialidades),
                specialties = d.Especialidades,
                image = d.ImageUrl,
                rating = d.Rating,
                reviewCount = d.ReviewCount,
                experience = d.ExperienceYears,
                location = d.Location ?? "No especificado",
                direccion = d.Direccion,
                availableSlots = new[] { "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM" },
                about = d.Biografia ?? "Información no disponible",
                telefono = d.Telefono
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
                id = doctor.Id.ToString(),
                name = doctor.Nombre,
                specialty = string.Join(", ", doctor.Especialidades),
                specialties = doctor.Especialidades,
                image = doctor.ImageUrl,
                rating = doctor.Rating,
                reviewCount = doctor.ReviewCount,
                experience = doctor.ExperienceYears,
                location = doctor.Location ?? "No especificado",
                direccion = doctor.Direccion,
                availableSlots = new[] { "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM" },
                about = doctor.About,
                telefono = doctor.Telefono,
                email = doctor.Email
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
    public async Task<IActionResult> GetAvailableSlots(string doctorId, [FromQuery] string? fecha = null)
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
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }
}