# ?? Guía de Tests de Conexión a Azure SQL Database

## ?? Descripción

Se han creado endpoints API para probar la conexión y configuración de la base de datos Azure SQL. Estos tests verifican:

1. **Conexión** - ¿Puede la aplicación conectarse a Azure SQL?
2. **Estructura** - ¿Existen todas las tablas necesarias?
3. **Datos** - ¿Están inicializados los datos básicos (roles, etc.)?

---

## ?? Endpoints Disponibles

### 1. Test Completo
Ejecuta todas las pruebas en secuencia.

```bash
GET http://localhost:5000/api/DatabaseTest/full-test
```

**Respuesta exitosa:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "connection": {
    "success": true,
    "canConnect": true,
    "message": "Conexión exitosa a Azure SQL Database",
    "serverVersion": "Microsoft SQL Azure (RTM) - 12.0.2000.8",
    "databaseName": "TuCita",
    "dataSource": "tu-servidor.database.windows.net,1433",
    "responseTime": "00:00:00.1234567"
  },
  "tables": {
    "success": true,
    "message": "Todas las tablas existen (17/17)",
    "existingTables": [
      "usuarios", "roles", "roles_usuarios", 
      "especialidades", "perfil_paciente", "perfil_medico",
      "medico_especialidad", "agenda_turnos", "citas",
      "notas_clinicas", "diagnosticos", "recetas", "receta_items",
      "azure_almacen_config", "documentos_clinicos", 
      "documento_etiquetas", "documentos_descargas"
    ],
    "missingTables": []
  },
  "data": {
    "success": true,
    "message": "Base de datos inicializada correctamente",
    "rolesCount": 3,
    "usuariosCount": 0,
    "especialidadesCount": 0,
    "medicosCount": 0,
    "pacientesCount": 0,
    "citasCount": 0,
    "hasBasicRoles": true
  }
}
```

---

### 2. Test de Conexión
Verifica solo la conectividad con Azure SQL.

```bash
GET http://localhost:5000/api/DatabaseTest/connection
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "canConnect": true,
  "message": "Conexión exitosa a Azure SQL Database",
  "serverVersion": "Microsoft SQL Azure (RTM) - 12.0.2000.8",
  "databaseName": "TuCita",
  "dataSource": "tu-servidor.database.windows.net,1433",
  "responseTime": "00:00:00.0856234"
}
```

**Respuesta con error:**
```json
{
  "success": false,
  "canConnect": false,
  "message": "No se pudo establecer conexión con la base de datos",
  "responseTime": "00:00:05.0000000",
  "errorDetails": "A network-related or instance-specific error..."
}
```

---

### 3. Test de Tablas
Verifica que todas las tablas existen.

```bash
GET http://localhost:5000/api/DatabaseTest/tables
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Todas las tablas existen (17/17)",
  "existingTables": [
    "usuarios", "roles", "roles_usuarios", 
    "especialidades", "perfil_paciente", "perfil_medico",
    "medico_especialidad", "agenda_turnos", "citas",
    "notas_clinicas", "diagnosticos", "recetas", "receta_items",
    "azure_almacen_config", "documentos_clinicos", 
    "documento_etiquetas", "documentos_descargas"
  ],
  "missingTables": []
}
```

**Si faltan tablas:**
```json
{
  "success": false,
  "message": "Faltan 3 tablas. Ejecuta migraciones.",
  "existingTables": ["usuarios", "roles", ...],
  "missingTables": ["documentos_clinicos", "documento_etiquetas", "documentos_descargas"]
}
```

---

### 4. Test de Datos
Verifica que los datos iniciales están cargados.

```bash
GET http://localhost:5000/api/DatabaseTest/data
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Base de datos inicializada correctamente",
  "rolesCount": 3,
  "usuariosCount": 5,
  "especialidadesCount": 12,
  "medicosCount": 3,
  "pacientesCount": 2,
  "citasCount": 8,
  "hasBasicRoles": true
}
```

---

### 5. Health Check
Endpoint simple para monitoreo (compatible con Azure Health Checks).

```bash
GET http://localhost:5000/api/DatabaseTest/health
```

**Respuesta saludable:**
```json
{
  "status": "Healthy",
  "database": "TuCita",
  "server": "tu-servidor.database.windows.net,1433",
  "responseTime": "85.62ms",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Respuesta no saludable (503):**
```json
{
  "status": "Unhealthy",
  "message": "No se pudo establecer conexión",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 6. Status
Información resumida del estado de la base de datos.

```bash
GET http://localhost:5000/api/DatabaseTest/status
```

**Respuesta:**
```json
{
  "status": "Connected",
  "database": "TuCita",
  "server": "tu-servidor.database.windows.net,1433",
  "version": "Microsoft SQL Azure (RTM) - 12.0.2000.8",
  "responseTime": "78.45ms",
  "statistics": {
    "roles": 3,
    "usuarios": 5,
    "especialidades": 12,
    "medicos": 3,
    "pacientes": 2,
    "citas": 8
  },
  "initialized": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## ?? Uso con cURL

### Test completo:
```bash
curl -X GET http://localhost:5000/api/DatabaseTest/full-test
```

### Solo conexión:
```bash
curl -X GET http://localhost:5000/api/DatabaseTest/connection
```

### Health check:
```bash
curl -X GET http://localhost:5000/api/DatabaseTest/health
```

---

## ?? Uso con PowerShell

### Test completo:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/DatabaseTest/full-test" -Method Get | ConvertTo-Json -Depth 10
```

### Solo conexión:
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:5000/api/DatabaseTest/connection" -Method Get
Write-Host "Conexión: " -NoNewline
Write-Host ($result.success ? "? EXITOSA" : "? FALLIDA") -ForegroundColor ($result.success ? "Green" : "Red")
Write-Host "Base de datos: $($result.databaseName)"
Write-Host "Servidor: $($result.dataSource)"
Write-Host "Tiempo de respuesta: $($result.responseTime)"
```

---

## ?? Diagnóstico de Errores Comunes

### Error: "DB_SERVER no configurada en .env"
**Causa:** Falta el archivo `.env` o no tiene las variables necesarias.

**Solución:**
```bash
# Copiar plantilla
cp .env.example .env

# Editar con tus credenciales
# Asegurarse de tener:
DB_SERVER=tu-servidor.database.windows.net
DB_PORT=1433
DB_NAME=TuCita
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña
```

---

### Error: "A network-related or instance-specific error occurred"
**Causas posibles:**
1. Firewall de Azure no permite tu IP
2. Credenciales incorrectas
3. Nombre de servidor incorrecto

**Solución:**
```bash
# 1. Verificar firewall en Azure Portal:
#    SQL Server ? Firewalls and virtual networks ? Add client IP

# 2. Verificar credenciales en .env
cat .env | grep DB_

# 3. Probar conexión directa
sqlcmd -S tu-servidor.database.windows.net -d TuCita -U tu-usuario -P tu-contraseña
```

---

### Error: "Faltan tablas"
**Causa:** Las migraciones no se han aplicado.

**Solución:**
```bash
# Ver migraciones pendientes
dotnet ef migrations list --project TuCita

# Aplicar migraciones
dotnet ef database update --project TuCita

# Si no existen migraciones, crearlas
dotnet ef migrations add InitialCreate --project TuCita
dotnet ef database update --project TuCita
```

---

### Error: "Faltan roles básicos"
**Causa:** `DbInitializer` no se ejecutó correctamente.

**Solución:**
```bash
# Reiniciar la aplicación (DbInitializer se ejecuta al iniciar)
dotnet run --project TuCita

# Verificar logs
# Buscar: "? Sistema inicializado correctamente"
```

---

## ?? Interpretación de Resultados

### ? Todo OK (Esperado después de configuración completa)
```json
{
  "connection": { "success": true, "canConnect": true },
  "tables": { "success": true, "existingTables": 17 },
  "data": { "success": true, "hasBasicRoles": true }
}
```

**Siguiente paso:** Empezar a usar la aplicación normalmente.

---

### ?? Conecta pero faltan tablas
```json
{
  "connection": { "success": true },
  "tables": { "success": false, "missingTables": [...] }
}
```

**Siguiente paso:** 
```bash
dotnet ef database update --project TuCita
```

---

### ?? Conecta pero faltan datos
```json
{
  "connection": { "success": true },
  "tables": { "success": true },
  "data": { "success": false, "hasBasicRoles": false }
}
```

**Siguiente paso:** Reiniciar la aplicación para que `DbInitializer` se ejecute.

---

### ? No conecta
```json
{
  "connection": { "success": false, "canConnect": false }
}
```

**Siguiente paso:** Verificar:
1. Credenciales en `.env`
2. Firewall de Azure
3. Que la base de datos existe

---

## ?? Flujo de Verificación Recomendado

### Primera vez (después de configurar .env):

```bash
# 1. Verificar conexión
curl http://localhost:5000/api/DatabaseTest/connection

# 2. Aplicar migraciones si es necesario
dotnet ef database update --project TuCita

# 3. Verificar tablas
curl http://localhost:5000/api/DatabaseTest/tables

# 4. Verificar datos iniciales
curl http://localhost:5000/api/DatabaseTest/data

# 5. Test completo
curl http://localhost:5000/api/DatabaseTest/full-test
```

---

### Monitoreo continuo:

```bash
# Health check cada 30 segundos
while true; do 
  curl -s http://localhost:5000/api/DatabaseTest/health | jq .status
  sleep 30
done
```

---

## ?? Logs en la Aplicación

Cuando ejecutas los tests, verás logs detallados en la consola:

```
?? Iniciando prueba de conexión a la base de datos...
? Conexión establecida exitosamente
?? Base de datos: TuCita
???  Servidor: tu-servidor.database.windows.net,1433
?? Versión: Microsoft SQL Azure (RTM) - 12.0.2000.8
??  Tiempo de respuesta: 85.62ms

?? Verificando estructura de tablas...
  ? usuarios
  ? roles
  ? roles_usuarios
  ...
?? Tablas encontradas: 17/17

?? Verificando datos iniciales...
  ?? Roles: 3
  ?? Usuarios: 5
  ?? Especialidades: 12
  ????? Médicos: 3
  ????? Pacientes: 2
  ?? Citas: 8
  ? Roles básicos configurados: Admin, Medico, Paciente
```

---

## ?? Integración con Azure

### Agregar a Azure App Service Health Check:

1. En Azure Portal ? App Service ? Health check
2. Path: `/api/DatabaseTest/health`
3. Interval: 30 segundos
4. Timeout: 5 segundos
5. Unhealthy threshold: 3 intentos

---

## ?? Archivos Creados

- `TuCita\Services\DatabaseTestService.cs` - Lógica de pruebas
- `TuCita\Controllers\Api\DatabaseTestController.cs` - Endpoints API
- `TEST_CONEXION_GUIA.md` - Esta guía

---

## ? Checklist Rápido

Antes de considerar que la conexión está lista:

- [ ] `GET /api/DatabaseTest/connection` retorna `success: true`
- [ ] `GET /api/DatabaseTest/tables` muestra 17 tablas
- [ ] `GET /api/DatabaseTest/data` muestra `hasBasicRoles: true`
- [ ] `GET /api/DatabaseTest/health` retorna status `Healthy`
- [ ] Tiempo de respuesta < 1 segundo
- [ ] No hay errores en los logs

---

**¡Listo para usar!** ??

Una vez que todos los tests pasen, tu aplicación está correctamente conectada a Azure SQL Database.
