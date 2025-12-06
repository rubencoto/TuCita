# ?? Guía SIMPLE para Desplegar TuCita (Sin saber Docker)

## ? Lo que necesitas saber

**CERO conocimiento de Docker necesario.** Todo es automático.

---

## ?? Antes de Empezar

### 1. Instalar Heroku CLI

**Windows:**
```
1. Descarga: https://devcenter.heroku.com/articles/heroku-cli
2. Ejecuta el instalador
3. Reinicia la terminal/CMD
4. Verifica: heroku --version
```

**¿Ya tienes Git instalado?** ? Sí (lo usas con GitHub)

---

## ?? Despliegue en 3 Pasos

### ? OPCIÓN 1: Usando el Script Automático (RECOMENDADO)

```sh
# 1. Abre CMD en la raíz del proyecto (donde está TuCita.sln)
cd C:\Users\ruben\source\repos\rubencoto\TuCita

# 2. Ejecuta el script
deploy-to-heroku.bat

# 3. Sigue las instrucciones en pantalla
```

**El script hace TODO automáticamente:**
- ? Verifica que Heroku CLI esté instalado
- ? Inicia sesión en Heroku
- ? Crea la aplicación
- ? Configura Docker (automático)
- ? Configura variables de entorno
- ? Agrega dominios
- ? Prepara todo para el push

**Cuando el script termine, ejecuta:**
```sh
git add .
git commit -m "Preparar para producción"
git push heroku master
```

---

### ?? OPCIÓN 2: Paso a Paso Manual

#### Paso 1: Login a Heroku
```sh
heroku login
# Se abrirá tu navegador para iniciar sesión
```

#### Paso 2: Crear la App
```sh
heroku create tucita-app --region us
```

#### Paso 3: Configurar Docker Stack
```sh
heroku stack:set container -a tucita-app
```

#### Paso 4: Configurar Variables de Entorno
```sh
# Base de datos
heroku config:set DB_SERVER=tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com -a tucita-app
heroku config:set DB_PORT=1433 -a tucita-app
heroku config:set DB_NAME=tco_db -a tucita-app
heroku config:set DB_USER=tcoadmin -a tucita-app
heroku config:set DB_PASSWORD=TCO2025** -a tucita-app

# JWT
heroku config:set JWT_KEY=tu-clave-secreta-minimo-32-caracteres-long -a tucita-app
heroku config:set JWT_ISSUER=TuCita -a tucita-app
heroku config:set JWT_AUDIENCE=TuCitaUsers -a tucita-app

# AWS S3 (si lo usas)
heroku config:set AWS_ACCESS_KEY_ID=tu-key -a tucita-app
heroku config:set AWS_SECRET_ACCESS_KEY=tu-secret -a tucita-app
heroku config:set AWS_REGION=us-east-1 -a tucita-app

# Ambiente
heroku config:set ASPNETCORE_ENVIRONMENT=Production -a tucita-app
```

#### Paso 5: Agregar Dominios
```sh
heroku domains:add www.tucitaonline.org -a tucita-app
heroku domains:add tucitaonline.org -a tucita-app
```

#### Paso 6: Configurar Git
```sh
heroku git:remote -a tucita-app
```

#### Paso 7: Desplegar
```sh
git add .
git commit -m "Preparar para producción"
git push heroku master
```

---

## ?? ¿Qué Pasa Cuando Haces `git push heroku master`?

```
1. Git envía tu código a Heroku
   ?? Heroku recibe: Dockerfile, heroku.yml, código

2. Heroku detecta heroku.yml
   ?? "Ah, esta app usa Docker"

3. Heroku lee el Dockerfile
   ?? Instrucciones de cómo construir la app

4. Heroku construye el contenedor (automático)
   ?? Instala Node.js 20
   ?? Compila el frontend (React + Vite)
   ?? Instala .NET 8
   ?? Compila el backend (ASP.NET Core)
   ?? Crea una imagen optimizada

5. Heroku ejecuta el contenedor
   ?? Tu app está en línea! ??
```

**TÚ NO HACES NADA DE DOCKER.** Es todo automático.

---

## ?? Verificar el Despliegue

### Ver Logs en Tiempo Real
```sh
heroku logs --tail -a tucita-app
```

### Abrir la App en el Navegador
```sh
heroku open -a tucita-app
```

### Ver Estado de la App
```sh
heroku ps -a tucita-app
```

### Ver Variables de Entorno
```sh
heroku config -a tucita-app
```

---

## ?? Actualizar la Aplicación (Después del Primer Despliegue)

### ? Opción Rápida: Usar el Script
```sh
update-app.bat
```

