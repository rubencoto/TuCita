using Microsoft.AspNetCore.SpaServices.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TuCita.Data;
using TuCita.Services;
using DotNetEnv;
using System.Diagnostics;

// ? Cargar variables de entorno desde el archivo .env
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// ? Construir cadena de conexión desde variables de entorno para Azure SQL
var dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? throw new InvalidOperationException("DB_SERVER no configurada en .env");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "1433";
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? throw new InvalidOperationException("DB_NAME no configurada en .env");
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? throw new InvalidOperationException("DB_USER no configurada en .env");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? throw new InvalidOperationException("DB_PASSWORD no configurada en .env");

// Cadena de conexión para Azure SQL Server
var connectionString = $"Server=tcp:{dbServer},{dbPort};Initial Catalog={dbName};Persist Security Info=False;User ID={dbUser};Password={dbPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

// ? Logging de diagnóstico para conexión a BD (sin exponer la contraseña completa)
Console.WriteLine($"?? Configuración de conexión:");
Console.WriteLine($"   Servidor: {dbServer}:{dbPort}");
Console.WriteLine($"   Base de datos: {dbName}");
Console.WriteLine($"   Usuario: {dbUser}");
Console.WriteLine($"   Contraseña configurada: {!string.IsNullOrEmpty(dbPassword)} (longitud: {dbPassword?.Length ?? 0})");
Console.WriteLine($"   SSL: Required");

// Add Entity Framework con cadena de conexión para SQL Server
builder.Services.AddDbContext<TuCitaDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// ? Add JWT Authentication usando variables de entorno
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? throw new InvalidOperationException("JWT_KEY no configurada en .env");
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
});

// Add Authorization
builder.Services.AddAuthorization();

// Add services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDoctorsService, DoctorsService>();
builder.Services.AddScoped<IAppointmentsService, AppointmentsService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IDatabaseTestService, DatabaseTestService>();

// Add controllers
builder.Services.AddControllers();

// Add SPA services
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "ClientApp/dist";
});

var app = builder.Build();

// ?? Iniciar servidor Vite automáticamente en Development
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
        logger.LogError("   1. Credenciales correctas en .env");
        logger.LogError("   2. Firewall de Azure permite tu IP");
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

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseSpaStaticFiles();

app.UseRouting();

// Add Authentication & Authorization middleware
app.UseAuthentication();
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
