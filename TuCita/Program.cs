using Microsoft.AspNetCore.SpaServices.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TuCita.Data;
using TuCita.Services;
using TuCita.Middleware;
using DotNetEnv;
using System.Diagnostics;
using Amazon.S3;
using Amazon.Runtime;

// Cargar variables de entorno desde el archivo .env (solo en desarrollo)
if (File.Exists(".env"))
{
    Env.Load();
}

var builder = WebApplication.CreateBuilder(args);

// Configurar codificación UTF-8 para toda la aplicación
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

// Configurar puerto dinámico de Heroku
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Construir cadena de conexión para SQL Server desde variables de entorno
var dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? throw new InvalidOperationException("DB_SERVER no configurada");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "1433";
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? throw new InvalidOperationException("DB_NAME no configurada");
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? throw new InvalidOperationException("DB_USER no configurada");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? throw new InvalidOperationException("DB_PASSWORD no configurada");

// Cadena de conexión para AWS RDS SQL Server
var connectionString = $"Data Source={dbServer},{dbPort};Initial Catalog={dbName};User ID={dbUser};Password={dbPassword};Persist Security Info=True;Pooling=False;MultipleActiveResultSets=False;Connect Timeout=30;Encrypt=True;TrustServerCertificate=True;Command Timeout=0";

// Logging de diagnóstico para conexión a BD (sin exponer la contraseña completa)
if (builder.Environment.IsDevelopment())
{
    Console.WriteLine($"?? Configuración de conexión AWS RDS SQL Server:");
    Console.WriteLine($"   Servidor: {dbServer}:{dbPort}");
    Console.WriteLine($"   Base de datos: {dbName}");
    Console.WriteLine($"   Usuario: {dbUser}");
    Console.WriteLine($"   Contraseña configurada: {!string.IsNullOrEmpty(dbPassword)} (longitud: {dbPassword?.Length ?? 0})");
    Console.WriteLine($"   Encrypt: True");
    Console.WriteLine($"   TrustServerCertificate: True");
}

// Add Entity Framework con SQL Server
builder.Services.AddDbContext<TuCitaDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// Add JWT Authentication usando variables de entorno
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? throw new InvalidOperationException("JWT_KEY no configurada");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "TuCita";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "TuCitaUsers";

var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    
    // Add events for debugging JWT authentication
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"?? JWT Authentication Failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var claims = context.Principal?.Claims.Select(c => $"{c.Type}={c.Value}");
            Console.WriteLine($"? JWT Token Validated. Claims: {string.Join(", ", claims ?? new string[0])}");
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault();
            if (token != null)
            {
                Console.WriteLine($"?? JWT Token Received: {token.Substring(0, Math.Min(20, token.Length))}...");
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"?? JWT Challenge: {context.Error}, {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
});

// Add Authorization
builder.Services.AddAuthorization();

// Add services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDoctorsService, DoctorsService>();
builder.Services.AddScoped<IAppointmentsService, AppointmentsService>();
builder.Services.AddScoped<IDoctorAppointmentsService, DoctorAppointmentsService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IMedicalHistoryService, MedicalHistoryService>();
builder.Services.AddScoped<IDoctorProfileService, DoctorProfileService>();
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();
builder.Services.AddScoped<IAdminEspecialidadesService, AdminEspecialidadesService>();
builder.Services.AddScoped<IAdminUsuariosService, AdminUsuariosService>();
builder.Services.AddScoped<IAdminCitasService, AdminCitasService>();
builder.Services.AddScoped<IAdminReportesService, AdminReportesService>();

// Add Background Service para limpieza automática de turnos vencidos (AWS RDS)
builder.Services.AddHostedService<ExpiredSlotsCleanupService>();

// Add AWS S3 Client
var awsAccessKey = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
var awsSecretKey = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");
var awsRegion = Environment.GetEnvironmentVariable("AWS_REGION") ?? "us-east-1";

