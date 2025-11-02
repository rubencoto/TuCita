using System;
using System.Windows.Input;
using ReactiveUI;
using TuCita.Desktop.Services;
using TuCita.Shared.DTOs.Auth;

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
        
        LoginCommand = ReactiveCommand.CreateFromTask(LoginAsync);
        TogglePasswordVisibilityCommand = ReactiveCommand.Create(TogglePasswordVisibility);
    }

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

    public ICommand LoginCommand { get; }
    public ICommand TogglePasswordVisibilityCommand { get; }

    public event EventHandler<AuthResponseDto>? LoginSuccessful;

    private async Task LoginAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Por favor, ingresa tu correo y contraseña";
            return;
        }

        IsLoading = true;
        ErrorMessage = string.Empty;

        try
        {
            var response = await _apiClient.LoginAsync(Email, Password);

            if (response != null)
            {
                // Guardar token
                _apiClient.SetAuthToken(response.Token);
                
                // Por ahora permitir todos los logins - se puede agregar validación de roles después
                LoginSuccessful?.Invoke(this, response);
            }
            else
            {
                ErrorMessage = "Correo o contraseña incorrectos";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Error al iniciar sesión: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void TogglePasswordVisibility()
    {
        ShowPassword = !ShowPassword;
    }
}
