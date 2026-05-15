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
  serverTimestamp
} from 'firebase/firestore';
import { Enlace, EnlaceFormData, TipoEnlace } from '@/types/enlace';

const COLLECTION_NAME = 'enlaces';

// Crear nuevo enlace
export async function crearEnlace(
  enlaceData: EnlaceFormData,
  userId: string,
  userName: string
): Promise<string> {
  try {
    const enlacesRef = collection(db, COLLECTION_NAME);
    const nuevoDocRef = doc(enlacesRef);
    const enlaceId = nuevoDocRef.id;
    
    // Obtener el último orden
    const q = query(enlacesRef, orderBy('orden', 'desc'));
    const snapshot = await getDocs(q);
    let ultimoOrden = 0;
    if (!snapshot.empty) {
      ultimoOrden = snapshot.docs[0].data().orden || 0;
    }
    
    const nuevoEnlace = {
      nombre: enlaceData.nombre,
      url: enlaceData.url,
      tipo: enlaceData.tipo,
      descripcion: enlaceData.descripcion,
      jurisdiccion: enlaceData.jurisdiccion,
      activo: true,
      orden: ultimoOrden + 1,
      icono: enlaceData.icono,
      creadoPor: userId,
      creadoPorNombre: userName,
      fechaRegistro: serverTimestamp(),
    };
    
    await setDoc(nuevoDocRef, nuevoEnlace);
    console.log('✅ Enlace creado con ID:', enlaceId);
    return enlaceId;
  } catch (error) {
    console.error('❌ Error al crear enlace:', error);
    throw error;
  }
}

// Obtener todos los enlaces
export async function obtenerEnlaces(): Promise<Enlace[]> {
  try {
    const enlacesRef = collection(db, COLLECTION_NAME);
    const q = query(enlacesRef, orderBy('orden', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const enlaces: Enlace[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      enlaces.push({
        ...data as Enlace,
        uid: doc.id,
      });
    });
    
    return enlaces;
  } catch (error) {
    console.error('❌ Error al obtener enlaces:', error);
    throw error;
  }
}

// Obtener enlaces por tipo
export async function obtenerEnlacesPorTipo(tipo: TipoEnlace): Promise<Enlace[]> {
  try {
    const enlacesRef = collection(db, COLLECTION_NAME);
    const q = query(enlacesRef, where('tipo', '==', tipo), orderBy('orden', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const enlaces: Enlace[] = [];
    querySnapshot.forEach((doc) => {
      enlaces.push({ ...doc.data() as Enlace, uid: doc.id });
    });
    
    return enlaces;
  } catch (error) {
    console.error('❌ Error al obtener enlaces por tipo:', error);
    throw error;
  }
}

// Actualizar enlace
export async function actualizarEnlace(
  enlaceId: string,
  data: Partial<Enlace>
): Promise<void> {
  try {
    const enlaceRef = doc(db, COLLECTION_NAME, enlaceId);
    await updateDoc(enlaceRef, data);
    console.log('✅ Enlace actualizado');
  } catch (error) {
    console.error('❌ Error al actualizar enlace:', error);
    throw error;
  }
}

// Reordenar enlaces (intercambiar órdenes)
export async function reordenarEnlaces(enlaceId1: string, enlaceId2: string): Promise<void> {
  try {
    const enlace1Ref = doc(db, COLLECTION_NAME, enlaceId1);
    const enlace2Ref = doc(db, COLLECTION_NAME, enlaceId2);
    
    const [doc1, doc2] = await Promise.all([
      getDoc(enlace1Ref),
      getDoc(enlace2Ref)
    ]);
    
    const orden1 = doc1.data()?.orden;
    const orden2 = doc2.data()?.orden;
    
    await Promise.all([
      updateDoc(enlace1Ref, { orden: orden2 }),
      updateDoc(enlace2Ref, { orden: orden1 })
    ]);
    
    console.log('✅ Enlaces reordenados');
  } catch (error) {
    console.error('❌ Error al reordenar enlaces:', error);
    throw error;
  }
}

// Eliminar enlace
export async function eliminarEnlace(enlaceId: string): Promise<void> {
  try {
    const enlaceRef = doc(db, COLLECTION_NAME, enlaceId);
    await deleteDoc(enlaceRef);
    console.log('✅ Enlace eliminado');
  } catch (error) {
    console.error('❌ Error al eliminar enlace:', error);
    throw error;
  }
}