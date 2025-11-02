using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using TuCita.Desktop.ViewModels;

namespace TuCita.Desktop.Views;

public partial class AppointmentDetailWindow : Window
{
    public AppointmentDetailWindow()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}
