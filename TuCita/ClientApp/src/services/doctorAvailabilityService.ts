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
