using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.DTOs.Admin;
using TuCita.Models;

namespace TuCita.Services
{
    public class AdminReportesService : IAdminReportesService
    {
        private readonly TuCitaDbContext _context;
        private readonly ILogger<AdminReportesService> _logger;

        public AdminReportesService(TuCitaDbContext context, ILogger<AdminReportesService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public Task<ReporteGeneradoDto> GenerarReporteAsync(ReporteFilterDto filtros)
        {
            throw new System.NotImplementedException();
        }

        public Task<ReporteExportadoDto> ExportarReporteAsync(ReporteFilterDto filtros)
        {
            throw new System.NotImplementedException();
        }

        public async Task<SummaryReportDto> GetSummaryAsync(string? desde, string? hasta, int? medicoId = null, int? especialidadId = null, string? estado = null)
        {
            // Manejar entradas vacías y parseo de fechas
            DateTime inicio;
            DateTime fin;

            if (string.IsNullOrWhiteSpace(desde))
            {
                // Por defecto tomar los últimos 7 días
                inicio = DateTime.UtcNow.Date.AddDays(-7);
            }
            else if (!DateTime.TryParse(desde, out inicio))
            {
                throw new ArgumentException("Parametro 'desde' invalido");
            }

            if (string.IsNullOrWhiteSpace(hasta))
            {
                // Por defecto hasta el final del día actual
                fin = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
            }
            else if (!DateTime.TryParse(hasta, out fin))
            {
                throw new ArgumentException("Parametro 'hasta' invalido");
            }

            if (inicio > fin)
            {
                throw new ArgumentException("La fecha 'desde' no puede ser mayor a 'hasta'");
            }

            // Construir query base aplicando filtros
            var query = _context.Citas.AsQueryable();

            query = query.Where(c => c.Inicio >= inicio && c.Inicio <= fin);

            if (medicoId.HasValue)
            {
                query = query.Where(c => c.MedicoId == medicoId.Value);
            }

            if (especialidadId.HasValue)
            {
                // Filtrar por especialidad usando la tabla many-to-many medico_especialidad
                query = query.Where(c => _context.MedicosEspecialidades.Any(me => me.MedicoId == c.MedicoId && me.EspecialidadId == especialidadId.Value));
            }

            if (!string.IsNullOrWhiteSpace(estado))
            {
                if (Enum.TryParse<EstadoCita>(estado, true, out var estadoEnum))
                {
                    query = query.Where(c => c.Estado == estadoEnum);
                }
                else
                {
                    throw new ArgumentException("Estado invalido");
                }
            }

            // Ejecutar consultas agregadas
            var total = await query.CountAsync();
            var atendidas = await query.CountAsync(c => c.Estado == EstadoCita.ATENDIDA);
            var canceladas = await query.CountAsync(c => c.Estado == EstadoCita.CANCELADA);
            var noShow = await query.CountAsync(c => c.Estado == EstadoCita.NO_ATENDIDA);

            // Ingresos no disponibles en el modelo de Cita actualmente
            return new SummaryReportDto
            {
                Total = total,
                Atendidas = atendidas,
                Canceladas = canceladas,
                NoShow = noShow,
                Ingresos = null
            };
        }

        public async Task<List<SeriesPointDto>> GetSeriesAsync(string? desde, string? hasta, string granularidad = "day", int? medicoId = null, int? especialidadId = null, string? estado = null)
        {
            // Parsear fechas con la misma lógica que en GetSummaryAsync
            DateTime inicio;
            DateTime fin;

            if (string.IsNullOrWhiteSpace(desde))
            {
                inicio = DateTime.UtcNow.Date.AddDays(-7);
            }
            else if (!DateTime.TryParse(desde, out inicio))
            {
                throw new ArgumentException("Parametro 'desde' invalido");
            }

            if (string.IsNullOrWhiteSpace(hasta))
            {
                fin = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
            }
            else if (!DateTime.TryParse(hasta, out fin))
            {
                throw new ArgumentException("Parametro 'hasta' invalido");
            }

            if (inicio > fin)
            {
                throw new ArgumentException("La fecha 'desde' no puede ser mayor a 'hasta'");
            }

            // Construir query base aplicando filtros
            var query = _context.Citas.AsQueryable();
            query = query.Where(c => c.Inicio >= inicio && c.Inicio <= fin);

            if (medicoId.HasValue)
            {
                query = query.Where(c => c.MedicoId == medicoId.Value);
            }

            if (especialidadId.HasValue)
            {
                query = query.Where(c => _context.MedicosEspecialidades.Any(me => me.MedicoId == c.MedicoId && me.EspecialidadId == especialidadId.Value));
            }

            if (!string.IsNullOrWhiteSpace(estado))
            {
                if (Enum.TryParse<EstadoCita>(estado, true, out var estadoEnum))
                {
                    query = query.Where(c => c.Estado == estadoEnum);
                }
                else
                {
                    throw new ArgumentException("Estado invalido");
                }
            }

            // Traer datos al cliente para agrupar en memoria (simplifica agrupaciones por semana)
            var citas = await query.Select(c => new { c.Inicio, c.Estado }).ToListAsync();

            // Función auxiliar para inicio de semana (lunes)
            static DateTime StartOfWeek(DateTime dt)
            {
                var diff = (7 + (dt.DayOfWeek - DayOfWeek.Monday)) % 7;
                return dt.Date.AddDays(-diff);
            }

            var result = new List<SeriesPointDto>();

            if (granularidad?.ToLower() == "week")
            {
                var firstWeek = StartOfWeek(inicio.Date);
                var lastWeek = StartOfWeek(fin.Date);

                for (var current = firstWeek; current <= lastWeek; current = current.AddDays(7))
                {
                    var group = citas.Where(c => StartOfWeek(c.Inicio) == current);

                    var total = group.Count();
                    var confirmada = group.Count(c => c.Estado == EstadoCita.CONFIRMADA);
                    var atendida = group.Count(c => c.Estado == EstadoCita.ATENDIDA);
                    var cancelada = group.Count(c => c.Estado == EstadoCita.CANCELADA);
                    var noshow = group.Count(c => c.Estado == EstadoCita.NO_ATENDIDA);

                    result.Add(new SeriesPointDto
                    {
                        Fecha = current.ToString("yyyy-MM-dd"),
                        Programada = total,
                        Confirmada = confirmada,
                        Atendida = atendida,
                        Cancelada = cancelada,
                        NoShow = noshow
                    });
                }
            }
            else
            {
                // daily
                var start = inicio.Date;
                var end = fin.Date;

                for (var day = start; day <= end; day = day.AddDays(1))
                {
                    var group = citas.Where(c => c.Inicio.Date == day);

                    var total = group.Count();
                    var confirmada = group.Count(c => c.Estado == EstadoCita.CONFIRMADA);
                    var atendida = group.Count(c => c.Estado == EstadoCita.ATENDIDA);
                    var cancelada = group.Count(c => c.Estado == EstadoCita.CANCELADA);
                    var noshow = group.Count(c => c.Estado == EstadoCita.NO_ATENDIDA);

                    result.Add(new SeriesPointDto
                    {
                        Fecha = day.ToString("yyyy-MM-dd"),
                        Programada = total,
                        Confirmada = confirmada,
                        Atendida = atendida,
                        Cancelada = cancelada,
                        NoShow = noshow
                    });
                }
            }

            return result;
        }

        public async Task<PagedResultDto<ReportItemDto>> GetListAsync(string?desde, string?hasta, string?estado, int?medicoId, int pagina = 1, int tamanoPagina = 20, string?q = null)
        {
            try
            {
                // Parsear fechas
                DateTime inicio;
                DateTime fin;

                if (string.IsNullOrWhiteSpace(desde))
                {
                    inicio = DateTime.UtcNow.Date.AddDays(-7);
                }
                else if (!DateTime.TryParse(desde, out inicio))
                {
                    throw new ArgumentException("Parametro 'desde' invalido");
                }

                if (string.IsNullOrWhiteSpace(hasta))
                {
                    fin = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
                }
                else if (!DateTime.TryParse(hasta, out fin))
                {
                    throw new ArgumentException("Parametro 'hasta' invalido");
                }

                if (inicio > fin)
                {
                    throw new ArgumentException("La fecha 'desde' no puede ser mayor a 'hasta'");
                }

                var baseQuery = _context.Citas.AsQueryable();
                baseQuery = baseQuery.Where(c => c.Inicio >= inicio && c.Inicio <= fin);

                if (medicoId.HasValue)
                {
                    baseQuery = baseQuery.Where(c => c.MedicoId == medicoId.Value);
                }

                if (!string.IsNullOrWhiteSpace(estado))
                {
                    if (Enum.TryParse<EstadoCita>(estado, true, out var est))
                    {
                        baseQuery = baseQuery.Where(c => c.Estado == est);
                    }
                    else
                    {
                        throw new ArgumentException("Estado invalido");
                    }
                }

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var qTrim = q.Trim().ToLower();
                    // Filter only on Motivo to avoid complex navigation translation issues
                    baseQuery = baseQuery.Where(c => c.Motivo != null && c.Motivo.ToLower().Contains(qTrim));
                }

                var totalRegistros = await baseQuery.CountAsync();

                // Load page with includes to safely access navigation properties
                var pageCitas = await baseQuery
                    .OrderByDescending(c => c.Inicio)
                    .Skip((pagina - 1) * tamanoPagina)
                    .Take(tamanoPagina)
                    .Include(c => c.Paciente).ThenInclude(p => p.Usuario)
                    .Include(c => c.Medico).ThenInclude(m => m.Usuario)
                    .ToListAsync();

                var medicoIds = pageCitas.Select(c => c.MedicoId).Distinct().ToList();

                var especialidadesMap = new Dictionary<long, string?>();

                if (medicoIds.Count > 0)
                {
                    especialidadesMap = await _context.MedicosEspecialidades
                        .Where(me => medicoIds.Contains(me.MedicoId))
                        .Include(me => me.Especialidad)
                        .GroupBy(me => me.MedicoId)
                        .Select(g => new { MedicoId = g.Key, Nombre = g.Select(x => x.Especialidad.Nombre).FirstOrDefault() })
                        .ToDictionaryAsync(x => (long)x.MedicoId, x => x.Nombre);
                }

                var items = pageCitas.Select(c => new ReportItemDto
                {
                    Id = c.Id,
                    Fecha = c.Inicio.ToString("yyyy-MM-dd"),
                    Hora = c.Inicio.ToString("HH:mm"),
                    Paciente = c.Paciente?.Usuario != null ? (c.Paciente.Usuario.Nombre + " " + c.Paciente.Usuario.Apellido) : string.Empty,
                    Doctor = c.Medico?.Usuario != null ? (c.Medico.Usuario.Nombre + " " + c.Medico.Usuario.Apellido) : string.Empty,
                    Especialidad = especialidadesMap.ContainsKey(c.MedicoId) ? especialidadesMap[c.MedicoId] : null,
                    Estado = c.Estado.ToString(),
                    Origen = null,  // Campo no disponible
                    AgendadoPor = null  // Campo no disponible
                }).ToList();

                var totalPaginas = (int)Math.Ceiling(totalRegistros / (double)tamanoPagina);

                return new PagedResultDto<ReportItemDto>
                {
                    Items = items,
                    TotalRegistros = totalRegistros,
                    TotalPaginas = totalPaginas
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en GetListAsync");
                // Return empty page instead of throwing to avoid 500 on UI; caller can detect empty result
                return new PagedResultDto<ReportItemDto>
                {
                    Items = new List<ReportItemDto>(),
                    TotalRegistros = 0,
                    TotalPaginas = 0
                };
            }
        }

        public async Task<byte[]> ExportCsvAsync(string? desde, string? hasta, string? estado, int? medicoId, string? q = null)
        {
            try
            {
                // Reuse GetListAsync logic but fetch all matching records (no paging)
                DateTime inicio;
                DateTime fin;

                if (string.IsNullOrWhiteSpace(desde))
                {
                    inicio = DateTime.UtcNow.Date.AddDays(-7);
                }
                else if (!DateTime.TryParse(desde, out inicio))
                {
                    throw new ArgumentException("Parametro 'desde' invalido");
                }

                if (string.IsNullOrWhiteSpace(hasta))
                {
                    fin = DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
                }
                else if (!DateTime.TryParse(hasta, out fin))
                {
                    throw new ArgumentException("Parametro 'hasta' invalido");
                }

                if (inicio > fin)
                {
                    throw new ArgumentException("La fecha 'desde' no puede ser mayor a 'hasta'");
                }

                var query = _context.Citas
                    .Where(c => c.Inicio >= inicio && c.Inicio <= fin);

                if (medicoId.HasValue)
                {
                    query = query.Where(c => c.MedicoId == medicoId.Value);
                }

                if (!string.IsNullOrWhiteSpace(estado) && Enum.TryParse<EstadoCita>(estado, true, out var est))
                {
                    query = query.Where(c => c.Estado == est);
                }

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var qTrim = q.Trim().ToLower();
                    query = query.Where(c => c.Motivo != null && c.Motivo.ToLower().Contains(qTrim));
                }

                var list = await query
                    .Include(c => c.Paciente).ThenInclude(p => p.Usuario)
                    .Include(c => c.Medico).ThenInclude(m => m.Usuario)
                    .OrderByDescending(c => c.Inicio)
                    .ToListAsync();

                var medicoIds = list.Select(c => c.MedicoId).Distinct().ToList();
                var especialidadesMap = new Dictionary<long, string?>();
                if (medicoIds.Count > 0)
                {
                    especialidadesMap = await _context.MedicosEspecialidades
                        .Where(me => medicoIds.Contains(me.MedicoId))
                        .Include(me => me.Especialidad)
                        .GroupBy(me => me.MedicoId)
                        .Select(g => new { MedicoId = g.Key, Nombre = g.Select(x => x.Especialidad.Nombre).FirstOrDefault() })
                        .ToDictionaryAsync(x => (long)x.MedicoId, x => x.Nombre);
                }

                // Build CSV
                var csvLines = new List<string>();
                csvLines.Add("Fecha,Hora,Paciente,Doctor,Especialidad,Estado");

                foreach (var c in list)
                {
                    var fecha = c.Inicio.ToString("yyyy-MM-dd");
                    var hora = c.Inicio.ToString("HH:mm");
                    var paciente = c.Paciente?.Usuario != null ? (c.Paciente.Usuario.Nombre + " " + c.Paciente.Usuario.Apellido) : string.Empty;
                    var doctor = c.Medico?.Usuario != null ? (c.Medico.Usuario.Nombre + " " + c.Medico.Usuario.Apellido) : string.Empty;
                    var esp = especialidadesMap.ContainsKey(c.MedicoId) ? especialidadesMap[c.MedicoId] : string.Empty;
                    var estadoStr = c.Estado.ToString();
                    var origen = string.Empty;  // Campo no disponible
                    var agendadoPor = string.Empty;  // Campo no disponible

                    // Escape double quotes and commas
                    string Escape(string s)
                    {
                        if (s == null) return string.Empty;
                        var escaped = s.Replace("\"", "\"\"");
                        if (escaped.Contains(",") || escaped.Contains("\"") || escaped.Contains('\n'))
                            return $"\"{escaped}\"";
                        return escaped;
                    }

                    csvLines.Add(string.Join(",", new[] { Escape(fecha), Escape(hora), Escape(paciente), Escape(doctor), Escape(esp), Escape(estadoStr), Escape(origen), Escape(agendadoPor) }));
                }

                var csv = string.Join("\n", csvLines);
                // Return UTF8 bytes with BOM to improve compatibility with Excel
                var preamble = System.Text.Encoding.UTF8.GetPreamble();
                var body = System.Text.Encoding.UTF8.GetBytes(csv);
                var result = new byte[preamble.Length + body.Length];
                Buffer.BlockCopy(preamble, 0, result, 0, preamble.Length);
                Buffer.BlockCopy(body, 0, result, preamble.Length, body.Length);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en ExportCsvAsync");
                // Return empty CSV
                var preamble = System.Text.Encoding.UTF8.GetPreamble();
                var body = System.Text.Encoding.UTF8.GetBytes("Fecha,Hora,Paciente,Doctor,Especialidad,Estado,Origen,AgendadoPor\n");
                var result = new byte[preamble.Length + body.Length];
                Buffer.BlockCopy(preamble, 0, result, 0, preamble.Length);
                Buffer.BlockCopy(body, 0, result, preamble.Length, body.Length);
                return result;
            }
        }
    }
}
