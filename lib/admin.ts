import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  getDoc,
  where
} from 'firebase/firestore';
import { Usuario, RolUsuario } from '@/types/usuario';
import { Tarea } from '@/types/tarea';

const COLLECTION_NAME = 'users';

// Obtener todos los usuarios
export async function obtenerUsuarios(): Promise<Usuario[]> {
  try {
    const usuariosRef = collection(db, COLLECTION_NAME);
    const q = query(usuariosRef, orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const usuarios: Usuario[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      usuarios.push({
        uid: doc.id,
        nombre: data.nombre || '',
        email: data.email || '',
        rol: data.rol || 'pasante',
        fechaRegistro: data.fechaRegistro,
        activo: data.activo !== false,
      });
    });
    
    return usuarios;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
}

// Cambiar rol de un usuario
export async function cambiarRolUsuario(usuarioId: string, nuevoRol: RolUsuario): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, usuarioId);
    await updateDoc(userRef, { rol: nuevoRol });
    console.log(`✅ Rol actualizado a ${nuevoRol}`);
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    throw error;
  }
}

// Eliminar usuario (soft delete - solo marca como inactivo)
export async function desactivarUsuario(usuarioId: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, usuarioId);
    await updateDoc(userRef, { activo: false });
    console.log('✅ Usuario desactivado');
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    throw error;
  }
}

// Reactivar usuario
export async function reactivarUsuario(usuarioId: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, usuarioId);
    await updateDoc(userRef, { activo: true });
    console.log('✅ Usuario reactivado');
  } catch (error) {
    console.error('Error al reactivar usuario:', error);
    throw error;
  }
}

// Eliminar usuario permanentemente (cuidado!)
export async function eliminarUsuarioPermanente(usuarioId: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, usuarioId);
    await deleteDoc(userRef);
    console.log('✅ Usuario eliminado permanentemente');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
}

// Obtener usuario por ID
export async function obtenerUsuarioPorId(usuarioId: string): Promise<Usuario | null> {
  try {
    const userRef = doc(db, COLLECTION_NAME, usuarioId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: userSnap.id,
        nombre: data.nombre || '',
        email: data.email || '',
        rol: data.rol || 'pasante',
        fechaRegistro: data.fechaRegistro,
        activo: data.activo !== false,
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

// Obtener estadísticas de un usuario específico
export async function obtenerEstadisticasUsuario(usuarioId: string) {
  try {
    // Obtener tareas del usuario
    const tareasRef = collection(db, 'tareas');
    const tareasQuery = query(tareasRef, where('asignadoA', '==', usuarioId));
    const tareasSnapshot = await getDocs(tareasQuery);
    
    const tareas = tareasSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as Tarea));
    
    const tareasPendientes = tareas.filter(t => t.estatus !== 'completada').length;
    const tareasCompletadas = tareas.filter(t => t.estatus === 'completada').length;
    const tareasTotales = tareas.length;
    
    // Obtener expedientes donde el usuario está asignado
    // Para simplificar, usamos tareas para saber en qué expedientes trabaja
    const expedientesUnicos = new Set(tareas.map(t => t.expedienteId));
    
    // Obtener horas totales registradas (de tareas completadas)
    const horasTotales = tareas
      .filter(t => t.estatus === 'completada' && t.horasReales)
      .reduce((sum, t) => sum + (t.horasReales || 0), 0);
    
    return {
      tareasPendientes,
      tareasCompletadas,
      tareasTotales,
      expedientesAsignados: expedientesUnicos.size,
      horasTotales
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      tareasPendientes: 0,
      tareasCompletadas: 0,
      tareasTotales: 0,
      expedientesAsignados: 0,
      horasTotales: 0
    };
  }
}

// Obtener tareas pendientes de un usuario
export async function obtenerTareasPendientesUsuario(usuarioId: string): Promise<Tarea[]> {
  try {
    const tareasRef = collection(db, 'tareas');
    const q = query(
      tareasRef, 
      where('asignadoA', '==', usuarioId),
      where('estatus', 'in', ['pendiente', 'en-progreso']),
      orderBy('fechaLimite', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const tareas: Tarea[] = [];
    querySnapshot.forEach((doc) => {
      tareas.push({ ...doc.data() as Tarea, uid: doc.id });
    });
    
    return tareas;
  } catch (error) {
    console.error('Error al obtener tareas pendientes:', error);
    return [];
  }
}

// Obtener expedientes donde el usuario tiene actividad
export async function obtenerExpedientesUsuario(usuarioId: string) {
  try {
    const tareas = await obtenerTareasPendientesUsuario(usuarioId);
    const expedientesIds = [...new Set(tareas.map(t => t.expedienteId))];
    
    const expedientes: { id: string; numero: string; cliente: string; estatus: string; tareasCount: number }[] = [];
    
    for (const expId of expedientesIds) {
      const expRef = doc(db, 'expedientes', expId);
      const expSnap = await getDoc(expRef);
      
      if (expSnap.exists()) {
        const data = expSnap.data();
        const tareasDelExpediente = tareas.filter(t => t.expedienteId === expId);
        expedientes.push({
          id: expId,
          numero: data.numExpediente || expId,
          cliente: data.clienteNombre || 'Cliente',
          estatus: data.estatus || 'Activo',
          tareasCount: tareasDelExpediente.length
        });
      }
    }
    
    return expedientes;
  } catch (error) {
    console.error('Error al obtener expedientes:', error);
    return [];
  }
}