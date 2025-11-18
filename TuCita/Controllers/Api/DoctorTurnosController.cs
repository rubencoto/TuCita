using Microsoft.AspNetCore.Mvc;
using TuCita.DTOs.Doctors;
using System.Collections.Concurrent;

namespace TuCita.Controllers.Api;

[ApiController]
[Route("api/doctor/turnos")]
public class DoctorTurnosController : ControllerBase
{
    private static readonly ConcurrentDictionary<long, AgendaTurnoDto> _store = new();
    private static long _idSeq = 1000;

    private readonly ILogger<DoctorTurnosController> _logger;

    public DoctorTurnosController(ILogger<DoctorTurnosController> logger)
    {
        _logger = logger;

        // Seed sample data once
        if (_store.IsEmpty)
        {
            var now = DateTime.UtcNow.Date.AddHours(9);
            for (int i = 0; i < 5; i++)
            {
                var id = System.Threading.Interlocked.Increment(ref _idSeq);
                var turno = new AgendaTurnoDto
                {
                    Id = id,
                    MedicoId = 1,
                    Inicio = now.AddHours(i * 1),
                    Fin = now.AddHours(i * 1 + 0).AddMinutes(45),
                    Estado = "DISPONIBLE"
                };
                _store[turno.Id] = turno;
            }
        }
    }

    [HttpGet]
    public ActionResult<IEnumerable<AgendaTurnoDto>> Get([FromQuery] long? doctorId, [FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var items = _store.Values.AsEnumerable();
        if (doctorId.HasValue)
            items = items.Where(x => x.MedicoId == doctorId.Value);
        if (start.HasValue)
            items = items.Where(x => x.Inicio >= start.Value);
        if (end.HasValue)
            items = items.Where(x => x.Inicio <= end.Value);
        return Ok(items.OrderBy(x => x.Inicio));
    }

    [HttpGet("{id:long}")]
    public ActionResult<AgendaTurnoDto> GetById(long id)
    {
        if (_store.TryGetValue(id, out var turno)) return Ok(turno);
        return NotFound();
    }

    public class CreateTurnoRequest
    {
        public long MedicoId { get; set; }
        public DateTime Inicio { get; set; }
        public DateTime Fin { get; set; }
    }

    [HttpPost]
    public ActionResult<AgendaTurnoDto> Create([FromBody] CreateTurnoRequest req)
    {
        if (req.Inicio >= req.Fin) return BadRequest("Inicio debe ser anterior a Fin");

        // overlap check
        var overlaps = _store.Values.Any(t => t.MedicoId == req.MedicoId && (req.Inicio < t.Fin && t.Inicio < req.Fin));
        if (overlaps) return Conflict("El turno traslapa con otro turno existente");

        var id = System.Threading.Interlocked.Increment(ref _idSeq);
        var dto = new AgendaTurnoDto
        {
            Id = id,
            MedicoId = req.MedicoId,
            Inicio = req.Inicio,
            Fin = req.Fin,
            Estado = "DISPONIBLE"
        };
        _store[id] = dto;
        return CreatedAtAction(nameof(GetById), new { id = id }, dto);
    }

    public class UpdateTurnoRequest
    {
        public DateTime Inicio { get; set; }
        public DateTime Fin { get; set; }
        public string? Estado { get; set; }
    }

    [HttpPut("{id:long}")]
    public ActionResult<AgendaTurnoDto> Update(long id, [FromBody] UpdateTurnoRequest req)
    {
        if (!_store.TryGetValue(id, out var existing)) return NotFound();
        if (req.Inicio >= req.Fin) return BadRequest("Inicio debe ser anterior a Fin");

        // overlap check excluding self
        var overlaps = _store.Values.Any(t => t.Id != id && t.MedicoId == existing.MedicoId && (req.Inicio < t.Fin && t.Inicio < req.Fin));
        if (overlaps) return Conflict("El turno traslapa con otro turno existente");

        existing.Inicio = req.Inicio;
        existing.Fin = req.Fin;
        if (!string.IsNullOrEmpty(req.Estado)) existing.Estado = req.Estado;

        _store[id] = existing;
        return Ok(existing);
    }

    [HttpDelete("{id:long}")]
    public ActionResult Delete(long id)
    {
        if (_store.TryRemove(id, out _)) return NoContent();
        return NotFound();
    }
}
