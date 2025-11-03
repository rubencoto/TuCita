using System;
using System.Windows.Input;
using ReactiveUI;
using System.Reactive;
using System.Threading.Tasks;
using TuCita.Desktop.Services;
using TuCita.Shared.DTOs.Auth;
using TuCita.Shared.DTOs.Doctors;
using System.Reactive.Linq;

namespace TuCita.Desktop.ViewModels;

public class LoginViewModel : ViewModelBase
{

        private readonly TuCitaApiClient _apiClient;
        private string _email = string.Empty;
        private string _password = string.Empty;
        private bool _isLoading;
        private string _errorMessage = string.Empty;
        private bool _showPassword;

        public LoginViewModel(TuCitaApiClient apiClient)
        {
            _apiClient = apiClient;

            // SOLUCIÓN: Crear comandos SIN observables que causen problemas de hilos
            LoginCommand = ReactiveCommand.CreateFromTask(
                LoginAsync,
                canExecute: null, // Sin validación reactiva automática
                outputScheduler: RxApp.MainThreadScheduler);

        TogglePasswordVisibilityCommand = ReactiveCommand.Create(
            () =>
            {
                ShowPassword = !ShowPassword;
                return Unit.Default; // Ensure the return type matches ReactiveCommand<Unit, Unit>
            },
            canExecute: null, // Siempre habilitado
            outputScheduler: RxApp.MainThreadScheduler);
            
            // Inicializar sin problemas de hilos
            _ = Task.Run(InitializeAsync);
        }

        // Propiedades normales sin observables complicados
        public string Email
        {
            get => _email;
            set => this.RaiseAndSetIfChanged(ref _email, value);
        }

        public string Password
        {
            get => _password;
            set => this.RaiseAndSetIfChanged(ref _password, value);
        }

        public bool IsLoading
    {
        get => _isLoading;
        set => this.RaiseAndSetIfChanged(ref _isLoading, value);
    }

    public string ErrorMessage
    {
        get => _errorMessage;
        set => this.RaiseAndSetIfChanged(ref _errorMessage, value);
    }

    public bool ShowPassword
    {
        get => _showPassword;
        set => this.RaiseAndSetIfChanged(ref _showPassword, value);
    }

    public ReactiveCommand<Unit, Unit> LoginCommand { get; }
    public ReactiveCommand<Unit, Unit> TogglePasswordVisibilityCommand { get; }

    public event EventHandler<DoctorDetailDto>? LoginSuccessful;

    private async Task InitializeAsync()
    {
        try
        {
            await _apiClient.InitializeAsync();
            Console.WriteLine("✅ ApiClient inicializado");

            if (await _apiClient.IsAuthenticatedAsync())
            {
                Console.WriteLine("🔍 Verificando sesión existente...");

                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    IsLoading = true;
                });

                var doctorProfile = await _apiClient.GetDoctorProfileAsync();

                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    IsLoading = false;

                    if (doctorProfile != null)
                    {
                        Console.WriteLine("✅ Sesión activa encontrada");
                        LoginSuccessful?.Invoke(this, doctorProfile);
                    }
                    else
                    {
                        Console.WriteLine("⚠️ Sesión expirada, limpiando token");
                    }
                });

                if (doctorProfile == null)
                {
                    await _apiClient.LogoutAsync();
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en InitializeAsync: {ex.Message}");
        }
    }
    private async Task LoginAsync()
    {
        Console.WriteLine("🔐 Iniciando proceso de login...");

        // VALIDACIÓN MANUAL en lugar de reactiva
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            // Asegurar que el cambio de UI esté en el hilo correcto
            await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
            {
                ErrorMessage = "Por favor, ingresa tu correo y contraseña";
            });
            return;
        }

        // Asegurar que IsLoading se actualice en el hilo de UI
        await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
        {
            IsLoading = true;
            ErrorMessage = string.Empty;
        });

        try
        {
            Console.WriteLine($"📧 Intentando login para: {Email}");
            var authResponse = await _apiClient.LoginAsync(Email, Password);

            if (authResponse != null)
            {
                Console.WriteLine("✅ Autenticación exitosa, verificando rol de doctor...");
                var doctorProfile = await _apiClient.GetDoctorProfileAsync();

                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    if (doctorProfile != null)
                    {
                        Console.WriteLine($"✅ Login exitoso como doctor: {doctorProfile.Nombre}");
                        LoginSuccessful?.Invoke(this, doctorProfile);
                    }
                    else
                    {
                        Console.WriteLine("❌ Usuario no es doctor");
                        ErrorMessage = "Acceso restringido: Solo médicos pueden usar esta aplicación";
                    }
                });

                if (doctorProfile == null)
                {
                    await _apiClient.LogoutAsync();
                }
            }
            else
            {
                Console.WriteLine("❌ Login falló - credenciales incorrectas");
                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    ErrorMessage = "Correo o contraseña incorrectos";
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en login: {ex.Message}");
            await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
            {
                ErrorMessage = $"Error al iniciar sesión: {ex.Message}";
            });
        }
        finally
        {
            await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
            {
                IsLoading = false;
            });
        }
    }
}
