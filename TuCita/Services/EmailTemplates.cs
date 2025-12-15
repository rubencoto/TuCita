using System.Text;

namespace TuCita.Services;

/// <summary>
/// Plantillas HTML profesionales para correos electrónicos
/// Diseño moderno con colores de TuCitaOnline y soporte UTF-8
/// </summary>
public static class EmailTemplates
{
    // Colores de TuCitaOnline
    private const string PrimaryBlue = "#2E8BC0";
    private const string TealGreen = "#14B8A6";
    private const string DarkBlue = "#1a5a7f";
    private const string LightBg = "#f0f4f8";
    private const string CardBg = "#f8f9fa";
    private const string TextDark = "#1f2937";
    private const string TextLight = "#6b7280";
    
    // URL base de la aplicación
    private const string BaseUrl = "https://tucitaonline.org";

    /// <summary>
    /// Template base con estructura común para todos los correos
    /// </summary>
    private static string GetBaseTemplate(string title, string content, string footerNote = "")
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"">
    <title>{title}</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: {LightBg};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }}
        .email-wrapper {{
            width: 100%;
            background-color: {LightBg};
            padding: 40px 20px;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, {PrimaryBlue} 0%, {DarkBlue} 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }}
        .header-icon {{
            font-size: 48px;
            margin-bottom: 10px;
            display: inline-block;
            width: 60px;
            height: 60px;
            line-height: 60px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }}
        .content {{
            padding: 40px 30px;
            color: {TextDark};
        }}
        .greeting {{
            font-size: 18px;
            margin-bottom: 20px;
            color: {TextDark};
        }}
        .info-card {{
            background-color: {CardBg};
            border-left: 4px solid {PrimaryBlue};
            padding: 24px;
            margin: 24px 0;
            border-radius: 8px;
        }}
        .info-row {{
            margin: 14px 0;
            display: block;
            padding: 8px 0;
        }}
        .info-label {{
            font-weight: 600;
            color: {PrimaryBlue};
            display: inline-block;
            min-width: 120px;
        }}
        .info-value {{
            color: {TextDark};
            display: inline;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, {PrimaryBlue} 0%, {TealGreen} 100%);
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(46, 139, 192, 0.3);
        }}
        .note {{
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 8px;
            color: #92400e;
            font-size: 14px;
        }}
        .tips {{
            background-color: #dbeafe;
            border-left: 4px solid {PrimaryBlue};
            padding: 16px;
            margin: 24px 0;
            border-radius: 8px;
        }}
        .tips-title {{
            font-weight: 600;
            color: {PrimaryBlue};
            margin-bottom: 12px;
            font-size: 16px;
        }}
        .tips ul {{
            margin: 8px 0;
            padding-left: 20px;
            color: {TextDark};
        }}
        .tips li {{
            margin: 6px 0;
            font-size: 14px;
        }}
        .footer {{
            background-color: {CardBg};
            padding: 30px;
            text-align: center;
            color: {TextLight};
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }}
        .footer-logo {{
            font-size: 24px;
            font-weight: 700;
            color: {PrimaryBlue};
            margin-bottom: 8px;
        }}
        .footer p {{
            margin: 8px 0;
        }}
        .footer-note {{
            font-size: 12px;
            color: #9ca3af;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
        }}
        @media only screen and (max-width: 600px) {{
            .email-wrapper {{
                padding: 20px 10px;
            }}
            .header {{
                padding: 30px 20px;
            }}
            .header h1 {{
                font-size: 24px;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .info-card {{
                padding: 20px;
            }}
            .button {{
                padding: 14px 32px;
                font-size: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class=""email-wrapper"">
        <div class=""email-container"">
            {content}
            <div class=""footer"">
                <div class=""footer-logo"">TuCitaOnline</div>
                <p><strong>Sistema de Gesti&oacute;n de Citas M&eacute;dicas</strong></p>
                <p>Simplificando el acceso a la salud</p>
                {(string.IsNullOrEmpty(footerNote) ? "" : $@"<div class=""footer-note"">{footerNote}</div>")}
                <div class=""footer-note"">
                    Este es un correo autom&aacute;tico. Por favor, no respondas a este mensaje.<br>
                    Si tienes alguna consulta, accede a tu cuenta en TuCitaOnline.
                </div>
            </div>
        </div>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Template para notificación de cita creada
    /// </summary>
    public static string CitaCreada(string nombrePaciente, string nombreMedico, DateTime fechaCita, string motivo, string especialidad)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">&#127973;</div>
                <h1>Nueva Cita M&eacute;dica Creada</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p>Tu cita m&eacute;dica ha sido creada exitosamente. A continuaci&oacute;n, los detalles de tu consulta:</p>
                
                <div class=""info-card"">
                    <div class=""info-row"">
                        <span class=""info-label"">&#128104;&#8205;&#9877;&#65039; M&eacute;dico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#127973; Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128197; Fecha:</span>
                        <span class=""info-value"">{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128336; Hora:</span>
                        <span class=""info-value"">{fechaCita:HH:mm}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128221; Motivo:</span>
                        <span class=""info-value"">{motivo}</span>
                    </div>
                </div>

                <div class=""tips"">
                    <div class=""tips-title"">&#128161; Recordatorios importantes</div>
                    <ul>
                        <li>Te enviaremos recordatorios 24 horas y 4 horas antes de tu cita</li>
                        <li>Llega 10 minutos antes de tu cita</li>
                        <li>Trae tu identificaci&oacute;n y estudios m&eacute;dicos previos</li>
                    </ul>
                </div>

                <center>
                    <a href=""{BaseUrl}/appointments"" class=""button"">
                        Ver Mis Citas &rarr;
                    </a>
                </center>

                <div class=""note"">
                    &#9888;&#65039; Si necesitas cancelar o reprogramar tu cita, puedes hacerlo desde tu panel de citas.
                </div>
            </div>
        ";

        return GetBaseTemplate("Nueva Cita M&eacute;dica - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para notificación de cita cancelada
    /// </summary>
    public static string CitaCancelada(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">&#10060;</div>
                <h1>Cita M&eacute;dica Cancelada</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p>Tu cita m&eacute;dica ha sido cancelada. A continuaci&oacute;n, los detalles de la cita cancelada:</p>
                
                <div class=""info-card"">
                    <div class=""info-row"">
                        <span class=""info-label"">&#128104;&#8205;&#9877;&#65039; M&eacute;dico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#127973; Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128197; Fecha cancelada:</span>
                        <span class=""info-value"">{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128336; Hora cancelada:</span>
                        <span class=""info-value"">{fechaCita:HH:mm}</span>
                    </div>
                </div>

                <center>
                    <a href=""{BaseUrl}/search"" class=""button"">
                        Agendar Nueva Cita &rarr;
                    </a>
                </center>

                <p style=""color: {TextLight}; font-size: 14px; margin-top: 30px; text-align: center;"">
                    Puedes agendar una nueva cita cuando lo desees.
                </p>
            </div>
        ";

        return GetBaseTemplate("Cita Cancelada - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para notificación de cita reprogramada
    /// </summary>
    public static string CitaReprogramada(string nombrePaciente, string nombreMedico, DateTime fechaAnterior, DateTime fechaNueva, string especialidad)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">&#128260;</div>
                <h1>Cita M&eacute;dica Reprogramada</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p>Tu cita m&eacute;dica ha sido reprogramada exitosamente. A continuaci&oacute;n, los detalles actualizados:</p>
                
                <div class=""info-card"">
                    <div class=""info-row"">
                        <span class=""info-label"">&#128104;&#8205;&#9877;&#65039; M&eacute;dico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#127973; Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                </div>

                <div class=""info-card"" style=""border-left-color: #ef4444; background-color: #fef2f2;"">
                    <div class=""info-row"">
                        <span class=""info-label"">&#128197; Fecha anterior:</span>
                        <span class=""info-value"" style=""text-decoration: line-through; color: {TextLight};"">{fechaAnterior:dddd, dd 'de' MMMM 'de' yyyy} - {fechaAnterior:HH:mm}</span>
                    </div>
                </div>

                <div class=""info-card"" style=""border-left-color: {TealGreen}; background-color: #f0fdf4;"">
                    <div class=""info-row"">
                        <span class=""info-label"">&#128197; Nueva fecha:</span>
                        <span class=""info-value"" style=""color: #166534; font-weight: 600;"">{fechaNueva:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128336; Nueva hora:</span>
                        <span class=""info-value"" style=""color: #166534; font-weight: 600;"">{fechaNueva:HH:mm}</span>
                    </div>
                </div>

                <div class=""tips"">
                    <div class=""tips-title"">&#128161; Informaci&oacute;n importante</div>
                    <ul>
                        <li>Te enviaremos nuevos recordatorios antes de tu cita</li>
                        <li>Aseg&uacute;rate de marcar la nueva fecha en tu calendario</li>
                    </ul>
                </div>

                <center>
                    <a href=""{BaseUrl}/appointments"" class=""button"">
                        Ver Mis Citas &rarr;
                    </a>
                </center>
            </div>
        ";

        return GetBaseTemplate("Cita Reprogramada - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para recordatorio 24 horas antes
    /// </summary>
    public static string Recordatorio24Horas(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">&#9200;</div>
                <h1>Recordatorio: Cita Ma&ntilde;ana</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p><strong>Tu cita m&eacute;dica es MA&Ntilde;ANA</strong>. Te recordamos los detalles:</p>
                
                <div class=""info-card"">
                    <div class=""info-row"">
                        <span class=""info-label"">&#128104;&#8205;&#9877;&#65039; M&eacute;dico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#127973; Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128197; Fecha:</span>
                        <span class=""info-value"">{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128336; Hora:</span>
                        <span class=""info-value"">{fechaCita:HH:mm}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128205; Ubicaci&oacute;n:</span>
                        <span class=""info-value"">{direccion}</span>
                    </div>
                </div>

                <div class=""tips"">
                    <div class=""tips-title"">&#128203; Recomendaciones</div>
                    <ul>
                        <li>Llega 10 minutos antes de tu cita</li>
                        <li>Trae tu identificaci&oacute;n oficial</li>
                        <li>Si tienes estudios m&eacute;dicos previos, ll&eacute;valos contigo</li>
                        <li>Anota cualquier duda o s&iacute;ntoma que quieras comentar</li>
                    </ul>
                </div>

                <center>
                    <a href=""{BaseUrl}/appointments"" class=""button"">
                        Ver Detalles de la Cita &rarr;
                    </a>
                </center>

                <div class=""note"">
                    &#9888;&#65039; Si no puedes asistir, cancela tu cita con anticipaci&oacute;n para que otros pacientes puedan aprovechar el horario.
                </div>
            </div>
        ";

        return GetBaseTemplate("Recordatorio de Cita - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para recordatorio urgente 4 horas antes
    /// </summary>
    public static string Recordatorio4Horas(string nombrePaciente, string nombreMedico, DateTime fechaCita, string especialidad, string direccion)
    {
        var content = $@"
            <div class=""header"" style=""background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"">
                <div class=""header-icon"">&#9888;&#65039;</div>
                <h1>URGENTE: Cita en 4 Horas</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombrePaciente}</strong>,</p>
                <p><strong style=""color: #dc2626; font-size: 18px;"">Tu cita m&eacute;dica es en 4 HORAS</strong></p>
                <p>Por favor, prep&aacute;rate para asistir a tu consulta:</p>
                
                <div class=""info-card"" style=""border-left-color: #ef4444; background-color: #fef2f2;"">
                    <div class=""info-row"">
                        <span class=""info-label"">&#128104;&#8205;&#9877;&#65039; M&eacute;dico:</span>
                        <span class=""info-value"">Dr. {nombreMedico}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#127973; Especialidad:</span>
                        <span class=""info-value"">{especialidad}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128197; Fecha:</span>
                        <span class=""info-value"" style=""font-weight: 600;"">{fechaCita:dddd, dd 'de' MMMM 'de' yyyy}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128336; Hora:</span>
                        <span class=""info-value"" style=""font-weight: 600; font-size: 20px; color: #dc2626;"">{fechaCita:HH:mm}</span>
                    </div>
                    <div class=""info-row"">
                        <span class=""info-label"">&#128205; Ubicaci&oacute;n:</span>
                        <span class=""info-value"">{direccion}</span>
                    </div>
                </div>

                <div class=""tips"" style=""background-color: #fef2f2; border-left-color: #ef4444;"">
                    <div class=""tips-title"" style=""color: #dc2626;"">&#9888;&#65039; No olvides llevar:</div>
                    <ul style=""color: #991b1b;"">
                        <li><strong>Tu identificaci&oacute;n oficial</strong></li>
                        <li><strong>Estudios m&eacute;dicos previos</strong> (si tienes)</li>
                        <li><strong>Lista de medicamentos actuales</strong></li>
                        <li><strong>Forma de pago</strong> (si aplica)</li>
                    </ul>
                </div>

                <center>
                    <a href=""{BaseUrl}/appointments"" class=""button"" style=""background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"">
                        Ver Detalles de la Cita &rarr;
                    </a>
                </center>

                <div class=""note"" style=""background-color: #fef2f2; border-left-color: #ef4444; color: #991b1b;"">
                    &#9888;&#65039; <strong>Si no puedes asistir, cancela tu cita AHORA</strong> para que otros pacientes puedan aprovechar el horario.
                </div>
            </div>
        ";

        return GetBaseTemplate("Recordatorio Urgente - TuCitaOnline", content);
    }

    /// <summary>
    /// Template para recuperación de contraseña
    /// </summary>
    public static string RecuperacionPassword(string nombre, string resetUrl)
    {
        var content = $@"
            <div class=""header"">
                <div class=""header-icon"">&#128272;</div>
                <h1>Recuperaci&oacute;n de Contrase&ntilde;a</h1>
            </div>
            <div class=""content"">
                <p class=""greeting"">Hola <strong>{nombre}</strong>,</p>
                <p>Recibimos una solicitud para restablecer la contrase&ntilde;a de tu cuenta en TuCitaOnline.</p>
                
                <div class=""note"">
                    &#8505;&#65039; Si no solicitaste este cambio, puedes ignorar este correo. Tu contrase&ntilde;a actual seguir&aacute; siendo v&aacute;lida.
                </div>

                <center>
                    <a href=""{resetUrl}"" class=""button"">
                        Restablecer Contrase&ntilde;a &rarr;
                    </a>
                </center>

                <div class=""tips"">
                    <div class=""tips-title"">&#128274; Consejos de seguridad</div>
                    <ul>
                        <li>Este enlace es v&aacute;lido por 1 hora</li>
                        <li>Usa una contrase&ntilde;a fuerte y &uacute;nica</li>
                        <li>No compartas tu contrase&ntilde;a con nadie</li>
                        <li>Si no solicitaste este cambio, ignora este correo</li>
                    </ul>
                </div>

                <p style=""color: {TextLight}; font-size: 13px; margin-top: 30px;"">
                    <strong>Nota:</strong> Si el bot&oacute;n no funciona, copia y pega este enlace en tu navegador:<br>
                    <span style=""word-break: break-all; color: {PrimaryBlue};"">{resetUrl}</span>
                </p>
            </div>
        ";

        return GetBaseTemplate("Recuperaci&oacute;n de Contrase&ntilde;a - TuCitaOnline", content);
    }
}
