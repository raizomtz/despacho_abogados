import { db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Interfaz para el usuario
export interface UserData {
  nombre: string;
  email: string;
  rol: 'abogado' | 'admin' | 'cliente';
  fechaRegistro: any;
  uid: string;
}

// Crear documento de usuario después del registro
export async function createUserDocument(uid: string, userData: {
  nombre: string;
  email: string;
  rol?: 'abogado' | 'admin' | 'cliente';
}) {
  try {
    const userRef = doc(db, 'users', uid);
    
    const userDoc: UserData = {
      uid: uid,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol || 'abogado', // Por defecto abogado
      fechaRegistro: serverTimestamp()
    };
    
    await setDoc(userRef, userDoc);
    console.log('✅ Documento de usuario creado exitosamente');
    return userDoc;
  } catch (error) {
    console.error('❌ Error al crear documento de usuario:', error);
    throw error;
  }
}

// Obtener datos de un usuario por UID
export async function getUserData(uid: string) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    } else {
      console.log('No existe documento para este usuario');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}