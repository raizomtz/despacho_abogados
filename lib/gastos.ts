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
  Timestamp
} from 'firebase/firestore';
import { Gasto, GastoFormData, EstatusPago } from '@/types/gasto';

const COLLECTION_NAME = 'gastos';

// Crear nuevo gasto
export async function crearGasto(
  gastoData: GastoFormData,
  userId: string,
  userName: string
): Promise<string> {
  try {
    const gastosRef = collection(db, COLLECTION_NAME);
    const nuevoDocRef = doc(gastosRef);
    const gastoId = nuevoDocRef.id;
    
    const nuevoGasto = {
      fecha: Timestamp.fromDate(new Date(gastoData.fecha)),
      clienteId: gastoData.clienteId,
      clienteNombre: gastoData.clienteNombre,
      expedienteId: gastoData.expedienteId,
      expedienteNum: gastoData.expedienteNum,
      concepto: gastoData.concepto,
      subtotal: gastoData.subtotal,
      iva: gastoData.iva,
      total: gastoData.total,
      estatusPago: gastoData.estatusPago,
      registradoPor: userId,
      registradoPorNombre: userName,
      comprobanteURL: null,
    };
    
    await setDoc(nuevoDocRef, nuevoGasto);
    console.log('✅ Gasto creado con ID:', gastoId);
    return gastoId;
  } catch (error) {
    console.error('❌ Error al crear gasto:', error);
    throw error;
  }
}

// Obtener todos los gastos
export async function obtenerGastos(): Promise<Gasto[]> {
  try {
    const gastosRef = collection(db, COLLECTION_NAME);
    const q = query(gastosRef, orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const gastos: Gasto[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      gastos.push({
        ...data as Gasto,
        uid: doc.id,
      });
    });
    
    return gastos;
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error);
    throw error;
  }
}

// Obtener gastos por expediente
export async function obtenerGastosPorExpediente(expedienteId: string): Promise<Gasto[]> {
  try {
    const gastosRef = collection(db, COLLECTION_NAME);
    const q = query(gastosRef, where('expedienteId', '==', expedienteId), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const gastos: Gasto[] = [];
    querySnapshot.forEach((doc) => {
      gastos.push({ ...doc.data() as Gasto, uid: doc.id });
    });
    
    return gastos;
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error);
    throw error;
  }
}

// Obtener gastos por cliente
export async function obtenerGastosPorCliente(clienteId: string): Promise<Gasto[]> {
  try {
    const gastosRef = collection(db, COLLECTION_NAME);
    const q = query(gastosRef, where('clienteId', '==', clienteId), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const gastos: Gasto[] = [];
    querySnapshot.forEach((doc) => {
      gastos.push({ ...doc.data() as Gasto, uid: doc.id });
    });
    
    return gastos;
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error);
    throw error;
  }
}

// Actualizar estatus de pago
export async function actualizarEstatusGasto(
  gastoId: string,
  nuevoEstatus: EstatusPago
): Promise<void> {
  try {
    const gastoRef = doc(db, COLLECTION_NAME, gastoId);
    await updateDoc(gastoRef, { estatusPago: nuevoEstatus });
    console.log('✅ Estatus actualizado');
  } catch (error) {
    console.error('❌ Error al actualizar estatus:', error);
    throw error;
  }
}

// Actualizar gasto completo
export async function actualizarGasto(
  gastoId: string,
  data: Partial<Gasto>
): Promise<void> {
  try {
    const gastoRef = doc(db, COLLECTION_NAME, gastoId);
    await updateDoc(gastoRef, data);
    console.log('✅ Gasto actualizado');
  } catch (error) {
    console.error('❌ Error al actualizar gasto:', error);
    throw error;
  }
}

// Eliminar gasto
export async function eliminarGasto(gastoId: string): Promise<void> {
  try {
    const gastoRef = doc(db, COLLECTION_NAME, gastoId);
    await deleteDoc(gastoRef);
    console.log('✅ Gasto eliminado');
  } catch (error) {
    console.error('❌ Error al eliminar gasto:', error);
    throw error;
  }
}

// Obtener resumen de gastos por expediente
export async function obtenerResumenGastosExpediente(expedienteId: string): Promise<{
  totalGastos: number;
  reembolsado: number;
  pendiente: number;
  porFacturar: number;
}> {
  try {
    const gastos = await obtenerGastosPorExpediente(expedienteId);
    
    const resumen = {
      totalGastos: 0,
      reembolsado: 0,
      pendiente: 0,
      porFacturar: 0,
    };
    
    gastos.forEach(gasto => {
      resumen.totalGastos += gasto.total;
      if (gasto.estatusPago === 'reembolsado') {
        resumen.reembolsado += gasto.total;
      } else if (gasto.estatusPago === 'pendiente') {
        resumen.pendiente += gasto.total;
      } else if (gasto.estatusPago === 'por-facturar') {
        resumen.porFacturar += gasto.total;
      }
    });
    
    return resumen;
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    return {
      totalGastos: 0,
      reembolsado: 0,
      pendiente: 0,
      porFacturar: 0,
    };
  }
}