# ?? Índice Maestro de Documentación - TuCita

## ?? Guía Rápida por Objetivo

### ?? "Quiero desplegar a Heroku"
1. Lee: [`GUIA-SIMPLE-HEROKU.md`](GUIA-SIMPLE-HEROKU.md) ? **EMPIEZA AQUÍ**
2. Ejecuta: `deploy-to-heroku.bat`
3. Despliega: `git push heroku master`

### ?? "Quiero actualizar mi app"
1. Ejecuta: `update-app.bat`
2. O manualmente: Ver [`CHEATSHEET.md`](CHEATSHEET.md)

### ?? "Quiero configurar mi dominio"
1. Lee: [`DOMAIN-SETUP.md`](DOMAIN-SETUP.md)
2. Ejecuta comandos de DNS

### ?? "Tengo un problema"
1. Ejecuta: `verify-deployment.bat`
2. Consulta: [`QUICK-COMMANDS.md`](QUICK-COMMANDS.md) ? Sección Troubleshooting
3. Revisa logs: `heroku logs --tail -a tucita-app`

### ?? "Quiero entender cómo funciona"
1. Arquitectura general: [`README.md`](README.md)
2. Routing: [`ROUTING.md`](ROUTING.md)
3. Estructura: [`ESTRUCTURA-PROYECTO.md`](ESTRUCTURA-PROYECTO.md)

---

## ?? Documentos por Categoría

### ?? Para Principiantes (Empieza aquí)

| Documento | Descripción | Tiempo de lectura |
|-----------|-------------|-------------------|
| [`README.md`](README.md) | Vista general del proyecto | 5 min |
| [`GUIA-SIMPLE-HEROKU.md`](GUIA-SIMPLE-HEROKU.md) | ? Cómo desplegar sin saber Docker | 15 min |
| [`CHEATSHEET.md`](CHEATSHEET.md) | Comandos visuales rápidos | 5 min |

**Ruta de aprendizaje:** README ? GUIA-SIMPLE ? CHEATSHEET

---

### ?? Despliegue y Configuración

| Documento | Propósito | Cuándo usarlo |
|-----------|-----------|---------------|
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Guía técnica completa de despliegue | Primera vez + Referencia avanzada |
| [`DOMAIN-SETUP.md`](DOMAIN-SETUP.md) | Configurar www.tucitaonline.org | Después del primer despliegue |
| [`QUICK-COMMANDS.md`](QUICK-COMMANDS.md) | Referencia de comandos Heroku/Git | Día a día |

**Usa esto cuando:**
- Primera vez: DEPLOYMENT.md
- Configurar DNS: DOMAIN-SETUP.md
- Comandos olvidados: QUICK-COMMANDS.md

---

### ??? Desarrollo y Arquitectura

| Documento | Contenido | Para quién |
|-----------|-----------|------------|
| [`ROUTING.md`](ROUTING.md) | Arquitectura de routing Frontend/Backend | Desarrolladores |
| [`ESTRUCTURA-PROYECTO.md`](ESTRUCTURA-PROYECTO.md) | Organización de archivos del proyecto | Todos |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial de cambios del proyecto | Mantenedores |

**Usa esto cuando:**
- Necesitas entender el routing: ROUTING.md
- Buscas un archivo: ESTRUCTURA-PROYECTO.md
- Quieres ver cambios: CHANGELOG.md

---

### ? Post-Despliegue

| Documento | Utilidad | Cuándo |
|-----------|----------|--------|
| [`RESUMEN-LIMPIEZA.md`](RESUMEN-LIMPIEZA.md) | Estado actual del proyecto | Referencia |
| [`LIMPIEZA-AWS-AMPLIFY.md`](LIMPIEZA-AWS-AMPLIFY.md) | Archivos de AWS Amplify removidos | Referencia histórica |
| `verify-deployment.bat` | Script de verificación | Después de cada deploy |

---

## ?? Documentos por Nivel de Experiencia

### ?? Nivel 1: Nunca he usado Heroku

**Lee en este orden:**
1. [`README.md`](README.md) - ¿Qué es TuCita?
2. [`GUIA-SIMPLE-HEROKU.md`](GUIA-SIMPLE-HEROKU.md) - Cómo desplegar paso a paso
3. [`CHEATSHEET.md`](CHEATSHEET.md) - Comandos que necesitarás

