# Plan de Reorganización - ClientApp

## ?? Estructura Actual
```
ClientApp/
??? src/
?   ??? components/
?   ?   ??? pages/           # 16 archivos de páginas
?   ?   ??? ui/              # 49+ componentes UI (shadcn/ui)
?   ?   ??? doctor/          # 2 componentes específicos de doctor
?   ?   ??? figma/           # 1 componente ImageWithFallback
?   ?   ??? navbar.tsx       # Componente compartido
?   ?   ??? footer.tsx       # Componente compartido
?   ?   ??? search-bar.tsx   # Componente compartido
?   ?   ??? doctor-card.tsx  # Componente compartido
?   ?   ??? appointment-calendar.tsx
?   ?   ??? appointment-card.tsx
?   ??? services/            # 11 servicios API
?   ??? styles/              # 1 archivo CSS
?   ??? guidelines/          # 1 archivo MD
?   ??? App.tsx              # ? Permanece aquí
?   ??? main.tsx             # ? Permanece aquí
?   ??? vite-env.d.ts        # ? Permanece aquí
??? public/                  # Assets públicos
??? index.html               # ? Permanece aquí
??? package.json             # ? Permanece aquí
??? tsconfig.json            # ? Permanece aquí
??? vite.config.ts           # ? Permanece aquí
??? tailwind.config.js       # ? Permanece aquí
??? postcss.config.js        # ? Permanece aquí
??? components.json          # ? Permanece aquí (shadcn/ui)
```

## ?? Estructura Propuesta (Best Practices)

```
ClientApp/
??? src/
?   ??? components/
?   ?   ??? layout/                  # Componentes de estructura
?   ?   ?   ??? navbar.tsx
?   ?   ?   ??? footer.tsx
?   ?   ?   ??? doctor/
?   ?   ?       ??? DoctorSidebar.tsx
?   ?   ?       ??? DoctorLayout.tsx
?   ?   ?
?   ?   ??? common/                  # Componentes reutilizables específicos del negocio
?   ?   ?   ??? ImageWithFallback.tsx  # ? Movido desde figma/
?   ?   ?   ??? search-bar.tsx
?   ?   ?   ??? doctor-card.tsx
?   ?   ?   ??? appointment-card.tsx
?   ?   ?   ??? appointment-calendar.tsx
?   ?   ?
?   ?   ??? ui/                      # Componentes UI primitivos (shadcn/ui)
?   ?   ?   ??? [49+ archivos sin cambios]
?   ?   ?
?   ?   ??? pages/                   # Páginas organizadas por dominio
?   ?       ??? auth/
?   ?       ?   ??? auth-page.tsx
?   ?       ?   ??? doctor-auth-page.tsx
?   ?       ?   ??? forgot-password-page.tsx
?   ?       ?   ??? reset-password-page.tsx
?   ?       ?
?   ?       ??? patient/
?   ?       ?   ??? home-page.tsx
?   ?       ?   ??? profile-page.tsx
?   ?       ?   ??? appointments-page.tsx
?   ?       ?   ??? appointment-detail-page.tsx
?   ?       ?   ??? booking-page.tsx
?   ?       ?   ??? reschedule-page.tsx
?   ?       ?   ??? search-page.tsx
?   ?       ?   ??? medical-history-page.tsx
?   ?       ?
?   ?       ??? doctor/
?   ?           ??? doctor-dashboard-page.tsx
?   ?           ??? doctor-profile-page.tsx
?   ?           ??? doctor-appointments-page.tsx
?   ?           ??? doctor-appointment-detail-page.tsx
?   ?           ??? doctor-availability-page.tsx
?   ?           ??? doctor-medical-history-page.tsx
?   ?
?   ??? services/                    # Servicios organizados por dominio
?   ?   ??? api/                     # Servicios API
?   ?   ?   ??? auth/
?   ?   ?   ?   ??? authService.ts
?   ?   ?   ?   ??? doctorAuthService.ts
?   ?   ?   ?   ??? adminAuthService.ts
?   ?   ?   ?
?   ?   ?   ??? patient/
?   ?   ?   ?   ??? profileService.ts
?   ?   ?   ?   ??? appointmentsService.ts
?   ?   ?   ?   ??? medicalHistoryService.ts
?   ?   ?   ?
?   ?   ?   ??? doctor/
?   ?   ?   ?   ??? doctorProfileService.ts
?   ?   ?   ?   ??? doctorAppointmentsService.ts
?   ?   ?   ?   ??? doctorAvailabilityService.ts
?   ?   ?   ?   ??? doctorsService.ts
?   ?   ?   ?
?   ?   ?   ??? axiosConfig.ts       # Configuración compartida
?   ?   ?
?   ?   ??? utils/                   # Utilidades (futuro)
?   ?
?   ??? styles/
?   ?   ??? globals.css              # ? Permanece en src/styles/
?   ?
?   ??? types/                       # TypeScript types (futuro)
?   ?
?   ??? hooks/                       # Custom hooks (futuro)
?   ?
?   ??? utils/                       # Funciones utilitarias (futuro)
?   ?
?   ??? constants/                   # Constantes de la app (futuro)
?   ?
?   ??? guidelines/
?   ?   ??? Guidelines.md            # ? Permanece en src/guidelines/
?   ?
?   ??? App.tsx                      # ? PERMANECE AQUÍ (punto de entrada)
?   ??? main.tsx                     # ? PERMANECE AQUÍ (punto de entrada)
?   ??? vite-env.d.ts                # ? PERMANECE AQUÍ (types de Vite)
?
??? public/                          # ? PERMANECE AQUÍ
?   ??? assets/
?
??? index.html                       # ? PERMANECE EN LA RAÍZ (requerido por Vite)
??? package.json                     # ? PERMANECE EN LA RAÍZ
??? package-lock.json                # ? PERMANECE EN LA RAÍZ
??? tsconfig.json                    # ? PERMANECE EN LA RAÍZ
??? tsconfig.node.json               # ? PERMANECE EN LA RAÍZ
??? vite.config.ts                   # ? PERMANECE EN LA RAÍZ (configuración Vite)
??? tailwind.config.js               # ? PERMANECE EN LA RAÍZ (configuración Tailwind)
??? postcss.config.js                # ? PERMANECE EN LA RAÍZ (configuración PostCSS)
??? components.json                  # ? PERMANECE EN LA RAÍZ (configuración shadcn/ui)
??? .eslintrc.cjs                    # ? PERMANECE EN LA RAÍZ (si existe)
??? .gitignore                       # ? PERMANECE EN LA RAÍZ
??? README.md                        # ? PERMANECE EN LA RAÍZ
```

