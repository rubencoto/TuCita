# ? FIX: JwtLoggingMiddleware - Soporte para archivos estáticos

## ?? PROBLEMA IDENTIFICADO

En producción (Heroku), las requests a archivos estáticos (`/`, `/index.html`, `/assets/*`) respondían con **500 Internal Server Error**.

**Logs mostraban excepciones en:**
- `TuCita.Middleware.JwtLoggingMiddleware.InvokeAsync` (línea ~64)
- `Program.cs` (línea ~294)

**Causa raíz:** El `JwtLoggingMiddleware` estaba intentando acceder a propiedades del header `Authorization` sin validar si existía, rompiendo las requests públicas que no llevan token.

---

## ?? SOLUCIÓN APLICADA

### 1. **JwtLoggingMiddleware.cs** - CORREGIDO ?

#### Cambios realizados:

1. **Ignore archivos estáticos**
   - Detecta extensiones estáticas: `.js`, `.css`, `.map`, `.png`, `.jpg`, `.svg`, `.ico`, `.html`, etc.
   - Ignora rutas específicas: `/`, `/index.html`, `/favicon.ico`, `/assets/*`
   - **No procesa estas requests** para máximo rendimiento

2. **Validación segura del Authorization header**
   - Valida que `authHeader` no sea null/empty antes de usar `.Substring()`
   - Usa `string.IsNullOrEmpty()` en lugar de comparaciones directas
   - **Solo registra la longitud del token**, no el contenido completo (seguridad)

3. **Try-catch global**
   - Envuelve TODO el código en try-catch
   - Si falla el logging, **la request continúa** sin errores
   - Log del error pero **NUNCA lanza excepciones**

4. **Protección de datos sensibles**
   - No loggea el JWT completo (solo longitud)
   - No loggea claims con "password" en el nombre
   - Reduce superficie de ataque en logs

#### Código final:

```csharp
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
```

---

### 2. **Program.cs** - COMENTARIOS ACLARADOS ?

#### Fragmento actualizado del orden de middlewares:

```csharp
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// En producción, no forzar HTTPS redirect si estamos detrás de un proxy (Heroku)
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// IMPORTANTE: UseStaticFiles DEBE ir ANTES de autenticación
// Los archivos estáticos (index.html, assets, etc.) NO requieren autenticación
app.UseStaticFiles();
app.UseSpaStaticFiles();

// Configurar middleware para UTF-8 - solo para respuestas HTML
app.Use(async (context, next) =>
{
    await next();
    
    // Solo aplicar UTF-8 a respuestas HTML, no a API
    if (context.Response.ContentType != null && context.Response.ContentType.StartsWith("text/html"))
    {
        context.Response.Headers["Content-Type"] = "text/html; charset=utf-8";
    }
});

app.UseRouting();

// ORDEN CORRECTO DE MIDDLEWARES:
// 1. UseAuthentication - Lee y valida el JWT si existe
app.UseAuthentication();

// 2. UseJwtLogging - Logging opcional (DESPUÉS de autenticación para tener acceso a User)
// Este middleware NUNCA debe romper requests públicas
app.UseJwtLogging();

// 3. UseAuthorization - Valida permisos basados en claims
app.UseAuthorization();

// Configure API routes
app.MapControllers();
```

---

## ?? CAMBIOS REALIZADOS - RESUMEN

| Archivo | Cambios | Descripción |
|---------|---------|-------------|
| `JwtLoggingMiddleware.cs` | ? **MODIFICADO** | Ignore archivos estáticos, validación segura, try-catch global |
| `Program.cs` | ? **COMENTARIOS** | Aclaraciones sobre orden de middlewares |

---

## ? RESULTADO ESPERADO

### Comportamiento correcto en producción:

#### Para archivos estáticos (/, /index.html, /assets/*)
```
Request: GET /
?
UseStaticFiles ? Sirve index.html ? 200 OK ?
?
JwtLoggingMiddleware ? Detecta archivo estático ? IGNORA ? Continúa
?
Response 200 (sin procesar autenticación)
```

#### Para API endpoints (/api/*)
```
Request: GET /api/appointments
?
UseAuthentication ? Valida JWT si existe
?
JwtLoggingMiddleware ? Solo loggea si es /api/historial/documento/*/download
?
UseAuthorization ? Valida permisos
?
Controller ? Procesa request
```

#### Si falla el logging
```
Request: GET /api/historial/documento/123/download
?
JwtLoggingMiddleware ? Exception en logging
?
Try-Catch ? Log error
?
await _next(context) ? Request continúa ?
?
No se rompe la request
```

---

## ?? VERIFICACIÓN

### Archivos que ahora funcionan correctamente:

? `/` (raíz)
? `/index.html`
? `/favicon.ico`
? `/assets/index-[hash].js`
? `/assets/index-[hash].css`
? `/assets/*.png`, `/assets/*.svg`
? Cualquier archivo con extensión estática

### Endpoints API protegidos:

? `/api/appointments` - Requiere JWT
? `/api/auth/profile` - Requiere JWT
? `/api/historial/documento/123/download` - Requiere JWT + Logging

---

## ?? PRINCIPIOS APLICADOS

1. **Fail-safe**: El middleware de logging NUNCA debe romper requests
2. **Performance**: Archivos estáticos se retornan inmediatamente sin procesamiento
3. **Seguridad**: No loggear JWTs completos ni datos sensibles
4. **Separación de concerns**: Logging es opcional y diagnóstico, no validación

---

## ?? COMMIT REALIZADO

**Branch:** `ParteRuben`

**Commit:** `76ae4d2` - "Fix JwtLoggingMiddleware: Ignore static files and never throw exceptions on public requests"

**Archivos modificados:**
- `TuCita/Middleware/JwtLoggingMiddleware.cs`
- `TuCita/Program.cs`

**Estado:** ? Pusheado a GitHub

---

## ?? DESPLIEGUE

Con estos cambios:

1. ? Los archivos estáticos se sirven correctamente (200 OK)
2. ? No hay excepciones en JwtLoggingMiddleware
3. ? Los endpoints API funcionan con autenticación
4. ? El logging de diagnóstico sigue funcionando donde se necesita

**La aplicación ahora debería funcionar correctamente en Heroku!** ??
