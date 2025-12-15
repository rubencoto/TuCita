using System.Net;
using System.Net.Mail;
using System.Text;
using System.Globalization;

namespace TuCita.Services;

public interface IEmailService
{
    Task<bool> EnviarEmailAsync(string destinatario, string asunto, string cuerpoHtml, string? remitente = null);
    Task<bool> EnviarCodigoSeguridadAsync(string emailDestino, string codigoSeguridad);
    Task<bool> SendPasswordResetLinkAsync(string email, string token, string nombre);
    Task<bool> EnviarConfirmacionCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad);
    Task<bool> EnviarRecordatorioCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad);
    
    Task<bool> EnviarCitaCreadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad);
    Task<bool> EnviarCitaCanceladaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad);
    Task<bool> EnviarCitaReprogramadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad);
    Task<bool> EnviarRecordatorio24HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion);
    Task<bool> EnviarRecordatorio4HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion);
}

public sealed class EmailService : IEmailService, IDisposable
{
    private readonly ILogger<EmailService> _logger;
    private readonly SmtpClient _smtpClient;
    private readonly string _remitenteDefault;
    private bool _disposed;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;

        // Configurar cultura española para fechas
        CultureInfo.CurrentCulture = new CultureInfo("es-ES");
        CultureInfo.CurrentUICulture = new CultureInfo("es-ES");

        var smtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER") ?? "smtp.gmail.com";
        var smtpPortStr = Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587";
        var smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? "";
        var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? "";
        _remitenteDefault = Environment.GetEnvironmentVariable("DEFAULT_SENDER") ?? "no-reply@tucitaonline.org";

        if (!int.TryParse(smtpPortStr, out var smtpPort) || smtpPort <= 0)
        {
            smtpPort = 587;
            _logger.LogWarning("Puerto SMTP inválido, usando valor por defecto: {Port}", smtpPort);
        }

        if (string.IsNullOrWhiteSpace(smtpUsername) || string.IsNullOrWhiteSpace(smtpPassword))
        {
            _logger.LogWarning("SMTP_USERNAME o SMTP_PASSWORD no configurados. El servicio puede no funcionar correctamente.");
        }

