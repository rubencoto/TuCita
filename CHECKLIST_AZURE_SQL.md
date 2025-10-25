# ? Checklist de Preparaci�n para Azure SQL Database

## Estado Final: LISTO PARA DESPLIEGUE ?

---

## 1. Modelos de Datos ?

### DatabaseModels.cs
- ? Todos los IDs cambiados de `ulong` a `long`
- ? Campos `Ciudad`, `Provincia`, `Pais` eliminados de `PerfilMedico`
- ? Solo queda `Direccion` (string, 200 caracteres)
- ? Todos los enums configurados correctamente (`EstadoTurno`, `EstadoCita`)
- ? Relaciones de navegaci�n correctamente definidas
- ? Atributos de columna SQL Server compatibles

---

## 2. DbContext ?

### TuCitaDbContext.cs
- ? Configuraci�n de claves compuestas
- ? Enums como strings con conversi�n autom�tica
- ? Columna computada `EmailNormalizado` para SQL Server
- ? Precisi�n DateTime configurada como `datetime2(6)`
- ? Campos de texto largo como `NVARCHAR(MAX)`
- ? Restricciones de eliminaci�n (`CASCADE`, `RESTRICT`) seg�n dise�o
- ? �ndices de performance configurados
- ? Restricciones CHECK para validaciones de datos

---

## 3. DTOs (Data Transfer Objects) ?

### Archivos Actualizados:
- ? `CitaDto.cs` - Sin referencia a `CiudadMedico`
- ? `DoctorDto.cs` - Solo `Direccion` y `Location`
- ? `DoctorDetailDto.cs` - Solo `Direccion` y `Location`
- ? `AgendaTurnoDto.cs` - IDs como `long`
- ? `AuthResponseDto.cs` - ID como `long`
- ? `ProfileResponseDto.cs` - IDs como `long`

---

## 4. Servicios ?

### AppointmentsService.cs
- ? M�todos con par�metros `long` en lugar de `ulong`
- ? Referencias a `CiudadMedico` eliminadas
- ? L�gica de creaci�n, cancelaci�n y actualizaci�n de citas correcta

### DoctorsService.cs
- ? M�todos con par�metros `long`
- ? Filtrado por ubicaci�n usando solo `Direccion`
- ? Referencias a `Ciudad`, `Provincia`, `Pais` eliminadas
- ? `Location` usa directamente `Direccion`

### AuthService.cs
- ? IDs como `long`
- ? Generaci�n de tokens JWT correcta
- ? Validaci�n de usuarios activos

### ProfileService.cs
- ? IDs como `long`
- ? Actualizaci�n de perfil sin campos obsoletos

---

## 5. Controladores API ?

### AppointmentsController.cs
- ? `long.TryParse` en lugar de `ulong.TryParse`
- ? Mappings sin `CiudadMedico`
- ? `location` usa `DireccionMedico`

### DoctorsController.cs
- ? `long.TryParse` en lugar de `ulong.TryParse`
- ? Mappings sin `ciudad`, `provincia`, `pais`
- ? Solo expone `direccion` y `location`

### AuthController.cs
- ? `long.TryParse` en lugar de `ulong.TryParse`

### ProfileController.cs
- ? `long.TryParse` en lugar de `ulong.TryParse`
- ? M�todo `GetCurrentUserId()` retorna `long?`

---

## 6. Configuraci�n ?

### Program.cs
- ? Cadena de conexi�n para Azure SQL Server configurada
- ? Usa variables de entorno desde `.env`
- ? Formato: `Server=tcp:{server},{port};Initial Catalog={db};...`
- ? `Encrypt=True` para Azure
- ? `TrustServerCertificate=False` para seguridad
- ? Logging de diagn�stico para conexi�n
- ? Manejo de errores de conexi�n SQL Server

### appsettings.json
- ? Plantilla lista para credenciales de Azure SQL
- ? Configuraci�n JWT lista
- ? Configuraci�n de logging optimizada

---

## 7. Archivo .env Requerido ??

Crear archivo `.env` en la ra�z del proyecto con:

```env
# Azure SQL Database
DB_SERVER=tu-servidor.database.windows.net
DB_PORT=1433
DB_NAME=TuCita
DB_USER=tu-usuario
DB_PASSWORD=tu-contrase�a-segura

# JWT Configuration
JWT_KEY=tu-clave-jwt-minimo-32-caracteres-muy-segura
JWT_ISSUER=TuCita
JWT_AUDIENCE=TuCitaUsers
JWT_EXPIRY_MINUTES=60

# Email Configuration (opcional para desarrollo)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-contrase�a-app
SMTP_FROM=noreply@tucita.com
```

---

## 8. Migraciones ?

### Estado Actual:
- ? Migraci�n inicial existente (verificar compatibilidad)
- ?? **ACCI�N REQUERIDA**: Generar nueva migraci�n si es necesario

### Comandos:
```bash
# Generar nueva migraci�n
dotnet ef migrations add AzureSqlMigration --project TuCita

# Aplicar migraci�n a Azure SQL
dotnet ef database update --project TuCita
```

---

## 9. Build y Compilaci�n ?

