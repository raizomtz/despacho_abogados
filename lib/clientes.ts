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
import { Cliente, ClienteFormData } from '@/types/cliente';

const COLLECTION_NAME = 'clientes';

// Generar código único automático
export async function generarCodigoCliente(): Promise<string> {
  const clientesRef = collection(db, COLLECTION_NAME);
  const q = query(clientesRef, orderBy('codigoUnico', 'desc'));
  const querySnapshot = await getDocs(q);
  
  let ultimoNumero = 0;
  
  if (!querySnapshot.empty) {
    const ultimoCliente = querySnapshot.docs[0].data();
    const ultimoCodigo = ultimoCliente.codigoUnico;
    const numero = parseInt(ultimoCodigo.split('-')[1]);
    if (!isNaN(numero)) {
      ultimoNumero = numero;
    }
  }
  
  const nuevoNumero = ultimoNumero + 1;
  const codigo = `CLI-${nuevoNumero.toString().padStart(3, '0')}`;
  return codigo;
}

// Crear nuevo cliente
export async function crearCliente(
  clienteData: ClienteFormData, 
  userId: string
): Promise<string> {
  try {
    const clientesRef = collection(db, COLLECTION_NAME);
    const nuevoDocRef = doc(clientesRef);
    const clienteId = nuevoDocRef.id;
    
    const nuevoCliente: Cliente = {
      ...clienteData,
      expedientes: [],
      creadoPor: userId,
      fechaRegistro: serverTimestamp(),
    };
    
    await setDoc(nuevoDocRef, nuevoCliente);
    console.log('✅ Cliente creado con ID:', clienteId);
    return clienteId;
  } catch (error) {
    console.error('❌ Error al crear cliente:', error);
    throw error;
  }
}

// Obtener todos los clientes
export async function obtenerClientes(): Promise<Cliente[]> {
  try {
    const clientesRef = collection(db, COLLECTION_NAME);
    const q = query(clientesRef, orderBy('fechaRegistro', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const clientes: Cliente[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      clientes.push({
        ...data as Cliente,
        uid: doc.id,
      });
    });
    
    return clientes;
  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    throw error;
  }
}

// Obtener cliente por ID
export async function obtenerClientePorId(clienteId: string): Promise<Cliente | null> {
  try {
    const clienteRef = doc(db, COLLECTION_NAME, clienteId);
    const clienteSnap = await getDoc(clienteRef);
    
    if (clienteSnap.exists()) {
      return { ...clienteSnap.data() as Cliente, uid: clienteSnap.id };
    }
    return null;
  } catch (error) {
    console.error('❌ Error al obtener cliente:', error);
    throw error;
  }
}

// Actualizar cliente
// Actualizar cliente (ya existente, solo verificamos)
export async function actualizarCliente(
  clienteId: string, 
  data: any
): Promise<void> {
  try {
    const clienteRef = doc(db, COLLECTION_NAME, clienteId);
    await updateDoc(clienteRef, data);
    console.log('✅ Cliente actualizado');
  } catch (error) {
    console.error('❌ Error al actualizar cliente:', error);
    throw error;
  }
}

// Eliminar cliente
export async function eliminarCliente(clienteId: string): Promise<void> {
  try {
    const clienteRef = doc(db, COLLECTION_NAME, clienteId);
    await deleteDoc(clienteRef);
    console.log('✅ Cliente eliminado');
  } catch (error) {
    console.error('❌ Error al eliminar cliente:', error);
    throw error;
  }
}