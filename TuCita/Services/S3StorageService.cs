using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace TuCita.Services;

/// <summary>
/// Interfaz para el servicio de almacenamiento en AWS S3
/// </summary>
public interface IS3StorageService
{
    /// <summary>
    /// Genera una URL pre-firmada para descargar un archivo desde S3
    /// </summary>
    /// <param name="bucketName">Nombre del bucket de S3</param>
    /// <param name="objectKey">Clave del objeto en S3</param>
    /// <param name="fileName">Nombre del archivo para la descarga (opcional)</param>
    /// <param name="expirationMinutes">Tiempo de expiración en minutos (por defecto 60)</param>
    /// <returns>URL pre-firmada para descargar el archivo</returns>
    Task<string> GeneratePresignedDownloadUrlAsync(string bucketName, string objectKey, string? fileName = null, int expirationMinutes = 60);

    /// <summary>
    /// Sube un archivo a S3
    /// </summary>
    /// <param name="bucketName">Nombre del bucket de S3</param>
    /// <param name="objectKey">Clave del objeto en S3</param>
    /// <param name="stream">Stream del archivo</param>
    /// <param name="contentType">Tipo de contenido del archivo</param>
    /// <returns>Información del archivo subido</returns>
    Task<PutObjectResponse> UploadFileAsync(string bucketName, string objectKey, Stream stream, string contentType);

    /// <summary>
    /// Elimina un archivo de S3
    /// </summary>
    /// <param name="bucketName">Nombre del bucket de S3</param>
    /// <param name="objectKey">Clave del objeto en S3</param>
    Task<bool> DeleteFileAsync(string bucketName, string objectKey);
}

