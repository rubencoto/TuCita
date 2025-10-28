using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TuCita.Services;
using TuCita.DTOs.Appointments;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentsService _appointmentsService;

    public AppointmentsController(IAppointmentsService appointmentsService)
    {
        _appointmentsService = appointmentsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var appointments = await _appointmentsService.GetAppointmentsByPatientAsync(userId);

            // Formatear para compatibilidad con frontend
            var response = appointments.Select(a => new
            {
                id = a.Id.ToString(),
                doctorName = a.NombreMedico,
                doctorSpecialty = a.Especialidad,
                date = a.Inicio.ToString("yyyy-MM-dd"),
                time = a.Inicio.ToString("HH:mm"),
                location = a.DireccionMedico ?? "No especificado",
                direccion = a.DireccionMedico,
                status = a.Estado,
                motivo = a.Motivo,
                inicio = a.Inicio,
                fin = a.Fin
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var newAppointment = await _appointmentsService.CreateAppointmentAsync(userId, request);

            if (newAppointment == null)
            {
                return BadRequest(new { message = "No se pudo crear la cita. El turno podría no estar disponible." });
            }

            // Formatear respuesta para compatibilidad con frontend
            var response = new
            {
                id = newAppointment.Id.ToString(),
                doctorName = newAppointment.NombreMedico,
                doctorSpecialty = newAppointment.Especialidad,
                date = newAppointment.Inicio.ToString("yyyy-MM-dd"),
                time = newAppointment.Inicio.ToString("HH:mm"),
                location = newAppointment.DireccionMedico ?? "No especificado",
                direccion = newAppointment.DireccionMedico,
                status = newAppointment.Estado,
                motivo = newAppointment.Motivo,
                inicio = newAppointment.Inicio,
                fin = newAppointment.Fin
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAppointment(string id, [FromBody] UpdateAppointmentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!long.TryParse(id, out var appointmentId))
            {
                return BadRequest(new { message = "ID de cita inválido" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var success = await _appointmentsService.UpdateAppointmentAsync(appointmentId, userId, request);

            if (!success)
            {
                return NotFound(new { message = "Cita no encontrada" });
            }

            return Ok(new { message = "Cita actualizada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelAppointment(string id)
    {
        try
        {
            if (!long.TryParse(id, out var appointmentId))
            {
                return BadRequest(new { message = "ID de cita inválido" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var success = await _appointmentsService.CancelAppointmentAsync(appointmentId, userId);

            if (!success)
            {
                return NotFound(new { message = "Cita no encontrada o ya cancelada" });
            }

            return Ok(new { message = "Cita cancelada correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }
}