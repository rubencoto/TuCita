using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using TuCita.Desktop.ViewModels;

namespace TuCita.Desktop.Views;

public partial class DoctorDashboardWindow : Window
{
    public DoctorDashboardWindow()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}
