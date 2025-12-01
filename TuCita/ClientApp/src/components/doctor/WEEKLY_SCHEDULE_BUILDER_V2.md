# ?? Weekly Schedule Builder - Versión Mejorada

## ?? Resumen de Mejoras Implementadas

### Fecha: Enero 2025
### Versión: 2.0.0

---

## ?? Nuevas Características

### 1. **Timeline Visual Interactivo**

#### Descripción
Vista gráfica estilo calendario que muestra los slots del día en una línea de tiempo de 24 horas.

#### Características:
- ? **Marcadores de hora**: Cada 4 horas (00, 04, 08, 12, 16, 20, 24)
- ? **Bloques coloreados**: 
  - ?? Azul para PRESENCIAL
  - ?? Púrpura para TELECONSULTA
- ? **Información en el bloque**: Hora inicio-fin + tipo
- ? **Responsive**: Se adapta al ancho disponible

#### Ejemplo Visual:
```
???????????????????????????????????????
? 00:00   04:00   08:00   12:00   16:00?
?   ?       ?    ??????       ??????  ?
?   ?       ?    ?8-12?       ?13-17?  ?
?   ?       ?    ??????       ??????  ?
???????????????????????????????????????
```

---

### 2. **Validación de Solapamientos**

#### Problema que Resuelve
Antes se podían crear slots que se solapaban (ej: 10:00-12:00 y 11:00-13:00).

#### Solución
```typescript
// Nueva función
const hasOverlappingSlots = (slots: WeeklyTimeSlot[]): boolean => {
  // Ordena slots por hora inicio
  // Verifica que cada slot no se cruce con el siguiente
  // Retorna true si hay conflicto
}
```

#### Validaciones:
? Al agregar nuevo slot  
? Al editar hora inicio  
? Al editar hora fin  

#### Feedback al Usuario:
```typescript
toast.error('Horario inválido', {
  description: 'Este rango se cruza con otro horario del mismo día.',
});
```

---

### 3. **Cálculo Automático de Duración**

#### Nuevas Funciones Helper:

```typescript
// Convierte hora a minutos desde medianoche
minutesFromMidnight('14:30') // => 870

// Calcula duración de un slot
getSlotDurationMinutes(slot) // => 60 (para un slot de 1 hora)

// Suma duración de múltiples slots
getSlotsDurationMinutes([slot1, slot2]) // => 180 (3 horas)

// Formatea minutos a texto legible
formatMinutesToLabel(150) // => "2 h 30 min"
formatMinutesToLabel(60)  // => "1 h"
formatMinutesToLabel(45)  // => "45 min"
```

#### Dónde se Muestra:
- **Header Global**: Total horas/semana
- **Panel Lateral**: Horas por día
- **Día Seleccionado**: Total del día

#### Ejemplo:
```
???????????????????????
? Lunes               ?
? 6 horarios · 8 h    ? ? Nueva info
???????????????????????
```

---

### 4. **Sistema de Plantillas Rápidas**

#### Plantillas Disponibles:

| Plantilla | Horario | Slots |
|-----------|---------|-------|
| **Mañana** | 08:00-12:00 | 1 slot de 4h |
| **Tarde** | 13:00-17:00 | 1 slot de 4h |
| **Jornada Completa** | 08:00-12:00 + 13:00-17:00 | 2 slots (8h total) |

#### Botones de Plantilla:

##### Por Día Individual:
```typescript
<Button onClick={() => setTemplateForDay(selectedDay, 'MANANA')}>
  Mañana (08–12)
</Button>
```

##### Para Todos los Días Laborables:
```typescript
<Button onClick={() => applyTemplateToWeekdays('COMPLETA')}>
  <LayoutTemplate /> Plantilla jornada completa (L–V)
</Button>
```

#### Casos de Uso:
```
Escenario 1: Doctor trabaja solo mañanas
? Click "Plantilla jornada completa (L-V)" ? Mañana
? Lunes-Viernes configurado en 2 segundos

Escenario 2: Horario mixto
? Lunes: Plantilla completa
? Martes: Plantilla tarde
? Miércoles: Personalizado
```

