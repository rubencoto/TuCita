using Microsoft.AspNetCore.Mvc;
using TuCita.DTOs.Doctors;
using System.Collections.Concurrent;
using System.Globalization;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para gestionar la disponibilidad de horarios de los doctores
/// Compatible con doctor-availability-page.tsx
/// </summary>
[ApiController]
[Route("api/doctor/availability")]
public class DoctorAvailabilityController : ControllerBase
{
    // Almacenamiento en memoria temporal (en producción usaría DbContext)
    private static readonly ConcurrentDictionary<long, DoctorSlotDto> _slots = new();
    private static long _idSequence = 1;
    private readonly ILogger<DoctorAvailabilityController> _logger;

    public DoctorAvailabilityController(ILogger<DoctorAvailabilityController> logger)
    {
        _logger = logger;
        SeedData();
    }

    /// <summary>
    /// Inicializa datos de ejemplo
    /// </summary>
    private void SeedData()
    {
        if (!_slots.IsEmpty) return;

        var today = DateTime.Now.Date;
        var tomorrow = today.AddDays(1);

        var sampleSlots = new[]
        {
            new DoctorSlotDto 
            { 
                IdSlot = 1, 
                DoctorId = "DOC-001", 
                Fecha = today.ToString("yyyy-MM-dd"), 
                HoraInicio = "09:00", 
                HoraFin = "10:00", 
                Tipo = SlotTipo.PRESENCIAL, 
                Estado = SlotEstado.DISPONIBLE 
            },
            new DoctorSlotDto 
            { 
                IdSlot = 2, 
                DoctorId = "DOC-001", 
                Fecha = today.ToString("yyyy-MM-dd"), 
                HoraInicio = "10:00", 
                HoraFin = "11:00", 
                Tipo = SlotTipo.PRESENCIAL, 
                Estado = SlotEstado.OCUPADO 
            },
            new DoctorSlotDto 
            { 
                IdSlot = 3, 
                DoctorId = "DOC-001", 
                Fecha = today.ToString("yyyy-MM-dd"), 
                HoraInicio = "11:00", 
                HoraFin = "12:00", 
                Tipo = SlotTipo.TELECONSULTA, 
                Estado = SlotEstado.DISPONIBLE 
            },
            new DoctorSlotDto 
            { 
                IdSlot = 4, 
                DoctorId = "DOC-001", 
                Fecha = today.ToString("yyyy-MM-dd"), 
                HoraInicio = "16:00", 
                HoraFin = "17:00", 
                Tipo = SlotTipo.PRESENCIAL, 
                Estado = SlotEstado.BLOQUEADO 
            },
            new DoctorSlotDto 
            { 
                IdSlot = 5, 
                DoctorId = "DOC-001", 
                Fecha = tomorrow.ToString("yyyy-MM-dd"), 
                HoraInicio = "09:00", 
                HoraFin = "10:00", 
                Tipo = SlotTipo.TELECONSULTA, 
                Estado = SlotEstado.DISPONIBLE 
            },
        };

        foreach (var slot in sampleSlots)
        {
            _slots[slot.IdSlot] = slot;
        }
        _idSequence = 6;
    }

