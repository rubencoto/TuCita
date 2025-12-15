using Microsoft.AspNetCore.Mvc;
using TuCita.DTOs.Doctors;
using TuCita.Services;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar la disponibilidad de horarios de los doctores
/// Compatible con doctor-availability-page.tsx
/// Ahora usa base de datos real en lugar de almacenamiento en memoria
/// </summary>
[ApiController]
[Route("api/doctor/availability")]
public class DoctorAvailabilityController : ControllerBase
{
    private readonly DoctorAvailabilityService _service;
    private readonly ILogger<DoctorAvailabilityController> _logger;

    public DoctorAvailabilityController(
        DoctorAvailabilityService service,
        ILogger<DoctorAvailabilityController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los slots, opcionalmente filtrados por doctorId y fecha
    /// GET /api/doctor/availability?doctorId=21&fecha=2025-01-20
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DoctorSlotDto>>> GetSlots(
        [FromQuery] string? doctorId = null,
        [FromQuery] string? fecha = null)
    {
        try
        {
            if (string.IsNullOrEmpty(doctorId))
            {
                return BadRequest(new { message = "El ID del doctor es requerido" });
            }

            var slots = await _service.GetDoctorSlotsAsync(doctorId, fecha);
            
            _logger.LogInformation("Obtenidos {Count} slots para doctor={DoctorId}, fecha={Fecha}", 
                slots.Count, doctorId, fecha ?? "todas");

            return Ok(slots);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener slots");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtiene un slot específico por ID
    /// GET /api/doctor/availability/1
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DoctorSlotDto>> GetSlot(long id)
    {
        try
        {
            var slot = await _service.GetSlotByIdAsync(id);
            
            if (slot == null)
            {
                _logger.LogWarning("Slot {SlotId} no encontrado", id);
                return NotFound(new { message = $"Slot con ID {id} no encontrado" });
            }

            _logger.LogInformation("Slot {SlotId} obtenido correctamente", id);
            return Ok(slot);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener slot {SlotId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Crea un nuevo slot de disponibilidad
    /// POST /api/doctor/availability
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<DoctorSlotDto>> CreateSlot([FromBody] CreateSlotRequest request)
    {
        try
        {
            // Validaciones de formato
            if (string.IsNullOrWhiteSpace(request.DoctorId))
                return BadRequest(new { message = "El ID del doctor es requerido" });

            if (!IsValidTimeFormat(request.HoraInicio))
                return BadRequest(new { message = "Formato de hora de inicio inválido (debe ser HH:mm)" });

            if (!IsValidTimeFormat(request.HoraFin))
                return BadRequest(new { message = "Formato de hora de fin inválido (debe ser HH:mm)" });

            if (!IsValidDateFormat(request.Fecha))
                return BadRequest(new { message = "Formato de fecha inválido (debe ser YYYY-MM-DD)" });

            // Validar que hora inicio sea anterior a hora fin
            if (string.Compare(request.HoraInicio, request.HoraFin) >= 0)
                return BadRequest(new { message = "La hora de inicio debe ser anterior a la hora de fin" });

            // Validar que la fecha no sea pasada
            if (DateOnly.TryParseExact(request.Fecha, "yyyy-MM-dd", out var fecha))
            {
                if (fecha < DateOnly.FromDateTime(DateTime.Now))
                    return BadRequest(new { message = "No se pueden crear slots en fechas pasadas" });
            }

            var slot = await _service.CreateSlotAsync(
                request.DoctorId,
                request.Fecha,
                request.HoraInicio,
                request.HoraFin,
                request.Tipo,
                request.Estado
            );

            _logger.LogInformation("Slot creado: ID={SlotId}, Doctor={DoctorId}, Fecha={Fecha}, Hora={HoraInicio}-{HoraFin}", 
                slot.IdSlot, request.DoctorId, request.Fecha, request.HoraInicio, request.HoraFin);

            return CreatedAtAction(nameof(GetSlot), new { id = slot.IdSlot }, slot);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear slot");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Crea slots en lote para un rango de fechas basado en un patrón semanal
    /// POST /api/doctor/availability/bulk
    /// </summary>
    [HttpPost("bulk")]
    public async Task<ActionResult<BulkCreateResult>> BulkCreateSlots([FromBody] BulkCreateSlotsRequest request)
    {
        try
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(request.DoctorId))
                return BadRequest(new { message = "El ID del doctor es requerido" });

            if (!IsValidDateFormat(request.FechaInicio))
                return BadRequest(new { message = "Formato de fecha de inicio inválido (debe ser YYYY-MM-DD)" });

            if (!IsValidDateFormat(request.FechaFin))
                return BadRequest(new { message = "Formato de fecha de fin inválido (debe ser YYYY-MM-DD)" });

            var fechaInicio = DateOnly.ParseExact(request.FechaInicio, "yyyy-MM-dd");
            var fechaFin = DateOnly.ParseExact(request.FechaFin, "yyyy-MM-dd");

            if (fechaFin < fechaInicio)
                return BadRequest(new { message = "La fecha de fin debe ser posterior a la fecha de inicio" });

            if (fechaInicio < DateOnly.FromDateTime(DateTime.Now))
                return BadRequest(new { message = "No se pueden crear slots en fechas pasadas" });

            var diasDiferencia = fechaFin.DayNumber - fechaInicio.DayNumber;
            if (diasDiferencia > 90)
                return BadRequest(new { message = "El rango de fechas no puede exceder 90 días" });

            // Convertir el horario semanal del request al formato esperado por el servicio
            var horarioSemanal = request.HorarioSemanal.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.Select(ts => new Services.WeeklyTimeSlot
                {
                    HoraInicio = ts.HoraInicio,
                    HoraFin = ts.HoraFin,
                    Tipo = ts.Tipo
                }).ToList()
            );

            var (created, slots, errors) = await _service.BulkCreateSlotsAsync(
                request.DoctorId,
                request.FechaInicio,
                request.FechaFin,
                horarioSemanal
            );

            _logger.LogInformation(
                "Creación masiva de slots completada. Doctor={DoctorId}, Creados={Creados}, Errores={Errores}",
                request.DoctorId, created, errors.Count);

            return Ok(new BulkCreateResult
            {
                SlotsCreados = created,
                Slots = slots,
                Errores = errors
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en creación masiva de slots");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Actualiza un slot existente (parcial)
    /// PUT /api/doctor/availability/1
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<DoctorSlotDto>> UpdateSlot(long id, [FromBody] UpdateSlotRequest request)
    {
        try
        {
            // Validar formatos si se proporcionaron
            if (request.HoraInicio != null && !IsValidTimeFormat(request.HoraInicio))
                return BadRequest(new { message = "Formato de hora de inicio inválido (debe ser HH:mm)" });

            if (request.HoraFin != null && !IsValidTimeFormat(request.HoraFin))
                return BadRequest(new { message = "Formato de hora de fin inválido (debe ser HH:mm)" });

            var slot = await _service.UpdateSlotAsync(
                id,
                request.HoraInicio,
                request.HoraFin,
                request.Tipo,
                request.Estado
            );

            if (slot == null)
            {
                _logger.LogWarning("Intento de actualizar slot inexistente: {SlotId}", id);
                return NotFound(new { message = $"Slot con ID {id} no encontrado" });
            }

            _logger.LogInformation("Slot actualizado: {SlotId}", id);
            return Ok(slot);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar slot {SlotId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Elimina un slot
    /// DELETE /api/doctor/availability/1
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSlot(long id)
    {
        try
        {
            var deleted = await _service.DeleteSlotAsync(id);

            if (!deleted)
            {
                _logger.LogWarning("Intento de eliminar slot inexistente: {SlotId}", id);
                return NotFound(new { message = $"Slot con ID {id} no encontrado" });
            }

            _logger.LogInformation("Slot eliminado: {SlotId}", id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar slot {SlotId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    #region Request/Response Models

    public class CreateSlotRequest
    {
        public string DoctorId { get; set; } = string.Empty;
        public string Fecha { get; set; } = string.Empty;
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFin { get; set; } = string.Empty;
        public SlotTipo Tipo { get; set; }
        public SlotEstado Estado { get; set; }
    }

    public class WeeklyTimeSlot
    {
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFin { get; set; } = string.Empty;
        public SlotTipo Tipo { get; set; }
    }

    public class BulkCreateSlotsRequest
    {
        public string DoctorId { get; set; } = string.Empty;
        public string FechaInicio { get; set; } = string.Empty;
        public string FechaFin { get; set; } = string.Empty;
        public Dictionary<int, List<WeeklyTimeSlot>> HorarioSemanal { get; set; } = new();
    }

    public class BulkCreateResult
    {
        public int SlotsCreados { get; set; }
        public List<DoctorSlotDto> Slots { get; set; } = new();
        public List<string> Errores { get; set; } = new();
    }

    public class UpdateSlotRequest
    {
        public string? HoraInicio { get; set; }
        public string? HoraFin { get; set; }
        public SlotTipo? Tipo { get; set; }
        public SlotEstado? Estado { get; set; }
    }

    #endregion

    #region Helper Methods

    private static bool IsValidTimeFormat(string time)
    {
        return TimeOnly.TryParseExact(time, "HH:mm", out _);
    }

    private static bool IsValidDateFormat(string date)
    {
        return DateOnly.TryParseExact(date, "yyyy-MM-dd", out _);
    }

    #endregion
}
