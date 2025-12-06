# ?? Guía Rápida de Comandos - TuCita

## ?? Comandos Rápidos de Despliegue

### Primer Despliegue

```bash
# 1. Configurar Heroku (interactivo)
chmod +x setup-heroku.sh
./setup-heroku.sh tucita-app

# 2. Desplegar
git add .
git commit -m "Preparar para producción"
git push heroku master

# 3. Verificar
heroku logs --tail -a tucita-app
heroku open -a tucita-app
```

### Actualizar Aplicación

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push heroku master

# Ver logs
heroku logs --tail -a tucita-app
```

## ?? Comandos de Heroku

### Gestión de la App

```bash
# Ver información de la app
heroku apps:info -a tucita-app

# Ver estado de los dynos
heroku ps -a tucita-app

# Reiniciar la aplicación
heroku restart -a tucita-app

# Escalar dynos (requiere plan de pago)
heroku ps:scale web=1 -a tucita-app

# Abrir en navegador
heroku open -a tucita-app
```

### Variables de Entorno

```bash
# Ver todas las variables
heroku config -a tucita-app

# Establecer una variable
heroku config:set VARIABLE=valor -a tucita-app

# Obtener una variable específica
heroku config:get DB_SERVER -a tucita-app

# Eliminar una variable
heroku config:unset VARIABLE -a tucita-app

# Establecer múltiples variables
heroku config:set \
  DB_SERVER=servidor \
  DB_NAME=basedatos \
  DB_USER=usuario \
  -a tucita-app
```

### Logs y Debugging

```bash
# Ver logs en tiempo real
heroku logs --tail -a tucita-app

# Ver últimos 1000 logs
heroku logs -n 1000 -a tucita-app

# Filtrar logs por fuente
heroku logs --source app -a tucita-app
heroku logs --source heroku -a tucita-app

# Ver solo errores
heroku logs --tail | grep -i error

# Ejecutar bash en el dyno
heroku run bash -a tucita-app

# Ejecutar comando en el dyno
heroku run dotnet --version -a tucita-app
```

### Dominios

```bash
# Ver dominios configurados
heroku domains -a tucita-app

# Agregar dominio
heroku domains:add www.tucitaonline.org -a tucita-app
heroku domains:add tucitaonline.org -a tucita-app

# Eliminar dominio
heroku domains:remove www.tucitaonline.org -a tucita-app

# Ver información de DNS
heroku domains:wait www.tucitaonline.org -a tucita-app
```

### SSL/Certificados

```bash
# Ver estado de SSL automático
heroku certs:auto -a tucita-app

# Ver información detallada del certificado
heroku certs:auto:info -a tucita-app

# Forzar renovación del certificado
heroku certs:auto:refresh -a tucita-app

# Habilitar SSL automático (si está deshabilitado)
heroku certs:auto:enable -a tucita-app
```

### Builds

```bash
# Ver historial de builds
heroku builds -a tucita-app

# Información de un build específico
heroku builds:info BUILD_ID -a tucita-app

# Limpiar caché de build
heroku builds:cache:purge -a tucita-app

# Cancelar build en progreso
heroku builds:cancel -a tucita-app
```

## ?? Comandos de Desarrollo Local

### Backend (.NET)

```bash
# Ejecutar en modo desarrollo
cd TuCita
dotnet run

# Ejecutar con auto-reload
dotnet watch run

# Compilar
dotnet build

# Publicar
dotnet publish -c Release -o ./publish

# Limpiar build
dotnet clean

# Restaurar paquetes
dotnet restore

# Ejecutar migraciones (si las hay)
dotnet ef database update

# Crear migración
dotnet ef migrations add NombreMigracion
```

### Frontend (React + Vite)

```bash
cd TuCita/ClientApp

# Instalar dependencias
npm install

# Desarrollo (con hot reload)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Type checking
npm run type-check

# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
```

## ?? Comandos de Docker

### Build Local

```bash
# Build de la imagen
docker build -t tucita-app .

# Ejecutar contenedor localmente
docker run -p 8080:8080 \
  -e DB_SERVER=servidor \
  -e DB_NAME=basedatos \
  -e DB_USER=usuario \
  -e DB_PASSWORD=contraseña \
  -e JWT_KEY=tu-clave-secreta \
  tucita-app

