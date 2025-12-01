using System.Security.Claims;

namespace TuCita.Middleware;

public class JwtLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<JwtLoggingMiddleware> _logger;

    public JwtLoggingMiddleware(RequestDelegate next, ILogger<JwtLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Solo loggear requests a /api/historial/documento/{id}/download
        if (context.Request.Path.StartsWithSegments("/api/historial/documento") && 
            context.Request.Path.Value?.Contains("/download") == true)
        {
            _logger.LogInformation("========== JWT LOGGING ==========");
            _logger.LogInformation($"Request Path: {context.Request.Path}");
            _logger.LogInformation($"Request Method: {context.Request.Method}");
            
            // Log Authorization header
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader != null)
            {
                _logger.LogInformation($"Authorization Header presente: {authHeader.Substring(0, Math.Min(20, authHeader.Length))}...");
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
                
                // Log TODOS los claims
                _logger.LogInformation("Todos los claims:");
                foreach (var claim in context.User.Claims)
                {
                    _logger.LogInformation($"  - {claim.Type}: {claim.Value}");
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
            context.Request.Path.Value?.Contains("/download") == true &&
            context.Response.StatusCode >= 400)
        {
            _logger.LogError($"Response Status Code: {context.Response.StatusCode}");
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
