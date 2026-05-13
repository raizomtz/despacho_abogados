import { Timestamp } from 'firebase/firestore';

export interface Autoridad {
  uid?: string;
  nombreCorto: string;
  nombreCompleto: string;
  fuero: 'Local' | 'Federal';
  materia: 'Civil' | 'Familiar' | 'Mercantil' | 'Penal' | 'Laboral' | 'Administrativo';
  direccion: string;
  ubicacionGPS: string;
  telefono: string;
  horario: string;
  creadoPor: string;
  fechaRegistro: Timestamp;
}

export interface AutoridadFormData {
  nombreCorto: string;
  nombreCompleto: string;
  fuero: 'Local' | 'Federal';
  materia: 'Civil' | 'Familiar' | 'Mercantil' | 'Penal' | 'Laboral' | 'Administrativo';
  direccion: string;
  ubicacionGPS: string;
  telefono: string;
  horario: string;
}