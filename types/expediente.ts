import { Timestamp } from 'firebase/firestore';

export interface Expediente {
  uid?: string;
  unidadNegocio: string;
  clienteId: string;
  clienteNombre: string;
  objeto: string;
  tipoAsunto: string;
  autoridadId: string;
  numExpediente: string;
  expedienteOrigen: string;
  actorInteresado: string;
  demandadoInculpado: string;
  estatus: 'Activo' | 'Concluido' | 'Suspendido';
  fechaRegistro: Timestamp;
  asignados: string[];
  creadoPor: string;
  encargadoPrincipal: string | null;
}

export interface ExpedienteFormData {
  unidadNegocio: string;
  clienteId: string;
  clienteNombre: string;
  objeto: string;
  tipoAsunto: string;
  autoridadId: string;
  numExpediente: string;
  expedienteOrigen: string;
  actorInteresado: string;
  demandadoInculpado: string;
  estatus: 'Activo' | 'Concluido' | 'Suspendido';
  asignados: string[];
  encargadoPrincipal: string | null;
}