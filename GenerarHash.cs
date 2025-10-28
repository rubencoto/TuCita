using BCrypt.Net;

Console.WriteLine("??????????????????????????????????????????????????");
Console.WriteLine("?   Generador de Hashes BCrypt - TuCita         ?");
Console.WriteLine("??????????????????????????????????????????????????\n");

var password = "Doctor123!";
Console.WriteLine($"?? Password: {password}");
Console.WriteLine($"??  Factor de costo: 11 (2048 iteraciones)\n");

// Generar hash con factor de costo 11 (2048 iteraciones)
var hash = BCrypt.HashPassword(password, 11);

Console.WriteLine($"? Hash generado:");
Console.WriteLine($"   {hash}");
Console.WriteLine($"\n?? Longitud: {hash.Length} caracteres");

// Verificar que el hash es v�lido
var isValid = BCrypt.Verify(password, hash);
Console.WriteLine($"\n? Verificaci�n: {(isValid ? "V�LIDO ?" : "INV�LIDO ?")}");

Console.WriteLine("\n" + new string('?', 60));
Console.WriteLine("\n?? Copia y pega esto en seed-data-sqlserver.sql:");
Console.WriteLine("\n" + new string('?', 60));
Console.WriteLine($"DECLARE @password_hash VARCHAR(255) = '{hash}';");
Console.WriteLine(new string('?', 60));

Console.WriteLine("\n?? Ubicaci�n en el archivo:");
Console.WriteLine("   L�nea ~47 en seed-data-sqlserver.sql");
Console.WriteLine("   Reemplaza la l�nea que comienza con:");
Console.WriteLine("   DECLARE @password_hash VARCHAR(255) = '$2a$11$ejemplo...");

Console.WriteLine("\n?? Contrase�a para todos los m�dicos: Doctor123!");

Console.WriteLine("\n? �Listo! Copia el hash de arriba.");