---

### 5. **Panel Lateral de Días**

#### Diseño de 2 Columnas:
```
??????????????????????????????????????
? Panel Días  ?  Panel Editor        ?
? (280px)     ?  (Resto del ancho)   ?
?             ?                      ?
? • Lunes     ?  [Timeline]          ?
? • Martes    ?  [Lista de slots]    ?
? • ...       ?  [Copiar a...]       ?
??????????????????????????????????????
```

#### Cada Día Muestra:
- **Punto de color**: Indica si está activo
- **Nombre completo**: "Lunes", no "Lun"
- **Estadísticas**:
  - "6 horario(s) · 8 h" (si activo)
  - "Día deshabilitado" (si no)
- **Badge "Activo"**: Solo si tiene slots
- **Switch**: Para activar/desactivar

#### Interacción:
- Click en día ? Se selecciona (borde azul)
- Switch ? Activa/desactiva día

---

### 6. **Mejoras en el Header Global**

#### Badges Informativos:

```typescript
<Badge>
  <Clock /> {totalSlots} slots
</Badge>
<Badge>
  {enabledDaysCount} día(s) activos
</Badge>
<Badge>
  {weeklyHoursLabel} / semana  ? NUEVO
</Badge>
```

#### Ejemplo Real:
```
????????????????????????????????????
? 42 slots | 5 día(s) activos     ?
? 40 h / semana                    ? ? Total semanal
????????????????????????????????????
```

---

### 7. **Validación Hora Fin > Hora Inicio**

#### Nueva Validación:
```typescript
const startMin = minutesFromMidnight(slot.horaInicio);
const endMin = minutesFromMidnight(slot.horaFin);

if (endMin <= startMin) {
  toast.error('Rango horario inválido', {
    description: 'La hora fin debe ser mayor a la hora inicio.',
  });
  return;
}
```

#### Casos que Previene:
- ? 10:00 - 10:00 (mismo tiempo)
- ? 12:00 - 11:00 (fin antes de inicio)
- ? 09:00 - 10:00 (válido)

---

### 8. **Mejoras en la UX**

#### Estados Vacíos Mejorados:

**Día Deshabilitado:**
```
???????????????????????????????
?     ? (icono grande)       ?
? Este día está deshabilitado ?
? Activa el día desde el      ?
? panel lateral...            ?
???????????????????????????????
```

**Sin Horarios:**
```
???????????????????????????????
?     ?? (icono grande)       ?
? No hay horarios configurados?
? Agrega un slot manualmente  ?
? o utiliza una plantilla.    ?
???????????????????????????????
```

#### Descripción Contextual:
```typescript
<CardDescription>
  Similar a un sistema de agenda profesional: 
  define tu disponibilidad base.
</CardDescription>
```

---

## ?? Comparación Versión 1.0 vs 2.0

| Característica | v1.0 | v2.0 |
|----------------|------|------|
| **Timeline Visual** | ? | ? |
| **Validación Solapamientos** | ? | ? |
| **Cálculo Duración** | ? | ? (minutos, horas, formato bonito) |
| **Plantillas** | ? | ? (3 tipos) |
| **Panel Lateral** | ? | ? (stats por día) |
| **Total Semanal** | ? | ? |
| **Layout 2 Columnas** | ? | ? |
| **Validación Hora** | Básica | ? Completa |

---

## ?? Flujos de Trabajo Optimizados

### Flujo 1: Configuración Rápida (30 segundos)
```
1. Click "Plantilla jornada completa (L-V)"
2. Listo! 10 slots creados (2 por día × 5 días)
```

### Flujo 2: Personalización por Día
```
1. Seleccionar día desde panel lateral
2. Ver timeline para entender el día
3. Usar plantilla o agregar manualmente
4. Copiar a otros días si es similar
```

### Flujo 3: Ajuste Fino
```
1. Ver timeline para detectar huecos
2. Agregar slot en el hueco
3. Validación automática previene errores
4. Feedback inmediato de duración total
```

