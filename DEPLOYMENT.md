# ?? Guía de Despliegue de TuCita en Heroku

## ?? Requisitos Previos

- Cuenta de Heroku (https://heroku.com)
- Heroku CLI instalado (https://devcenter.heroku.com/articles/heroku-cli)
- Git instalado
- Dominio www.tucitaonline.org configurado

## ?? Configuración Inicial de Heroku

### 1. Crear la aplicación en Heroku

```bash
# Login en Heroku
heroku login

# Crear la aplicación
heroku create tucita-app --region us

# Configurar el stack para usar Docker
heroku stack:set container -a tucita-app
```

### 2. Configurar Variables de Entorno

```bash
# Base de datos
heroku config:set DB_SERVER=tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com -a tucita-app
heroku config:set DB_PORT=1433 -a tucita-app
heroku config:set DB_NAME=tco_db -a tucita-app
heroku config:set DB_USER=tcoadmin -a tucita-app
heroku config:set DB_PASSWORD=TCO2025** -a tucita-app

# JWT Settings
heroku config:set JWT_KEY=your-secure-jwt-key-minimum-32-characters-long -a tucita-app
heroku config:set JWT_ISSUER=TuCita -a tucita-app
heroku config:set JWT_AUDIENCE=TuCitaUsers -a tucita-app

# AWS S3 (para almacenamiento de archivos)
heroku config:set AWS_ACCESS_KEY_ID=your-aws-access-key -a tucita-app
heroku config:set AWS_SECRET_ACCESS_KEY=your-aws-secret-key -a tucita-app
heroku config:set AWS_REGION=us-east-1 -a tucita-app
heroku config:set AWS_S3_BUCKET=your-bucket-name -a tucita-app

# Email Settings (opcional, para notificaciones)
heroku config:set SMTP_SERVER=smtp.gmail.com -a tucita-app
heroku config:set SMTP_PORT=587 -a tucita-app
heroku config:set SMTP_USERNAME=your-email@gmail.com -a tucita-app
heroku config:set SMTP_PASSWORD=your-app-password -a tucita-app

# Ambiente
heroku config:set ASPNETCORE_ENVIRONMENT=Production -a tucita-app
```

### 3. Configurar el Dominio Personalizado

```bash
# Agregar el dominio a Heroku
heroku domains:add www.tucitaonline.org -a tucita-app
heroku domains:add tucitaonline.org -a tucita-app

# Ver los DNS targets de Heroku
heroku domains -a tucita-app
```

**IMPORTANTE**: Toma nota de los DNS targets que Heroku te proporciona (algo como `xxx-yyy-zzz.herokudns.com`)

### 4. Configurar DNS en tu Proveedor de Dominio

En el panel de administración de tu dominio (tucitaonline.org), configura:

#### Opción A: Usar CNAME (Recomendado)
```
Tipo: CNAME
Host: www
Valor: [el DNS target de Heroku, ej: xxx-yyy.herokudns.com]
TTL: 3600
```

#### Opción B: Usar ALIAS/ANAME (si tu proveedor lo soporta)
```
Tipo: ALIAS o ANAME
Host: @
Valor: [el DNS target de Heroku]
TTL: 3600
```

#### Redirección de dominio raíz
```
Tipo: URL Redirect
De: tucitaonline.org
A: https://www.tucitaonline.org
```

## ?? Despliegue

### Método 1: Usando Script Automático (Windows - Recomendado)

```bash
# 1. Ejecutar script de configuración
deploy-to-heroku.bat

# 2. Seguir las instrucciones en pantalla
# El script configurará todo automáticamente

# 3. Después del script, desplegar
git add .
git commit -m "Preparar para despliegue en Heroku"
git push heroku master
```

### Método 2: Despliegue Manual desde Git

```bash
# Asegúrate de estar en la raíz del proyecto
cd /path/to/TuCita

# Agregar el remote de Heroku (si no está agregado)
heroku git:remote -a tucita-app

# Commit de los cambios
git add .
git commit -m "Preparar para despliegue en Heroku"

# Push a Heroku (esto iniciará el build automático)
git push heroku master
```

### Verificar el Despliegue

```bash
# Ver logs en tiempo real
heroku logs --tail -a tucita-app

# Abrir la aplicación
heroku open -a tucita-app

# Ver status
heroku ps -a tucita-app
```

## ?? Troubleshooting

### Problema: La aplicación no inicia

```bash
# Ver logs detallados
heroku logs --tail -a tucita-app

# Verificar variables de entorno
heroku config -a tucita-app

# Revisar el estado de los dynos
heroku ps -a tucita-app

# Reiniciar la aplicación
heroku restart -a tucita-app
```

### Problema: Error de conexión a base de datos

```bash
# Verificar variables de BD
heroku config:get DB_SERVER -a tucita-app
heroku config:get DB_NAME -a tucita-app

# Verificar conectividad desde Heroku
heroku run bash -a tucita-app
# Dentro del dyno:
# curl -v telnet://tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com:1433
```

### Problema: Build falla

```bash
# Limpiar cache de build
heroku builds:cache:purge -a tucita-app

# Ver historial de builds
heroku builds -a tucita-app

# Rebuild
git commit --allow-empty -m "Rebuild"
git push heroku master
```

### Problema: El dominio no resuelve

1. Verifica que los registros DNS estén correctamente configurados
2. Espera 24-48 horas para propagación DNS completa
3. Verifica con: `nslookup www.tucitaonline.org`
4. Usa herramientas como: https://dnschecker.org/

## ?? SSL/HTTPS

Heroku proporciona SSL gratuito para dominios personalizados:

```bash
# Heroku ACM (Automated Certificate Management) se activa automáticamente
# Verificar estado del certificado
heroku certs:auto -a tucita-app

# Forzar HTTPS en la aplicación (ya configurado en Program.cs)
```

## ?? Monitoreo

### Métricas de la aplicación

```bash
# Ver métricas
heroku metrics -a tucita-app

# Ver uso de dynos
heroku ps -a tucita-app
```

### Logs

```bash
# Logs en tiempo real
heroku logs --tail -a tucita-app

# Ver últimos 1000 logs
heroku logs -n 1000 -a tucita-app

# Filtrar logs por tipo
heroku logs --source app -a tucita-app
```

## ?? Actualizaciones

Para actualizar la aplicación:

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"

# Desplegar
git push heroku master

# Verificar
heroku logs --tail -a tucita-app
```

## ?? Escalado (Opcional)

```bash
# Ver plan actual
heroku ps -a tucita-app

# Escalar dynos (requiere plan de pago)
heroku ps:scale web=2 -a tucita-app

# Cambiar tipo de dyno
heroku ps:type hobby -a tucita-app
```

## ?? Seguridad

### Secrets y Variables Sensibles

- ? Nunca commits archivos `.env` al repositorio
- ? Usa `heroku config:set` para todas las variables sensibles
- ? Rota las credenciales regularmente
- ? Usa contraseñas fuertes para JWT_KEY

### Firewall de Base de Datos

Asegúrate de que el firewall de AWS RDS permita conexiones desde Heroku:

1. Ve a AWS RDS Console
2. Selecciona tu instancia
3. Seguridad ? Security Groups
4. Agrega regla de entrada para puertos 1433 desde `0.0.0.0/0` (o IPs específicas de Heroku)

## ?? Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos accesible desde Heroku
- [ ] DNS configurado correctamente
- [ ] SSL configurado
- [ ] Logs funcionando
- [ ] Build exitoso localmente
- [ ] Frontend compilado correctamente
- [ ] Migraciones de BD aplicadas
- [ ] Credenciales rotadas y seguras

## ?? URLs de la Aplicación

- Desarrollo: http://localhost:5000
- Heroku: https://tucita-app.herokuapp.com
- Producción: https://www.tucitaonline.org

## ?? Soporte

Si encuentras problemas:
1. Revisa los logs: `heroku logs --tail -a tucita-app`
2. Consulta la documentación de Heroku: https://devcenter.heroku.com
3. Verifica el status de Heroku: https://status.heroku.com

---

**Última actualización**: 2024
**Versión**: 1.0
