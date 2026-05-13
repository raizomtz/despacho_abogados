export interface Cliente {
  codigoUnico: string;
  nombre: string;
  rfc: string;
  domicilio: string;
  representanteLegal: string;
  contactoPrincipal: string;
  email: string;
  celWhatsapp: string;
  telefono: string;
  expedientes: string[];
  creadoPor: string;
  fechaRegistro: any; // Firebase Timestamp
  uid?: string; // ID del documento en Firestore
}

export interface ClienteFormData {
  codigoUnico: string;
  nombre: string;
  rfc: string;
  domicilio: string;
  representanteLegal: string;
  contactoPrincipal: string;
  email: string;
  celWhatsapp: string;
  telefono: string;
}