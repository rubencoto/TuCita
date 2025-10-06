# Script de PowerShell para probar los endpoints de TuCita
# Ejecutar desde la carpeta raíz del proyecto

$baseUrl = "http://localhost:5174"
$apiUrl = "$baseUrl/api"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Probando API de TuCita" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Función para hacer requests
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Name,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    Write-Host "Probando: $Name" -ForegroundColor Yellow
    Write-Host "  URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        Write-Host "  ? Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.Content) {
            $json = $response.Content | ConvertFrom-Json
            if ($json -is [array]) {
                Write-Host "  ? Resultados: $($json.Count) elementos" -ForegroundColor Green
            }
        }
        
        return $true
    }
    catch {
        Write-Host "  ? Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "  ? Status Code: $statusCode" -ForegroundColor Red
        }
        return $false
    }
    
    Write-Host ""
}

# 1. Verificar que el servidor está corriendo
Write-Host "1. Verificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "  ? Servidor está corriendo" -ForegroundColor Green
}
catch {
    Write-Host "  ? Servidor no responde. Asegúrate de que esté corriendo en $baseUrl" -ForegroundColor Red
    exit
}
Write-Host ""

# 2. Probar endpoint de especialidades (no requiere autenticación)
Write-Host "2. Probando endpoints públicos..." -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$apiUrl/doctors/specialties" -Name "Obtener Especialidades"
Write-Host ""

# 3. Probar endpoint de doctores (no requiere autenticación)
Write-Host "3. Probando búsqueda de doctores..." -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$apiUrl/doctors" -Name "Obtener todos los doctores"
Test-Endpoint -Method "GET" -Url "$apiUrl/doctors?specialty=Cardiología" -Name "Buscar cardiólogos"
Write-Host ""

# 4. Intentar registrar un usuario de prueba
Write-Host "4. Probando registro de usuario..." -ForegroundColor Cyan
$randomNum = Get-Random -Minimum 1000 -Maximum 9999
$registerData = @{
    email = "test$randomNum@example.com"
    password = "Test123!"
    nombre = "Usuario"
    apellido = "Prueba"
}

$registered = Test-Endpoint -Method "POST" -Url "$apiUrl/auth/register" -Name "Registrar usuario de prueba" -Body $registerData
Write-Host ""

# 5. Intentar login con el usuario creado
if ($registered) {
    Write-Host "5. Probando login..." -ForegroundColor Cyan
    $loginData = @{
        email = $registerData.email
        password = $registerData.password
    }
    
    Write-Host "Intentando login con: $($loginData.email)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
        $loginResponse = $response.Content | ConvertFrom-Json
        $token = $loginResponse.token
        
        Write-Host "  ? Login exitoso" -ForegroundColor Green
        Write-Host "  ? Token obtenido" -ForegroundColor Green
        Write-Host ""
        
        # 6. Probar endpoint protegido con el token
        Write-Host "6. Probando endpoints protegidos..." -ForegroundColor Cyan
        $authHeaders = @{
            "Authorization" = "Bearer $token"
        }
        
        Test-Endpoint -Method "GET" -Url "$apiUrl/appointments" -Name "Obtener mis citas" -Headers $authHeaders
        Write-Host ""
    }
    catch {
        Write-Host "  ? Error en login: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}
else {
    Write-Host "5. Saltando pruebas de autenticación (registro falló)" -ForegroundColor Yellow
    Write-Host ""
}

# Resumen
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Pruebas completadas" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints probados:" -ForegroundColor White
Write-Host "  • GET /api/doctors/specialties" -ForegroundColor Gray
Write-Host "  • GET /api/doctors" -ForegroundColor Gray
Write-Host "  • POST /api/auth/register" -ForegroundColor Gray
Write-Host "  • POST /api/auth/login" -ForegroundColor Gray
Write-Host "  • GET /api/appointments" -ForegroundColor Gray
Write-Host ""
Write-Host "Para ver más detalles, revisa los logs de la aplicación." -ForegroundColor White
Write-Host ""

# Comando para ver médicos en la base de datos
Write-Host "Consulta SQL para verificar médicos:" -ForegroundColor Yellow
Write-Host @"
SELECT 
    u.id,
    CONCAT('Dr. ', u.nombre, ' ', u.apellido) as medico,
    pm.ciudad,
    GROUP_CONCAT(e.nombre) as especialidades
FROM usuarios u
JOIN perfil_medico pm ON u.id = pm.usuario_id
LEFT JOIN medico_especialidad me ON pm.usuario_id = me.medico_id
LEFT JOIN especialidades e ON me.especialidad_id = e.id
GROUP BY u.id;
"@ -ForegroundColor Gray
