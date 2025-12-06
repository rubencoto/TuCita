# ?? Estructura de Archivos del Proyecto TuCita

## ?? Archivos Esenciales para Heroku

### Configuración de Despliegue (Raíz del Proyecto)
```
TuCita/
??? Dockerfile                          ? Build de Docker (multi-stage)
??? heroku.yml                          ? Configuración de Heroku
??? .dockerignore                       ? Optimización de build
??? Procfile                            ? Comando de ejecución
??? .env.example                        ? Plantilla de variables
```

**?? NO MODIFICAR** estos archivos - Ya están optimizados para producción.

---

## ??? Scripts de Automatización (Windows)

### Scripts de Despliegue
```
??? deploy-to-heroku.bat               ?? Setup inicial (ejecutar una vez)
??? update-app.bat                     ?? Actualizar app
??? verify-deployment.bat              ? Verificar despliegue
```

**Uso:**
- **Primera vez**: `deploy-to-heroku.bat`
- **Actualizar**: `update-app.bat`
- **Verificar**: `verify-deployment.bat`

---

## ?? Documentación

### Guías de Usuario
```
??? GUIA-SIMPLE-HEROKU.md              ? EMPIEZA AQUÍ - Guía para principiantes
??? CHEATSHEET.md                      ?? Comandos rápidos visuales
??? DEPLOYMENT.md                      ?? Guía técnica completa
??? DOMAIN-SETUP.md                    ?? Configurar dominio personalizado
??? ROUTING.md                         ?? Arquitectura de routing
??? QUICK-COMMANDS.md                  ? Referencia de comandos
??? CHANGELOG.md                       ?? Historial de cambios
??? README.md                          ?? Información general
```

**Orden de lectura recomendado:**
1. `README.md` - Vista general
2. `GUIA-SIMPLE-HEROKU.md` - Cómo desplegar
3. `CHEATSHEET.md` - Comandos rápidos
4. `DOMAIN-SETUP.md` - Configurar dominio

---

## ??? Estructura del Código

### Backend (.NET 8)
```
TuCita/
??? TuCita/
?   ??? Controllers/
?   ?   ??? Api/                       ?? API Controllers
?   ??? Data/
?   ?   ??? TuCitaDbContext.cs        ??? Contexto de BD
?   ?   ??? DbInitializer.cs          ?? Inicialización
?   ??? DTOs/                          ?? Data Transfer Objects
?   ??? Middleware/                    ?? Middleware personalizado
?   ??? Models/                        ??? Modelos de BD
?   ??? Services/                      ?? Lógica de negocio
?   ??? appsettings.json              ?? Config desarrollo
?   ??? appsettings.Production.json   ?? Config producción
?   ??? Program.cs                     ?? Punto de entrada
?   ??? TuCita.csproj                 ?? Configuración del proyecto
```

### Frontend (React + Vite)
```
TuCita/
??? TuCita/
?   ??? ClientApp/
?   ?   ??? src/
?   ?   ?   ??? components/
?   ?   ?   ?   ??? layout/           ?? Navbar, Footer
?   ?   ?   ?   ??? pages/            ?? Páginas principales
?   ?   ?   ?   ?   ??? patient/      ?? Páginas de paciente
?   ?   ?   ?   ?   ??? doctor/       ????? Páginas de doctor
?   ?   ?   ?   ?   ??? admin/        ????? Panel admin
?   ?   ?   ?   ??? ui/               ?? Componentes UI
?   ?   ?   ?   ??? doctor/           ?? Herramientas doctor
?   ?   ?   ??? services/
?   ?   ?   ?   ??? api/              ?? Servicios API
?   ?   ?   ??? lib/                  ??? Utilidades
?   ?   ?   ??? App.tsx               ?? Componente raíz
?   ?   ??? public/                   ??? Archivos estáticos
?   ?   ??? package.json              ?? Dependencias Node
?   ?   ??? vite.config.ts            ?? Config Vite
?   ?   ??? tsconfig.json             ?? Config TypeScript
```

---

## ?? Archivos de Configuración

### Variables de Entorno
```
??? .env                               ?? Variables locales (NO commitear)
??? .env.example                       ?? Plantilla de ejemplo
```

**?? IMPORTANTE:**
- `.env` está en `.gitignore` (nunca se sube a Git)
- `.env.example` es una plantilla segura para compartir
- En producción: usar `heroku config:set`

### Git
```
??? .gitignore                         ?? Archivos a ignorar
??? .git/                              ?? Repositorio Git
```

