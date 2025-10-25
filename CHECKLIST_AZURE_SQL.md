# ? Checklist de Preparación para Azure SQL Database

## Estado Final: LISTO PARA DESPLIEGUE ?

---

## 1. Modelos de Datos ?

### DatabaseModels.cs
- ? Todos los IDs cambiados de `ulong` a `long`
- ? Campos `Ciudad`, `Provincia`, `Pais` eliminados de `PerfilMedico`
- ? Solo queda `Direccion` (string, 200 caracteres)
- ? Todos los enums configurados correctamente (`EstadoTurno`, `EstadoCita`)
- ? Relaciones de navegación correctamente definidas
- ? Atributos de columna SQL Server compatibles

---

## 2. DbContext ?

### TuCitaDbContext.cs
- ? Configuración de claves compuestas
- ? Enums como strings con conversión automática
- ? Columna computada `EmailNormalizado` para SQL Server
- ? Precisión DateTime configurada como `datetime2(6)`
- ? Campos de texto largo como `NVARCHAR(MAX)`
- ? Restricciones de eliminación (`CASCADE`, `RESTRICT`) según diseño
- ? Índices de performance configurados
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
- ? Métodos con parámetros `long` en lugar de `ulong`
- ? Referencias a `CiudadMedico` eliminadas
- ? Lógica de creación, cancelación y actualización de citas correcta

### DoctorsService.cs
- ? Métodos con parámetros `long`
- ? Filtrado por ubicación usando solo `Direccion`
- ? Referencias a `Ciudad`, `Provincia`, `Pais` eliminadas
- ? `Location` usa directamente `Direccion`

### AuthService.cs
- ? IDs como `long`
- ? Generación de tokens JWT correcta
- ? Validación de usuarios activos

### ProfileService.cs
- ? IDs como `long`
- ? Actualización de perfil sin campos obsoletos

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
- ? Método `GetCurrentUserId()` retorna `long?`

---

## 6. Configuración ?

### Program.cs
- ? Cadena de conexión para Azure SQL Server configurada
- ? Usa variables de entorno desde `.env`
- ? Formato: `Server=tcp:{server},{port};Initial Catalog={db};...`
- ? `Encrypt=True` para Azure
- ? `TrustServerCertificate=False` para seguridad
- ? Logging de diagnóstico para conexión
- ? Manejo de errores de conexión SQL Server

### appsettings.json
- ? Plantilla lista para credenciales de Azure SQL
- ? Configuración JWT lista
- ? Configuración de logging optimizada

---

## 7. Archivo .env Requerido ??

Crear archivo `.env` en la raíz del proyecto con:

```env
# Azure SQL Database
DB_SERVER=tu-servidor.database.windows.net
DB_PORT=1433
DB_NAME=TuCita
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña-segura

# JWT Configuration
JWT_KEY=tu-clave-jwt-minimo-32-caracteres-muy-segura
JWT_ISSUER=TuCita
JWT_AUDIENCE=TuCitaUsers
JWT_EXPIRY_MINUTES=60

# Email Configuration (opcional para desarrollo)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-app
SMTP_FROM=noreply@tucita.com
```

---

## 8. Migraciones ?

### Estado Actual:
- ? Migración inicial existente (verificar compatibilidad)
- ?? **ACCIÓN REQUERIDA**: Generar nueva migración si es necesario

### Comandos:
```bash
# Generar nueva migración
dotnet ef migrations add AzureSqlMigration --project TuCita

# Aplicar migración a Azure SQL
dotnet ef database update --project TuCita
```

---

## 9. Build y Compilación ?

### Resultado:
```
? Compilación correcta
? Sin errores
? Sin advertencias críticas
```

---

## 10. Verificación de Compatibilidad SQL Server ?

### Tipos de Datos:
- ? `long` ? `BIGINT` en SQL Server
- ? `int` ? `INT` en SQL Server
- ? `string` ? `NVARCHAR` en SQL Server
- ? `DateTime` ? `DATETIME2(6)` en SQL Server
- ? `DateOnly` ? `DATE` en SQL Server
- ? `bool` ? `BIT` en SQL Server
- ? `byte[]` ? `VARBINARY` en SQL Server

### Características SQL Server:
- ? Columnas computadas: `email_normalizado`
- ? Índices únicos en campos críticos
- ? Restricciones CHECK para enums
- ? Índices compuestos para queries complejas
- ? Foreign Keys con comportamientos CASCADE/RESTRICT

---

## 11. Seguridad ?

### Implementado:
- ? Autenticación JWT
- ? Autorización basada en roles
- ? Contraseñas hasheadas
- ? Tokens de recuperación de contraseña
- ? Validación de entrada en DTOs
- ? Columna `email_normalizado` para búsquedas case-insensitive

---

## 12. Frontend (React + Vite) ?

### Estado:
- ? Integración con API backend
- ? Manejo de autenticación
- ? Páginas de login, registro, recuperación de contraseña
- ? Gestión de citas y perfil de usuario
- ? Servidor Vite se inicia automáticamente en desarrollo

---

## 13. Próximos Pasos ??

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
   # El sistema creará roles automáticamente al iniciar
   # DbInitializer.cs se ejecuta en Program.cs
   ```

5. **Pruebas de Conexión**
   ```bash
   # Ejecutar aplicación y verificar logs
   dotnet run --project TuCita
   
   # Verificar:
   # - "? Conexión a base de datos exitosa"
   # - "? Sistema inicializado correctamente"
   ```

6. **Verificar Endpoints API**
   ```bash
   # Probar endpoints básicos:
   # POST /api/auth/register
   # POST /api/auth/login
   # GET /api/doctors
   ```

---

## 14. Comandos Útiles

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

# Crear migración
dotnet ef migrations add NombreMigracion --project TuCita

# Aplicar migraciones
dotnet ef database update --project TuCita

# Revertir migración
dotnet ef database update MigracionAnterior --project TuCita

# Eliminar última migración
dotnet ef migrations remove --project TuCita
```

### Azure SQL:
```bash
# Conectar con sqlcmd (si está instalado)
sqlcmd -S tu-servidor.database.windows.net -d TuCita -U tu-usuario -P tu-contraseña

# Verificar conexión desde .NET
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
- ? Logs de conexión a base de datos
- ? Tiempo de respuesta de queries
- ? Errores de autenticación
- ? Creación exitosa de usuarios
- ? Flujo completo de registro ? login ? citas

### Herramientas Recomendadas:
- Azure Portal ? SQL Database ? Query Performance Insight
- Azure Application Insights (opcional)
- Logs de aplicación en tiempo real

---

## ?? Proyecto Listo para Azure SQL Database

Todos los cambios necesarios han sido implementados y verificados.
El proyecto está preparado para conectarse a Azure SQL Database.

**Última actualización:** $(Get-Date)
**Estado:** ? LISTO PARA DESPLIEGUE
