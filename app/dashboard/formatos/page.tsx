'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  Copy,
  TrendingUp,
  Download,
  File,
  FileArchive
} from 'lucide-react';
import { 
  obtenerFormatos, 
  crearFormato, 
  actualizarFormato,
  eliminarFormato,
  incrementarUsoFormato
} from '@/lib/formatos';
import { Formato, FormatoFormData } from '@/types/formato';
import FormatoModal from '@/components/formatos/FormatoModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export default function FormatosPage() {
  const { user } = useAuth();
  const [formatos, setFormatos] = useState<Formato[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [formatoToEdit, setFormatoToEdit] = useState<Formato | null>(null);
  const [formatoToDelete, setFormatoToDelete] = useState<Formato | null>(null);

  const cargarFormatos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerFormatos();
      setFormatos(data);
    } catch (error) {
      toast.error('Error al cargar formatos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarFormatos();
  }, [cargarFormatos]);

  const handleCrearFormato = useCallback(async (formData: FormatoFormData) => {
    if (!user) return;
    
    try {
      const userName = user.email?.split('@')[0] || 'Usuario';
      await crearFormato(formData, user.uid, userName);
      toast.success('Formato creado exitosamente');
      await cargarFormatos();
    } catch (error) {
      toast.error('Error al crear formato');
      console.error(error);
      throw error;
    }
  }, [user, cargarFormatos]);

  const handleEditarFormato = useCallback(async (formData: FormatoFormData) => {
    if (!formatoToEdit?.uid) return;
    
    try {
      await actualizarFormato(formatoToEdit.uid, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
      });
      toast.success('Formato actualizado exitosamente');
      await cargarFormatos();
      setFormatoToEdit(null);
    } catch (error) {
      toast.error('Error al actualizar formato');
      console.error(error);
      throw error;
    }
  }, [formatoToEdit, cargarFormatos]);

  const handleSaveFormato = useCallback(async (formData: FormatoFormData) => {
    if (formatoToEdit) {
      await handleEditarFormato(formData);
    } else {
      await handleCrearFormato(formData);
    }
  }, [formatoToEdit, handleCrearFormato, handleEditarFormato]);

const handleEliminarFormato = useCallback(async () => {
  if (!formatoToDelete?.uid) return;
  
  try {
    await eliminarFormato(formatoToDelete.uid, formatoToDelete.archivoPath);
    toast.success('Formato eliminado exitosamente');
    await cargarFormatos();
    setFormatoToDelete(null);
  } catch (error) {
    toast.error('Error al eliminar formato');
    console.error(error);
  }
}, [formatoToDelete, cargarFormatos]);

  const handleDescargarFormato = useCallback(async (formato: Formato) => {
    try {
      await incrementarUsoFormato(formato.uid!);
      
      // Abrir el archivo en nueva pestaña (esto dispara la descarga)
      window.open(formato.archivoUrl, '_blank');
      
      // Actualizar contador en UI
      setFormatos(prev => prev.map(f => 
        f.uid === formato.uid 
          ? { ...f, vecesUsado: (f.vecesUsado || 0) + 1 }
          : f
      ));
      
      toast.success('Descargando archivo...');
    } catch (error) {
      toast.error('Error al descargar formato');
      console.error(error);
    }
  }, []);

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'judicial': return 'bg-blue-100 text-blue-800';
      case 'administrativo': return 'bg-green-100 text-green-800';
      case 'notarial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'judicial': return 'Judicial';
      case 'administrativo': return 'Administrativo';
      case 'notarial': return 'Notarial';
      default: return 'General';
    }
  };

  const getTipoArchivoIcon = (tipo: string) => {
    if (tipo === 'pdf') return <FileArchive size={16} className="text-red-500" />;
    return <FileText size={16} className="text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatosFiltrados = formatos.filter(formato => {
    const matchesSearch = formato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (formato.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFiltro === 'todas' || formato.categoria === categoriaFiltro;
    
    return matchesSearch && matchesCategoria;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formatos / Machotes</h1>
          <p className="text-gray-600 mt-1">
            Gestión de plantillas y documentos legales
          </p>
        </div>
        <button
          onClick={() => {
            setFormatoToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Formato
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCategoriaFiltro('todas')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              categoriaFiltro === 'todas'
                ? 'bg-[#C6A43F] text-black'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {['judicial', 'administrativo', 'notarial', 'general'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                categoriaFiltro === cat
                  ? getCategoriaColor(cat)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getCategoriaLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de formatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando formatos...</p>
          </div>
        ) : formatosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || categoriaFiltro !== 'todas' ? 'No se encontraron resultados' : 'No hay formatos registrados'}
            </h2>
            <p className="text-gray-500">
              {searchTerm || categoriaFiltro !== 'todas'
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer formato o machote'}
            </p>
          </div>
        ) : (
          formatosFiltrados.map((formato) => (
            <div
              key={formato.uid}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getTipoArchivoIcon(formato.tipoArchivo)}
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {formato.nombre}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDescargarFormato(formato)}
                      className="p-1 text-gray-500 hover:text-[#C6A43F] transition-colors"
                      title="Descargar"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setFormatoToEdit(formato);
                        setModalOpen(true);
                      }}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setFormatoToDelete(formato);
                        setConfirmModalOpen(true);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoriaColor(formato.categoria)}`}>
                    {getCategoriaLabel(formato.categoria)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {formato.tipoArchivo?.toUpperCase()}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {formatFileSize(formato.tamanioBytes || 0)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {formato.descripcion || 'Sin descripción'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <TrendingUp size={12} />
                    <span>Usado {formato.vecesUsado || 0} veces</span>
                  </div>
                  <button
                    onClick={() => handleDescargarFormato(formato)}
                    className="flex items-center gap-1 text-sm text-[#C6A43F] hover:text-[#B3922F] transition-colors"
                  >
                    <Download size={14} />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modales */}
      <FormatoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormatoToEdit(null);
        }}
        onSave={handleSaveFormato}
        initialData={formatoToEdit || undefined}
        isEdit={!!formatoToEdit}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setFormatoToDelete(null);
        }}
        onConfirm={handleEliminarFormato}
        title="Eliminar Formato"
        message={`¿Estás seguro de que deseas eliminar "${formatoToDelete?.nombre}"? Se eliminará el archivo y no se podrá recuperar.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}