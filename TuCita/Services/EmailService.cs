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
    
    // Nuevos métodos para notificaciones de citas
    Task<bool> EnviarCitaCreadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad);
    Task<bool> EnviarCitaCanceladaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad);
    Task<bool> EnviarCitaReprogramadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad);
    Task<bool> EnviarRecordatorio24HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion);
    Task<bool> EnviarRecordatorio4HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly SmtpClient _smtpClient;
    private readonly string _remitenteDefault;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;

        // Configurar cultura española para fechas
        CultureInfo.CurrentCulture = new CultureInfo("es-ES");
        CultureInfo.CurrentUICulture = new CultureInfo("es-ES");

        var smtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER") ?? "smtp.gmail.com";
        var smtpPort = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
        var smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? "";
        var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? "";
        _remitenteDefault = Environment.GetEnvironmentVariable("DEFAULT_SENDER") ?? "no-reply@tucitaonline.org";

        _smtpClient = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUsername, smtpPassword),
            EnableSsl = true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 30000
        };

        _logger.LogInformation("EmailService inicializado con servidor SMTP: {SmtpServer}:{SmtpPort}", smtpServer, smtpPort);
    }

    public async Task<bool> EnviarEmailAsync(string destinatario, string asunto, string cuerpoHtml, string? remitente = null)
    {
        try
        {
            _logger.LogInformation("Preparando envío de correo a: {Destinatario}, Asunto: {Asunto}", destinatario, asunto);

            var mensaje = new MailMessage
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
            _logger.LogError(ex, "Error SMTP al enviar correo a {Destinatario}: {Message}", destinatario, ex.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error general al enviar correo a {Destinatario}: {Message}", destinatario, ex.Message);
            return false;
        }
    }

    public async Task<bool> EnviarCodigoSeguridadAsync(string emailDestino, string codigoSeguridad)
    {
        var asunto = "Código de seguridad - TuCitaOnline";
        var cuerpoHtml = $"<h2>Tu código de seguridad es: {codigoSeguridad}</h2><p>Este código expira en 10 minutos.</p>";
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> SendPasswordResetLinkAsync(string email, string token, string nombre)
    {
        var asunto = "Recuperación de Contraseña - TuCitaOnline";
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
        var resetUrl = $"{frontendUrl}/reset-password?token={token}";
        
        // ? Usar template profesional
        var cuerpoHtml = EmailTemplates.RecuperacionPassword(nombre, resetUrl);
        
        return await EnviarEmailAsync(email, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarConfirmacionCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var asunto = "Confirmación de cita médica - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Cita Confirmada</h2>
            <p>Hola {nombrePaciente},</p>
            <p>Tu cita médica ha sido confirmada:</p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
                <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
            </ul>";
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorioCitaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var asunto = "Recordatorio: Tu cita médica es mañana - TuCitaOnline";
        var cuerpoHtml = $@"
            <h2>Recordatorio de Cita</h2>
            <p>Hola {nombrePaciente},</p>
            <p>Te recordamos tu cita médica para mañana:</p>
            <ul>
                <li><strong>Médico:</strong> Dr. {nombreMedico}</li>
                <li><strong>Especialidad:</strong> {especialidad}</li>
                <li><strong>Fecha:</strong> {fechaCita:dd/MM/yyyy}</li>
                <li><strong>Hora:</strong> {fechaCita:HH:mm}</li>
            </ul>";
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaCreadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad)
    {
        var asunto = "Nueva Cita Médica Creada - TuCitaOnline";
        
        // ? Usar template profesional con diseño moderno
        var cuerpoHtml = EmailTemplates.CitaCreada(nombrePaciente, nombreMedico, fechaCita, motivo, especialidad);
        
        _logger.LogInformation("Enviando notificación de cita creada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaCanceladaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var asunto = "Cita Médica Cancelada - TuCitaOnline";
        
        // ? Usar template profesional
        var cuerpoHtml = EmailTemplates.CitaCancelada(nombrePaciente, nombreMedico, fechaCita, especialidad);
        
        _logger.LogInformation("Enviando notificación de cita cancelada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarCitaReprogramadaAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad)
    {
        var asunto = "Cita Médica Reprogramada - TuCitaOnline";
        
        // ? Usar template profesional
        var cuerpoHtml = EmailTemplates.CitaReprogramada(nombrePaciente, nombreMedico, fechaAnterior, fechaNueva, especialidad);
        
        _logger.LogInformation("Enviando notificación de cita reprogramada a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorio24HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var asunto = "Recordatorio: Cita Médica Mañana - TuCitaOnline";
        
        // ? Usar template profesional
        var cuerpoHtml = EmailTemplates.Recordatorio24Horas(nombrePaciente, nombreMedico, fechaCita, especialidad, direccion);
        
        _logger.LogInformation("Enviando recordatorio 24h a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public async Task<bool> EnviarRecordatorio4HorasAsync(string emailDestino, string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var asunto = "URGENTE: Cita Médica en 4 Horas - TuCitaOnline";
        
        // ? Usar template profesional con diseño urgente
        var cuerpoHtml = EmailTemplates.Recordatorio4Horas(nombrePaciente, nombreMedico, fechaCita, especialidad, direccion);
        
        _logger.LogInformation("Enviando recordatorio 4h a: {Email}", emailDestino);
        return await EnviarEmailAsync(emailDestino, asunto, cuerpoHtml);
    }

    public void Dispose()
    {
        _smtpClient?.Dispose();
    }
}
