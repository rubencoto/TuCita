# ?? Guía de la Nueva Estructura - ClientApp

## ?? Ubicación de Archivos

### ¿Dónde va cada tipo de archivo?

#### ?? **Páginas** ? `src/components/pages/{dominio}/`
```
src/components/pages/
??? auth/           # Páginas de autenticación (login, registro, etc.)
??? patient/        # Páginas del módulo de pacientes
??? doctor/         # Páginas del módulo de doctores
```

**Ejemplos:**
- Nueva página de paciente ? `src/components/pages/patient/nueva-pagina.tsx`
- Nueva página de doctor ? `src/components/pages/doctor/nueva-pagina.tsx`
- Nueva página de admin ? `src/components/pages/admin/nueva-pagina.tsx` (crear carpeta)

---

#### ?? **Servicios API** ? `src/services/api/{dominio}/`
```
src/services/api/
??? auth/           # Servicios de autenticación
??? patient/        # Servicios de pacientes
??? doctor/         # Servicios de doctores
```

**Ejemplos:**
- Nuevo servicio de paciente ? `src/services/api/patient/nuevoServicio.ts`
- Nuevo servicio de doctor ? `src/services/api/doctor/nuevoServicio.ts`
- Servicio compartido ? `src/services/api/nuevoServicio.ts`

---

#### ?? **Componentes Comunes** ? `src/components/common/`
```
src/components/common/
??? ImageWithFallback.tsx
??? search-bar.tsx
??? doctor-card.tsx
??? appointment-card.tsx
??? appointment-calendar.tsx
```

**Usar para:**
- ? Componentes reutilizables específicos del negocio
- ? Componentes que se usan en múltiples páginas
- ? Componentes que contienen lógica de negocio

**Ejemplos:**
- Card personalizado ? `src/components/common/custom-card.tsx`
- Selector de fecha especializado ? `src/components/common/date-picker.tsx`

---

#### ??? **Componentes de Layout** ? `src/components/layout/`
```
src/components/layout/
??? navbar.tsx
??? footer.tsx
??? sidebar.tsx (futuro)
??? doctor/
    ??? DoctorSidebar.tsx
    ??? DoctorLayout.tsx
```

**Usar para:**
- ? Navegación (navbar, sidebar, breadcrumbs)
- ? Estructura de página (header, footer, wrappers)
- ? Layouts específicos de roles

**Ejemplos:**
- Nuevo header ? `src/components/layout/header.tsx`
- Layout de admin ? `src/components/layout/admin/AdminLayout.tsx`

---

#### ?? **Componentes UI Primitivos** ? `src/components/ui/`
```
src/components/ui/
??? button.tsx
??? card.tsx
??? dialog.tsx
??? ... (49+ componentes de shadcn/ui)
```

**?? NO MODIFICAR - Generados por shadcn/ui**

**Usar para:**
- ? Componentes UI básicos sin lógica de negocio
- ? Solo agregar nuevos con `npx shadcn@latest add [component]`

---

## ??? Futuras Carpetas (Crear cuando sea necesario)

### 1. **Types** ? `src/types/`
Para interfaces y tipos TypeScript compartidos.

```typescript
// src/types/appointment.ts
export interface Appointment {
  id: number;
  doctorName: string;
  // ...
}

// Importar en archivos
import { Appointment } from '@/types/appointment';
```

**Crear cuando:**
- Tienes tipos usados en 3+ archivos
- Necesitas compartir interfaces entre componentes
- Quieres centralizar definiciones de tipos

---

### 2. **Hooks** ? `src/hooks/`
Para custom React hooks reutilizables.

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  // lógica de autenticación
  return { user, login, logout };
}

// Usar en componentes
import { useAuth } from '@/hooks/useAuth';
```

**Crear cuando:**
- Tienes lógica de estado repetida
- Necesitas compartir comportamiento entre componentes
- Quieres encapsular efectos secundarios

**Ejemplos:**
- `useAuth.ts` - Manejo de autenticación
- `useAppointments.ts` - Manejo de citas
- `useDebounce.ts` - Debouncing de inputs
- `useLocalStorage.ts` - Persistencia local

---

### 3. **Utils** ? `src/utils/`
Para funciones utilitarias puras.

```typescript
// src/utils/date.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES');
}

// Usar en archivos
import { formatDate } from '@/utils/date';
```

**Crear cuando:**
- Tienes funciones usadas en múltiples archivos
- Necesitas transformar datos
- Quieres separar lógica de presentación

**Ejemplos:**
- `date.ts` - Formateo de fechas
- `validation.ts` - Validaciones
- `currency.ts` - Formateo de moneda
- `string.ts` - Manipulación de strings

---

### 4. **Constants** ? `src/constants/`
Para valores constantes de la aplicación.

```typescript
// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

