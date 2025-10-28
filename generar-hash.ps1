# Generador de Hash BCrypt para TuCita
# Este script genera el hash necesario para el seeding

Write-Host "??????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "?   Generador de Hashes BCrypt - TuCita         ?" -ForegroundColor Cyan
Write-Host "??????????????????????????????????????????????????`n" -ForegroundColor Cyan

Write-Host "?? Compilando generador..." -ForegroundColor Yellow
dotnet build Tools/HashGenerator/HashGenerator.csproj --nologo --verbosity quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "? Compilación exitosa`n" -ForegroundColor Green
    
    Write-Host "?? Generando hash para password: Doctor123!`n" -ForegroundColor Yellow
    dotnet run --project Tools/HashGenerator/HashGenerator.csproj --no-build
} else {
    Write-Host "? Error al compilar el generador" -ForegroundColor Red
    Write-Host "`n?? Alternativa: Usa este hash pre-generado (solo para desarrollo):`n" -ForegroundColor Yellow
    Write-Host "   `$2a`$11`$Z9h.cIPz0gi.URNNX3kh2OPST9/PgBqxO1VN5WkNzN4M9E7OvPdOO" -ForegroundColor White
    Write-Host "`n   Copia y pega en seed-data-sqlserver.sql línea 47:" -ForegroundColor Yellow
    Write-Host "   DECLARE @password_hash VARCHAR(255) = '`$2a`$11`$Z9h.cIPz0gi.URNNX3kh2OPST9/PgBqxO1VN5WkNzN4M9E7OvPdOO';" -ForegroundColor Cyan
}

Write-Host "`n? Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host