**Scripts que usarás:**
- `deploy-to-heroku.bat` - Una vez
- `update-app.bat` - Siempre que hagas cambios

**Tiempo total:** ~1 hora

---

### ?? Nivel 2: Ya desplegué, quiero más

**Lee en este orden:**
1. [`DOMAIN-SETUP.md`](DOMAIN-SETUP.md) - Configurar dominio personalizado
2. [`QUICK-COMMANDS.md`](QUICK-COMMANDS.md) - Comandos útiles del día a día
3. [`ROUTING.md`](ROUTING.md) - Cómo funciona la arquitectura

**Qué harás:**
- Configurar DNS para www.tucitaonline.org
- Activar SSL
- Entender mejor el sistema

**Tiempo total:** ~2 horas

---

### ?? Nivel 3: Experto, quiero customizar

**Lee en este orden:**
1. [`DEPLOYMENT.md`](DEPLOYMENT.md) - Detalles técnicos completos
2. [`ESTRUCTURA-PROYECTO.md`](ESTRUCTURA-PROYECTO.md) - Organización interna
3. [`CHANGELOG.md`](CHANGELOG.md) - Historial de cambios

**Qué harás:**
- Modificar configuración de Docker
- Optimizar el despliegue
- Contribuir al proyecto

**Tiempo total:** ~3 horas

---

## ?? Mapa de Documentación

```
???????????????????????????????????????????????????????
?                    README.md                        ?
?              (Punto de entrada)                     ?
???????????????????????????????????????????????????????
                          ?
                          ?
        ?????????????????????????????????????
        ?                 ?                 ?
        ?                 ?                 ?
????????????????  ????????????????  ????????????????
? GUIA-SIMPLE  ?  ?  DEPLOYMENT  ?  ?   ROUTING    ?
?   -HEROKU    ?  ?              ?  ?              ?
? (Principiantes)? ?  (Técnico)   ?  ? (Desarrollo) ?
????????????????  ????????????????  ????????????????
        ?                 ?                 ?
        ?                 ?                 ?
        ?                 ?                 ?
????????????????  ????????????????  ????????????????
?  CHEATSHEET  ?  ? DOMAIN-SETUP ?  ? ESTRUCTURA   ?
?  (Rápido)    ?  ?  (DNS/SSL)   ?  ?  -PROYECTO   ?
????????????????  ????????????????  ????????????????
        ?                 ?                 ?
        ?????????????????????????????????????
                 ?                 ?
                 ?                 ?
         ????????????????  ????????????????
         ?    QUICK-    ?  ?  CHANGELOG   ?
         ?   COMMANDS   ?  ?              ?
         ????????????????  ????????????????
```

---

## ?? Buscar por Tema

### Configuración
- **Variables de entorno**: DEPLOYMENT.md ? Sección "Configurar Variables"
- **Puerto de Heroku**: GUIA-SIMPLE-HEROKU.md ? "Qué pasa cuando haces push"
- **SSL/HTTPS**: DOMAIN-SETUP.md ? "SSL/HTTPS"

### Comandos
- **Comandos básicos**: CHEATSHEET.md ? "Comandos Esenciales"
- **Comandos avanzados**: QUICK-COMMANDS.md
- **Scripts**: README.md ? "Despliegue Rápido"

### Troubleshooting
- **Build falla**: CHEATSHEET.md ? "Solución de Problemas"
- **App no inicia**: QUICK-COMMANDS.md ? "Troubleshooting"
- **Error de BD**: DEPLOYMENT.md ? "Troubleshooting"

### DNS y Dominios
- **Configurar CNAME**: DOMAIN-SETUP.md ? "Configuración DNS"
- **Propagación**: DOMAIN-SETUP.md ? "Tiempos de Propagación"
- **Por proveedor**: DOMAIN-SETUP.md ? "Configuración por Proveedor"

### Arquitectura
- **Routing Frontend**: ROUTING.md ? "Sistema de Navegación"
- **Routing Backend**: ROUTING.md ? "Rutas de API"
- **Estructura de archivos**: ESTRUCTURA-PROYECTO.md

---

## ?? Casos de Uso Comunes

