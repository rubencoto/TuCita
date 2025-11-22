using System;

namespace HashGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            // Generar hash para la contraseña "admin123"
            string password = "admin123";
            string hash = BCrypt.Net.BCrypt.HashPassword(password);
            
            Console.WriteLine("==============================================");
            Console.WriteLine("  GENERADOR DE HASH BCRYPT - TUCITA");
            Console.WriteLine("==============================================");
            Console.WriteLine();
            Console.WriteLine($"Password: {password}");
            Console.WriteLine($"Hash:     {hash}");
            Console.WriteLine();
            Console.WriteLine("==============================================");
            Console.WriteLine("Copia este hash y úsalo en el script SQL");
            Console.WriteLine("==============================================");
            
            // Verificar que el hash funciona
            bool isValid = BCrypt.Net.BCrypt.Verify(password, hash);
            Console.WriteLine();
            Console.WriteLine($"Verificación: {(isValid ? "✅ VÁLIDO" : "❌ INVÁLIDO")}");
            Console.WriteLine();
        }
    }
}
