import { Timestamp } from 'firebase/firestore';

export type RolUsuario = 'admin' | 'abogado' | 'pasante';

export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  fechaRegistro: Timestamp;
  activo: boolean; // Para soft delete
}