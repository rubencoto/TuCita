using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TuCita.Desktop.Services;
using TuCita.Desktop.Views;
using TuCita.Desktop.ViewModels;

namespace TuCita.Desktop;

public partial class App : Application
{
    public IServiceProvider? ServiceProvider { get; private set; }
    public IConfiguration? Configuration { get; private set; }

    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public override void OnFrameworkInitializationCompleted()
    {
        // Configurar servicios
        var services = new ServiceCollection();
        ConfigureServices(services);
        ServiceProvider = services.BuildServiceProvider();

        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            // Mostrar ventana de login en lugar de main window
            desktop.MainWindow = ServiceProvider.GetRequiredService<LoginWindow>();
        }

        base.OnFrameworkInitializationCompleted();
    }

    private void ConfigureServices(IServiceCollection services)
    {
        // Configuración
        Configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        services.AddSingleton(Configuration);

        // HttpClient con configuración base
        services.AddHttpClient<TuCitaApiClient>(client =>
        {
            var baseUrl = Configuration["TuCitaApi:BaseUrl"] ?? "https://localhost:7000";
            client.BaseAddress = new Uri(baseUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        // ViewModels
        services.AddTransient<LoginViewModel>();
        services.AddTransient<MainViewModel>();

        // Views
        services.AddTransient<LoginWindow>();
        services.AddTransient<MainWindow>();
    }
}
