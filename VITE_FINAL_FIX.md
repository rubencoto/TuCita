# Vite Build Fix - Final Solution

## Problem
Heroku build was failing with:
```
[vite:build-html] Failed to resolve ./src/main.tsx from /tmp/build_41ccc309/TuCita/ClientApp/index.html
```

## Root Cause Analysis

After multiple attempts, the issue was identified:

1. **Previous Fix Attempt**: Changed from `/src/main.tsx` (absolute) to `./src/main.tsx` (relative)
   - ? Worked locally
   - ? Failed on Heroku

2. **Why Relative Path Failed**:
   - Vite's dev server and local build handle relative paths differently
   - During Heroku's `dotnet publish` process, the working directory context differs
   - Vite couldn't resolve the relative path `./src/main.tsx` in the Heroku build environment

3. **Solution**: Use **absolute path** `/src/main.tsx`
   - Vite treats paths starting with `/` as project-relative (from project root)
   - This works consistently in both local and Heroku builds
   - During production build, Vite still generates relative asset paths (which is correct)

## Final Configuration

### ? `TuCita/ClientApp/index.html`
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TuCitaOnline - Sistema de Gestión de Citas Médicas</title>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Key Point**: `/src/main.tsx` is an **absolute path from project root**, not a filesystem absolute path.

### ? `TuCita/ClientApp/vite.config.ts`
```typescript
export default defineConfig({
  base: './',  // Ensures relative paths in production build
  // NO root config - uses default (directory containing vite.config.ts)
  plugins: [react()],
  // ... rest of config
});
```

## How Vite Resolves Paths

### Development (`npm run dev`)
- `/src/main.tsx` ? Resolved from project root (where vite.config.ts lives)
- Vite dev server handles the transformation

### Production Build (`npm run build`)
1. **Input**: `index.html` references `/src/main.tsx`
2. **Vite Processing**: 
   - Resolves `/src/main.tsx` from project root
   - Bundles all dependencies
   - Generates hashed filenames
3. **Output**: `dist/index.html` with relative paths:
   ```html
   <script type="module" crossorigin src="./assets/index-[hash].js"></script>
   <link rel="stylesheet" crossorigin href="./assets/index-[hash].css">
   ```

### Why This Works in Heroku
- MSBuild runs `npm run build` with `WorkingDirectory="ClientApp"`
- Vite's project root is `ClientApp/` (where vite.config.ts is located)
- `/src/main.tsx` resolves to `ClientApp/src/main.tsx` ?
- No path duplication issues

## Verification

### ? Local Build
```bash
cd TuCita/ClientApp
npm run build
# ? 3264 modules transformed
# ? built in 6.01s
```

### ? Generated Output
```html
<!-- dist/index.html -->
<script type="module" crossorigin src="./assets/index-CrD58hzx.js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-DLLCiDrg.css">
```

Assets correctly use **relative paths** for deployment.

## Path Resolution Summary

| Path Type | Example | Vite Behavior | Use Case |
|-----------|---------|---------------|----------|
| Absolute (filesystem) | `C:/app/src/main.tsx` | ? Not used in web | N/A |
| Absolute (project-relative) | `/src/main.tsx` | ? From project root | **index.html entry** |
| Relative | `./src/main.tsx` | From current file location | Module imports |
| Relative | `./assets/index.js` | From current file location | **Production assets** |

## Key Learnings

1. **Vite `/` prefix**: Not a filesystem path, but project-relative
2. **`base: './'`**: Controls output asset paths (production build)
3. **No `root` config**: Let Vite use default (avoids duplication)
4. **index.html entry**: Use `/src/main.tsx` (project-relative)
5. **Production output**: Vite generates `./assets/...` (relative to HTML)

## Commit History

1. ? `f2e358f` - Added `root: './'` and `base: './'` (overcompensation)
2. ? `67d0000` - Changed to `./src/main.tsx` (relative path attempt)
3. ? `e2b0f42` - Removed `root: './'` (fixed duplication)
4. ? `d22b507` - **Changed back to `/src/main.tsx`** (final fix)

## Status: ? READY FOR HEROKU

This configuration should now work correctly in Heroku's build environment.

**Changes Pushed**: Commit `d22b507` on branch `ParteRuben`
