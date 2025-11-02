using TuCita.Shared.DTOs.Auth;
using ReactiveUI;

namespace TuCita.Desktop.ViewModels;

public class MainViewModel : ViewModelBase
{
    private AuthResponseDto? _currentUser;
    private string _welcomeMessage = string.Empty;

    public AuthResponseDto? CurrentUser
    {
        get => _currentUser;
        set
        {
            this.RaiseAndSetIfChanged(ref _currentUser, value);
            if (value != null)
            {
                WelcomeMessage = $"Bienvenido, {value.Name}";
            }
        }
    }

    public string WelcomeMessage
    {
        get => _welcomeMessage;
        set => this.RaiseAndSetIfChanged(ref _welcomeMessage, value);
    }
}
