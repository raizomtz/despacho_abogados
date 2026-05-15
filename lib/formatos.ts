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
  Timestamp,
  increment
} from 'firebase/firestore';
import { Formato, FormatoFormData } from '@/types/formato';
import { subirArchivoFormato } from './storage';

const COLLECTION_NAME = 'formatos';

// Crear nuevo formato
// Crear nuevo formato con archivo
export async function crearFormato(
  formatoData: FormatoFormData,
  userId: string,
  userName: string
): Promise<string> {
  try {
    if (!formatoData.archivo) {
      throw new Error('Debes seleccionar un archivo');
    }

    // Primero crear el documento en Firestore para obtener el ID
    const formatosRef = collection(db, COLLECTION_NAME);
    const nuevoDocRef = doc(formatosRef);
    const formatoId = nuevoDocRef.id;  // ← Firebase genera el ID automáticamente

    // Subir archivo a Storage usando el mismo ID
    const { url, path } = await subirArchivoFormato(formatoData.archivo, userId, formatoId);
    
    const nuevoFormato = {
      nombre: formatoData.nombre,
      descripcion: formatoData.descripcion,
      categoria: formatoData.categoria,
      archivoUrl: url,
      archivoPath: path,
      nombreArchivo: formatoData.archivo.name,
      tipoArchivo: formatoData.archivo.type.includes('pdf') ? 'pdf' : 
                   formatoData.archivo.type.includes('word') ? 'docx' : 'doc',
      tamanioBytes: formatoData.archivo.size,
      creadoPor: userId,
      creadoPorNombre: userName,
      fechaCreacion: serverTimestamp(),
      fechaModificacion: serverTimestamp(),
      vecesUsado: 0,
    };
    
    await setDoc(nuevoDocRef, nuevoFormato);
    console.log('✅ Formato creado con ID:', formatoId);
    return formatoId;
  } catch (error) {
    console.error('❌ Error al crear formato:', error);
    throw error;
  }
}

// Obtener todos los formatos
export async function obtenerFormatos(): Promise<Formato[]> {
  try {
    const formatosRef = collection(db, COLLECTION_NAME);
    const q = query(formatosRef, orderBy('fechaModificacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const formatos: Formato[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      formatos.push({
        ...data as Formato,
        uid: doc.id,
      });
    });
    
    return formatos;
  } catch (error) {
    console.error('❌ Error al obtener formatos:', error);
    throw error;
  }
}

// Obtener formato por ID
export async function obtenerFormatoPorId(formatoId: string): Promise<Formato | null> {
  try {
    const formatoRef = doc(db, COLLECTION_NAME, formatoId);
    const formatoSnap = await getDoc(formatoRef);
    
    if (formatoSnap.exists()) {
      return { ...formatoSnap.data() as Formato, uid: formatoSnap.id };
    }
    return null;
  } catch (error) {
    console.error('❌ Error al obtener formato:', error);
    throw error;
  }
}

// Obtener formatos por categoría
export async function obtenerFormatosPorCategoria(categoria: string): Promise<Formato[]> {
  try {
    const formatosRef = collection(db, COLLECTION_NAME);
    const q = query(formatosRef, where('categoria', '==', categoria), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const formatos: Formato[] = [];
    querySnapshot.forEach((doc) => {
      formatos.push({ ...doc.data() as Formato, uid: doc.id });
    });
    
    return formatos;
  } catch (error) {
    console.error('❌ Error al obtener formatos:', error);
    throw error;
  }
}

// Actualizar formato
export async function actualizarFormato(
  formatoId: string,
  data: Partial<Formato>
): Promise<void> {
  try {
    const formatoRef = doc(db, COLLECTION_NAME, formatoId);
    await updateDoc(formatoRef, {
      ...data,
      fechaModificacion: serverTimestamp()
    });
    console.log('✅ Formato actualizado');
  } catch (error) {
    console.error('❌ Error al actualizar formato:', error);
    throw error;
  }
}

// Incrementar contador de uso
export async function incrementarUsoFormato(formatoId: string): Promise<void> {
  try {
    const formatoRef = doc(db, COLLECTION_NAME, formatoId);
    await updateDoc(formatoRef, {
      vecesUsado: increment(1),
      fechaModificacion: serverTimestamp()
    });
    console.log('✅ Uso incrementado');
  } catch (error) {
    console.error('❌ Error al incrementar uso:', error);
    throw error;
  }
}

// Eliminar formato
export async function eliminarFormato(formatoId: string, archivoPath: string): Promise<void> {
  try {
    const formatoRef = doc(db, COLLECTION_NAME, formatoId);
    await deleteDoc(formatoRef);
    console.log('✅ Formato eliminado');
  } catch (error) {
    console.error('❌ Error al eliminar formato:', error);
    throw error;
  }
}