// Usar en archivos
import { ROUTES } from '@/constants/routes';
```

**Crear cuando:**
- Tienes valores mágicos repetidos
- Necesitas configuración centralizada
- Quieres evitar typos en strings

**Ejemplos:**
- `routes.ts` - Rutas de la aplicación
- `api.ts` - URLs de API
- `status.ts` - Estados de citas
- `roles.ts` - Roles de usuario

---

## ?? Reglas de Imports

### ? Usar Imports Absolutos (Recomendado)

```typescript
// ? BIEN - Imports absolutos con @
import { Button } from '@/components/ui/button';
import { HomePage } from '@/components/pages/patient/home-page';
import { authService } from '@/services/api/auth/authService';
import { Appointment } from '@/types/appointment';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/date';
```

### ?? Usar Imports Relativos (Solo mismo directorio)

```typescript
// ? BIEN - Mismo directorio
import { ImageWithFallback } from './ImageWithFallback';
import { helper } from './helper';

// ? EVITAR - Paths relativos complejos
import { Button } from '../../../ui/button';
import { HomePage } from '../../pages/patient/home-page';
```

---

## ?? Convenciones de Nombres

### Archivos
```
kebab-case.tsx         ? home-page.tsx
kebab-case.ts          ? auth-service.ts
PascalCase.tsx         ??  Solo para componentes: ImageWithFallback.tsx
```

### Componentes
```typescript
// ? BIEN - PascalCase para componentes
export function HomePage() { ... }
export function DoctorCard() { ... }

// ? MAL - camelCase para componentes
export function homePage() { ... }
```

### Servicios
```typescript
// ? BIEN - camelCase para servicios
export const authService = new AuthService();

// ? BIEN - default export para servicios
export default appointmentsService;
```

### Hooks
```typescript
// ? BIEN - use + PascalCase
export function useAuth() { ... }
export function useAppointments() { ... }

// ? MAL
export function getAuth() { ... }
```

---

## ?? Ejemplos Prácticos

### Ejemplo 1: Crear una Nueva Página de Paciente

```bash
# 1. Crear el archivo
TuCita/ClientApp/src/components/pages/patient/nueva-funcionalidad-page.tsx
```

```typescript
// 2. Contenido del archivo
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import appointmentsService from '@/services/api/patient/appointmentsService';

export function NuevaFuncionalidadPage() {
  // Tu lógica aquí
  return (
    <div>
      {/* Tu UI aquí */}
    </div>
  );
}
```

```typescript
// 3. Agregar a App.tsx
import { NuevaFuncionalidadPage } from './components/pages/patient/nueva-funcionalidad-page';

// Agregar en el renderPage()
case 'nueva-funcionalidad':
  return <NuevaFuncionalidadPage />;
```

---

### Ejemplo 2: Crear un Nuevo Servicio

```bash
# 1. Crear el archivo
TuCita/ClientApp/src/services/api/patient/nuevoServicio.ts
```

```typescript
// 2. Contenido del archivo
import api from '../axiosConfig';

export interface NuevoTipo {
  id: number;
  nombre: string;
}

class NuevoServicio {
  async getData(): Promise<NuevoTipo[]> {
    const response = await api.get('/api/nueva-ruta');
    return response.data;
  }
}

export default new NuevoServicio();
```

```typescript
// 3. Usar en componentes
import nuevoServicio from '@/services/api/patient/nuevoServicio';

const data = await nuevoServicio.getData();
```

---

### Ejemplo 3: Crear un Custom Hook

```bash
# 1. Crear carpeta y archivo
mkdir TuCita/ClientApp/src/hooks
TuCita/ClientApp/src/hooks/useAppointments.ts
```

```typescript
// 2. Contenido del archivo
import { useState, useEffect } from 'react';
import appointmentsService from '@/services/api/patient/appointmentsService';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const data = await appointmentsService.getMyAppointments();
        setAppointments(data);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);

  return { appointments, loading };
}
```

```typescript
// 3. Usar en componentes
import { useAppointments } from '@/hooks/useAppointments';

function MyComponent() {
  const { appointments, loading } = useAppointments();
  
  if (loading) return <div>Cargando...</div>;
  return <div>{/* render appointments */}</div>;
}
```

---

## ?? Checklist para Nuevos Archivos

Antes de crear un archivo nuevo, pregúntate:

- [ ] ¿Es una página? ? `src/components/pages/{dominio}/`
- [ ] ¿Es un servicio API? ? `src/services/api/{dominio}/`
- [ ] ¿Es un componente reutilizable? ? `src/components/common/`
- [ ] ¿Es parte de la navegación? ? `src/components/layout/`
- [ ] ¿Es un tipo compartido? ? `src/types/`
- [ ] ¿Es un hook personalizado? ? `src/hooks/`
- [ ] ¿Es una función utilitaria? ? `src/utils/`
- [ ] ¿Es una constante? ? `src/constants/`
- [ ] ¿Es un componente UI básico? ? Usar shadcn/ui

---

## ?? Recursos Adicionales

- **shadcn/ui:** https://ui.shadcn.com/
- **Vite:** https://vitejs.dev/
- **React Router (futuro):** https://reactrouter.com/
- **TanStack Query (futuro):** https://tanstack.com/query/

---

**Última actualización:** 2025  
**Versión de la estructura:** 1.0.0
