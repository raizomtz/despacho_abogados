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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Autoridad, AutoridadFormData } from '@/types/autoridad';

const COLLECTION_NAME = 'autoridades';

// Crear nueva autoridad
export async function crearAutoridad(
  autoridadData: AutoridadFormData,
  userId: string
): Promise<string> {
  try {
    const autoridadesRef = collection(db, COLLECTION_NAME);
    const nuevoDocRef = doc(autoridadesRef);
    const autoridadId = nuevoDocRef.id;
    
    const nuevaAutoridad = {
      nombreCorto: autoridadData.nombreCorto,
      nombreCompleto: autoridadData.nombreCompleto,
      fuero: autoridadData.fuero,
      materia: autoridadData.materia,
      direccion: autoridadData.direccion,
      ubicacionGPS: autoridadData.ubicacionGPS,
      telefono: autoridadData.telefono,
      horario: autoridadData.horario,
      creadoPor: userId,
      fechaRegistro: serverTimestamp(),
    };
    
    await setDoc(nuevoDocRef, nuevaAutoridad);
    console.log('✅ Autoridad creada con ID:', autoridadId);
    return autoridadId;
  } catch (error) {
    console.error('❌ Error al crear autoridad:', error);
    throw error;
  }
}

// Obtener todas las autoridades
export async function obtenerAutoridades(): Promise<Autoridad[]> {
  try {
    const autoridadesRef = collection(db, COLLECTION_NAME);
    const q = query(autoridadesRef, orderBy('nombreCorto', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const autoridades: Autoridad[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      autoridades.push({
        ...data as Autoridad,
        uid: doc.id,
      });
    });
    
    return autoridades;
  } catch (error) {
    console.error('❌ Error al obtener autoridades:', error);
    throw error;
  }
}

// Obtener autoridad por ID
export async function obtenerAutoridadPorId(autoridadId: string): Promise<Autoridad | null> {
  try {
    const autoridadRef = doc(db, COLLECTION_NAME, autoridadId);
    const autoridadSnap = await getDoc(autoridadRef);
    
    if (autoridadSnap.exists()) {
      return { ...autoridadSnap.data() as Autoridad, uid: autoridadSnap.id };
    }
    return null;
  } catch (error) {
    console.error('❌ Error al obtener autoridad:', error);
    throw error;
  }
}

// Actualizar autoridad
export async function actualizarAutoridad(
  autoridadId: string, 
  data: Partial<Autoridad>
): Promise<void> {
  try {
    const autoridadRef = doc(db, COLLECTION_NAME, autoridadId);
    await updateDoc(autoridadRef, data);
    console.log('✅ Autoridad actualizada');
  } catch (error) {
    console.error('❌ Error al actualizar autoridad:', error);
    throw error;
  }
}

// Eliminar autoridad
export async function eliminarAutoridad(autoridadId: string): Promise<void> {
  try {
    const autoridadRef = doc(db, COLLECTION_NAME, autoridadId);
    await deleteDoc(autoridadRef);
    console.log('✅ Autoridad eliminada');
  } catch (error) {
    console.error('❌ Error al eliminar autoridad:', error);
    throw error;
  }
}