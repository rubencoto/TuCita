using System.Text.Json;

namespace TuCita.Desktop.Services;

public class TokenStorageService
{
    private readonly string _tokenFilePath;

    public TokenStorageService()
    {
        var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var appFolder = Path.Combine(appDataPath, "TuCitaDesktop");
        Directory.CreateDirectory(appFolder);
        _tokenFilePath = Path.Combine(appFolder, "auth.json");
    }

    public async Task<string?> GetTokenAsync()
    {
        try
        {
            if (!File.Exists(_tokenFilePath))
                return null;

            var json = await File.ReadAllTextAsync(_tokenFilePath);
            var tokenData = JsonSerializer.Deserialize<TokenData>(json);
            
            if (tokenData?.ExpiresAt <= DateTime.UtcNow)
            {
                await ClearTokenAsync();
                return null;
            }

            return tokenData?.Token;
        }
        catch
        {
            return null;
        }
    }

    public async Task SaveTokenAsync(string token, DateTime expiresAt)
    {
        try
        {
            var tokenData = new TokenData
            {
                Token = token,
                ExpiresAt = expiresAt,
                SavedAt = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(tokenData, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(_tokenFilePath, json);
            Console.WriteLine("✅ Token guardado correctamente");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error guardando token: {ex.Message}");
        }
    }

    public async Task ClearTokenAsync()
    {
        try
        {
            if (File.Exists(_tokenFilePath))
                File.Delete(_tokenFilePath);
            Console.WriteLine("✅ Token limpiado");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error limpiando token: {ex.Message}");
        }
    }

    private class TokenData
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime SavedAt { get; set; }
    }
}
