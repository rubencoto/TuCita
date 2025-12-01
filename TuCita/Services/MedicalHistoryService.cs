using Microsoft.EntityFrameworkCore;
using TuCita.Data;
using TuCita.Models;
using TuCita.DTOs.MedicalHistory;
using Microsoft.AspNetCore.Http;

namespace TuCita.Services;

public interface IMedicalHistoryService
{
    Task<IEnumerable<HistorialMedicoDto>> GetPatientMedicalHistoryAsync(long pacienteId);
    Task<IEnumerable<HistorialMedicoExtendidoDto>> GetDoctorPatientHistoryAsync(long medicoId, long pacienteId);
    Task<IEnumerable<HistorialMedicoExtendidoDto>> GetDoctorAllPatientsHistoryAsync(long medicoId);
    Task<CitaDetalleDto?> GetAppointmentDetailAsync(long citaId, long usuarioId, bool isDoctorOrAdmin);
    Task<NotaClinicaDto?> CreateNotaClinicaAsync(CreateNotaClinicaRequest request, long medicoId);
    Task<DiagnosticoDto?> CreateDiagnosticoAsync(CreateDiagnosticoRequest request, long medicoId);
    Task<RecetaDto?> CreateRecetaAsync(CreateRecetaRequest request, long medicoId);
    Task<DocumentoDto?> CreateDocumentoAsync(CreateDocumentoRequest request, long medicoId);
    Task<DocumentoDto?> UploadDocumentToS3Async(long citaId, long medicoId, IFormFile file, string categoria, string? notas, List<string> etiquetas);
    Task<bool> DeleteDocumentoAsync(long documentoId, long usuarioId, bool isDoctorOrAdmin);
    Task<string?> GetDocumentDownloadUrlAsync(long documentoId, long usuarioId, bool isDoctorOrAdmin);
}

public class MedicalHistoryService : IMedicalHistoryService
{
    private readonly TuCitaDbContext _context;
    private readonly IS3StorageService _s3StorageService;