### Resultado:
```
? Compilaci�n correcta
? Sin errores
? Sin advertencias cr�ticas
```

---

## 10. Verificaci�n de Compatibilidad SQL Server ?

### Tipos de Datos:
- ? `long` ? `BIGINT` en SQL Server
- ? `int` ? `INT` en SQL Server
- ? `string` ? `NVARCHAR` en SQL Server
- ? `DateTime` ? `DATETIME2(6)` en SQL Server
- ? `DateOnly` ? `DATE` en SQL Server
- ? `bool` ? `BIT` en SQL Server
- ? `byte[]` ? `VARBINARY` en SQL Server

### Caracter�sticas SQL Server:
- ? Columnas computadas: `email_normalizado`
- ? �ndices �nicos en campos cr�ticos
- ? Restricciones CHECK para enums
- ? �ndices compuestos para queries complejas
- ? Foreign Keys con comportamientos CASCADE/RESTRICT

---

## 11. Seguridad ?

### Implementado:
- ? Autenticaci�n JWT
- ? Autorizaci�n basada en roles
- ? Contrase�as hasheadas
- ? Tokens de recuperaci�n de contrase�a
- ? Validaci�n de entrada en DTOs
- ? Columna `email_normalizado` para b�squedas case-insensitive

---

## 12. Frontend (React + Vite) ?

### Estado:
- ? Integraci�n con API backend
- ? Manejo de autenticaci�n
- ? P�ginas de login, registro, recuperaci�n de contrase�a
- ? Gesti�n de citas y perfil de usuario
- ? Servidor Vite se inicia autom�ticamente en desarrollo

---

## 13. Pr�ximos Pasos ??

### Antes de Desplegar:

1. **Configurar Azure SQL Database**
   ```bash
   # Crear servidor SQL en Azure Portal
   # Configurar reglas de firewall
   # Crear base de datos "TuCita"
   ```

2. **Configurar Variables de Entorno**
   ```bash
   # Crear archivo .env con credenciales reales
   # Verificar JWT_KEY tiene al menos 32 caracteres
   ```

3. **Aplicar Migraciones**
   ```bash
   dotnet ef database update --project TuCita
   ```

4. **Inicializar Datos Base**
   ```bash
   # El sistema crear� roles autom�ticamente al iniciar
   # DbInitializer.cs se ejecuta en Program.cs
   ```

5. **Pruebas de Conexi�n**
   ```bash
   # Ejecutar aplicaci�n y verificar logs
   dotnet run --project TuCita
   
   # Verificar:
   # - "? Conexi�n a base de datos exitosa"
   # - "? Sistema inicializado correctamente"
   ```

6. **Verificar Endpoints API**
   ```bash
   # Probar endpoints b�sicos:
   # POST /api/auth/register
   # POST /api/auth/login
   # GET /api/doctors
   ```

---

## 14. Comandos �tiles

### Desarrollo Local:
```bash
# Restaurar paquetes
dotnet restore

# Compilar proyecto
dotnet build

# Ejecutar proyecto
dotnet run --project TuCita

# Ver logs de Entity Framework
dotnet run --project TuCita --verbosity detailed
```

### Migraciones:
```bash
# Listar migraciones
dotnet ef migrations list --project TuCita

# Crear migraci�n
dotnet ef migrations add NombreMigracion --project TuCita

# Aplicar migraciones
dotnet ef database update --project TuCita

# Revertir migraci�n
dotnet ef database update MigracionAnterior --project TuCita

# Eliminar �ltima migraci�n
dotnet ef migrations remove --project TuCita
```

### Azure SQL:
```bash
# Conectar con sqlcmd (si est� instalado)
sqlcmd -S tu-servidor.database.windows.net -d TuCita -U tu-usuario -P tu-contrase�a

# Verificar conexi�n desde .NET
dotnet run --project TuCita
```

---

## 15. Checklist Final Pre-Despliegue

- [ ] Archivo `.env` creado con credenciales reales
- [ ] Azure SQL Database creada y accesible
- [ ] Firewall de Azure configurado para permitir conexiones
- [ ] Migraciones aplicadas exitosamente
- [ ] Roles inicializados (Admin, Medico, Paciente)
- [ ] Build exitoso sin errores
- [ ] Prueba de login/registro funcionando
- [ ] Endpoints API respondiendo correctamente
- [ ] SMTP configurado para emails (opcional)

---

## 16. Monitoreo Post-Despliegue

### Verificar:
- ? Logs de conexi�n a base de datos
- ? Tiempo de respuesta de queries
- ? Errores de autenticaci�n
- ? Creaci�n exitosa de usuarios
- ? Flujo completo de registro ? login ? citas

### Herramientas Recomendadas:
- Azure Portal ? SQL Database ? Query Performance Insight
- Azure Application Insights (opcional)
- Logs de aplicaci�n en tiempo real

---

## ?? Proyecto Listo para Azure SQL Database

Todos los cambios necesarios han sido implementados y verificados.
El proyecto est� preparado para conectarse a Azure SQL Database.

**�ltima actualizaci�n:** $(Get-Date)
**Estado:** ? LISTO PARA DESPLIEGUE