    /// <summary>
    /// Obtiene todos los slots, opcionalmente filtrados por doctorId y fecha
    /// GET /api/doctor/availability?doctorId=DOC-001&fecha=2025-01-20
    /// </summary>
    [HttpGet]
    public ActionResult<IEnumerable<DoctorSlotDto>> GetSlots(
        [FromQuery] string? doctorId = null,
        [FromQuery] string? fecha = null)
    {
        try
        {
            var slots = _slots.Values.AsEnumerable();

            if (!string.IsNullOrEmpty(doctorId))
                slots = slots.Where(s => s.DoctorId == doctorId);

            if (!string.IsNullOrEmpty(fecha))
            {
                if (!IsValidDateFormat(fecha))
                {
                    return BadRequest(new { message = "Formato de fecha inválido (debe ser YYYY-MM-DD)" });
                }
                slots = slots.Where(s => s.Fecha == fecha);
            }

            var result = slots.OrderBy(s => s.Fecha).ThenBy(s => s.HoraInicio).ToList();
            _logger.LogInformation("Obtenidos {Count} slots para doctor={DoctorId}, fecha={Fecha}", 
                result.Count, doctorId ?? "todos", fecha ?? "todas");

            return Ok(result);
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
    public ActionResult<DoctorSlotDto> GetSlot(long id)
    {
        try
        {
            if (_slots.TryGetValue(id, out var slot))
            {
                _logger.LogInformation("Slot {SlotId} obtenido correctamente", id);
                return Ok(slot);
            }

            _logger.LogWarning("Slot {SlotId} no encontrado", id);
            return NotFound(new { message = $"Slot con ID {id} no encontrado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener slot {SlotId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Solicitud para crear un nuevo slot
    /// </summary>
    public class CreateSlotRequest
    {
        public string DoctorId { get; set; } = string.Empty;
        public string Fecha { get; set; } = string.Empty;
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFin { get; set; } = string.Empty;
        public SlotTipo Tipo { get; set; }
        public SlotEstado Estado { get; set; }
    }

    /// <summary>
    /// Crea un nuevo slot de disponibilidad
    /// POST /api/doctor/availability
    /// </summary>
    [HttpPost]
    public ActionResult<DoctorSlotDto> CreateSlot([FromBody] CreateSlotRequest request)
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

            // Verificar solapamiento de horarios
            var overlaps = _slots.Values.Any(s =>
                s.DoctorId == request.DoctorId &&
                s.Fecha == request.Fecha &&
                TimesOverlap(request.HoraInicio, request.HoraFin, s.HoraInicio, s.HoraFin));

            if (overlaps)
                return Conflict(new { message = "El horario se solapa con otro slot existente" });

            // Crear nuevo slot
            var newId = Interlocked.Increment(ref _idSequence);
            var slot = new DoctorSlotDto
            {
                IdSlot = newId,
                DoctorId = request.DoctorId,
                Fecha = request.Fecha,
                HoraInicio = request.HoraInicio,
                HoraFin = request.HoraFin,
                Tipo = request.Tipo,
                Estado = request.Estado
            };

            _slots[newId] = slot;
            _logger.LogInformation("Slot creado: ID={SlotId}, Doctor={DoctorId}, Fecha={Fecha}, Hora={HoraInicio}-{HoraFin}", 
                newId, request.DoctorId, request.Fecha, request.HoraInicio, request.HoraFin);

            return CreatedAtAction(nameof(GetSlot), new { id = newId }, slot);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear slot");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Solicitud para actualizar un slot existente
    /// </summary>
    public class UpdateSlotRequest
    {
        public string? HoraInicio { get; set; }
        public string? HoraFin { get; set; }
        public SlotTipo? Tipo { get; set; }
        public SlotEstado? Estado { get; set; }
    }

    /// <summary>
    /// Actualiza un slot existente (parcial)
    /// PUT /api/doctor/availability/1
    /// </summary>
    [HttpPut("{id}")]
    public ActionResult<DoctorSlotDto> UpdateSlot(long id, [FromBody] UpdateSlotRequest request)
    {
        try
        {
            if (!_slots.TryGetValue(id, out var existing))
            {
                _logger.LogWarning("Intento de actualizar slot inexistente: {SlotId}", id);
                return NotFound(new { message = $"Slot con ID {id} no encontrado" });
            }

            // No permitir modificar slots ocupados
            if (existing.Estado == SlotEstado.OCUPADO)
            {
                _logger.LogWarning("Intento de modificar slot ocupado: {SlotId}", id);
                return BadRequest(new { message = "No se pueden modificar slots ocupados" });
            }

            // Aplicar cambios
            var horaInicio = request.HoraInicio ?? existing.HoraInicio;
            var horaFin = request.HoraFin ?? existing.HoraFin;

            // Validar formatos si se proporcionaron
            if (request.HoraInicio != null && !IsValidTimeFormat(request.HoraInicio))
                return BadRequest(new { message = "Formato de hora de inicio inválido (debe ser HH:mm)" });

            if (request.HoraFin != null && !IsValidTimeFormat(request.HoraFin))
                return BadRequest(new { message = "Formato de hora de fin inválido (debe ser HH:mm)" });

            // Validar que hora inicio sea anterior a hora fin
            if (string.Compare(horaInicio, horaFin) >= 0)
                return BadRequest(new { message = "La hora de inicio debe ser anterior a la hora de fin" });

            // Verificar solapamiento excluyendo el slot actual
            var overlaps = _slots.Values.Any(s =>
                s.DoctorId == existing.DoctorId &&
                s.Fecha == existing.Fecha &&
                s.IdSlot != id &&
                TimesOverlap(horaInicio, horaFin, s.HoraInicio, s.HoraFin));

            if (overlaps)
                return Conflict(new { message = "El horario se solapa con otro slot existente" });

            // Actualizar
            existing.HoraInicio = horaInicio;
            existing.HoraFin = horaFin;
            if (request.Tipo.HasValue) existing.Tipo = request.Tipo.Value;
            if (request.Estado.HasValue) existing.Estado = request.Estado.Value;

            _slots[id] = existing;
            _logger.LogInformation("Slot actualizado: {SlotId}", id);

            return Ok(existing);
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
    public ActionResult DeleteSlot(long id)
    {
        try
        {
            if (!_slots.TryGetValue(id, out var slot))
            {
                _logger.LogWarning("Intento de eliminar slot inexistente: {SlotId}", id);
                return NotFound(new { message = $"Slot con ID {id} no encontrado" });
            }

            // No permitir eliminar slots ocupados
            if (slot.Estado == SlotEstado.OCUPADO)
            {
                _logger.LogWarning("Intento de eliminar slot ocupado: {SlotId}", id);
                return BadRequest(new { message = "No se pueden eliminar slots ocupados. Primero cancele las citas asociadas." });
            }

            _slots.TryRemove(id, out _);
            _logger.LogInformation("Slot eliminado: {SlotId}", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar slot {SlotId}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    #region Métodos de Ayuda

    /// <summary>
    /// Valida el formato de hora HH:mm
    /// </summary>
    private static bool IsValidTimeFormat(string time)
    {
        return TimeOnly.TryParseExact(time, "HH:mm", out _);
    }

    /// <summary>
    /// Valida el formato de fecha YYYY-MM-DD
    /// </summary>
    private static bool IsValidDateFormat(string date)
    {
        return DateOnly.TryParseExact(date, "yyyy-MM-dd", out _);
    }

    /// <summary>
    /// Verifica si dos rangos de tiempo se solapan
    /// </summary>
    private static bool TimesOverlap(string start1, string end1, string start2, string end2)
    {
        // Dos rangos se solapan si: inicio1 < fin2 AND inicio2 < fin1
        return string.Compare(start1, end2) < 0 && string.Compare(start2, end1) < 0;
    }

    #endregion
}
