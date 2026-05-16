import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { Expediente, ExpedienteFormData } from '@/types/expediente';
import { actualizarCliente } from './clientes';

const COLLECTION_NAME = 'expedientes';

// Crear nuevo expediente
export async function crearExpediente(
  expedienteData: ExpedienteFormData,
  userId: string
): Promise<string> {
  try {
    const expedientesRef = collection(db, COLLECTION_NAME);
    const nuevoDocRef = doc(expedientesRef);
    const expedienteId = nuevoDocRef.id;
    
    // Crear el objeto sin usar spread directamente para evitar conflictos de tipos
    const nuevoExpediente = {
      unidadNegocio: expedienteData.unidadNegocio,
      clienteId: expedienteData.clienteId,
      clienteNombre: expedienteData.clienteNombre,
      objeto: expedienteData.objeto,
      tipoAsunto: expedienteData.tipoAsunto,
      autoridadId: expedienteData.autoridadId,
      numExpediente: expedienteData.numExpediente,
      expedienteOrigen: expedienteData.expedienteOrigen,
      actorInteresado: expedienteData.actorInteresado,
      demandadoInculpado: expedienteData.demandadoInculpado,
      estatus: expedienteData.estatus,
      asignados: expedienteData.asignados || [],
      encargadoPrincipal: expedienteData.encargadoPrincipal || null, 
      fechaRegistro: serverTimestamp(),
      creadoPor: userId,
    };
    
    await setDoc(nuevoDocRef, nuevoExpediente);
    
    // Actualizar el cliente para agregar el ID del expediente
    await actualizarCliente(expedienteData.clienteId, {
      expedientes: arrayUnion(expedienteId)
    });
    
    console.log('✅ Expediente creado con ID:', expedienteId);
    return expedienteId;
  } catch (error) {
    console.error('❌ Error al crear expediente:', error);
    throw error;
  }
}

// Obtener todos los expedientes
export async function obtenerExpedientes(): Promise<Expediente[]> {
  try {
    const expedientesRef = collection(db, COLLECTION_NAME);
    const q = query(expedientesRef, orderBy('fechaRegistro', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const expedientes: Expediente[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expedientes.push({
        ...data as Expediente,
        uid: doc.id,
      });
    });
    
    return expedientes;
  } catch (error) {
    console.error('❌ Error al obtener expedientes:', error);
    throw error;
  }
}

// Obtener expediente por ID
export async function obtenerExpedientePorId(expedienteId: string): Promise<Expediente | null> {
  try {
    const expedienteRef = doc(db, COLLECTION_NAME, expedienteId);
    const expedienteSnap = await getDoc(expedienteRef);
    
    if (expedienteSnap.exists()) {
      return { ...expedienteSnap.data() as Expediente, uid: expedienteSnap.id };
    }
    return null;
  } catch (error) {
    console.error('❌ Error al obtener expediente:', error);
    throw error;
  }
}

// Obtener expedientes por cliente
export async function obtenerExpedientesPorCliente(clienteId: string): Promise<Expediente[]> {
  try {
    const expedientesRef = collection(db, COLLECTION_NAME);
    const q = query(expedientesRef, where('clienteId', '==', clienteId));
    const querySnapshot = await getDocs(q);
    
    const expedientes: Expediente[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expedientes.push({
        ...data as Expediente,
        uid: doc.id,
      });
    });
    
    return expedientes;
  } catch (error) {
    console.error('❌ Error al obtener expedientes por cliente:', error);
    throw error;
  }
}

// Actualizar expediente
export async function actualizarExpediente(
  expedienteId: string, 
  data: Partial<Expediente>
): Promise<void> {
  try {
    const expedienteRef = doc(db, COLLECTION_NAME, expedienteId);
    await updateDoc(expedienteRef, data);
    console.log('✅ Expediente actualizado');
  } catch (error) {
    console.error('❌ Error al actualizar expediente:', error);
    throw error;
  }
}

// Eliminar expediente
export async function eliminarExpediente(expedienteId: string, clienteId: string): Promise<void> {
  try {
    const expedienteRef = doc(db, COLLECTION_NAME, expedienteId);
    await deleteDoc(expedienteRef);
    
    // Remover el expediente del array del cliente
    await actualizarCliente(clienteId, {
      expedientes: arrayRemove(expedienteId)
    });
    
    console.log('✅ Expediente eliminado');
  } catch (error) {
    console.error('❌ Error al eliminar expediente:', error);
    throw error;
  }
}

// Obtener expedientes donde el usuario está asignado
export async function obtenerExpedientesPorUsuario(usuarioId: string): Promise<Expediente[]> {
  try {
    const expedientesRef = collection(db, COLLECTION_NAME);
    const q = query(
      expedientesRef, 
      where('asignados', 'array-contains', usuarioId),
      orderBy('fechaRegistro', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const expedientes: Expediente[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expedientes.push({
        uid: doc.id,
        unidadNegocio: data.unidadNegocio,
        clienteId: data.clienteId,
        clienteNombre: data.clienteNombre,
        objeto: data.objeto,
        tipoAsunto: data.tipoAsunto,
        autoridadId: data.autoridadId,
        numExpediente: data.numExpediente,
        expedienteOrigen: data.expedienteOrigen,
        actorInteresado: data.actorInteresado,
        demandadoInculpado: data.demandadoInculpado,
        estatus: data.estatus,
        asignados: data.asignados || [],
        encargadoPrincipal: data.encargadoPrincipal || null,
        fechaRegistro: data.fechaRegistro,
        creadoPor: data.creadoPor,
      });
    });
    
    return expedientes;
  } catch (error) {
    console.error('❌ Error al obtener expedientes por usuario:', error);
    throw error;
  }
}