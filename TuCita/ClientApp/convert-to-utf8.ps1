# Script para convertir archivos a UTF-8
$files = @(
    "src\components\pages\forgot-password-page.tsx",
    "src\components\pages\reset-password-page.tsx"
)

Write-Host "Convirtiendo archivos a UTF-8..." -ForegroundColor Yellow

foreach ($filePath in $files) {
    if (Test-Path $filePath) {
        Write-Host "  Procesando: $filePath" -ForegroundColor Cyan
        
        # Leer el contenido del archivo
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Guardar con codificación UTF-8 (sin BOM)
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText((Resolve-Path $filePath).Path, $content, $utf8NoBom)
        
        Write-Host "  ? Convertido exitosamente" -ForegroundColor Green
    } else {
        Write-Host "  ? No se encontró: $filePath" -ForegroundColor Red
    }
}

Write-Host "`nTodos los archivos convertidos a UTF-8 sin BOM" -ForegroundColor Green
