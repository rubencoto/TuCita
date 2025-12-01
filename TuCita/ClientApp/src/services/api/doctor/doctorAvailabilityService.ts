// Servicio para gestionar la disponibilidad de horarios del doctor
// Compatible con DoctorAvailabilityController.cs

export type SlotTipo = 'PRESENCIAL' | 'TELECONSULTA';
export type SlotEstado = 'DISPONIBLE' | 'BLOQUEADO' | 'OCUPADO';

export interface DoctorSlot {
  idSlot: number;
  doctorId: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  tipo: SlotTipo;
  estado: SlotEstado;
}

export interface CreateSlotRequest {
  doctorId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipo: SlotTipo;
  estado: SlotEstado;
}

export interface UpdateSlotRequest {
  horaInicio?: string;
  horaFin?: string;
  tipo?: SlotTipo;
  estado?: SlotEstado;
}

export interface WeeklyTimeSlot {
  horaInicio: string;
  horaFin: string;
  tipo: SlotTipo;
}

export interface BulkCreateSlotsRequest {
  doctorId: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  horarioSemanal: Record<number, WeeklyTimeSlot[]>; // 0-6 (Domingo-Sábado)
}

export interface BulkCreateResult {
  slotsCreados: number;
  slots: DoctorSlot[];
  errores: string[];
}

export interface ApiErrorResponse {
  message: string;
}

const API_BASE_URL = '/api/doctor/availability';

/**
 * Convierte la respuesta del backend (PascalCase) a camelCase para el frontend
 */
function toCamelCase(obj: any): DoctorSlot {
  return {
    idSlot: obj.idSlot,
    doctorId: obj.doctorId,
    fecha: obj.fecha,
    horaInicio: obj.horaInicio,
    horaFin: obj.horaFin,
    tipo: obj.tipo,
    estado: obj.estado,
  };
}

/**
 * Convierte el resultado de creación masiva a camelCase
 */
function bulkResultToCamelCase(obj: any): BulkCreateResult {
  return {
    slotsCreados: obj.slotsCreados,
    slots: obj.slots.map(toCamelCase),
    errores: obj.errores || [],
  };
}

/**
 * Crea múltiples slots basados en un horario semanal recurrente
 */
export async function bulkCreateSlots(request: BulkCreateSlotsRequest): Promise<BulkCreateResult> {
  const response = await fetch(`${API_BASE_URL}/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || `Error al crear slots en lote: ${response.status}`);
  }

  const data = await response.json();
  return bulkResultToCamelCase(data);
}

/**
 * Genera un horario semanal por defecto (Lunes a Viernes, 9am-5pm)
 */
export function getDefaultWeeklySchedule(): Record<number, WeeklyTimeSlot[]> {
  const defaultSlots: WeeklyTimeSlot[] = [
    { horaInicio: '09:00', horaFin: '10:00', tipo: 'PRESENCIAL' },
    { horaInicio: '10:00', horaFin: '11:00', tipo: 'PRESENCIAL' },
    { horaInicio: '11:00', horaFin: '12:00', tipo: 'PRESENCIAL' },
    { horaInicio: '14:00', horaFin: '15:00', tipo: 'PRESENCIAL' },
    { horaInicio: '15:00', horaFin: '16:00', tipo: 'PRESENCIAL' },
    { horaInicio: '16:00', horaFin: '17:00', tipo: 'PRESENCIAL' },
  ];

  return {
    1: [...defaultSlots], // Lunes
    2: [...defaultSlots], // Martes
    3: [...defaultSlots], // Miércoles
    4: [...defaultSlots], // Jueves
    5: [...defaultSlots], // Viernes
    // Sábado y Domingo vacíos
  };
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export function getDayName(dayIndex: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayIndex] || '';
}

/**
 * Calcula el primer y último día del próximo mes
 */
export function getNextMonthRange(): { start: string; end: string } {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
  
  return {
    start: nextMonth.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  };
}

/**
 * Obtiene todos los slots, opcionalmente filtrados por doctorId y fecha
 */
export async function getSlots(
  doctorId?: string,
  fecha?: string
): Promise<DoctorSlot[]> {
  const params = new URLSearchParams();
  if (doctorId) params.append('doctorId', doctorId);
  if (fecha) params.append('fecha', fecha);

  const url = params.toString() 
    ? `${API_BASE_URL}?${params.toString()}`
    : API_BASE_URL;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || `Error al obtener slots: ${response.status}`);
  }

  const data = await response.json();
  return data.map(toCamelCase);
}

/**
 * Obtiene un slot específico por ID
 */
export async function getSlot(id: number): Promise<DoctorSlot> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || `Error al obtener slot: ${response.status}`);
  }

  const data = await response.json();
  return toCamelCase(data);
}

/**
 * Crea un nuevo slot de disponibilidad
 */
export async function createSlot(request: CreateSlotRequest): Promise<DoctorSlot> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || `Error al crear slot: ${response.status}`);
  }

  const data = await response.json();
  return toCamelCase(data);
}

/**
 * Actualiza un slot existente
 */
export async function updateSlot(
  id: number,
  request: UpdateSlotRequest
): Promise<DoctorSlot> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || `Error al actualizar slot: ${response.status}`);
  }

  const data = await response.json();
  return toCamelCase(data);
}

/**
 * Elimina un slot
 */
export async function deleteSlot(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || `Error al eliminar slot: ${response.status}`);
  }
}
