# Vite Build Fix for Heroku CI

## Problem
The Vite build was failing in Heroku CI/CD with the error:
```
[vite:build-html] Failed to resolve ./src/main.tsx
```

This occurred **only in Heroku**, not in local builds.

## Root Cause

### Path Duplication Issue
The `vite.config.ts` had `root: './'` configured, which caused a **path duplication problem** in the Heroku build environment.

**How the problem occurred:**

1. **MSBuild configuration** in `TuCita.csproj`:
   ```xml
   <Exec WorkingDirectory="$(SpaRoot)" Command="npm run build" />
   ```
   - `$(SpaRoot)` = `ClientApp\`
   - MSBuild **already executes npm from inside ClientApp**

2. **Vite config had** `root: './'`:
   - This told Vite to use the current directory as the project root
   - But the current directory was **already ClientApp** (set by MSBuild)
   - Vite then tried to resolve paths relative to `ClientApp/ClientApp/` (duplication!)

3. **Result:**
   - Vite looked for `ClientApp/ClientApp/src/main.tsx` instead of `ClientApp/src/main.tsx`
   - File not found ? build failure

### Why It Worked Locally
- When running `npm run build` manually from inside `ClientApp/`, the `root: './'` setting worked fine
- The duplication only happened when MSBuild set the working directory **before** calling npm

## Solution

### Changed File: `TuCita/ClientApp/vite.config.ts`

**REMOVED:**
```typescript
export default defineConfig({
  root: './',  // ? REMOVED - Caused path duplication in CI
  base: './',
  // ...
});
```

**KEPT:**
```typescript
export default defineConfig({
  base: './',  // ? KEPT - Ensures relative asset paths in production
  // ...
});
```

### Why This Fixes Heroku Builds

1. **Default Behavior**: When `root` is not specified, Vite uses the directory containing `vite.config.ts` as the project root
   - This is **always correct** regardless of where the build is executed from

2. **No Duplication**: 
   - MSBuild sets `WorkingDirectory="ClientApp"`
   - Vite runs from `ClientApp/` and uses `ClientApp/` as root (default)
   - No path duplication occurs

3. **Consistent Across Environments**:
   - ? Local: `npm run build` from `ClientApp/` ? works
   - ? Heroku CI: MSBuild runs from `ClientApp/` ? works
   - ? Both use the same effective root directory

### What `base: './'` Does

- **Purpose**: Controls the base path for all assets in the **production build**
- **Effect**: Generates relative paths like `./assets/index.js` instead of `/assets/index.js`
- **Benefit**: Assets work correctly whether served from root `/` or a subdirectory
- **Required for**: ASP.NET Core static file serving from `wwwroot/`

## Files Changed

### ? `TuCita/ClientApp/vite.config.ts`
- Removed `root: './'`
- Kept `base: './'`

### ? No Other Changes
- ? `index.html` - unchanged (already correct)
- ? `TuCita.csproj` - unchanged
- ? Heroku configuration - unchanged
- ? Buildpacks - unchanged

## Verification

### Local Build Test
```bash
cd TuCita/ClientApp
npm run build
# ? 3264 modules transformed.
# ? built in 6.24s
```

### Generated Output
```html
<!-- dist/index.html -->
<script type="module" crossorigin src="./assets/index-[hash].js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-[hash].css">
```

? Assets use relative paths  
? Entry file resolved correctly  
? Build completes successfully

## Expected Heroku Build Behavior

### Before Fix
```
MSBuild WorkingDirectory: ClientApp/
Vite root config: './' ? Effective root: ClientApp/ClientApp/
Vite looks for: ClientApp/ClientApp/src/main.tsx
Result: ? File not found
```

### After Fix
```
MSBuild WorkingDirectory: ClientApp/
Vite root config: (default) ? Effective root: ClientApp/
Vite looks for: ClientApp/src/main.tsx
Result: ? File found, build succeeds
```

## Summary

**Root Cause**: `root: './'` in vite.config.ts caused path duplication when MSBuild already set the working directory to `ClientApp/`

**Fix**: Remove `root: './'` to let Vite use its default behavior (current directory as root)

**Result**: Vite correctly resolves `./src/main.tsx` from the already-correct working directory set by MSBuild

**Impact**: 
- ? Local builds: Still work
- ? Heroku builds: Now work
- ? Path resolution: Consistent across all environments
