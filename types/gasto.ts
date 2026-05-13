import { Timestamp } from 'firebase/firestore';

export type EstatusPago = 'pendiente' | 'reembolsado' | 'por-facturar';

export interface Gasto {
  uid?: string;
  fecha: Timestamp;
  clienteId: string;
  clienteNombre: string;
  expedienteId: string;
  expedienteNum: string;
  concepto: string;
  subtotal: number;
  iva: number;
  total: number;
  estatusPago: EstatusPago;
  registradoPor: string;
  registradoPorNombre?: string;
  comprobanteURL: string | null;
}

export interface GastoFormData {
  fecha: string; // ISO string del input date
  clienteId: string;
  clienteNombre: string;
  expedienteId: string;
  expedienteNum: string;
  concepto: string;
  subtotal: number;
  iva: number;
  total: number;
  estatusPago: EstatusPago;
}