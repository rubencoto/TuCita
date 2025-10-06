# ?? Resolver Errores de TypeScript en VS Code

Si ves errores de TypeScript como:
- `Cannot find module '../ui/button'`
- `'React' refers to a UMD global`
- `Module can only be default-imported using the 'esModuleInterop' flag`

## ? Soluciones Rápidas

### Solución 1: Reiniciar el Servidor TypeScript en VS Code
1. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escribe: `TypeScript: Restart TS Server`
3. Presiona Enter

### Solución 2: Seleccionar la Versión de TypeScript del Workspace
1. Abre cualquier archivo `.ts` o `.tsx`
2. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
3. Escribe: `TypeScript: Select TypeScript Version`
4. Selecciona: **Use Workspace Version** (5.7.2)

### Solución 3: Recargar VS Code
1. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escribe: `Developer: Reload Window`
3. Presiona Enter

### Solución 4: Reinstalar Dependencias
```powershell
cd TuCita/ClientApp
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

## ?? Verificar que todo funciona

Ejecuta el type-check:
```powershell
cd TuCita/ClientApp
npm run type-check
```

Si todo está bien, no debería mostrar errores.

## ?? Configuración Aplicada

Ya he creado los siguientes archivos de configuración:

1. ? `.vscode/settings.json` - Configura VS Code para usar TypeScript del proyecto
2. ? `src/vite-env.d.ts` - Definiciones de tipos para Vite
3. ? `tsconfig.json` actualizado con `esModuleInterop`

## ?? Nota Importante

Los errores que ves son **del IDE solamente**. El código compila correctamente con:
- `npm run build` ?
- `npm run dev` ?
- `dotnet build` ?

Es solo un problema de que VS Code está usando una versión antigua de TypeScript del sistema en lugar de la del proyecto.
