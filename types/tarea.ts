import { Timestamp, FieldValue } from 'firebase/firestore';

export type TipoTarea = 'diligencia' | 'vencimiento' | 'documento' | 'administrativa';
export type Prioridad = 'alta' | 'media' | 'baja';
export type EstatusTarea = 'pendiente' | 'en-progreso' | 'completada' | 'atrasada';

export interface HistorialTarea {
  usuario: string;
  usuarioNombre?: string;
  estatusAnterior: EstatusTarea;
  estatusNuevo: EstatusTarea;
  fecha: Timestamp | FieldValue; // ← Permitir ambos tipos
  comentario: string;
}

export interface Tarea {
  uid?: string;
  titulo: string;
  descripcion: string;
  tipo: TipoTarea;
  expedienteId: string;
  expedienteNum: string;
  clienteNombre: string;
  asignadoA: string;
  asignadoANombre?: string; // Desnormalizado para mostrar
  asignadoPor: string;
  asignadoPorNombre?: string; // Desnormalizado
  fechaAsignacion: Timestamp;
  fechaLimite: Timestamp;
  prioridad: Prioridad;
  estatus: EstatusTarea;
  fechaCompletado: Timestamp | null;
  horasReales: number;
  comentarioFinal: string;
  historial: HistorialTarea[];
}

export interface TareaFormData {
  titulo: string;
  descripcion: string;
  tipo: TipoTarea;
  expedienteId: string;
  expedienteNum: string;
  clienteNombre: string;
  asignadoA: string;
  fechaLimite: string; // ISO string del input date
  prioridad: Prioridad;
}

export interface ActualizarEstatusData {
  estatus: EstatusTarea;
  horasReales?: number;
  comentarioFinal?: string;
}