---

## ?? Funciones Técnicas Nuevas

### minutesFromMidnight(time: string): number
Convierte "HH:mm" a minutos desde las 00:00.

**Ejemplo:**
```typescript
minutesFromMidnight('00:00') // => 0
minutesFromMidnight('09:30') // => 570
minutesFromMidnight('23:59') // => 1439
```

### getSlotDurationMinutes(slot: WeeklyTimeSlot): number
Calcula duración de un slot en minutos.

**Ejemplo:**
```typescript
const slot = { horaInicio: '09:00', horaFin: '12:00', tipo: 'PRESENCIAL' };
getSlotDurationMinutes(slot) // => 180 (3 horas)
```

### getSlotsDurationMinutes(slots: WeeklyTimeSlot[]): number
Suma duración de múltiples slots.

**Ejemplo:**
```typescript
const slots = [
  { horaInicio: '08:00', horaFin: '12:00', tipo: 'PRESENCIAL' },
  { horaInicio: '13:00', horaFin: '17:00', tipo: 'PRESENCIAL' }
];
getSlotsDurationMinutes(slots) // => 480 (8 horas)
```

### formatMinutesToLabel(minutes: number): string
Formatea minutos a texto legible.

**Ejemplos:**
```typescript
formatMinutesToLabel(0)   // => "0h"
formatMinutesToLabel(45)  // => "45 min"
formatMinutesToLabel(60)  // => "1 h"
formatMinutesToLabel(90)  // => "1 h 30 min"
formatMinutesToLabel(480) // => "8 h"
```

### hasOverlappingSlots(slots: WeeklyTimeSlot[]): boolean
Detecta si hay slots que se solapan.

**Ejemplo:**
```typescript
const slots = [
  { horaInicio: '09:00', horaFin: '11:00', tipo: 'PRESENCIAL' },
  { horaInicio: '10:00', horaFin: '12:00', tipo: 'PRESENCIAL' }  // ? Se solapa!
];
hasOverlappingSlots(slots) // => true
```

### setTemplateForDay(dayIndex, template)
Aplica plantilla a un día específico.

**Plantillas:**
- `'MANANA'`: 08:00-12:00
- `'TARDE'`: 13:00-17:00
- `'COMPLETA'`: 08:00-12:00 + 13:00-17:00

### applyTemplateToWeekdays(template)
Aplica plantilla a Lunes-Viernes.

---

## ?? Mejoras Visuales

### Colores de Día con Dot Indicator:
```typescript
const WEEK_DAYS = [
  { ..., dotColor: 'bg-blue-500' },    // Lunes
  { ..., dotColor: 'bg-purple-500' },  // Martes
  { ..., dotColor: 'bg-pink-500' },    // Miércoles
  { ..., dotColor: 'bg-orange-500' },  // Jueves
  { ..., dotColor: 'bg-green-500' },   // Viernes
  { ..., dotColor: 'bg-teal-500' },    // Sábado
  { ..., dotColor: 'bg-red-500' },     // Domingo
];
```

### Timeline CSS:
- Fondo: `bg-slate-100`
- Marcadores: Border dashed cada 4 horas
- Slots: `bg-blue-500/80` o `bg-purple-500/80`
- Texto: `text-white`, tamaño `text-[10px]`

### Panel Lateral:
- Borde cuando seleccionado: `border-[#2E8BC0]`
- Fondo cuando seleccionado: `bg-blue-50/60`
- Hover: `hover:bg-gray-50`

---

## ?? Responsive Design

### Breakpoints:
- **Mobile** (`<768px`): Grid de 1 columna
- **Desktop** (`?1024px`): Grid `280px + 1fr`

### Adaptaciones:
```typescript
// Header: flex-col en mobile, flex-row en desktop
className="flex flex-col gap-4 md:flex-row md:items-center"

// Slots: 1 columna en mobile, 3 columnas en desktop
className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.2fr]"

// Badges: wrap en mobile
className="flex flex-wrap items-center gap-2"
```

---

## ?? Testing Recomendado