# Ver contenedores en ejecución
docker ps

# Ver logs del contenedor
docker logs -f CONTAINER_ID

# Detener contenedor
docker stop CONTAINER_ID

# Eliminar contenedor
docker rm CONTAINER_ID

# Eliminar imagen
docker rmi tucita-app
```

## ??? Comandos de Base de Datos

### SQL Server (Azure Data Studio / SSMS)

```bash
# Conectar a la base de datos
sqlcmd -S tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com,1433 \
  -d tco_db -U tcoadmin -P 'TCO2025**'

# Backup de base de datos
sqlcmd -Q "BACKUP DATABASE tco_db TO DISK='backup.bak'"

# Ver tablas
sqlcmd -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES"

# Ver citas
sqlcmd -Q "SELECT TOP 10 * FROM Citas"
```

## ?? Comandos de Verificación

### DNS

```bash
# Verificar configuración DNS
nslookup www.tucitaonline.org

# Verificar CNAME
dig www.tucitaonline.org CNAME

# Verificar propagación DNS
curl https://dnschecker.org/all-dns-records-of-domain.php?query=www.tucitaonline.org
```

### SSL/HTTPS

```bash
# Verificar certificado SSL
openssl s_client -connect www.tucitaonline.org:443 -servername www.tucitaonline.org

# Verificar expiración del certificado
echo | openssl s_client -connect www.tucitaonline.org:443 2>/dev/null | openssl x509 -noout -dates

# Verificar cadena de certificados
curl -vI https://www.tucitaonline.org
```

### API

```bash
# Verificar salud de la API
curl https://www.tucitaonline.org/api/health

# Test de autenticación
curl -X POST https://www.tucitaonline.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Test con autenticación
curl https://www.tucitaonline.org/api/appointments/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ?? Comandos de Monitoreo

### Heroku

```bash
# Ver métricas
heroku metrics -a tucita-app

# Ver uso de recursos
heroku ps -a tucita-app

# Ver releases
heroku releases -a tucita-app

# Ver addons
heroku addons -a tucita-app

# Ver información de facturación
heroku billing
```

## ?? Comandos de Git

```bash
# Ver estado
git status

# Agregar cambios
git add .
git add archivo.txt

# Commit
git commit -m "Mensaje descriptivo"

# Push a GitHub
git push origin master

# Push a Heroku
git push heroku master

# Ver remotes
git remote -v

# Agregar remote de Heroku
heroku git:remote -a tucita-app

# Ver historial
git log --oneline

# Ver diferencias
git diff

# Revertir cambios
git checkout -- archivo.txt

# Crear rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout master

# Merge de ramas
git merge feature/nueva-funcionalidad
```

## ?? Comandos de Testing

```bash
# Backend tests (cuando estén implementados)
cd TuCita
dotnet test

# Frontend tests (cuando estén implementados)
cd TuCita/ClientApp
npm test
npm run test:coverage
```

## ??? Troubleshooting Rápido

```bash
# App no inicia - Ver logs
heroku logs --tail -a tucita-app

# Error de build - Limpiar caché
heroku builds:cache:purge -a tucita-app

# Reiniciar app
heroku restart -a tucita-app

# Verificar variables de entorno
heroku config -a tucita-app

# Ejecutar bash para debug
heroku run bash -a tucita-app

# Ver estado de SSL
heroku certs:auto -a tucita-app

# Verificar DNS
nslookup www.tucitaonline.org

# Limpiar build local
dotnet clean
cd ClientApp && rm -rf node_modules dist && npm install
```

## ?? Comandos One-Liners Útiles

```bash
# Deploy rápido
git add . && git commit -m "Update" && git push heroku master

# Ver logs de errores
heroku logs --tail -a tucita-app | grep -i error

# Restart y ver logs
heroku restart -a tucita-app && heroku logs --tail -a tucita-app

# Build local completo
dotnet clean && cd ClientApp && rm -rf dist && npm run build && cd .. && dotnet build

# Ver todas las URLs de la app
echo "Heroku: https://tucita-app.herokuapp.com" && echo "Producción: https://www.tucitaonline.org"
```

---

**Tip**: Guarda este archivo en favoritos para acceso rápido a comandos comunes.