if (!string.IsNullOrEmpty(awsAccessKey) && !string.IsNullOrEmpty(awsSecretKey))
{
    var credentials = new BasicAWSCredentials(awsAccessKey, awsSecretKey);
    
    // ? Configuración explícita para forzar AWS Signature Version 4
    var config = new AmazonS3Config
    {
        RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(awsRegion),
        // ? CRÍTICO: Estas propiedades fuerzan Signature Version 4
        SignatureVersion = "4",
        SignatureMethod = Amazon.Runtime.SigningAlgorithm.HmacSHA256,
        UseHttp = false,
        // ? IMPORTANTE: NO usar ForcePathStyle para Signature V4
        // Virtual-hosted-style es requerido para Signature V4 en regiones nuevas
        ForcePathStyle = false
    };
    
    builder.Services.AddSingleton<IAmazonS3>(sp => new AmazonS3Client(credentials, config));
    builder.Services.AddScoped<IS3StorageService, S3StorageService>();
    
    Console.WriteLine($"? AWS S3 configurado:");
    Console.WriteLine($"   Región: {awsRegion}");
    Console.WriteLine($"   Signature Version: 4 (AWS4-HMAC-SHA256)");
    Console.WriteLine($"   Signature Method: HmacSHA256");
    Console.WriteLine($"   Use HTTPS: True");
    Console.WriteLine($"   Force Path Style: False (Virtual-hosted-style)");
}
else
{
    Console.WriteLine("?? AWS S3 no configurado - Faltan credenciales AWS_ACCESS_KEY_ID o AWS_SECRET_ACCESS_KEY");
}

// EmailService es suficiente - sin tablas de notificaciones en BD

// Add controllers con soporte UTF-8
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        // Serializar enums como strings en lugar de números
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Add SPA services - Frontend is built to wwwroot during publish
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "wwwroot";
});

var app = builder.Build();

// Iniciar servidor Vite automáticamente en Development
Process? viteProcess = null;
if (app.Environment.IsDevelopment())
{
    try
    {
        var clientAppPath = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp");
        
        if (Directory.Exists(clientAppPath))
        {
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("?? Iniciando servidor Vite...");

            var processStartInfo = new ProcessStartInfo
            {
                FileName = "npm",
                Arguments = "run dev",
                WorkingDirectory = clientAppPath,
                UseShellExecute = true,
                CreateNoWindow = false
            };

            viteProcess = Process.Start(processStartInfo);
            logger.LogInformation("? Servidor Vite iniciado en http://localhost:3000");
        }
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "?? No se pudo iniciar el servidor Vite automáticamente. Inícialo manualmente con 'npm run dev' en la carpeta ClientApp");
    }
}

// Detener Vite cuando se cierre la aplicación
app.Lifetime.ApplicationStopping.Register(() =>
{
    if (viteProcess != null && !viteProcess.HasExited)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("?? Deteniendo servidor Vite...");
        
        try
        {
            viteProcess.Kill(true);
            viteProcess.Dispose();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "?? Error al detener el servidor Vite");
        }
    }
});

// Inicializar roles básicos al arrancar la aplicación
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        var context = services.GetRequiredService<TuCitaDbContext>();
        
        logger.LogInformation("?? Inicializando sistema...");
        await DbInitializer.InitializeAsync(context);
        logger.LogInformation("? Sistema inicializado correctamente");
    }
    catch (Microsoft.Data.SqlClient.SqlException ex)
    {
        logger.LogError(ex, "? Error de conexión a SQL Server. Verifica:");
        logger.LogError("   1. Credenciales correctas en variables de entorno");
        logger.LogError("   2. Firewall permite conexiones");
        logger.LogError("   3. Base de datos '{DbName}' existe", Environment.GetEnvironmentVariable("DB_NAME"));
        logger.LogError("   4. Usuario tiene permisos suficientes");
        logger.LogError("   Detalle: {Message}", ex.Message);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "? Error inesperado al inicializar el sistema");
    }
}

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

// Add Authentication & Authorization middleware
app.UseAuthentication();

// Add JWT Logging Middleware (AFTER Authentication so user is authenticated)
app.UseJwtLogging();

app.UseAuthorization();

// Configure API routes
app.MapControllers();

// Configure SPA - solo para rutas que NO sean /api/
app.MapWhen(
    context => !context.Request.Path.StartsWithSegments("/api"),
    appBuilder =>
    {
        appBuilder.UseSpa(spa =>
        {
            spa.Options.SourcePath = "ClientApp";

            if (app.Environment.IsDevelopment())
            {
                // Solo intentar proxy si no es una ruta de API
                spa.UseProxyToSpaDevelopmentServer("http://localhost:3000");
            }
        });
    }
);

app.Run();