        _smtpClient = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 30000
        };

        _logger.LogInformation("EmailService inicializado: {Server}:{Port}, Remitente: {Sender}", 
            smtpServer, smtpPort, _remitenteDefault);
    }

    public async Task<bool> EnviarEmailAsync(string destinatario, string asunto, string cuerpoHtml, string? remitente = null)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        if (string.IsNullOrWhiteSpace(destinatario))
        {
            _logger.LogWarning("Intento de envío con destinatario vacío");
            return false;
        }

        if (!IsValidEmail(destinatario))
        {
            _logger.LogWarning("Email destinatario inválido: {Email}", destinatario);
            return false;
        }

        try
        {
            _logger.LogInformation("Preparando envío de correo a: {Destinatario}, Asunto: {Asunto}", destinatario, asunto);

            using var mensaje = new MailMessage
            {
                From = new MailAddress(remitente ?? _remitenteDefault, "TuCitaOnline"),
                Subject = asunto,
                Body = cuerpoHtml,
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8,
                HeadersEncoding = Encoding.UTF8,
                BodyTransferEncoding = System.Net.Mime.TransferEncoding.Base64
            };

            // Agregar header para UTF-8
            mensaje.Headers.Add("Content-Type", "text/html; charset=utf-8");

            mensaje.To.Add(destinatario);
            await _smtpClient.SendMailAsync(mensaje);

            _logger.LogInformation("Correo enviado exitosamente a: {Destinatario}", destinatario);
            return true;
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "Error SMTP al enviar correo a {Destinatario}: {StatusCode}", 
                destinatario, ex.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al enviar correo a {Destinatario}", destinatario);
            return false;
        }
    }

    public async Task<bool> EnviarCodigoSeguridadAsync(string emailDestino, string codigoSeguridad)
    {
        if (string.IsNullOrWhiteSpace(codigoSeguridad))
        {
            _logger.LogWarning("Intento de envío de código de seguridad vacío");
            return false;
        }

        var asunto = "Código de seguridad - TuCitaOnline";
        var codigoEscapado = WebUtility.HtmlEncode(codigoSeguridad);
        var cuerpoHtml = $@"<h2>Tu código de seguridad es: {codigoEscapado}</h2>
<p>Este código expira en 10 minutos.</p>
<p style=""color: #666; font-size: 12px;"">Si no solicitaste este código, ignora este mensaje.</p>";
        
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> SendPasswordResetLinkAsync(string email, string token, string nombre)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("Intento de envío de link de recuperación con token vacío");
            return false;
        }

        if (string.IsNullOrWhiteSpace(nombre))
        {
            nombre = "Usuario";
        }

        var asunto = "Recuperación de Contraseña - TuCitaOnline";
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
        var tokenEncoded = Uri.EscapeDataString(token);
        var resetUrl = $"{frontendUrl}/reset-password?token={tokenEncoded}";
        
        var nombreSeguro = WebUtility.HtmlEncode(nombre);
        var cuerpoHtml = EmailTemplates.RecuperacionPassword(nombreSeguro, resetUrl);
        
        return await EnviarEmailAsync(email, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarConfirmacionCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var nombrePacienteSeguro = WebUtility.HtmlEncode(nombrePaciente);
        var nombreMedicoSeguro = WebUtility.HtmlEncode(nombreMedico);
        var especialidadSegura = WebUtility.HtmlEncode(especialidad);

        var asunto = "Confirmación de cita médica - TuCitaOnline";
        var cuerpoHtml = $@"
<h2>Cita Confirmada</h2>
<p>Hola {nombrePacienteSeguro},</p>
<p>Tu cita médica ha sido confirmada:</p>
<ul>
    <li><strong>Médico:</strong> Dr. {nombreMedicoSeguro}</li>
    <li><strong>Especialidad:</strong> {especialidadSegura}</li>
    <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
    <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
</ul>";
        
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorioCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var nombrePacienteSeguro = WebUtility.HtmlEncode(nombrePaciente);
        var nombreMedicoSeguro = WebUtility.HtmlEncode(nombreMedico);
        var especialidadSegura = WebUtility.HtmlEncode(especialidad);

        var asunto = "Recordatorio: Tu cita médica es mañana - TuCitaOnline";
        var cuerpoHtml = $@"
<h2>Recordatorio de Cita</h2>
<p>Hola {nombrePacienteSeguro},</p>
<p>Te recordamos tu cita médica para mañana:</p>
<ul>
    <li><strong>Médico:</strong> Dr. {nombreMedicoSeguro}</li>
    <li><strong>Especialidad:</strong> {especialidadSegura}</li>
    <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
    <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
</ul>";
        
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaCreadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad)
    {
        var nombrePacienteSeguro = WebUtility.HtmlEncode(nombrePaciente ?? string.Empty);
        var nombreMedicoSeguro = WebUtility.HtmlEncode(nombreMedico ?? string.Empty);
        var motivoSeguro = WebUtility.HtmlEncode(motivo ?? string.Empty);
        var especialidadSegura = WebUtility.HtmlEncode(especialidad ?? string.Empty);

        var asunto = "Nueva Cita Médica Creada - TuCitaOnline";
        var cuerpoHtml = EmailTemplates.CitaCreada(nombrePacienteSeguro, nombreMedicoSeguro, fechaCita, motivoSeguro, especialidadSegura);
        
        _logger.LogInformation("Enviando notificación de cita creada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaCanceladaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var nombrePacienteSeguro = WebUtility.HtmlEncode(nombrePaciente ?? string.Empty);
        var nombreMedicoSeguro = WebUtility.HtmlEncode(nombreMedico ?? string.Empty);
        var especialidadSegura = WebUtility.HtmlEncode(especialidad ?? string.Empty);

        var asunto = "Cita Médica Cancelada - TuCitaOnline";
        var cuerpoHtml = EmailTemplates.CitaCancelada(nombrePacienteSeguro, nombreMedicoSeguro, fechaCita, especialidadSegura);
        
        _logger.LogInformation("Enviando notificación de cita cancelada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaReprogramadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad)
    {
        var nombrePacienteSeguro = WebUtility.HtmlEncode(nombrePaciente ?? string.Empty);
        var nombreMedicoSeguro = WebUtility.HtmlEncode(nombreMedico ?? string.Empty);
        var especialidadSegura = WebUtility.HtmlEncode(especialidad ?? string.Empty);

        var asunto = "Cita Médica Reprogramada - TuCitaOnline";
        var cuerpoHtml = EmailTemplates.CitaReprogramada(nombrePacienteSeguro, nombreMedicoSeguro, fechaAnterior, fechaNueva, especialidadSegura);
        
        _logger.LogInformation("Enviando notificación de cita reprogramada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorio24HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var nombrePacienteSeguro = WebUtility.HtmlEncode(nombrePaciente ?? string.Empty);
        var nombreMedicoSeguro = WebUtility.HtmlEncode(nombreMedico ?? string.Empty);
        var especialidadSegura = WebUtility.HtmlEncode(especialidad ?? string.Empty);
        var direccionSegura = WebUtility.HtmlEncode(direccion ?? string.Empty);

        var asunto = "Recordatorio: Cita Médica Mañana - TuCitaOnline";
        var cuerpoHtml = EmailTemplates.Recordatorio24Horas(nombrePacienteSeguro, nombreMedicoSeguro, fechaCita, especialidadSegura, direccionSegura);
        
        _logger.LogInformation("Enviando recordatorio 24h a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorio4HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var nombrePacienteSeguro = WebUtility.HtmlEncode(nombrePaciente ?? string.Empty);
        var nombreMedicoSeguro = WebUtility.HtmlEncode(nombreMedico ?? string.Empty);
        var especialidadSegura = WebUtility.HtmlEncode(especialidad ?? string.Empty);
        var direccionSegura = WebUtility.HtmlEncode(direccion ?? string.Empty);

        var asunto = "URGENTE: Cita Médica en 4 Horas - TuCitaOnline";
        var cuerpoHtml = EmailTemplates.Recordatorio4Horas(nombrePacienteSeguro, nombreMedicoSeguro, fechaCita, especialidadSegura, direccionSegura);
        
        _logger.LogInformation("Enviando recordatorio 4h a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var addr = new MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    public void Dispose()
    {
        if (_disposed)
            return;

        _smtpClient?.Dispose();
        _disposed = true;
    }
}
