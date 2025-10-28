using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.MedicalHistory;

namespace TuCita.Services;

public interface IMedicalHistoryService
{
    Task<IEnumerable<HistorialMedicoDto>> GetPatientMedicalHistoryAsync(long pacienteId);
    Task<CitaDetalleDto?> GetAppointmentDetailAsync(long citaId, long usuarioId, bool isDoctorOrAdmin);
    Task<NotaClinicaDto?> CreateNotaClinicaAsync(CreateNotaClinicaRequest request, long medicoId);
    Task<DiagnosticoDto?> CreateDiagnosticoAsync(CreateDiagnosticoRequest request, long medicoId);
    Task<RecetaDto?> CreateRecetaAsync(CreateRecetaRequest request, long medicoId);
    Task<DocumentoDto?> CreateDocumentoAsync(CreateDocumentoRequest request, long medicoId);
    Task<bool> DeleteDocumentoAsync(long documentoId, long usuarioId, bool isDoctorOrAdmin);
}

public class MedicalHistoryService : IMedicalHistoryService
{
    private readonly TuCitaDbContext _context;

    public MedicalHistoryService(TuCitaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HistorialMedicoDto>> GetPatientMedicalHistoryAsync(long pacienteId)
    {
        try
        {
            var citas = await _context.Citas
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .Include(c => c.Diagnosticos)
                .Include(c => c.NotasClinicas)
                .Include(c => c.Recetas)
                    .ThenInclude(r => r.Items)
                .Include(c => c.Documentos)
                    .ThenInclude(d => d.Etiquetas)
                .Where(c => c.PacienteId == pacienteId && c.Estado == EstadoCita.ATENDIDA)
                .OrderByDescending(c => c.Inicio)
                .ToListAsync();

            return citas.Select(c => MapToHistorialMedicoDto(c)).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetPatientMedicalHistoryAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<CitaDetalleDto?> GetAppointmentDetailAsync(long citaId, long usuarioId, bool isDoctorOrAdmin)
    {
        try
        {
            var cita = await _context.Citas
                .Include(c => c.Medico)
                    .ThenInclude(m => m.Usuario)
                .Include(c => c.Medico)
                    .ThenInclude(m => m.EspecialidadesMedico)
                        .ThenInclude(me => me.Especialidad)
                .Include(c => c.Paciente)
                    .ThenInclude(p => p.Usuario)
                .Include(c => c.Diagnosticos)
                .Include(c => c.NotasClinicas)
                .Include(c => c.Recetas)
                    .ThenInclude(r => r.Items)
                .Include(c => c.Documentos)
                    .ThenInclude(d => d.Etiquetas)
                .FirstOrDefaultAsync(c => c.Id == citaId);

            if (cita == null)
                return null;

            // Verificar que el usuario tiene permiso para ver esta cita
            if (!isDoctorOrAdmin && cita.PacienteId != usuarioId)
                return null;

            return MapToCitaDetalleDto(cita);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetAppointmentDetailAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<NotaClinicaDto?> CreateNotaClinicaAsync(CreateNotaClinicaRequest request, long medicoId)
    {
        try
        {
            // Verificar que la cita existe y pertenece al médico
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == request.CitaId && c.MedicoId == medicoId);

            if (cita == null)
                return null;

            var nota = new NotaClinica
            {
                CitaId = request.CitaId,
                Nota = request.Contenido,
                CreadoEn = DateTime.UtcNow
            };

            _context.NotasClinicas.Add(nota);
            await _context.SaveChangesAsync();

            return new NotaClinicaDto
            {
                Id = nota.Id,
                CitaId = nota.CitaId,
                Contenido = nota.Nota,
                Fecha = nota.CreadoEn
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en CreateNotaClinicaAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    public async Task<DiagnosticoDto?> CreateDiagnosticoAsync(CreateDiagnosticoRequest request, long medicoId)
    {
        try
        {
            // Verificar que la cita existe y pertenece al médico
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == request.CitaId && c.MedicoId == medicoId);

            if (cita == null)
                return null;

            var diagnostico = new Diagnostico
            {
                CitaId = request.CitaId,
                Codigo = request.Codigo,
                Descripcion = request.Descripcion,
                CreadoEn = DateTime.UtcNow
            };

            _context.Diagnosticos.Add(diagnostico);
            await _context.SaveChangesAsync();

            return new DiagnosticoDto
            {
                Id = diagnostico.Id,
                CitaId = diagnostico.CitaId,
                Codigo = diagnostico.Codigo,
                Descripcion = diagnostico.Descripcion,
                Fecha = diagnostico.CreadoEn
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en CreateDiagnosticoAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    public async Task<RecetaDto?> CreateRecetaAsync(CreateRecetaRequest request, long medicoId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Verificar que la cita existe y pertenece al médico
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == request.CitaId && c.MedicoId == medicoId);

            if (cita == null)
                return null;

            var receta = new Receta
            {
                CitaId = request.CitaId,
                Indicaciones = request.Indicaciones,
                CreadoEn = DateTime.UtcNow
            };

            _context.Recetas.Add(receta);
            await _context.SaveChangesAsync();

            // Agregar los items de la receta
            foreach (var item in request.Medicamentos)
            {
                var recetaItem = new RecetaItem
                {
                    RecetaId = receta.Id,
                    Medicamento = item.Medicamento,
                    Dosis = item.Dosis,
                    Frecuencia = item.Frecuencia,
                    Duracion = item.Duracion,
                    Notas = item.Notas
                };
                _context.RecetaItems.Add(recetaItem);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Recargar la receta con los items
            var recetaCreada = await _context.Recetas
                .Include(r => r.Items)
                .FirstAsync(r => r.Id == receta.Id);

            return new RecetaDto
            {
                Id = recetaCreada.Id,
                CitaId = recetaCreada.CitaId,
                Indicaciones = recetaCreada.Indicaciones,
                Fecha = recetaCreada.CreadoEn,
                Medicamentos = recetaCreada.Items.Select(i => new RecetaItemDto
                {
                    Id = i.Id,
                    Medicamento = i.Medicamento,
                    Dosis = i.Dosis,
                    Frecuencia = i.Frecuencia,
                    Duracion = i.Duracion,
                    Notas = i.Notas
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"Error en CreateRecetaAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    public async Task<DocumentoDto?> CreateDocumentoAsync(CreateDocumentoRequest request, long medicoId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Verificar que la cita existe y pertenece al médico
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == request.CitaId && c.MedicoId == medicoId);

            if (cita == null)
                return null;

            // Usar el pacienteId de la cita
            var pacienteId = cita.PacienteId;

            var documento = new DocumentoClinico
            {
                CitaId = request.CitaId,
                MedicoId = medicoId,
                PacienteId = pacienteId,
                Categoria = request.Categoria,
                NombreArchivo = request.NombreArchivo,
                MimeType = request.MimeType,
                TamanoBytes = request.TamanoBytes,
                StorageId = request.StorageId,
                BlobContainer = request.BlobContainer,
                BlobCarpeta = request.BlobCarpeta,
                BlobNombre = request.BlobNombre,
                Notas = request.Notas,
                CreadoPor = medicoId,
                CreadoEn = DateTime.UtcNow
            };

            _context.DocumentosClinicos.Add(documento);
            await _context.SaveChangesAsync();

            // Agregar etiquetas si existen
            if (request.Etiquetas != null && request.Etiquetas.Any())
            {
                foreach (var etiqueta in request.Etiquetas)
                {
                    var docEtiqueta = new DocumentoEtiqueta
                    {
                        DocumentoId = documento.Id,
                        Etiqueta = etiqueta
                    };
                    _context.DocumentoEtiquetas.Add(docEtiqueta);
                }
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            // Recargar el documento con etiquetas
            var documentoCreado = await _context.DocumentosClinicos
                .Include(d => d.Etiquetas)
                .FirstAsync(d => d.Id == documento.Id);

            return new DocumentoDto
            {
                Id = documentoCreado.Id,
                CitaId = documentoCreado.CitaId,
                Categoria = documentoCreado.Categoria,
                NombreArchivo = documentoCreado.NombreArchivo,
                MimeType = documentoCreado.MimeType,
                TamanoBytes = documentoCreado.TamanoBytes,
                Notas = documentoCreado.Notas,
                FechaSubida = documentoCreado.CreadoEn,
                Etiquetas = documentoCreado.Etiquetas.Select(e => e.Etiqueta).ToList()
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"Error en CreateDocumentoAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
        }
    }

    public async Task<bool> DeleteDocumentoAsync(long documentoId, long usuarioId, bool isDoctorOrAdmin)
    {
        try
        {
            var documento = await _context.DocumentosClinicos
                .Include(d => d.Cita)
                .FirstOrDefaultAsync(d => d.Id == documentoId);

            if (documento == null)
                return false;

            // Verificar permisos: debe ser el médico que lo creó, el paciente de la cita, o admin
            if (!isDoctorOrAdmin && documento.CreadoPor != usuarioId && documento.Cita.PacienteId != usuarioId)
                return false;

            _context.DocumentosClinicos.Remove(documento);
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en DeleteDocumentoAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return false;
        }
    }

    // Métodos auxiliares de mapeo
    private HistorialMedicoDto MapToHistorialMedicoDto(Cita cita)
    {
        return new HistorialMedicoDto
        {
            CitaId = cita.Id,
            FechaCita = cita.Inicio,
            NombreMedico = cita.Medico?.Usuario != null 
                ? $"Dr. {cita.Medico.Usuario.Nombre} {cita.Medico.Usuario.Apellido}" 
                : "Médico no disponible",
            Especialidad = cita.Medico?.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre,
            EstadoCita = cita.Estado.ToString(),
            Motivo = cita.Motivo,
            Diagnosticos = cita.Diagnosticos.Select(d => new DiagnosticoDto
            {
                Id = d.Id,
                CitaId = d.CitaId,
                Codigo = d.Codigo,
                Descripcion = d.Descripcion,
                Fecha = d.CreadoEn
            }).ToList(),
            NotasClinicas = cita.NotasClinicas.Select(n => new NotaClinicaDto
            {
                Id = n.Id,
                CitaId = n.CitaId,
                Contenido = n.Nota,
                Fecha = n.CreadoEn
            }).ToList(),
            Recetas = cita.Recetas.Select(r => new RecetaDto
            {
                Id = r.Id,
                CitaId = r.CitaId,
                Indicaciones = r.Indicaciones,
                Fecha = r.CreadoEn,
                Medicamentos = r.Items.Select(i => new RecetaItemDto
                {
                    Id = i.Id,
                    Medicamento = i.Medicamento,
                    Dosis = i.Dosis,
                    Frecuencia = i.Frecuencia,
                    Duracion = i.Duracion,
                    Notas = i.Notas
                }).ToList()
            }).ToList(),
            Documentos = cita.Documentos.Select(d => new DocumentoDto
            {
                Id = d.Id,
                CitaId = d.CitaId,
                Categoria = d.Categoria,
                NombreArchivo = d.NombreArchivo,
                MimeType = d.MimeType,
                TamanoBytes = d.TamanoBytes,
                Notas = d.Notas,
                FechaSubida = d.CreadoEn,
                Etiquetas = d.Etiquetas.Select(e => e.Etiqueta).ToList()
            }).ToList()
        };
    }

    private CitaDetalleDto MapToCitaDetalleDto(Cita cita)
    {
        return new CitaDetalleDto
        {
            Id = cita.Id,
            Inicio = cita.Inicio,
            Fin = cita.Fin,
            Estado = cita.Estado.ToString(),
            Motivo = cita.Motivo,
            NombreMedico = cita.Medico?.Usuario != null 
                ? $"Dr. {cita.Medico.Usuario.Nombre} {cita.Medico.Usuario.Apellido}" 
                : "Médico no disponible",
            Especialidad = cita.Medico?.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre,
            DireccionMedico = cita.Medico?.Direccion,
            NombrePaciente = cita.Paciente?.Usuario != null 
                ? $"{cita.Paciente.Usuario.Nombre} {cita.Paciente.Usuario.Apellido}" 
                : "Paciente no disponible",
            Identificacion = cita.Paciente?.Identificacion,
            Diagnosticos = cita.Diagnosticos.Select(d => new DiagnosticoDto
            {
                Id = d.Id,
                CitaId = d.CitaId,
                Codigo = d.Codigo,
                Descripcion = d.Descripcion,
                Fecha = d.CreadoEn
            }).ToList(),
            NotasClinicas = cita.NotasClinicas.Select(n => new NotaClinicaDto
            {
                Id = n.Id,
                CitaId = n.CitaId,
                Contenido = n.Nota,
                Fecha = n.CreadoEn
            }).ToList(),
            Recetas = cita.Recetas.Select(r => new RecetaDto
            {
                Id = r.Id,
                CitaId = r.CitaId,
                Indicaciones = r.Indicaciones,
                Fecha = r.CreadoEn,
                Medicamentos = r.Items.Select(i => new RecetaItemDto
                {
                    Id = i.Id,
                    Medicamento = i.Medicamento,
                    Dosis = i.Dosis,
                    Frecuencia = i.Frecuencia,
                    Duracion = i.Duracion,
                    Notas = i.Notas
                }).ToList()
            }).ToList(),
            Documentos = cita.Documentos.Select(d => new DocumentoDto
            {
                Id = d.Id,
                CitaId = d.CitaId,
                Categoria = d.Categoria,
                NombreArchivo = d.NombreArchivo,
                MimeType = d.MimeType,
                TamanoBytes = d.TamanoBytes,
                Notas = d.Notas,
                FechaSubida = d.CreadoEn,
                Etiquetas = d.Etiquetas.Select(e => e.Etiqueta).ToList()
            }).ToList()
        };
    }
}
