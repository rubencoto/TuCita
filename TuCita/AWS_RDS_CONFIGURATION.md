# Configuración de AWS RDS SQL Server

## ?? Resumen de Cambios

Se ha actualizado la aplicación para conectarse a AWS RDS SQL Server en lugar de Azure SQL Database.

## ?? Cambios Realizados

### 1. Archivo `.env`

Se actualizaron las variables de entorno de la base de datos:

```env
# Base de Datos - AWS RDS SQL Server (PRODUCCIÓN)
DB_SERVER=tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com
DB_PORT=1433
DB_NAME=tco_db
DB_USER=tcoadmin
DB_PASSWORD=TCO2025**
```

### 2. Archivo `appsettings.json`

Se actualizó la cadena de conexión de respaldo:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com,1433;Initial Catalog=tco_db;User ID=tcoadmin;Password=TCO2025**;Persist Security Info=True;Pooling=False;MultipleActiveResultSets=False;Connect Timeout=30;Encrypt=True;TrustServerCertificate=True;Command Timeout=0"
  }
}
```

### 3. Archivo `Program.cs`

Se actualizó la construcción de la cadena de conexión para:
- Usar el puerto de la variable de entorno `DB_PORT`
- Configurar `TrustServerCertificate=True` para confiar en el certificado SSL de AWS RDS
- Mejorar el logging de diagnóstico

## ?? Configuración de Seguridad SSL

AWS RDS SQL Server usa certificados SSL para conexiones cifradas. La configuración incluye:

- **Encrypt=True**: La conexión está cifrada
- **TrustServerCertificate=True**: Confiar en el certificado del servidor AWS RDS

### Alternativa Más Segura (Opcional)

Para mayor seguridad en producción, puedes descargar el certificado de AWS RDS y validarlo:

1. Descargar el certificado raíz de AWS RDS:
   ```
   https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
   ```

2. Instalar el certificado en el almacén de certificados de Windows

3. Cambiar `TrustServerCertificate=False` en la cadena de conexión

## ?? Parámetros de Conexión

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| **Data Source** | tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com,1433 | Servidor y puerto AWS RDS |
| **Initial Catalog** | tco_db | Nombre de la base de datos |
| **User ID** | tcoadmin | Usuario de la base de datos |
| **Password** | TCO2025** | Contraseña del usuario |
| **Persist Security Info** | True | Mantener información de seguridad |
| **Pooling** | False | Deshabilitar pool de conexiones |
| **MultipleActiveResultSets** | False | No permitir múltiples resultados activos |
| **Connect Timeout** | 30 | Tiempo de espera de conexión (segundos) |
| **Encrypt** | True | Cifrar la conexión |
| **TrustServerCertificate** | True | Confiar en el certificado del servidor |
| **Command Timeout** | 0 | Sin tiempo límite para comandos |

## ?? Pasos para Ejecutar la Aplicación

1. **Verificar las variables de entorno** en el archivo `.env`

2. **Verificar reglas de firewall en AWS RDS**:
   - Asegúrate de que el grupo de seguridad permita conexiones desde tu IP en el puerto 1433
   - AWS Console ? RDS ? Databases ? tcodb ? Connectivity & security ? VPC security groups

3. **Detener la aplicación** si está corriendo en modo debug

4. **Reiniciar la aplicación** para aplicar los cambios:
   ```
   dotnet run
   ```

## ? Verificación de Conexión

Al iniciar la aplicación, verás en los logs:

```
?? Configuración de conexión AWS RDS SQL Server:
   Servidor: tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com:1433
   Base de datos: tco_db
   Usuario: tcoadmin
   Contraseña configurada: True (longitud: 9)
   Encrypt: True
   TrustServerCertificate: True
```

Si la conexión es exitosa:
```
?? Inicializando sistema...
? Sistema inicializado correctamente
```

## ? Solución de Problemas

### Error: "La cadena de certificación fue emitida por una entidad en la que no se confía"

**Solución**: Ya está aplicada con `TrustServerCertificate=True`

### Error: "A network-related or instance-specific error occurred"

**Posibles causas**:
1. El grupo de seguridad de AWS RDS no permite conexiones desde tu IP
2. El servidor RDS no está disponible
3. El puerto 1433 está bloqueado

**Solución**:
- Verificar reglas de firewall en AWS Console
- Verificar que el RDS esté en estado "Available"
- Verificar que no haya firewall local bloqueando el puerto 1433

### Error: "Login failed for user 'tcoadmin'"

**Solución**: Verificar las credenciales en el archivo `.env`

## ?? Notas Importantes

- ?? **Nunca subir el archivo `.env` a Git** (ya está en `.gitignore`)
- ?? Las contraseñas están en texto plano en `.env` por simplicidad de desarrollo
- ?? Para producción, considera usar AWS Secrets Manager o Azure Key Vault
- ?? AWS RDS puede generar costos, asegúrate de monitorear el uso

## ?? Migración de Datos

Si tienes datos en Azure SQL Database y quieres migrarlos a AWS RDS:

1. **Exportar datos de Azure SQL**:
   ```sql
   -- Generar script de datos
   ```

2. **Importar a AWS RDS**:
   ```sql
   -- Ejecutar script en AWS RDS
   ```

O usar herramientas como:
- SQL Server Management Studio (SSMS)
- Azure Data Studio
- AWS Database Migration Service (DMS)