### ?? Opción Manual:
```sh
# 1. Hacer cambios en el código
# 2. Commit
git add .
git commit -m "Descripción de cambios"

# 3. Push a Heroku (esto reconstruye y redespliega automáticamente)
git push heroku master

# 4. Ver logs
heroku logs --tail -a tucita-app
```

**Cada vez que haces `git push heroku master`, Heroku:**
1. Reconstruye el contenedor Docker (automático)
2. Despliega la nueva versión
3. Reinicia la app

**Tiempo total: 5-10 minutos**

---

## ?? Configurar el Dominio

### Paso 1: Obtener DNS Target
```sh
heroku domains -a tucita-app
```

Verás algo como:
```
www.tucitaonline.org  ?  xxx-yyy-zzz.herokudns.com
```

### Paso 2: Configurar en tu Proveedor de DNS

En el panel de tu dominio (GoDaddy, Namecheap, etc.):

```
Tipo: CNAME
Host: www
Valor: xxx-yyy-zzz.herokudns.com
TTL: 3600
```

**Ver guía completa:** `DOMAIN-SETUP.md`

---

## ? Preguntas Frecuentes

### ¿Necesito instalar Docker en mi PC?
**NO.** Heroku lo maneja en sus servidores.

### ¿Cómo funciona Docker entonces?
Heroku lee tu `Dockerfile`, construye el contenedor en la nube, y lo ejecuta. Tú solo haces `git push`.

### ¿Qué archivos son importantes?
- `Dockerfile` ? Instrucciones de build (YA CREADO ?)
- `heroku.yml` ? Configuración de Heroku (YA CREADO ?)
- `.dockerignore` ? Archivos a ignorar (YA CREADO ?)
- `Procfile` ? Comando de inicio (YA CREADO ?)

**NO los modifiques.** Ya están optimizados.

### ¿Puedo ver el contenedor Docker localmente?
Sí, pero NO es necesario. Si quieres:
```sh
# Instalar Docker Desktop
# Luego:
docker build -t tucita-test .
docker run -p 8080:8080 tucita-test
```

Pero para desarrollo normal, sigue usando:
```sh
cd TuCita
dotnet run
```

### ¿Cómo veo los errores?
```sh
heroku logs --tail -a tucita-app
```

### ¿Cómo reinicio la app?
```sh
heroku restart -a tucita-app
```

---

## ?? Resumen de Comandos Esenciales

```sh
# Primera vez (setup)
deploy-to-heroku.bat

# Desplegar/Actualizar
git add .
git commit -m "mensaje"
git push heroku master

# Ver logs
heroku logs --tail -a tucita-app

# Abrir app
heroku open -a tucita-app

# Reiniciar
heroku restart -a tucita-app

# Ver variables
heroku config -a tucita-app

# Ver dominios
heroku domains -a tucita-app
```

---

## ?? Solución de Problemas

### Build falla
```sh
# Limpiar caché
heroku builds:cache:purge -a tucita-app

# Intentar de nuevo
git push heroku master
```

### App no inicia
```sh
# Ver logs
heroku logs --tail -a tucita-app

# Verificar variables
heroku config -a tucita-app

# Reiniciar
heroku restart -a tucita-app
```

### Error de base de datos
```sh
# Verificar variables
heroku config:get DB_SERVER -a tucita-app
heroku config:get DB_NAME -a tucita-app

# Verificar que AWS RDS permite conexiones desde Heroku
# (configurar firewall en AWS)
```

---

## ? Checklist de Despliegue

- [ ] Heroku CLI instalado
- [ ] Sesión iniciada (`heroku login`)
- [ ] App creada en Heroku
- [ ] Stack configurado a `container`
- [ ] Variables de entorno configuradas
- [ ] Dominios agregados
- [ ] Git remote configurado
- [ ] Código en Git (`git add .`, `git commit`)
- [ ] Push a Heroku (`git push heroku master`)
- [ ] DNS configurado
- [ ] SSL activo (automático después de DNS)

---

## ?? Ayuda Adicional

- **Documentación completa**: Ver `DEPLOYMENT.md`
- **Configuración DNS**: Ver `DOMAIN-SETUP.md`
- **Comandos útiles**: Ver `QUICK-COMMANDS.md`
- **Logs de Heroku**: `heroku logs --tail -a tucita-app`

---

## ?? ¡Listo!

Una vez completado:
- ? Tu app estará en: https://www.tucitaonline.org
- ? SSL automático activado
- ? Base de datos conectada
- ? Todo funcionando en producción

**Tiempo total del proceso: 30-45 minutos**

(La mayor parte es esperar que DNS se propague)
