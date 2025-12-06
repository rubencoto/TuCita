using TuCita.DTOs.Admin;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TuCita.Services
{
    public interface IAdminReportesService
    {
        Task<ReporteGeneradoDto> GenerarReporteAsync(ReporteFilterDto filtros);
        Task<ReporteExportadoDto> ExportarReporteAsync(ReporteFilterDto filtros);
        Task<SummaryReportDto> GetSummaryAsync(string? desde, string? hasta, int? medicoId = null, int? especialidadId = null, string? estado = null);
        Task<List<SeriesPointDto>> GetSeriesAsync(string? desde, string? hasta, string granularidad = "day", int? medicoId = null, int? especialidadId = null, string? estado = null);
        Task<PagedResultDto<ReportItemDto>> GetListAsync(string? desde, string? hasta, string? estado, int? medicoId, int pagina = 1, int tamanoPagina = 20, string? q = null);
        Task<byte[]> ExportCsvAsync(string? desde, string? hasta, string? estado, int? medicoId, string? q = null);
    }
}