### "Es mi primera vez, ¿por dónde empiezo?"
```
1. README.md (5 min)
2. GUIA-SIMPLE-HEROKU.md (15 min)
3. Ejecutar: deploy-to-heroku.bat
4. Ejecutar: git push heroku master
5. CHEATSHEET.md (guardar para después)
```

### "Ya desplegué, ¿cómo actualizo?"
```
1. Hacer cambios en el código
2. Ejecutar: update-app.bat
3. O manual: CHEATSHEET.md ? "Actualizar la App"
```

### "¿Cómo configuro www.tucitaonline.org?"
```
1. DOMAIN-SETUP.md (leer completo)
2. heroku domains:add www.tucitaonline.org
3. Configurar DNS según tu proveedor
4. Esperar 24-48h
```

### "Algo salió mal, ¿qué hago?"
```
1. verify-deployment.bat (ejecutar)
2. heroku logs --tail -a tucita-app (ver logs)
3. QUICK-COMMANDS.md ? "Troubleshooting"
4. Si persiste: DEPLOYMENT.md ? "Troubleshooting"
```

### "¿Cómo funciona el routing?"
```
1. ROUTING.md (leer completo)
2. Ver: TuCita/Program.cs
3. Ver: ClientApp/src/App.tsx
```

---

## ?? Scripts Disponibles

| Script | Cuándo usarlo | Documentación |
|--------|---------------|---------------|
| `deploy-to-heroku.bat` | Primera vez | GUIA-SIMPLE-HEROKU.md |
| `update-app.bat` | Actualizar app | CHEATSHEET.md |
| `verify-deployment.bat` | Después de deploy | RESUMEN-LIMPIEZA.md |

---

## ??? Archivos de Configuración

| Archivo | Propósito | Modificar |
|---------|-----------|-----------|
| `Dockerfile` | Build de Docker | ? No |
| `heroku.yml` | Config de Heroku | ? No |
| `.dockerignore` | Optimización | ? No |
| `Procfile` | Comando de inicio | ? No |
| `.env.example` | Plantilla | ? Sí (para guiar) |

**Documentación:** ESTRUCTURA-PROYECTO.md

---

## ?? Rutas Recomendadas de Lectura

### Para Desplegar (Primera Vez)
```
README.md
    ?
GUIA-SIMPLE-HEROKU.md
    ?
[Ejecutar deploy-to-heroku.bat]
    ?
CHEATSHEET.md (referencia)
```

### Para Configurar Dominio
```
DOMAIN-SETUP.md (completo)
    ?
[Configurar DNS]
    ?
verify-deployment.bat
```

### Para Entender el Sistema
```
README.md
    ?
ROUTING.md
    ?
ESTRUCTURA-PROYECTO.md
    ?
Código fuente
```

---

## ?? Ayuda Rápida

| Pregunta | Respuesta en |
|----------|--------------|
| ¿Cómo empiezo? | GUIA-SIMPLE-HEROKU.md |
| ¿Qué comandos uso? | CHEATSHEET.md |
| ¿Cómo funciona el routing? | ROUTING.md |
| ¿Dónde está cada archivo? | ESTRUCTURA-PROYECTO.md |
| ¿Qué cambió? | CHANGELOG.md |
| ¿Algo no funciona? | QUICK-COMMANDS.md |

---

## ?? Resumen

### Total de Documentos: 9

1. **README.md** - Punto de entrada
2. **GUIA-SIMPLE-HEROKU.md** - ? Para principiantes
3. **CHEATSHEET.md** - Referencia visual rápida
4. **DEPLOYMENT.md** - Guía técnica completa
5. **DOMAIN-SETUP.md** - Configurar dominio
6. **ROUTING.md** - Arquitectura de routing
7. **QUICK-COMMANDS.md** - Comandos útiles
8. **ESTRUCTURA-PROYECTO.md** - Organización
9. **CHANGELOG.md** - Historial

### Total de Scripts: 3

1. **deploy-to-heroku.bat** - Setup inicial
2. **update-app.bat** - Actualización
3. **verify-deployment.bat** - Verificación

---

**?? EMPIEZA AQUÍ:** [`GUIA-SIMPLE-HEROKU.md`](GUIA-SIMPLE-HEROKU.md)

**Última actualización:** 2024  
**Versión:** 1.0  
**Estado:** ? Completo
