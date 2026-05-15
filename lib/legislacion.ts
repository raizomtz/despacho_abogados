import { db, storage } from './firebase';
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
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Legislacion, LegislacionFormData, TipoLegislacion, NivelLegislacion } from '@/types/legislacion';

const COLLECTION_NAME = 'legislacion';

// Función auxiliar para subir archivo
async function subirArchivoLegislacion(
  file: File,
  userId: string,
  legislacionId: string
): Promise<{ url: string; path: string }> {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${legislacionId}.${fileExtension}`;
    const filePath = `legislacion/${userId}/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    console.log('✅ Archivo subido a Storage');
    return { url, path: filePath };
  } catch (error) {
    console.error('❌ Error al subir archivo:', error);
    throw error;
  }
}

// Función auxiliar para eliminar archivo
async function eliminarArchivoStorage(filePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    console.log('✅ Archivo eliminado de Storage');
  } catch (error) {
    console.error('❌ Error al eliminar archivo:', error);
    throw error;
  }
}

// Crear nueva legislación con archivo
export async function crearLegislacion(
  legislacionData: LegislacionFormData,
  userId: string,
  userName: string
): Promise<string> {
  try {
    if (!legislacionData.archivo) {
      throw new Error('Debes seleccionar un archivo');
    }

    // Primero crear el documento en Firestore para obtener el ID
    const legislacionRef = collection(db, COLLECTION_NAME);
    const nuevoDocRef = doc(legislacionRef);
    const legislacionId = nuevoDocRef.id;

    // Subir archivo a Storage usando el mismo ID
    const { url, path } = await subirArchivoLegislacion(legislacionData.archivo, userId, legislacionId);
    
    const nuevaLegislacion = {
      titulo: legislacionData.titulo,
      descripcion: legislacionData.descripcion,
      tipo: legislacionData.tipo,
      nivel: legislacionData.nivel,
      jurisdiccion: legislacionData.jurisdiccion,
      fechaPublicacion: legislacionData.fechaPublicacion,
      articulos: legislacionData.articulos,
      vigente: legislacionData.vigente,
      archivoUrl: url,
      archivoPath: path,
      nombreArchivo: legislacionData.archivo.name,
      tipoArchivo: legislacionData.archivo.type.includes('pdf') ? 'pdf' : 
                   legislacionData.archivo.type.includes('word') ? 'docx' : 'doc',
      tamanioBytes: legislacionData.archivo.size,
      creadoPor: userId,
      creadoPorNombre: userName,
      fechaRegistro: serverTimestamp(),
      vecesVisto: 0,
    };
    
    await setDoc(nuevoDocRef, nuevaLegislacion);
    console.log('✅ Legislación creada con ID:', legislacionId);
    return legislacionId;
  } catch (error) {
    console.error('❌ Error al crear legislación:', error);
    throw error;
  }
}

// Obtener toda la legislación
export async function obtenerLegislacion(): Promise<Legislacion[]> {
  try {
    const legislacionRef = collection(db, COLLECTION_NAME);
    const q = query(legislacionRef, orderBy('titulo', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const legislacion: Legislacion[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      legislacion.push({
        uid: doc.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        nivel: data.nivel,
        jurisdiccion: data.jurisdiccion,
        fechaPublicacion: data.fechaPublicacion,
        articulos: data.articulos,
        vigente: data.vigente,
        archivoUrl: data.archivoUrl,
        archivoPath: data.archivoPath,
        nombreArchivo: data.nombreArchivo,
        tipoArchivo: data.tipoArchivo,
        tamanioBytes: data.tamanioBytes,
        creadoPor: data.creadoPor,
        creadoPorNombre: data.creadoPorNombre,
        fechaRegistro: data.fechaRegistro,
        vecesVisto: data.vecesVisto || 0,
      });
    });
    
    return legislacion;
  } catch (error) {
    console.error('❌ Error al obtener legislación:', error);
    throw error;
  }
}

// Obtener legislación por ID
export async function obtenerLegislacionPorId(legislacionId: string): Promise<Legislacion | null> {
  try {
    const legislacionRef = doc(db, COLLECTION_NAME, legislacionId);
    const legislacionSnap = await getDoc(legislacionRef);
    
    if (legislacionSnap.exists()) {
      const data = legislacionSnap.data();
      return {
        uid: legislacionSnap.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        nivel: data.nivel,
        jurisdiccion: data.jurisdiccion,
        fechaPublicacion: data.fechaPublicacion,
        articulos: data.articulos,
        vigente: data.vigente,
        archivoUrl: data.archivoUrl,
        archivoPath: data.archivoPath,
        nombreArchivo: data.nombreArchivo,
        tipoArchivo: data.tipoArchivo,
        tamanioBytes: data.tamanioBytes,
        creadoPor: data.creadoPor,
        creadoPorNombre: data.creadoPorNombre,
        fechaRegistro: data.fechaRegistro,
        vecesVisto: data.vecesVisto || 0,
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error al obtener legislación:', error);
    throw error;
  }
}

// Actualizar legislación (solo metadatos)
export async function actualizarLegislacion(
  legislacionId: string,
  data: Partial<Legislacion>
): Promise<void> {
  try {
    const legislacionRef = doc(db, COLLECTION_NAME, legislacionId);
    await updateDoc(legislacionRef, data);
    console.log('✅ Legislación actualizada');
  } catch (error) {
    console.error('❌ Error al actualizar legislación:', error);
    throw error;
  }
}

// Incrementar contador de vistas
export async function incrementarVistaLegislacion(legislacionId: string): Promise<void> {
  try {
    const legislacionRef = doc(db, COLLECTION_NAME, legislacionId);
    await updateDoc(legislacionRef, {
      vecesVisto: increment(1)
    });
    console.log('✅ Vista incrementada');
  } catch (error) {
    console.error('❌ Error al incrementar vista:', error);
    throw error;
  }
}

// Eliminar legislación (con archivo de Storage)
export async function eliminarLegislacion(legislacionId: string, archivoPath?: string): Promise<void> {
  try {
    // Eliminar archivo de Storage si existe
    if (archivoPath) {
      await eliminarArchivoStorage(archivoPath);
    }
    
    // Eliminar documento de Firestore
    const legislacionRef = doc(db, COLLECTION_NAME, legislacionId);
    await deleteDoc(legislacionRef);
    console.log('✅ Legislación eliminada');
  } catch (error) {
    console.error('❌ Error al eliminar legislación:', error);
    throw error;
  }
}