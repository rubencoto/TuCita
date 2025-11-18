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

    // Método helper para mapear estados del backend al formato frontend
    private static string MapEstadoToFrontend(string estado)
    {
        return estado.ToUpperInvariant() switch
        {
            "PENDIENTE" => "pending",
            "CONFIRMADA" => "confirmed",
            "CANCELADA" => "cancelled",
            "REPROGRAMADA" => "rescheduled",
            "ATENDIDA" => "completed",
            "NO_ASISTIO" => "no_show",
            _ => "pending" // Default
        };
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
                doctorSpecialty = new[] { a.Especialidad }, // Array para compatibilidad con frontend
                doctorImage = "/api/placeholder/96/96", // Imagen por defecto
                date = a.Inicio.ToString("yyyy-MM-dd"),
                time = a.Inicio.ToString("HH:mm"),
                location = a.DireccionMedico ?? "No especificado",
                direccion = a.DireccionMedico,
                status = MapEstadoToFrontend(a.Estado), // Mapear estado al formato frontend
                type = "consultation", // Tipo por defecto
                motivo = a.Motivo,
                inicio = a.Inicio,
                fin = a.Fin,
                medicoId = a.MedicoId, // Agregar medicoId para reagendamiento
                pacienteId = userId, // Agregar pacienteId
                sedeId = 0 // Placeholder - puede agregarse si es necesario
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
            Console.WriteLine($"?? Recibiendo solicitud de cita...");
            Console.WriteLine($"?? Request recibido: TurnoId={request.TurnoId}, DoctorId={request.DoctorId}, Motivo={request.Motivo}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine("? ModelState inválido:");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"  - {error.Key}: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(new { 
                    message = "Datos de solicitud inválidos",
                    errors = ModelState.Select(x => new { 
                        field = x.Key, 
                        errors = x.Value.Errors.Select(e => e.ErrorMessage).ToArray() 
                    })
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"?? Usuario ID del claim: {userIdClaim}");
            
            if (!long.TryParse(userIdClaim, out var userId))
            {
                Console.WriteLine("? No se pudo parsear el ID del usuario");
                return Unauthorized(new { message = "Usuario no autenticado correctamente" });
            }

            Console.WriteLine($"? Usuario autenticado: ID={userId}");
            Console.WriteLine($"?? Llamando a CreateAppointmentAsync...");

            var newAppointment = await _appointmentsService.CreateAppointmentAsync(userId, request);

            if (newAppointment == null)
            {
                Console.WriteLine("? No se pudo crear la cita - Turno no disponible");
                return BadRequest(new { message = "No se pudo crear la cita. El turno podría no estar disponible." });
            }

            Console.WriteLine($"? Cita creada exitosamente: ID={newAppointment.Id}");

            // Formatear respuesta para compatibilidad con frontend
            var response = new
            {
                id = newAppointment.Id.ToString(),
                doctorName = newAppointment.NombreMedico,
                doctorSpecialty = new[] { newAppointment.Especialidad }, // Array para compatibilidad con frontend
                doctorImage = "/api/placeholder/96/96", // Imagen por defecto
                date = newAppointment.Inicio.ToString("yyyy-MM-dd"),
                time = newAppointment.Inicio.ToString("HH:mm"),
                location = newAppointment.DireccionMedico ?? "No especificado",
                direccion = newAppointment.DireccionMedico,
                status = MapEstadoToFrontend(newAppointment.Estado), // Mapear estado al formato frontend
                type = "consultation", // Tipo por defecto
                motivo = newAppointment.Motivo,
                inicio = newAppointment.Inicio,
                fin = newAppointment.Fin
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"? Error inesperado: {ex.Message}");
            Console.WriteLine($"?? StackTrace: {ex.StackTrace}");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message, stackTrace = ex.StackTrace });
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

    [HttpPost("{id}/reschedule")]
    public async Task<IActionResult> RescheduleAppointment(string id, [FromBody] RescheduleAppointmentRequest request)
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

            var rescheduledAppointment = await _appointmentsService.RescheduleAppointmentAsync(
                appointmentId, 
                userId, 
                request.NewTurnoId
            );

            if (rescheduledAppointment == null)
            {
                return BadRequest(new { message = "No se pudo reagendar la cita. Verifica que el turno esté disponible." });
            }

            // Formatear respuesta para compatibilidad con frontend
            var response = new
            {
                id = rescheduledAppointment.Id.ToString(),
                doctorName = rescheduledAppointment.NombreMedico,
                doctorSpecialty = new[] { rescheduledAppointment.Especialidad },
                doctorImage = "/api/placeholder/96/96",
                date = rescheduledAppointment.Inicio.ToString("yyyy-MM-dd"),
                time = rescheduledAppointment.Inicio.ToString("HH:mm"),
                location = rescheduledAppointment.DireccionMedico ?? "No especificado",
                direccion = rescheduledAppointment.DireccionMedico,
                status = MapEstadoToFrontend(rescheduledAppointment.Estado),
                type = "consultation",
                motivo = rescheduledAppointment.Motivo,
                inicio = rescheduledAppointment.Inicio,
                fin = rescheduledAppointment.Fin
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en RescheduleAppointment: {ex.Message}");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    // GET: /api/appointments/doctor/today
    [HttpGet("doctor/today")]
    public async Task<IActionResult> GetTodayForDoctor()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var citas = await _appointmentsService.GetTodayForDoctorAsync(userId);

            var response = citas.Select(a => new
            {
                id = a.Id,
                inicio = a.Inicio,
                time = a.Inicio.ToString("HH:mm"),
                pacienteNombre = string.IsNullOrEmpty(a.PacienteNombre) ? "N/D" : a.PacienteNombre,
                motivo = a.Motivo,
                // Provide both Spanish 'estado' and english 'status' to be compatible with frontends
                estado = (a.Estado ?? string.Empty).ToUpperInvariant(),
                status = MapEstadoToFrontend(a.Estado ?? string.Empty),
                medicoId = a.MedicoId
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }
}