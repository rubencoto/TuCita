using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TuCita.Services;
using TuCita.DTOs.MedicalHistory;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar el historial médico de pacientes
/// Permite consultar citas atendidas, diagnósticos, recetas y documentos clínicos
/// </summary>
[ApiController]
[Route("api/historial")]
[Authorize]
public class MedicalHistoryController : ControllerBase
{
    private readonly IMedicalHistoryService _medicalHistoryService;

    /// <summary>
    /// Constructor del controlador de historial médico
    /// </summary>
    /// <param name="medicalHistoryService">Servicio de historial médico inyectado por DI</param>
    public MedicalHistoryController(IMedicalHistoryService medicalHistoryService)
    {
        _medicalHistoryService = medicalHistoryService;
    }

    /// <summary>
    /// Obtiene el historial médico completo de un paciente (solo citas atendidas)
    /// </summary>
    /// <param name="idPaciente">ID del paciente</param>
    /// <returns>Lista de citas atendidas con diagnósticos, recetas y notas clínicas</returns>
    /// <response code="200">Historial obtenido exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="403">Acceso denegado (paciente solo puede ver su propio historial)</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// - Doctores y administradores pueden ver el historial de cualquier paciente
    /// - Pacientes solo pueden ver su propio historial médico
    /// </remarks>
    [HttpGet("paciente/{idPaciente}")]
    [Authorize(Roles = "DOCTOR,ADMIN,PACIENTE")]
    public async Task<IActionResult> GetPatientMedicalHistory(long idPaciente)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var isDoctorOrAdmin = userRoles.Contains("DOCTOR") || userRoles.Contains("ADMIN");
            
            // Si no es doctor/admin, solo puede ver su propio historial
            if (!isDoctorOrAdmin && userId != idPaciente)
            {
                return Forbid();
            }

            var historial = await _medicalHistoryService.GetPatientMedicalHistoryAsync(idPaciente);

            return Ok(historial);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene el historial médico de un paciente específico tratado por el doctor autenticado
    /// </summary>
    /// <param name="idPaciente">ID del paciente</param>
    /// <returns>Solo las citas ATENDIDAS del doctor con ese paciente</returns>
    /// <response code="200">Historial obtenido exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Retorna únicamente las citas en las que el doctor autenticado atendió al paciente.
    /// Solo incluye citas con estado ATENDIDA.
    /// </remarks>
    [HttpGet("doctor/paciente/{idPaciente}")]
    [Authorize(Roles = "DOCTOR,ADMIN")]
    public async Task<IActionResult> GetDoctorPatientHistory(long idPaciente)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var medicoId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var historial = await _medicalHistoryService.GetDoctorPatientHistoryAsync(medicoId, idPaciente);

            return Ok(historial);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene el historial médico completo de todos los pacientes atendidos por el doctor
    /// </summary>
    /// <returns>Lista de todas las citas ATENDIDAS del doctor con todos sus pacientes</returns>
    /// <response code="200">Historial obtenido exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// Útil para que el doctor tenga una vista general de todos sus pacientes
    /// y sus historiales médicos.
    /// </remarks>
    [HttpGet("doctor/todos-pacientes")]
    [Authorize(Roles = "DOCTOR,ADMIN")]
    public async Task<IActionResult> GetDoctorAllPatientsHistory()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var medicoId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var historial = await _medicalHistoryService.GetDoctorAllPatientsHistoryAsync(medicoId);

            return Ok(historial);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene los detalles completos de una cita específica incluyendo diagnósticos, recetas y documentos
    /// </summary>
    /// <param name="idCita">ID de la cita</param>
    /// <returns>Detalle completo de la cita con toda su información médica asociada</returns>
    /// <response code="200">Detalle obtenido exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Cita no encontrada o sin permisos para verla</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// - Doctores y administradores pueden ver detalles de cualquier cita
    /// - Pacientes solo pueden ver detalles de sus propias citas
    /// </remarks>
    [HttpGet("cita/{idCita}")]
    [Authorize(Roles = "DOCTOR,ADMIN,PACIENTE")]
    public async Task<IActionResult> GetAppointmentDetail(long idCita)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var isDoctorOrAdmin = userRoles.Contains("DOCTOR") || userRoles.Contains("ADMIN");
            
            var citaDetalle = await _medicalHistoryService.GetAppointmentDetailAsync(idCita, userId, isDoctorOrAdmin);

            if (citaDetalle == null)
            {
                return NotFound(new { message = "Cita no encontrada o no tiene permisos para verla" });
            }