/// <summary>
/// Implementación del servicio de almacenamiento en AWS S3
/// </summary>
public class S3StorageService : IS3StorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly IConfiguration _configuration;
    private readonly ILogger<S3StorageService> _logger;
    private readonly string _awsAccessKey;
    private readonly string _awsSecretKey;
    private readonly string _awsRegion;

    public S3StorageService(IAmazonS3 s3Client, IConfiguration configuration, ILogger<S3StorageService> logger)
    {
        _s3Client = s3Client;
        _configuration = configuration;
        _logger = logger;
        
        // Obtener credenciales desde variables de entorno
        _awsAccessKey = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID") ?? "";
        _awsSecretKey = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY") ?? "";
        _awsRegion = Environment.GetEnvironmentVariable("AWS_REGION") ?? "us-east-1";
    }

    public async Task<string> GeneratePresignedDownloadUrlAsync(
        string bucketName, 
        string objectKey, 
        string? fileName = null, 
        int expirationMinutes = 60)
    {
        try
        {
            _logger.LogInformation("?? Generando URL pre-firmada con AWS SDK:");
            _logger.LogInformation("   Bucket: {BucketName}", bucketName);
            _logger.LogInformation("   Object Key: {ObjectKey}", objectKey);
            _logger.LogInformation("   File Name: {FileName}", fileName ?? "N/A");
            _logger.LogInformation("   Expiration: {ExpirationMinutes} minutos", expirationMinutes);
            
            // Verificar que el objeto existe antes de generar la URL
            try
            {
                var metadataRequest = new GetObjectMetadataRequest
                {
                    BucketName = bucketName,
                    Key = objectKey
                };
                
                await _s3Client.GetObjectMetadataAsync(metadataRequest);
                _logger.LogInformation("   ? Objeto verificado - existe en S3");
            }
            catch (AmazonS3Exception s3Ex) when (s3Ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogError("   ? Objeto no encontrado en S3: {ObjectKey}", objectKey);
                throw new FileNotFoundException($"El archivo no existe en S3: {objectKey}");
            }
            
            // ? USAR EL SDK DE AWS - Dejar que el SDK maneje la firma
            _logger.LogInformation("   ?? Generando URL pre-firmada con AWS SDK...");
            
            var request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = objectKey,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
                Protocol = Protocol.HTTPS
            };
            
            // Agregar Content-Disposition si se especifica fileName
            if (!string.IsNullOrEmpty(fileName))
            {
                request.ResponseHeaderOverrides.ContentDisposition = $"attachment; filename=\"{fileName}\"";
            }
            
            var url = _s3Client.GetPreSignedURL(request);
            
            _logger.LogInformation("? URL pre-firmada generada exitosamente");
            _logger.LogInformation("   URL length: {UrlLength} caracteres", url.Length);
            
            // Verificar que la URL contiene los parámetros de Signature Version 4
            if (url.Contains("X-Amz-Algorithm=AWS4-HMAC-SHA256"))
            {
                _logger.LogInformation("   ? URL usa AWS Signature Version 4 (AWS4-HMAC-SHA256) ?");
            }
            else if (url.Contains("AWSAccessKeyId="))
            {
                _logger.LogWarning("   ?? URL usa Signature Version 2 - Esto puede causar problemas");
            }
            
            // Mostrar preview de la URL para debugging
            var urlPreview = url.Length > 200 ? url.Substring(0, 200) + "..." : url;
            _logger.LogInformation("   URL preview: {UrlPreview}", urlPreview);
            
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error al generar URL pre-firmada para objeto: {ObjectKey} en bucket: {BucketName}", objectKey, bucketName);
            throw new Exception($"Error al generar URL de descarga: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Calcula el hash SHA256 de un string
    /// </summary>
    private string ComputeSHA256Hash(string data)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(data);
        var hash = sha256.ComputeHash(bytes);
        return BytesToHex(hash);
    }

    /// <summary>
    /// Calcula HMAC SHA256
    /// </summary>
    private byte[] ComputeHMACSHA256(byte[] key, string data)
    {
        using var hmac = new HMACSHA256(key);
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
    }

    /// <summary>
    /// Genera la signing key para AWS Signature V4
    /// </summary>
    private byte[] GetSignatureKey(string key, string dateStamp, string regionName, string serviceName)
    {
        var kSecret = Encoding.UTF8.GetBytes($"AWS4{key}");
        var kDate = ComputeHMACSHA256(kSecret, dateStamp);
        var kRegion = ComputeHMACSHA256(kDate, regionName);
        var kService = ComputeHMACSHA256(kRegion, serviceName);
        var kSigning = ComputeHMACSHA256(kService, "aws4_request");
        return kSigning;
    }

    /// <summary>
    /// Convierte bytes a string hexadecimal
    /// </summary>
    private string BytesToHex(byte[] bytes)
    {
        return BitConverter.ToString(bytes).Replace("-", "").ToLowerInvariant();
    }

    public async Task<PutObjectResponse> UploadFileAsync(string bucketName, string objectKey, Stream stream, string contentType)
    {
        try
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = objectKey,
                InputStream = stream,
                ContentType = contentType,
                // Habilitar encriptación del lado del servidor
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
            };

            var response = await _s3Client.PutObjectAsync(putRequest);
            
            _logger.LogInformation("Archivo subido exitosamente: {ObjectKey} en bucket: {BucketName}", objectKey, bucketName);
            
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al subir archivo: {ObjectKey} en bucket: {BucketName}", objectKey, bucketName);
            throw new Exception($"Error al subir archivo a S3: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteFileAsync(string bucketName, string objectKey)
    {
        try
        {
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = objectKey
            };

            var response = await _s3Client.DeleteObjectAsync(deleteRequest);
            
            _logger.LogInformation("Archivo eliminado exitosamente: {ObjectKey} en bucket: {BucketName}", objectKey, bucketName);
            
            return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent || 
                   response.HttpStatusCode == System.Net.HttpStatusCode.OK;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar archivo: {ObjectKey} en bucket: {BucketName}", objectKey, bucketName);
            return false;
        }
    }
}
