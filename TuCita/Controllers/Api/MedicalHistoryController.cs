using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TuCita.Services;
using TuCita.DTOs.MedicalHistory;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/historial")]
[Authorize]
public class MedicalHistoryController : ControllerBase
{
    private readonly IMedicalHistoryService _medicalHistoryService;

    public MedicalHistoryController(IMedicalHistoryService medicalHistoryService)
    {
        _medicalHistoryService = medicalHistoryService;
    }

    /// <summary>
    /// Obtiene el historial m�dico completo de un paciente (solo citas atendidas)
    /// </summary>
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
    /// Obtiene los detalles completos de una cita espec�fica
    /// </summary>
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
    /// Crea una nueva nota cl�nica (solo m�dicos)
    /// </summary>
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
                return BadRequest(new { message = "No se pudo crear la nota cl�nica. Verifique que la cita existe y le pertenece." });
            }

            return Ok(nota);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea un nuevo diagn�stico (solo m�dicos)
    /// </summary>
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
                return BadRequest(new { message = "No se pudo crear el diagn�stico. Verifique que la cita existe y le pertenece." });
            }

            return Ok(diagnostico);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva receta (solo m�dicos)
    /// </summary>
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
    /// Sube un nuevo documento cl�nico (solo m�dicos)
    /// </summary>
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

            // El servicio obtendr� autom�ticamente el pacienteId de la cita
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
    /// Elimina un documento cl�nico
    /// </summary>
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
