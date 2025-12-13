# ? FIX: Procfile corregido para usar DLL publicado

## ?? PROBLEMA IDENTIFICADO

El dyno en Heroku crasheaba con el error:
```
"You intended to execute a .NET SDK command: No .NET SDKs were found."
```

**CAUSA RAÍZ:** El `Procfile` estaba intentando ejecutar el DLL desde un directorio incorrecto.

---

## ?? ANÁLISIS DEL PROBLEMA

### Proceso de publicación en Heroku

El buildpack de .NET en Heroku ejecuta:
```bash
dotnet publish TuCita.sln --runtime linux-x64 "-p:PublishDir=bin/publish" --artifacts-path /tmp/build_artifacts
```

Esto genera la aplicación publicada en: `bin/publish/TuCita.dll`

### Procfile ANTES (incorrecto)

```
web: dotnet TuCita.dll
```

**Problema:** Intenta ejecutar `TuCita.dll` desde la raíz del slug, pero el archivo no está ahí. El buildpack de .NET publica en `bin/publish/`.

---

## ?? SOLUCIÓN APLICADA

### Procfile DESPUÉS (correcto)

```
web: dotnet bin/publish/TuCita.dll
```

**Por qué funciona:**
1. El buildpack de .NET publica en `bin/publish/TuCita.dll`
2. El runtime de .NET Core está instalado en el slug (por el buildpack)
3. No se necesita el SDK para ejecutar un DLL ya compilado
4. `dotnet bin/publish/TuCita.dll` ejecuta la aplicación correctamente

---

## ?? ESTRUCTURA EN HEROKU (después del build)

```
/app/  (raíz del slug)
??? bin/
?   ??? publish/
?       ??? TuCita.dll          ? El DLL que queremos ejecutar
?       ??? TuCita.pdb
?       ??? appsettings.json
?       ??? web.config
?       ??? wwwroot/            ? Frontend compilado (de ClientApp/dist)
?           ??? index.html
?           ??? assets/
??? Procfile                     ? Apunta a bin/publish/TuCita.dll
??? TuCita/                      ? Código fuente (no se usa en runtime)
??? ...
```

---

## ? ARCHIVO MODIFICADO

### **Procfile**

**ANTES:**
```
web: dotnet TuCita.dll
```

**DESPUÉS:**
```
web: dotnet bin/publish/TuCita.dll
```

**Cambio:** Añadido el path `bin/publish/` para apuntar al DLL publicado.

---

## ?? VERIFICACIÓN

### En Heroku, el proceso debería ser:

1. ? Buildpack de .NET compila y publica: `dotnet publish ? bin/publish/TuCita.dll`
2. ? Heroku ejecuta: `dotnet bin/publish/TuCita.dll` (comando del Procfile)
3. ? El runtime de .NET ejecuta el DLL (no necesita SDK)
4. ? La aplicación ASP.NET Core arranca en el puerto `$PORT`
5. ? El dyno está saludable y responde a requests

### Logs esperados (exitosos):

```
Starting process with command `dotnet bin/publish/TuCita.dll`
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://0.0.0.0:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
State changed from starting to up
```

---

## ?? EXPLICACIÓN TÉCNICA

### ¿Por qué el error original?

**Error:** `"You intended to execute a .NET SDK command: No .NET SDKs were found."`

**Causa:** Este error ocurre cuando:
1. Se intenta ejecutar un archivo `.csproj` o un comando de SDK (`dotnet run`, `dotnet build`, etc.)
2. El SDK de .NET no está instalado (solo el runtime)

**En Heroku:**
- El **buildpack de .NET** instala el **SDK** temporalmente para compilar
- Después del build, solo queda el **runtime** (para ejecutar DLLs)
- El SDK no está disponible en el dyno en ejecución

### ¿Por qué funciona la solución?

**Comando:** `dotnet bin/publish/TuCita.dll`

**Razón:**
1. `dotnet <archivo.dll>` es un comando de **runtime** (no de SDK)
2. Solo necesita el **.NET Runtime** (que está instalado)
3. El DLL ya está compilado (en `bin/publish/`)
4. No requiere compilación adicional

---

## ?? COMPARACIÓN

| Aspecto | Antes (?) | Después (?) |
|---------|-----------|-------------|
| Comando | `dotnet TuCita.dll` | `dotnet bin/publish/TuCita.dll` |
| Path del DLL | Raíz (incorrecto) | `bin/publish/` (correcto) |
| Encuentra el DLL | ? No | ? Sí |
| Requiere SDK | ? Sí (error) | ? No (solo runtime) |
| Dyno arranca | ? No | ? Sí |

---

## ?? RESULTADO ESPERADO

Con este fix, el dyno en Heroku debería:

1. ? Encontrar el DLL en `bin/publish/TuCita.dll`
2. ? Ejecutarlo usando el .NET Runtime (sin necesitar SDK)
3. ? Arrancar la aplicación ASP.NET Core
4. ? Escuchar en el puerto configurado por Heroku (`$PORT`)
5. ? Responder correctamente a requests HTTP
6. ? Servir el frontend desde `wwwroot/`

---

## ?? COMMIT REALIZADO

**Branch:** `ParteRuben`

**Commit:** `b30b1cc` - "Fix Procfile: Execute published DLL from bin/publish/ to avoid SDK requirement"

**Cambios:**
- `Procfile`: 1 línea modificada

**Estado:** ? Pusheado a `origin/ParteRuben`

---

## ?? LECCIÓN APRENDIDA

**Problema:** El Procfile apuntaba a un DLL que no existe en la ubicación especificada.

**Solución:** Actualizar el Procfile para apuntar al DLL en la ubicación correcta después de `dotnet publish`.

**Principio:** En Heroku con buildpacks de .NET:
- El **build time** tiene SDK (para compilar)
- El **runtime** solo tiene .NET Runtime (para ejecutar DLLs)
- El Procfile debe ejecutar el DLL publicado, no comandos de SDK

**Referencia:** [Heroku .NET Buildpack Documentation](https://github.com/heroku/dotnet-buildpack)

---

## ? LISTO PARA DESPLIEGUE

El Procfile ahora está correctamente configurado para ejecutar la aplicación en Heroku. ??