## ?? Archivos que NO SE MUEVEN

### **Raíz de ClientApp/** (archivos de configuración)
- ? `index.html` - Punto de entrada HTML (requerido por Vite)
- ? `package.json` - Dependencias y scripts
- ? `package-lock.json` - Lock de dependencias
- ? `vite.config.ts` - Configuración de Vite
- ? `tsconfig.json` - Configuración de TypeScript
- ? `tsconfig.node.json` - TypeScript para Node
- ? `tailwind.config.js` - Configuración de Tailwind CSS
- ? `postcss.config.js` - Configuración de PostCSS
- ? `components.json` - Configuración de shadcn/ui
- ? `.eslintrc.cjs` - Configuración de ESLint (si existe)
- ? `.gitignore` - Archivos ignorados por Git
- ? `README.md` - Documentación del proyecto

### **src/** (puntos de entrada de la aplicación)
- ? `App.tsx` - Componente raíz de React
- ? `main.tsx` - Punto de entrada de la aplicación
- ? `vite-env.d.ts` - Tipos de Vite
- ? `index.css` - CSS global (importado en main.tsx)

### **src/styles/**
- ? `globals.css` - Estilos globales de Tailwind

### **src/guidelines/**
- ? `Guidelines.md` - Documentación de desarrollo

## ? Beneficios de la Reorganización

### 1. **Separación por Responsabilidades**
- `layout/`: Componentes estructurales de la aplicación
- `common/`: Componentes de negocio reutilizables
- `ui/`: Componentes UI primitivos (sin lógica de negocio)
- `pages/`: Páginas organizadas por dominio (auth, patient, doctor)

### 2. **Escalabilidad**
- Fácil agregar nuevos roles (admin, recepcionista)
- Clara separación entre pacientes y doctores
- Servicios agrupados por contexto de negocio

### 3. **Mantenibilidad**
- Ubicación predecible de archivos
- Imports más claros
- Facilita onboarding de nuevos desarrolladores

### 4. **Preparado para Crecimiento**
- Carpetas `types/`, `hooks/`, `utils/` listas para usar
- Estructura profesional estándar en React/TypeScript

## ?? Pasos de Implementación

1. ? **Crear nueva estructura de carpetas**
2. ? **Mover componentes de layout**
3. ? **Mover componentes comunes**
4. ? **Reorganizar páginas por dominio**
5. ? **Reorganizar servicios por dominio**
6. ? **Actualizar imports en App.tsx y main.tsx**
7. ? **Mover ImageWithFallback de figma/ a common/**
8. ? **Actualizar imports en todos los componentes que usen estos archivos**
9. ? **Eliminar carpetas vacías (figma/)**
10. ? **Verificar compilación**

## ?? Notas Importantes

### ?? Archivos de Configuración
- **NUNCA mover** archivos de configuración de la raíz (`vite.config.ts`, `package.json`, etc.)
- **NUNCA mover** `App.tsx`, `main.tsx` o `index.html` de sus ubicaciones
- Estos archivos son requeridos por Vite y las herramientas de build

### ?? Estructura de Componentes
- La carpeta `ui/` permanece intacta (generada por shadcn/ui)
- Se mantiene compatibilidad con imports absolutos de `@/`
- No se modificará lógica interna de componentes
- Solo se actualizan paths de imports

### ?? Compatibilidad
- Los imports de `@/components/ui/*` siguen funcionando igual
- Los imports de configuración (`@/lib/utils`) no cambian
- Solo cambian los imports de componentes de negocio y páginas
