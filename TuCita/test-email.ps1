# Script de prueba para el servicio de correo electrónico
# TuCitaOnline - Email Service Test

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Email Service - TuCitaOnline" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$baseUrl = "https://localhost:7063"
$testEmail = Read-Host "Ingresa el email de destino para la prueba"

if ([string]::IsNullOrWhiteSpace($testEmail)) {
    Write-Host "? Email no puede estar vacío" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "?? Enviando código de seguridad a: $testEmail" -ForegroundColor Yellow
Write-Host ""

# Preparar el request
$body = @{
    email = $testEmail
} | ConvertTo-Json

try {
    # Enviar request
    $response = Invoke-RestMethod -Uri "$baseUrl/api/email/send-security-code" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -SkipCertificateCheck

    # Mostrar resultado
    if ($response.success) {
        Write-Host "? ¡Correo enviado exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Mensaje: $($response.message)" -ForegroundColor Gray
        Write-Host "Código (solo para desarrollo): $($response.code)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "?? Revisa tu bandeja de entrada (y SPAM) en: $testEmail" -ForegroundColor Cyan
    } else {
        Write-Host "? Error al enviar el correo" -ForegroundColor Red
        Write-Host "Mensaje: $($response.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "? Error en la petición HTTP:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host ""
        Write-Host "Detalles del error:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pausa al final
Read-Host "Presiona Enter para salir"
