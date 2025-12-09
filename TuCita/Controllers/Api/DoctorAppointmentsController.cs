using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TuCita.Services;
using TuCita.DTOs.Appointments;
using TuCita.DTOs.MedicalHistory;
using Microsoft.EntityFrameworkCore;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar las citas médicas desde la perspectiva del doctor
/// Requiere autenticación con rol MEDICO
/// </summary>
[ApiController]
[Route("api/doctor/appointments")]
[Authorize(Roles = "MEDICO")]
public class DoctorAppointmentsController : ControllerBase
{
    private readonly IDoctorAppointmentsService _appointmentsService;
    private readonly IMedicalHistoryService _medicalHistoryService;
    private readonly ILogger<DoctorAppointmentsController> _logger;

    /// <summary>
    /// Constructor del controlador de citas para doctores
    /// </summary>
    /// <param name="appointmentsService">Servicio de gestión de citas para doctores</param>
    /// <param name="medicalHistoryService">Servicio de historial médico</param>
    /// <param name="logger">Logger para registro de eventos</param>
    public DoctorAppointmentsController(
        IDoctorAppointmentsService appointmentsService,
        IMedicalHistoryService medicalHistoryService,
        ILogger<DoctorAppointmentsController> logger)
    {
        _appointmentsService = appointmentsService;
        _medicalHistoryService = medicalHistoryService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todas las citas del doctor autenticado con filtros opcionales
    /// </summary>
    /// <param name="fechaInicio">Filtro opcional por fecha de inicio</param>
    /// <param name="fechaFin">Filtro opcional por fecha de fin</param>
    /// <param name="estado">Filtro opcional por estado (PENDIENTE, CONFIRMADA, ATENDIDA, etc.)</param>
    /// <returns>Lista de citas del doctor que cumplen con los filtros especificados</returns>
    /// <response code="200">Lista de citas obtenida exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet]
    public async Task<IActionResult> GetDoctorAppointments(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] string? estado = null)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            // Obtener el ID del perfil médico del usuario
            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            var appointments = await _appointmentsService.GetDoctorAppointmentsAsync(
                medicoId.Value,
                fechaInicio,
                fechaFin,
                estado
            );

