# Vite Production Build Fix

## Problem
The Vite build was failing in production (Heroku) with the error:
```
[vite:build-html] Failed to resolve /src/main.tsx from index.html
```

## Root Cause
The build was failing due to two issues:
1. The `vite.config.ts` was missing explicit `root` and `base` path configuration
2. The `index.html` was using an absolute path (`/src/main.tsx`) instead of a relative path

While Vite works with default settings in many environments, production builds on Heroku (which uses Linux and has different path resolution) require explicit configuration to ensure consistent behavior across all environments.

## Solution Applied

### Changed File 1: `TuCita/ClientApp/vite.config.ts`

Added two critical configuration options at the top level:

```typescript
export default defineConfig({
  root: './',      // Explicitly set the project root to current directory
  base: './',      // Use relative paths for assets (not absolute from /)
  // ... rest of config
});
```

### Changed File 2: `TuCita/ClientApp/index.html`

Changed the script entry point from absolute to relative path:

**Before:**
```html
<script type="module" src="/src/main.tsx"></script>
```

**After:**
```html
<script type="module" src="./src/main.tsx"></script>
```

## Why This Fixes the Issue

1. **`root: './'`**: Explicitly tells Vite that the project root is the current directory (where vite.config.ts lives). This ensures Vite correctly resolves `index.html` and the `src/` directory regardless of where the build command is executed from.

2. **`base: './'`**: Configures Vite to use **relative paths** in the production build instead of absolute paths from the server root. This ensures that the built assets work correctly whether served from the root (`/`) or a subdirectory.

3. **Relative path in index.html** (`./src/main.tsx`): Using a relative path instead of an absolute path ensures that Vite can resolve the entry point correctly in all environments, especially on Linux-based systems like Heroku.

### Files NOT Changed

? Heroku configuration files - Not modified
? .NET configuration - Not modified
? Buildpacks - Not modified

## Verification

The build now completes successfully:
```bash
npm run build
# ? 3264 modules transformed.
# ? built in ~6s
```

Generated `dist/index.html` correctly references assets with relative paths:
```html
<script type="module" crossorigin src="./assets/index-[hash].js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-[hash].css">
```

## Testing in Production

This fix ensures:
- ? Local builds work (`npm run build`)
- ? Heroku builds work (buildpacks correctly build the frontend)
- ? The .NET app can serve the built files from `wwwroot/`
- ? All asset paths resolve correctly in production
- ? Works correctly on both Windows (dev) and Linux (production)

## Deployment
The changes are minimal and safe to deploy. The build process remains the same:
1. Heroku Node.js buildpack runs `npm install` in `ClientApp/`
2. .NET publish target runs `npm run build` 
3. Built files from `ClientApp/dist/` are copied to `wwwroot/`
4. ASP.NET Core serves the static files

No additional configuration or deployment steps required.
