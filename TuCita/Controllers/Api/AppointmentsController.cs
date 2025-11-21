using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TuCita.Services;
using TuCita.DTOs.Appointments;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar las citas médicas desde la perspectiva del paciente
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentsService _appointmentsService;

    /// <summary>
    /// Constructor del controlador de citas
    /// </summary>
    /// <param name="appointmentsService">Servicio de gestión de citas inyectado por DI</param>
    public AppointmentsController(IAppointmentsService appointmentsService)
    {
        _appointmentsService = appointmentsService;
    }

    /// <summary>
    /// Mapea el estado de la cita del formato de backend al formato del frontend
    /// </summary>
    /// <param name="estado">Estado en formato backend (PENDIENTE, CONFIRMADA, etc.)</param>
    /// <returns>Estado en formato frontend (pending, confirmed, etc.)</returns>
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

    /// <summary>
    /// Obtiene todas las citas del paciente autenticado
    /// </summary>
    /// <returns>Lista de citas del paciente con información del doctor, horario y estado</returns>
    /// <response code="200">Lista de citas obtenida exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
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

    /// <summary>
    /// Crea una nueva cita médica para el paciente autenticado
    /// </summary>
    /// <param name="request">Datos de la cita (turno ID, doctor ID y motivo de consulta)</param>
    /// <returns>Información de la cita creada</returns>
    /// <response code="200">Cita creada exitosamente</response>
    /// <response code="400">Datos inválidos o turno no disponible</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
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

    /// <summary>
    /// Actualiza la información de una cita existente
    /// </summary>
    /// <param name="id">ID de la cita a actualizar</param>
    /// <param name="request">Nuevos datos de la cita</param>
    /// <returns>Mensaje de confirmación</returns>
    /// <response code="200">Cita actualizada exitosamente</response>
    /// <response code="400">ID inválido o datos incorrectos</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Cita no encontrada</response>
    /// <response code="500">Error interno del servidor</response>
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

    /// <summary>
    /// Cancela una cita existente
    /// </summary>
    /// <param name="id">ID de la cita a cancelar</param>
    /// <returns>Mensaje de confirmación de cancelación</returns>
    /// <response code="200">Cita cancelada exitosamente</response>
    /// <response code="400">ID de cita inválido</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Cita no encontrada o ya cancelada</response>
    /// <response code="500">Error interno del servidor</response>
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

    /// <summary>
    /// Reagenda una cita existente a un nuevo turno
    /// </summary>
    /// <param name="id">ID de la cita a reagendar</param>
    /// <param name="request">Información del nuevo turno (NewTurnoId)</param>
    /// <returns>Información de la cita reagendada con el nuevo horario</returns>
    /// <response code="200">Cita reagendada exitosamente</response>
    /// <response code="400">ID inválido, datos incorrectos o nuevo turno no disponible</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
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
}