---

## ?? Archivos Generados (No commitear)

### Backend
```
TuCita/
??? bin/                               ?? Binarios compilados
??? obj/                               ?? Objetos temporales
??? publish/                           ?? Build de publicación
```

### Frontend
```
ClientApp/
??? node_modules/                      ?? Dependencias Node
??? dist/                              ??? Build de producción
??? .cache/                            ?? Caché de Vite
```

**Estos están en `.gitignore` y `.dockerignore`**

---

## ?? Archivos Clave por Función

### Para Desarrollar Localmente
- `TuCita/Program.cs` - Configuración backend
- `TuCita/ClientApp/src/App.tsx` - Configuración frontend
- `TuCita/.env` - Variables de entorno locales

### Para Desplegar a Heroku
- `Dockerfile` - Instrucciones de build
- `heroku.yml` - Configuración Heroku
- `deploy-to-heroku.bat` - Script de setup
- `Procfile` - Comando de inicio

### Para Configurar el Dominio
- `DOMAIN-SETUP.md` - Guía de DNS
- Configuración en Heroku: `heroku domains`

### Para Debuggear
- `verify-deployment.bat` - Verificar estado
- `QUICK-COMMANDS.md` - Comandos útiles
- Logs: `heroku logs --tail -a tucita-app`

---

## ?? Tamaño de Archivos (Aproximado)

```
Código fuente (sin node_modules): ~50 MB
node_modules: ~500 MB
Build Docker final: ~800 MB
Git repository: ~60 MB
```

---

## ?? Flujo de Archivos en Despliegue

```
1. DESARROLLO LOCAL
   ??? Editar código fuente
   ??? TuCita/.env (variables locales)
   ??? dotnet run + npm run dev

2. COMMIT A GIT
   ??? git add .
   ??? git commit -m "mensaje"
   ??? git push origin master (GitHub)

3. DESPLIEGUE A HEROKU
   ??? git push heroku master
   ?
   ??? Heroku lee heroku.yml
   ?   ??? Usa Dockerfile
   ?
   ??? Build Stage 1: Frontend
   ?   ??? package.json
   ?   ??? npm install
   ?   ??? npm run build ? dist/
   ?
   ??? Build Stage 2: Backend
   ?   ??? TuCita.csproj
   ?   ??? dotnet restore
   ?   ??? dotnet publish
   ?   ??? Copia dist/ del frontend
   ?
   ??? Runtime Stage
       ??? Imagen optimizada
       ??? Variables de Heroku
       ??? Procfile
       ??? App en ejecución

4. PRODUCCIÓN
   ??? https://www.tucitaonline.org
```

---

## ?? Archivos que NO están (removidos)

Los siguientes archivos fueron removidos por ser redundantes:

- ? `Procfile.buildpack` - Alternativa sin Docker (no necesaria)
- ? `setup-heroku.sh` - Script de shell (tenemos .bat para Windows)
- ? `DOCKER-ALTERNATIVE.md` - Explicación de alternativas (no necesaria)

**Razón:** Usamos Docker con scripts de Windows (.bat), simplificando la configuración.

---

## ? Checklist de Archivos Necesarios

Antes de desplegar, verifica que existan:

### Configuración de Heroku
- [ ] `Dockerfile`
- [ ] `heroku.yml`
- [ ] `.dockerignore`
- [ ] `Procfile`

### Scripts de Automatización
- [ ] `deploy-to-heroku.bat`
- [ ] `update-app.bat`
- [ ] `verify-deployment.bat`

### Configuración de Producción
- [ ] `TuCita/appsettings.Production.json`
- [ ] `.env.example` (plantilla)

### Documentación
- [ ] `README.md`
- [ ] `GUIA-SIMPLE-HEROKU.md`
- [ ] `DEPLOYMENT.md`
- [ ] `DOMAIN-SETUP.md`

**Si falta alguno:** Revisar el repositorio Git.

---

## ?? Resumen

| Tipo | Cantidad | Propósito |
|------|----------|-----------|
| **Archivos de Heroku** | 4 | Configuración de despliegue |
| **Scripts Windows** | 3 | Automatización |
| **Documentación** | 8 | Guías y referencias |
| **Código Backend** | ~50 archivos | Lógica de negocio |
| **Código Frontend** | ~100 archivos | Interfaz de usuario |

**Total archivos importantes: ~165**

---

**Última actualización**: 2024  
**Versión**: 1.0  
**Estado**: ? Listo para producción
