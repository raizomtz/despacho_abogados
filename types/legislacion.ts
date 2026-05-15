import { Timestamp } from 'firebase/firestore';

export type TipoLegislacion = 'constitucion' | 'codigo' | 'ley' | 'reglamento' | 'jurisprudencia';
export type NivelLegislacion = 'federal' | 'estatal' | 'municipal';

export interface Legislacion {
  uid?: string;
  titulo: string;
  descripcion: string;
  tipo: TipoLegislacion;
  nivel: NivelLegislacion;
  jurisdiccion: string;
  fechaPublicacion: string;
  articulos: number;
  vigente: boolean;
  // Campos de archivo
  archivoUrl: string;
  archivoPath: string;
  nombreArchivo: string;
  tipoArchivo: 'pdf' | 'doc' | 'docx';
  tamanioBytes: number;
  // Metadatos
  creadoPor: string;
  creadoPorNombre?: string;
  fechaRegistro: Timestamp;
  vecesVisto: number;
}

export interface LegislacionFormData {
  titulo: string;
  descripcion: string;
  tipo: TipoLegislacion;
  nivel: NivelLegislacion;
  jurisdiccion: string;
  fechaPublicacion: string;
  articulos: number;
  vigente: boolean;
  archivo: File | null;
  nombreArchivo?: string;
}