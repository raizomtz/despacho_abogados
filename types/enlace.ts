import { Timestamp } from 'firebase/firestore';

export type TipoEnlace = 'tribunal' | 'junta' | 'federal' | 'otro';

export interface Enlace {
  uid?: string;
  nombre: string;
  url: string;
  tipo: TipoEnlace;
  descripcion: string;
  jurisdiccion: string;
  activo: boolean;
  orden: number;
  icono: string;
  creadoPor: string;
  creadoPorNombre?: string;
  fechaRegistro: Timestamp;
}

export interface EnlaceFormData {
  nombre: string;
  url: string;
  tipo: TipoEnlace;
  descripcion: string;
  jurisdiccion: string;
  icono: string;
}