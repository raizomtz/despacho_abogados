import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function obtenerUsuarios() {
  try {
    const usuariosRef = collection(db, 'users');
    const q = query(usuariosRef, orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const usuarios: any[] = [];
    querySnapshot.forEach((doc) => {
      usuarios.push({
        uid: doc.id,
        ...doc.data()
      });
    });
    
    return usuarios;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}