            return Ok(citaDetalle);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva nota clínica asociada a una cita (solo médicos)
    /// </summary>
    /// <param name="request">Contenido de la nota clínica y ID de la cita</param>
    /// <returns>Nota clínica creada con su ID asignado</returns>
    /// <response code="200">Nota clínica creada exitosamente</response>
    /// <response code="400">Datos inválidos o cita no pertenece al médico</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("nota")]
    [Authorize(Roles = "DOCTOR,ADMIN")]
    public async Task<IActionResult> CreateNotaClinica([FromBody] CreateNotaClinicaRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var medicoId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var nota = await _medicalHistoryService.CreateNotaClinicaAsync(request, medicoId);

            if (nota == null)
            {
                return BadRequest(new { message = "No se pudo crear la nota clínica. Verifique que la cita existe y le pertenece." });
            }

            return Ok(nota);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea un nuevo diagnóstico médico asociado a una cita (solo médicos)
    /// </summary>
    /// <param name="request">Información del diagnóstico (códigos CIE, descripción, etc.)</param>
    /// <returns>Diagnóstico creado con su ID asignado</returns>
    /// <response code="200">Diagnóstico creado exitosamente</response>
    /// <response code="400">Datos inválidos o cita no pertenece al médico</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("diagnostico")]
    [Authorize(Roles = "DOCTOR,ADMIN")]
    public async Task<IActionResult> CreateDiagnostico([FromBody] CreateDiagnosticoRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var medicoId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var diagnostico = await _medicalHistoryService.CreateDiagnosticoAsync(request, medicoId);

            if (diagnostico == null)
            {
                return BadRequest(new { message = "No se pudo crear el diagnóstico. Verifique que la cita existe y le pertenece." });
            }

            return Ok(diagnostico);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva receta médica con medicamentos asociada a una cita (solo médicos)
    /// </summary>
    /// <param name="request">Información de la receta y lista de medicamentos prescritos</param>
    /// <returns>Receta creada con todos sus medicamentos asociados</returns>
    /// <response code="200">Receta creada exitosamente</response>
    /// <response code="400">Datos inválidos o cita no pertenece al médico</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("receta")]
    [Authorize(Roles = "DOCTOR,ADMIN")]
    public async Task<IActionResult> CreateReceta([FromBody] CreateRecetaRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var medicoId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var receta = await _medicalHistoryService.CreateRecetaAsync(request, medicoId);

            if (receta == null)
            {
                return BadRequest(new { message = "No se pudo crear la receta. Verifique que la cita existe y le pertenece." });
            }

            return Ok(receta);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Sube un nuevo documento clínico (PDF, imagen, estudio, etc.) asociado a una cita (solo médicos)
    /// </summary>
    /// <param name="request">Información del documento (tipo, nombre, URL de almacenamiento)</param>
    /// <returns>Documento creado con su información de almacenamiento</returns>
    /// <response code="200">Documento creado exitosamente</response>
    /// <response code="400">Datos inválidos o cita no pertenece al médico</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// El servicio obtiene automáticamente el ID del paciente de la cita asociada.
    /// El documento debe estar previamente subido a Azure Blob Storage.
    /// </remarks>
    [HttpPost("documento")]
    [Authorize(Roles = "DOCTOR,ADMIN")]
    public async Task<IActionResult> CreateDocumento([FromBody] CreateDocumentoRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!long.TryParse(userIdClaim, out var medicoId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            // El servicio obtendrá automáticamente el pacienteId de la cita
            var documento = await _medicalHistoryService.CreateDocumentoAsync(request, medicoId);

            if (documento == null)
            {
                return BadRequest(new { message = "No se pudo crear el documento. Verifique que la cita existe y le pertenece." });
            }

            return Ok(documento);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Elimina un documento clínico del historial médico
    /// </summary>
    /// <param name="id">ID del documento a eliminar</param>
    /// <returns>Confirmación de eliminación</returns>
    /// <response code="200">Documento eliminado exitosamente</response>
    /// <response code="401">Usuario no autenticado</response>
    /// <response code="404">Documento no encontrado o sin permisos para eliminarlo</response>
    /// <response code="500">Error interno del servidor</response>
    /// <remarks>
    /// - Doctores pueden eliminar documentos de citas que les pertenecen
    /// - Pacientes pueden eliminar sus propios documentos
    /// - Administradores pueden eliminar cualquier documento
    /// </remarks>
    [HttpDelete("documento/{id}")]
    [Authorize(Roles = "DOCTOR,ADMIN,PACIENTE")]
    public async Task<IActionResult> DeleteDocumento(long id)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            
            if (!long.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Usuario no autenticado" });
            }

            var isDoctorOrAdmin = userRoles.Contains("DOCTOR") || userRoles.Contains("ADMIN");
            
            var success = await _medicalHistoryService.DeleteDocumentoAsync(id, userId, isDoctorOrAdmin);

            if (!success)
            {
                return NotFound(new { message = "Documento no encontrado o no tiene permisos para eliminarlo" });
            }

            return Ok(new { message = "Documento eliminado correctamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }
}
