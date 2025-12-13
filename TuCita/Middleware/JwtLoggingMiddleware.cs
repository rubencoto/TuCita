using System.Security.Claims;

namespace TuCita.Middleware;

public class JwtLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<JwtLoggingMiddleware> _logger;
    
    // Extensiones de archivos estáticos que deben ser ignorados
    private static readonly HashSet<string> StaticFileExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".js", ".css", ".map", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
        ".woff", ".woff2", ".ttf", ".eot", ".html", ".json", ".webp", ".avif"
    };

    public JwtLoggingMiddleware(RequestDelegate next, ILogger<JwtLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // Ignorar archivos estáticos
            var path = context.Request.Path.Value ?? "";
            var extension = Path.GetExtension(path);
            
            if (StaticFileExtensions.Contains(extension) ||
                path.StartsWith("/assets/", StringComparison.OrdinalIgnoreCase) ||
                path.Equals("/", StringComparison.OrdinalIgnoreCase) ||
                path.Equals("/index.html", StringComparison.OrdinalIgnoreCase) ||
                path.Equals("/favicon.ico", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            // Solo loggear requests a /api/historial/documento/{id}/download
            if (context.Request.Path.StartsWithSegments("/api/historial/documento") && 
                path.Contains("/download", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("========== JWT LOGGING ==========");
                _logger.LogInformation($"Request Path: {context.Request.Path}");
                _logger.LogInformation($"Request Method: {context.Request.Method}");
                
                // Log Authorization header (solo longitud, no contenido)
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader))
                {
                    var tokenLength = authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) 
                        ? authHeader.Length - 7 
                        : authHeader.Length;
                    _logger.LogInformation($"Authorization Header presente (tipo: {(authHeader.StartsWith("Bearer ") ? "Bearer" : "Otro")}, longitud token: {tokenLength})");
                }
                else
                {
                    _logger.LogWarning("?? NO HAY Authorization Header");
                }

                // Log User Claims si están disponibles
                if (context.User?.Identity?.IsAuthenticated == true)
                {
                    _logger.LogInformation("? Usuario AUTENTICADO");
                    _logger.LogInformation($"User Identity Name: {context.User.Identity.Name}");
                    
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    _logger.LogInformation($"UserId Claim: {userIdClaim}");
                    
                    var roleClaims = context.User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
                    _logger.LogInformation($"Role Claims: {string.Join(", ", roleClaims)}");
                    
                    // Log TODOS los claims (sin valores sensibles)
                    _logger.LogInformation("Todos los claims:");
                    foreach (var claim in context.User.Claims)
                    {
                        // No loggear valores de claims sensibles
                        var value = claim.Type.Contains("password", StringComparison.OrdinalIgnoreCase) 
                            ? "***" 
                            : claim.Value;
                        _logger.LogInformation($"  - {claim.Type}: {value}");
                    }
                }
                else
                {
                    _logger.LogWarning("? Usuario NO autenticado");
                }
                
                _logger.LogInformation("==================================");
            }

            await _next(context);
            
            // Log el response status si es un error
            if (context.Request.Path.StartsWithSegments("/api/historial/documento") && 
                path.Contains("/download", StringComparison.OrdinalIgnoreCase) &&
                context.Response.StatusCode >= 400)
            {
                _logger.LogError($"Response Status Code: {context.Response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            // NUNCA lanzar excepciones del middleware de logging
            _logger.LogError(ex, "? Error en JwtLoggingMiddleware - la request continuará");
            await _next(context);
        }
    }
}

public static class JwtLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseJwtLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<JwtLoggingMiddleware>();
    }
}