### Casos de Prueba:

1. **Validación de Solapamientos**
   ```
   ? Crear slot 09:00-11:00
   ? Intentar crear 10:00-12:00
   ? Debe mostrar error
   ```

2. **Plantillas**
   ```
   ? Aplicar "Mañana" ? Debe crear 08:00-12:00
   ? Aplicar "Tarde" ? Debe crear 13:00-17:00
   ? Aplicar "Completa" ? Debe crear 2 slots
   ```

3. **Timeline Visual**
   ```
   ? Crear slot 08:00-12:00
   ? Timeline debe mostrar bloque en posición correcta
   ? Ancho del bloque proporcional a duración
   ```

4. **Cálculo de Duración**
   ```
   ? Slot 09:00-10:00 ? "1 h"
   ? Slot 09:00-10:30 ? "1 h 30 min"
   ? Suma de día debe ser correcta
   ```

5. **Panel Lateral**
   ```
   ? Click en día ? Se selecciona
   ? Switch ON ? Crea slot de ejemplo
   ? Estadísticas actualizadas en tiempo real
   ```

---

## ?? Performance

### Optimizaciones Implementadas:

1. **useMemo para Cálculos Costosos**
   ```typescript
   const totalSlots = useMemo(() => ..., [schedule]);
   const weeklyMinutes = useMemo(() => ..., [schedule]);
   ```

2. **Constantes Precomputadas**
   ```typescript
   const TIME_OPTIONS = (() => { ... })();
   ```

3. **Helpers Puros**
   ```typescript
   // Sin efectos secundarios, fácil de testear
   const minutesFromMidnight = (time: string): number => ...
   ```

---

## ?? Documentación de Uso

### Para el Usuario Final:

1. **Activar Días**: Usar switch en panel lateral
2. **Seleccionar Día**: Click en botón del día
3. **Ver Timeline**: Entender distribución visual
4. **Usar Plantillas**: Click en botones rápidos
5. **Personalizar**: Agregar/editar slots manualmente
6. **Copiar**: Usar botones de copiado al final

### Para Desarrolladores:

1. **Props del Componente**:
   ```typescript
   interface WeeklyScheduleBuilderProps {
     initialSchedule?: Record<number, WeeklyTimeSlot[]>;
     onChange: (schedule: Record<number, WeeklyTimeSlot[]>) => void;
   }
   ```

2. **Estructura del Schedule**:
   ```typescript
   {
     1: [{ horaInicio: '09:00', horaFin: '10:00', tipo: 'PRESENCIAL' }],
     2: [...],
     ...
   }
   ```

3. **Validaciones Automáticas**:
   - Hora fin > hora inicio
   - Sin solapamientos
   - Feedback con toast

---

## ?? Próximas Mejoras Potenciales

### v2.1 (Futuro):
- [ ] Drag & Drop en timeline
- [ ] Zoom en timeline (vista por horas)
- [ ] Plantillas personalizadas guardables
- [ ] Importar/Exportar horario completo
- [ ] Historial de cambios (undo/redo)
- [ ] Vista mensual compacta
- [ ] Copiar semana completa

### v2.2 (Futuro):
- [ ] Sugerencias inteligentes de horarios
- [ ] Detectar patrones y sugerir repetir
- [ ] Validación contra festivos
- [ ] Integración con calendario externo

---

## ? Checklist de Implementación

- ? Timeline visual
- ? Validación de solapamientos
- ? Cálculo de duración
- ? Formateo de tiempo legible
- ? Plantillas rápidas (3 tipos)
- ? Panel lateral con estadísticas
- ? Layout de 2 columnas responsive
- ? Total horas semanales
- ? Validación hora fin > inicio
- ? Estados vacíos mejorados
- ? useMemo para performance
- ? Helpers tipados y testeables
- ? Feedback mejorado (toast descriptions)

---

**Versión:** 2.0.0  
**Fecha:** Enero 2025  
**Status:** ? Producción Ready  
**Tested:** ? Compila sin errores  

?? **¡Componente listo para usar!**
