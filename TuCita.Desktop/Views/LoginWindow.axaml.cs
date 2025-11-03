using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using TuCita.Desktop.ViewModels;
using TuCita.Desktop.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using TuCita.Shared.DTOs.Doctors;

namespace TuCita.Desktop.Views;

public partial class LoginWindow : Window
{
    private readonly TuCitaApiClient? _apiClient;

    public LoginWindow()
    {
        InitializeComponent();
#if DEBUG
        this.AttachDevTools();
#endif
    }

    public LoginWindow(LoginViewModel viewModel) : this()
    {
        DataContext = viewModel;
        
        // Suscribirse al evento de login exitoso
        viewModel.LoginSuccessful += OnLoginSuccessful;
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }

    private void OnLoginSuccessful(object? sender, DoctorDetailDto doctorData)
    {
        Console.WriteLine($"✅ Login exitoso para doctor: {doctorData.Nombre}");

        // Abrir ventana principal
        var app = Application.Current as App;
        if (app?.ServiceProvider != null)
        {
            try
            {
                var mainWindow = app.ServiceProvider.GetRequiredService<MainWindow>();
                var mainViewModel = app.ServiceProvider.GetRequiredService<MainViewModel>();

                // Configurar datos del doctor en el MainViewModel si es necesario
                // mainViewModel.CurrentDoctor = doctorData;

                mainWindow.DataContext = mainViewModel;
                mainWindow.Show();
                this.Close();

                Console.WriteLine("✅ Ventana principal abierta correctamente");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error abriendo ventana principal: {ex.Message}");
            }
        }
    }
}
