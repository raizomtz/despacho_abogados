import { Timestamp } from 'firebase/firestore';

export interface Formato {
  uid?: string;
  nombre: string;
  descripcion: string;
  categoria: 'judicial' | 'administrativo' | 'notarial' | 'general';
  archivoUrl: string; // URL de Firebase Storage
  archivoPath: string; // Ruta en Storage
  nombreArchivo: string;
  tipoArchivo: 'pdf' | 'doc' | 'docx';
  tamanioBytes: number;
  creadoPor: string;
  creadoPorNombre?: string;
  fechaCreacion: Timestamp;
  fechaModificacion: Timestamp;
  vecesUsado: number;
}

export interface FormatoFormData {
  nombre: string;
  descripcion: string;
  categoria: 'judicial' | 'administrativo' | 'notarial' | 'general';
  archivo: File | null;
  archivoUrl?: string;
  archivoPath?: string;
  nombreArchivo?: string;
  tipoArchivo?: 'pdf' | 'doc' | 'docx';
  tamanioBytes?: number;
}