            return Ok(appointments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener citas del doctor");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene la lista de pacientes únicos que han tenido citas con el doctor
    /// </summary>
    /// <returns>Lista de pacientes del doctor con información básica</returns>
    /// <response code="200">Lista de pacientes obtenida exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("patients")]
    public async Task<IActionResult> GetDoctorPatients()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            var patients = await _appointmentsService.GetDoctorPatientsAsync(medicoId.Value);

            return Ok(patients);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener pacientes del doctor");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene el detalle completo de una cita específica incluyendo información del paciente
    /// </summary>
    /// <param name="id">ID de la cita a consultar</param>
    /// <returns>Detalles completos de la cita y datos del paciente</returns>
    /// <response code="200">Detalle de cita obtenido exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico o cita no encontrados</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAppointmentDetail(long id)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            var appointmentDetail = await _appointmentsService.GetAppointmentDetailAsync(id, medicoId.Value);

            if (appointmentDetail == null)
            {
                return NotFound(new { message = "Cita no encontrada o no tiene permisos para acceder a ella" });
            }

            return Ok(appointmentDetail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener detalle de cita {CitaId}", id);
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva cita manualmente desde el panel del doctor
    /// </summary>
    /// <param name="request">Datos de la cita (paciente, horario, motivo, etc.)</param>
    /// <returns>Información de la cita creada</returns>
    /// <response code="200">Cita creada exitosamente</response>
    /// <response code="400">Datos inválidos, horario no disponible o paciente no existe</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateDoctorAppointmentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Datos de solicitud inválidos",
                    errors = ModelState.Select(x => new
                    {
                        field = x.Key,
                        errors = x.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    })
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            var appointment = await _appointmentsService.CreateDoctorAppointmentAsync(medicoId.Value, request);

            if (appointment == null)
            {
                return BadRequest(new { message = "No se pudo crear la cita. Verifica que el horario esté disponible y el paciente exista." });
            }

            return Ok(appointment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear cita manual");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza el estado de una cita (CONFIRMADA, ATENDIDA, CANCELADA, NO_ASISTIO)
    /// </summary>
    /// <param name="id">ID de la cita a actualizar</param>
    /// <param name="request">Nuevo estado y notas opcionales</param>
    /// <returns>Mensaje de confirmación</returns>
    /// <response code="200">Estado actualizado exitosamente</response>
    /// <response code="400">Datos inválidos</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico o cita no encontrados o sin permisos</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(long id, [FromBody] UpdateAppointmentStatusRequest request)
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
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            var success = await _appointmentsService.UpdateAppointmentStatusAsync(id, medicoId.Value, request);

            if (!success)
            {
                return NotFound(new { message = "Cita no encontrada o no tiene permisos para modificarla" });
            }

            return Ok(new { message = "Estado de cita actualizado correctamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar estado de cita");
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea un nuevo diagnóstico médico para una cita específica
    /// </summary>
    /// <param name="id">ID de la cita</param>
    /// <param name="request">Información del diagnóstico (descripción, códigos CIE, etc.)</param>
    /// <returns>Diagnóstico creado con su ID asignado</returns>
    /// <response code="200">Diagnóstico creado exitosamente</response>
    /// <response code="400">Datos inválidos o cita no pertenece al doctor</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("{id}/diagnostico")]
    public async Task<IActionResult> CreateDiagnostico(long id, [FromBody] CreateDiagnosticoRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Datos de solicitud inválidos",
                    errors = ModelState.Select(x => new
                    {
                        field = x.Key,
                        errors = x.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    })
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            // Sobrescribir el CitaId del request con el id de la ruta
            request.CitaId = id;

            var diagnostico = await _medicalHistoryService.CreateDiagnosticoAsync(request, medicoId.Value);

            if (diagnostico == null)
            {
                return BadRequest(new { message = "No se pudo crear el diagnóstico. Verifica que la cita existe y te pertenece." });
            }

            return Ok(diagnostico);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear diagnóstico para cita {CitaId}", id);
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva nota clínica para una cita específica
    /// </summary>
    /// <param name="id">ID de la cita</param>
    /// <param name="request">Contenido de la nota clínica</param>
    /// <returns>Nota clínica creada con su ID asignado</returns>
    /// <response code="200">Nota clínica creada exitosamente</response>
    /// <response code="400">Datos inválidos o cita no pertenece al doctor</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("{id}/nota")]
    public async Task<IActionResult> CreateNotaClinica(long id, [FromBody] CreateNotaClinicaRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Datos de solicitud inválidos",
                    errors = ModelState.Select(x => new
                    {
                        field = x.Key,
                        errors = x.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    })
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            // Sobrescribir el CitaId del request con el id de la ruta
            request.CitaId = id;

            var nota = await _medicalHistoryService.CreateNotaClinicaAsync(request, medicoId.Value);

            if (nota == null)
            {
                return BadRequest(new { message = "No se pudo crear la nota clínica. Verifica que la cita existe y te pertenece." });
            }

            return Ok(nota);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear nota clínica para cita {CitaId}", id);
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva receta médica con medicamentos para una cita específica
    /// </summary>
    /// <param name="id">ID de la cita</param>
    /// <param name="request">Información de la receta y lista de medicamentos</param>
    /// <returns>Receta creada con sus medicamentos asociados</returns>
    /// <response code="200">Receta creada exitosamente</response>
    /// <response code="400">Datos inválidos o cita no pertenece al doctor</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("{id}/receta")]
    public async Task<IActionResult> CreateReceta(long id, [FromBody] CreateRecetaRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Datos de solicitud inválidos",
                    errors = ModelState.Select(x => new
                    {
                        field = x.Key,
                        errors = x.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    })
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            // Sobrescribir el CitaId del request con el id de la ruta
            request.CitaId = id;

            var receta = await _medicalHistoryService.CreateRecetaAsync(request, medicoId.Value);

            if (receta == null)
            {
                return BadRequest(new { message = "No se pudo crear la receta. Verifica que la cita existe y te pertenece." });
            }

            return Ok(receta);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear receta para cita {CitaId}", id);
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Sube un documento médico (PDF, imagen, estudio, etc.) asociado a una cita
    /// </summary>
    /// <param name="id">ID de la cita</param>
    /// <param name="request">Información del documento (tipo, nombre, URL en Azure Storage)</param>
    /// <returns>Documento creado con su información de almacenamiento</returns>
    /// <response code="200">Documento subido exitosamente</response>
    /// <response code="400">Datos inválidos o cita no pertenece al doctor</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Perfil de médico no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("{id}/documento")]
    public async Task<IActionResult> CreateDocumento(long id, [FromBody] CreateDocumentoRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Datos de solicitud inválidos",
                    errors = ModelState.Select(x => new
                    {
                        field = x.Key,
                        errors = x.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    })
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var medicoId = await GetMedicoIdFromUsuarioId(userId);
            if (medicoId == null)
            {
                return NotFound(new { message = "Perfil de médico no encontrado" });
            }

            // Sobrescribir el CitaId del request con el id de la ruta
            request.CitaId = id;

            var documento = await _medicalHistoryService.CreateDocumentoAsync(request, medicoId.Value);

            if (documento == null)
            {
                return BadRequest(new { message = "No se pudo subir el documento. Verifica que la cita existe y te pertenece." });
            }

            return Ok(documento);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al subir documento para cita {CitaId}", id);
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Método auxiliar para obtener el ID del perfil médico a partir del ID de usuario
    /// </summary>
    /// <param name="usuarioId">ID del usuario autenticado</param>
    /// <returns>ID del perfil médico o null si no existe</returns>
    private async Task<long?> GetMedicoIdFromUsuarioId(long usuarioId)
    {
        using var scope = HttpContext.RequestServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<TuCita.Data.TuCitaDbContext>();

        // Verificar que el perfil médico existe para este usuario
        var perfilExiste = await context.PerfilesMedicos
            .AnyAsync(m => m.UsuarioId == usuarioId);

        // El UsuarioId ES el ID del perfil médico (relación 1:1)
        return perfilExiste ? usuarioId : null;
    }
}
