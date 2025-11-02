using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using TuCita.Desktop.ViewModels;
using TuCita.Desktop.Services;
using Microsoft.Extensions.DependencyInjection;
using System;

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

    public LoginWindow(LoginViewModel viewModel, TuCitaApiClient apiClient) : this()
    {
        _apiClient = apiClient;
        DataContext = viewModel;
        
        // Suscribirse al evento de login exitoso
        viewModel.LoginSuccessful += OnLoginSuccessful;
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }

    private void OnLoginSuccessful(object? sender, TuCita.Shared.DTOs.Auth.AuthResponseDto userData)
    {
        // Verificar si el usuario es un médico
        // Nota: Asume que el rol viene en el objeto userData
        // Ajustar según la estructura real de AuthResponseDto
        
        if (_apiClient == null) return;

        // Si es médico, abrir Dashboard Médico
        if (IsDoctorRole(userData))
        {
            var dashboardWindow = new DoctorDashboardWindow
            {
                DataContext = new DoctorDashboardViewModel(
                    _apiClient, 
                    userData.Id, 
                    userData.Name ?? "Doctor")
            };
            dashboardWindow.Show();
            this.Close();
        }
        else
        {
            // Si es paciente u otro rol, abrir ventana principal
            var app = Application.Current as App;
            if (app?.ServiceProvider != null)
            {
                var mainWindow = app.ServiceProvider.GetRequiredService<MainWindow>();
                var mainViewModel = app.ServiceProvider.GetRequiredService<MainViewModel>();
                mainViewModel.CurrentUser = userData;
                mainWindow.DataContext = mainViewModel;
                mainWindow.Show();
                this.Close();
            }
        }
    }

    private bool IsDoctorRole(TuCita.Shared.DTOs.Auth.AuthResponseDto userData)
    {
        // Implementar lógica para determinar si es médico
        // Esto depende de cómo se estructure el AuthResponseDto
        // Por ejemplo, podría ser:
        // return userData.Role?.Equals("DOCTOR", StringComparison.OrdinalIgnoreCase) ?? false;
        
        // Por ahora, retornar false como valor por defecto
        // Ajustar cuando se tenga la estructura exacta
        return false; // TODO: Implementar verificación de rol real
    }
}
