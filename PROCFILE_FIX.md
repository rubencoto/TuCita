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

Cuando se ejecuta desde la raíz del repositorio, esto genera la aplicación publicada en: `TuCita/bin/publish/TuCita.dll`

### Procfile ORIGINAL (incorrecto)

```
web: dotnet TuCita.dll
```

**Problema:** Intenta ejecutar `TuCita.dll` desde la raíz del slug, pero el archivo no está ahí.

### Procfile INTERMEDIO (parcialmente correcto)

```
web: dotnet bin/publish/TuCita.dll
```

**Problema:** No incluía el subdirectorio `TuCita/` donde realmente se publica el DLL.

---

## ?? SOLUCIÓN APLICADA

### Procfile FINAL (correcto)

```
web: dotnet TuCita/bin/publish/TuCita.dll
```

**Por qué funciona:**
1. El buildpack de .NET publica desde la raíz del repo
2. El proyecto está en el subdirectorio `TuCita/`
3. La publicación genera: `TuCita/bin/publish/TuCita.dll`
4. El runtime de .NET Core está instalado en el slug (por el buildpack)
5. No se necesita el SDK para ejecutar un DLL ya compilado
6. `dotnet TuCita/bin/publish/TuCita.dll` ejecuta la aplicación correctamente

---

## ?? ESTRUCTURA EN HEROKU (después del build)

```
/app/  (raíz del slug)
??? TuCita/
?   ??? bin/
?   ?   ??? publish/
?   ?       ??? TuCita.dll          ? El DLL que queremos ejecutar
?   ?       ??? TuCita.pdb
?   ?       ??? appsettings.json
?   ?       ??? web.config
?   ?       ??? wwwroot/            ? Frontend compilado (de ClientApp/dist)
?   ?           ??? index.html
?   ?           ??? assets/
?   ??? Controllers/
?   ??? Services/
?   ??? ...                          ? Código fuente (no se usa en runtime)
??? Procfile                         ? Apunta a TuCita/bin/publish/TuCita.dll
??? ...
```

---

## ? ARCHIVO MODIFICADO

### **Procfile**

**VERSIÓN ORIGINAL:**
```
web: dotnet TuCita.dll
```

**VERSIÓN INTERMEDIA:**
```
web: dotnet bin/publish/TuCita.dll
```

**VERSIÓN FINAL (CORRECTA):**
```
web: dotnet TuCita/bin/publish/TuCita.dll
```

**Cambio:** Añadido el prefijo `TuCita/` para reflejar la estructura real del directorio de publicación.

---

## ?? VERIFICACIÓN

### En Heroku, el proceso debería ser:

1. ? Buildpack de .NET compila y publica: `dotnet publish ? TuCita/bin/publish/TuCita.dll`
2. ? Heroku ejecuta: `dotnet TuCita/bin/publish/TuCita.dll` (comando del Procfile)
3. ? El runtime de .NET ejecuta el DLL (no necesita SDK)
4. ? La aplicación ASP.NET Core arranca en el puerto `$PORT`
5. ? El dyno está saludable y responde a requests

### Logs esperados (exitosos):

```
Starting process with command `dotnet TuCita/bin/publish/TuCita.dll`
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

**Comando:** `dotnet TuCita/bin/publish/TuCita.dll`

**Razón:**
1. `dotnet <archivo.dll>` es un comando de **runtime** (no de SDK)
2. Solo necesita el **.NET Runtime** (que está instalado)
3. El DLL ya está compilado (en `TuCita/bin/publish/`)
4. No requiere compilación adicional

---

## ?? COMPARACIÓN

| Aspecto | Original (?) | Intermedio (?) | Final (?) |
|---------|--------------|----------------|------------|
| Comando | `dotnet TuCita.dll` | `dotnet bin/publish/TuCita.dll` | `dotnet TuCita/bin/publish/TuCita.dll` |
| Path del DLL | Raíz (incorrecto) | Sin subdirectorio (incorrecto) | `TuCita/bin/publish/` (correcto) |
| Encuentra el DLL | ? No | ? No | ? Sí |
| Requiere SDK | ? Sí (error) | ? Sí (error) | ? No (solo runtime) |
| Dyno arranca | ? No | ? No | ? Sí |

---

## ?? RESULTADO ESPERADO

Con este fix, el dyno en Heroku debería:

1. ? Encontrar el DLL en `TuCita/bin/publish/TuCita.dll`
2. ? Ejecutarlo usando el .NET Runtime (sin necesitar SDK)
3. ? Arrancar la aplicación ASP.NET Core
4. ? Escuchar en el puerto configurado por Heroku (`$PORT`)
5. ? Responder correctamente a requests HTTP
6. ? Servir el frontend desde `wwwroot/`

---

## ?? COMMITS REALIZADOS

**Branch:** `ParteRuben`

**Commits:**
1. `b30b1cc` - Fix Procfile: Execute published DLL from bin/publish/ to avoid SDK requirement
2. `f2b773c` - Add documentation for Procfile fix
3. `508c5f9` - Fix Procfile: Update path to TuCita/bin/publish/TuCita.dll for correct Heroku execution

**Cambios:**
- `Procfile`: Path actualizado a `TuCita/bin/publish/TuCita.dll`

**Estado:** ? Pusheado a `origin/ParteRuben`

---

## ?? LECCIÓN APRENDIDA

**Problema:** El Procfile apuntaba a un DLL que no existe en la ubicación especificada debido a la estructura de directorios del proyecto.

**Solución:** Actualizar el Procfile para incluir el prefijo `TuCita/` que refleja la estructura real del proyecto después de `dotnet publish`.

**Principio:** En Heroku con buildpacks de .NET:
- El **build time** tiene SDK (para compilar)
- El **runtime** solo tiene .NET Runtime (para ejecutar DLLs)
- El Procfile debe ejecutar el DLL publicado con la ruta completa desde la raíz del slug
- La estructura de directorios del proyecto debe respetarse en la ruta del DLL

**Referencia:** [Heroku .NET Buildpack Documentation](https://github.com/heroku/dotnet-buildpack)

---

## ? LISTO PARA DESPLIEGUE

El Procfile ahora está correctamente configurado con la ruta completa `TuCita/bin/publish/TuCita.dll` para ejecutar la aplicación en Heroku. ??
