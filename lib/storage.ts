import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Subir archivo a Storage
export async function subirArchivoFormato(
  file: File,
  userId: string,
  formatoId: string
): Promise<{ url: string; path: string }> {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${formatoId}.${fileExtension}`;
    const filePath = `formatos/${userId}/${fileName}`;
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

// Eliminar archivo de Storage
export async function eliminarArchivoStorage(filePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    console.log('✅ Archivo eliminado de Storage');
  } catch (error) {
    console.error('❌ Error al eliminar archivo:', error);
    throw error;
  }
}