    public MedicalHistoryService(TuCitaDbContext context, IS3StorageService s3StorageService)
    {
        _context = context;
        _s3StorageService = s3StorageService;
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

    public async Task<IEnumerable<HistorialMedicoExtendidoDto>> GetDoctorPatientHistoryAsync(long medicoId, long pacienteId)
    {
        try
        {
            var citas = await _context.Citas
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
                .Where(c => c.MedicoId == medicoId && c.PacienteId == pacienteId && c.Estado == EstadoCita.ATENDIDA)
                .OrderByDescending(c => c.Inicio)
                .ToListAsync();

            return citas.Select(c => MapToHistorialMedicoExtendidoDto(c)).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorPatientHistoryAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<IEnumerable<HistorialMedicoExtendidoDto>> GetDoctorAllPatientsHistoryAsync(long medicoId)
    {
        try
        {
            var citas = await _context.Citas
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
                .Where(c => c.MedicoId == medicoId && c.Estado == EstadoCita.ATENDIDA)
                .OrderByDescending(c => c.Inicio)
                .ToListAsync();

            return citas.Select(c => MapToHistorialMedicoExtendidoDto(c)).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDoctorAllPatientsHistoryAsync: {ex.Message}");
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
                // AWS S3 fields (replacing Azure Blob fields)
                S3ObjectKey = request.S3ObjectKey,
                S3VersionId = request.S3VersionId,
                S3ETag = request.S3ETag,
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

    public async Task<DocumentoDto?> UploadDocumentToS3Async(
        long citaId, 
        long medicoId, 
        IFormFile file, 
        string categoria, 
        string? notas, 
        List<string> etiquetas)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            // Verificar que la cita existe y pertenece al médico
            var cita = await _context.Citas
                .FirstOrDefaultAsync(c => c.Id == citaId && c.MedicoId == medicoId);

            if (cita == null)
            {
                Console.WriteLine($"[ERROR] Cita {citaId} no encontrada o no pertenece al médico {medicoId}");
                return null;
            }

            var pacienteId = cita.PacienteId;

            // Obtener configuración de S3
            var bucketName = Environment.GetEnvironmentVariable("AWS_S3_BUCKET_NAME");
            if (string.IsNullOrEmpty(bucketName))
            {
                Console.WriteLine("[ERROR] AWS_S3_BUCKET_NAME no configurado");
                throw new InvalidOperationException("AWS S3 no está configurado correctamente");
            }

            // Obtener o crear configuración de almacenamiento en la base de datos
            var storageConfig = await _context.S3AlmacenConfigs
                .FirstOrDefaultAsync(s => s.BucketName == bucketName);

            if (storageConfig == null)
            {
                // Crear configuración de S3 si no existe
                storageConfig = new S3AlmacenConfig
                {
                    Nombre = "DefaultS3Storage",
                    BucketName = bucketName,
                    Region = Environment.GetEnvironmentVariable("AWS_REGION") ?? "us-east-1",
                    Activo = true,
                    CreadoEn = DateTime.UtcNow
                };
                _context.S3AlmacenConfigs.Add(storageConfig);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[INFO] Configuración de S3 creada: ID={storageConfig.Id}, Bucket={bucketName}");
            }

            // Generar clave única para S3
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var fileName = file.FileName;
            var sanitizedFileName = string.Join("_", fileName.Split(Path.GetInvalidFileNameChars()));
            var s3ObjectKey = $"citas/{citaId}/doc_{timestamp}_{sanitizedFileName}";

            Console.WriteLine($"[INFO] Subiendo archivo a S3:");
            Console.WriteLine($"  Bucket: {bucketName}");
            Console.WriteLine($"  Key: {s3ObjectKey}");
            Console.WriteLine($"  Size: {file.Length} bytes");
            Console.WriteLine($"  ContentType: {file.ContentType}");

            // Subir archivo a S3
            using (var stream = file.OpenReadStream())
            {
                var uploadResponse = await _s3StorageService.UploadFileAsync(
                    bucketName,
                    s3ObjectKey,
                    stream,
                    file.ContentType
                );

                Console.WriteLine($"[SUCCESS] Archivo subido a S3: ETag={uploadResponse.ETag}");

                // Crear registro en la base de datos
                var documento = new DocumentoClinico
                {
                    CitaId = citaId,
                    MedicoId = medicoId,
                    PacienteId = pacienteId,
                    Categoria = categoria,
                    NombreArchivo = fileName,
                    MimeType = file.ContentType,
                    TamanoBytes = file.Length,
                    StorageId = storageConfig.Id,
                    S3ObjectKey = s3ObjectKey,
                    S3VersionId = uploadResponse.VersionId,
                    S3ETag = uploadResponse.ETag,
                    Notas = notas,
                    CreadoPor = medicoId,
                    CreadoEn = DateTime.UtcNow
                };

                _context.DocumentosClinicos.Add(documento);
                await _context.SaveChangesAsync();

                Console.WriteLine($"[SUCCESS] Documento registrado en BD: ID={documento.Id}");

                // Agregar etiquetas si existen
                if (etiquetas != null && etiquetas.Any())
                {
                    foreach (var etiqueta in etiquetas)
                    {
                        var docEtiqueta = new DocumentoEtiqueta
                        {
                            DocumentoId = documento.Id,
                            Etiqueta = etiqueta
                        };
                        _context.DocumentoEtiquetas.Add(docEtiqueta);
                    }
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"[SUCCESS] {etiquetas.Count} etiquetas agregadas");
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
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"[EXCEPTION] Error en UploadDocumentToS3Async: {ex.Message}");
            Console.WriteLine($"[EXCEPTION] StackTrace: {ex.StackTrace}");
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

    public async Task<string?> GetDocumentDownloadUrlAsync(long documentoId, long usuarioId, bool isDoctorOrAdmin)
    {
        try
        {
            var documento = await _context.DocumentosClinicos
                .Include(d => d.Cita)
                .FirstOrDefaultAsync(d => d.Id == documentoId);

            if (documento == null)
                return null;

            // Verificar permisos:
            // - Administradores tienen acceso completo
            // - Doctores pueden ver documentos de sus citas (MedicoId de la cita)
            // - Pacientes solo pueden ver documentos de sus propias citas
            bool tienePermiso = isDoctorOrAdmin || 
                               documento.Cita.PacienteId == usuarioId ||  // Es el paciente de la cita
                               documento.Cita.MedicoId == usuarioId;       // Es el doctor de la cita
            
            if (!tienePermiso)
            {
                Console.WriteLine($"PERMISO DENEGADO: usuarioId={usuarioId}, pacienteId={documento.Cita.PacienteId}, medicoId={documento.Cita.MedicoId}, isDoctorOrAdmin={isDoctorOrAdmin}");
                return null;
            }

            // Obtener configuración de S3 desde variables de entorno
            var bucketName = Environment.GetEnvironmentVariable("AWS_S3_BUCKET_NAME");
            
            if (string.IsNullOrEmpty(bucketName))
            {
                Console.WriteLine("ERROR: AWS_S3_BUCKET_NAME no está configurado en variables de entorno");
                return null;
            }

            // Generar URL temporal firmada de S3
            var downloadUrl = await _s3StorageService.GeneratePresignedDownloadUrlAsync(
                bucketName,
                documento.S3ObjectKey,
                documento.NombreArchivo,
                expirationMinutes: 60 // URL válida por 60 minutos
            );

            return downloadUrl;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en GetDocumentDownloadUrlAsync: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return null;
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

    private HistorialMedicoExtendidoDto MapToHistorialMedicoExtendidoDto(Cita cita)
    {
        return new HistorialMedicoExtendidoDto
        {
            CitaId = cita.Id,
            FechaCita = cita.Inicio,
            NombreMedico = cita.Medico?.Usuario != null 
                ? $"Dr. {cita.Medico.Usuario.Nombre} {cita.Medico.Usuario.Apellido}" 
                : "Médico no disponible",
            Especialidad = cita.Medico?.EspecialidadesMedico?.FirstOrDefault()?.Especialidad?.Nombre,
            EstadoCita = cita.Estado.ToString(),
            Motivo = cita.Motivo,
            // Información del paciente
            PacienteId = cita.PacienteId,
            NombrePaciente = cita.Paciente?.Usuario != null 
                ? $"{cita.Paciente.Usuario.Nombre} {cita.Paciente.Usuario.Apellido}" 
                : "Paciente no disponible",
            EdadPaciente = cita.Paciente?.FechaNacimiento != null 
                ? DateTime.Now.Year - cita.Paciente.FechaNacimiento.Value.Year 
                : null,
            FotoPaciente = null, // Puedes agregar esto si tienes fotos en el modelo
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
