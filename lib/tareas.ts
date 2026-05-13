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
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Tarea, TareaFormData, ActualizarEstatusData, HistorialTarea } from '@/types/tarea';

const COLLECTION_NAME = 'tareas';

// Crear nueva tarea
export async function crearTarea(
  tareaData: TareaFormData,
  userId: string,
  userName: string
): Promise<string> {
  try {
    const tareasRef = collection(db, COLLECTION_NAME);
    const nuevoDocRef = doc(tareasRef);
    const tareaId = nuevoDocRef.id;
    
    const nuevaTarea = {
      titulo: tareaData.titulo,
      descripcion: tareaData.descripcion,
      tipo: tareaData.tipo,
      expedienteId: tareaData.expedienteId,
      expedienteNum: tareaData.expedienteNum,
      clienteNombre: tareaData.clienteNombre,
      asignadoA: tareaData.asignadoA,
      asignadoPor: userId,
      asignadoPorNombre: userName,
      fechaAsignacion: serverTimestamp(),
      fechaLimite: Timestamp.fromDate(new Date(tareaData.fechaLimite)),
      prioridad: tareaData.prioridad,
      estatus: 'pendiente',
      fechaCompletado: null,
      horasReales: 0,
      comentarioFinal: '',
      historial: []
    };
    
    await setDoc(nuevoDocRef, nuevaTarea);
    console.log('✅ Tarea creada con ID:', tareaId);
    return tareaId;
  } catch (error) {
    console.error('❌ Error al crear tarea:', error);
    throw error;
  }
}

// Obtener tareas asignadas a un usuario
export async function obtenerTareasPorUsuario(usuarioId: string): Promise<Tarea[]> {
  try {
    const tareasRef = collection(db, COLLECTION_NAME);
    const q = query(
      tareasRef, 
      where('asignadoA', '==', usuarioId),
      orderBy('fechaLimite', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const tareas: Tarea[] = [];
    querySnapshot.forEach((doc) => {
      tareas.push({ ...doc.data() as Tarea, uid: doc.id });
    });
    
    return tareas;
  } catch (error) {
    console.error('❌ Error al obtener tareas:', error);
    throw error;
  }
}

// Obtener todas las tareas (para admin/abogados)
export async function obtenerTodasTareas(): Promise<Tarea[]> {
  try {
    const tareasRef = collection(db, COLLECTION_NAME);
    const q = query(tareasRef, orderBy('fechaLimite', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const tareas: Tarea[] = [];
    querySnapshot.forEach((doc) => {
      tareas.push({ ...doc.data() as Tarea, uid: doc.id });
    });
    
    return tareas;
  } catch (error) {
    console.error('❌ Error al obtener tareas:', error);
    throw error;
  }
}

// Obtener tarea por ID
export async function obtenerTareaPorId(tareaId: string): Promise<Tarea | null> {
  try {
    const tareaRef = doc(db, COLLECTION_NAME, tareaId);
    const tareaSnap = await getDoc(tareaRef);
    
    if (tareaSnap.exists()) {
      return { ...tareaSnap.data() as Tarea, uid: tareaSnap.id };
    }
    return null;
  } catch (error) {
    console.error('❌ Error al obtener tarea:', error);
    throw error;
  }
}

// Actualizar estatus de tarea
export async function actualizarEstatusTarea(
  tareaId: string,
  data: ActualizarEstatusData,
  usuarioId: string,
  usuarioNombre: string
): Promise<void> {
  try {
    const tareaRef = doc(db, COLLECTION_NAME, tareaId);
    const tareaActual = await getDoc(tareaRef);
    
    if (!tareaActual.exists()) {
      throw new Error('Tarea no encontrada');
    }
    
    const tareaData = tareaActual.data() as Tarea;
    
    // Crear historial
    const nuevoHistorial: HistorialTarea = {
      usuario: usuarioId,
      usuarioNombre: usuarioNombre,
      estatusAnterior: tareaData.estatus,
      estatusNuevo: data.estatus,
      fecha: serverTimestamp(),
      comentario: data.comentarioFinal || `Cambió estatus a ${data.estatus}`
    };
    
    const updateData: any = {
      estatus: data.estatus,
      historial: [...(tareaData.historial || []), nuevoHistorial]
    };
    
    // Si se completa, agregar fecha y horas
    if (data.estatus === 'completada') {
      updateData.fechaCompletado = serverTimestamp();
      if (data.horasReales) {
        updateData.horasReales = data.horasReales;
      }
      if (data.comentarioFinal) {
        updateData.comentarioFinal = data.comentarioFinal;
      }
    }
    
    await updateDoc(tareaRef, updateData);
    console.log('✅ Estatus actualizado');
  } catch (error) {
    console.error('❌ Error al actualizar estatus:', error);
    throw error;
  }
}

// Actualizar tarea completa
export async function actualizarTarea(
  tareaId: string,
  data: Partial<Tarea>
): Promise<void> {
  try {
    const tareaRef = doc(db, COLLECTION_NAME, tareaId);
    await updateDoc(tareaRef, data);
    console.log('✅ Tarea actualizada');
  } catch (error) {
    console.error('❌ Error al actualizar tarea:', error);
    throw error;
  }
}

// Eliminar tarea
export async function eliminarTarea(tareaId: string): Promise<void> {
  try {
    const tareaRef = doc(db, COLLECTION_NAME, tareaId);
    await deleteDoc(tareaRef);
    console.log('✅ Tarea eliminada');
  } catch (error) {
    console.error('❌ Error al eliminar tarea:', error);
    throw error;
  }
}

// Obtener tareas por expediente
export async function obtenerTareasPorExpediente(expedienteId: string): Promise<Tarea[]> {
  try {
    const tareasRef = collection(db, COLLECTION_NAME);
    const q = query(tareasRef, where('expedienteId', '==', expedienteId));
    const querySnapshot = await getDocs(q);
    
    const tareas: Tarea[] = [];
    querySnapshot.forEach((doc) => {
      tareas.push({ ...doc.data() as Tarea, uid: doc.id });
    });
    
    return tareas;
  } catch (error) {
    console.error('❌ Error al obtener tareas por expediente:', error);
    throw error;
  }
}