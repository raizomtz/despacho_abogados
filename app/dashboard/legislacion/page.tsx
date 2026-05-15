'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  Download,
  TrendingUp,
  FileText,
  Calendar,
  X
} from 'lucide-react';
import { 
  obtenerLegislacion, 
  crearLegislacion, 
  actualizarLegislacion,
  eliminarLegislacion,
  incrementarVistaLegislacion
} from '@/lib/legislacion';
import { Legislacion, LegislacionFormData } from '@/types/legislacion';
import LegislacionModal from '@/components/legislacion/LegislacionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

export default function LegislacionPage() {
  const { user } = useAuth();
  const [legislacion, setLegislacion] = useState<Legislacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todas');
  const [legislacionToEdit, setLegislacionToEdit] = useState<Legislacion | null>(null);
  const [legislacionToDelete, setLegislacionToDelete] = useState<Legislacion | null>(null);
  const [legislacionToView, setLegislacionToView] = useState<Legislacion | null>(null);

  const cargarLegislacion = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerLegislacion();
      setLegislacion(data);
    } catch (error) {
      toast.error('Error al cargar legislación');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarLegislacion();
  }, [cargarLegislacion]);

  const handleCrearLegislacion = useCallback(async (formData: LegislacionFormData) => {
    if (!user) return;
    
    try {
      const userName = user.email?.split('@')[0] || 'Usuario';
      await crearLegislacion(formData, user.uid, userName);
      toast.success('Legislación creada exitosamente');
      await cargarLegislacion();
    } catch (error) {
      toast.error('Error al crear legislación');
      console.error(error);
      throw error;
    }
  }, [user, cargarLegislacion]);

  const handleEditarLegislacion = useCallback(async (formData: LegislacionFormData) => {
    if (!legislacionToEdit?.uid) return;
    
    try {
      await actualizarLegislacion(legislacionToEdit.uid, {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        nivel: formData.nivel,
        jurisdiccion: formData.jurisdiccion,
        fechaPublicacion: formData.fechaPublicacion,
        articulos: formData.articulos,
        vigente: formData.vigente,
      });
      toast.success('Legislación actualizada exitosamente');
      await cargarLegislacion();
      setLegislacionToEdit(null);
    } catch (error) {
      toast.error('Error al actualizar legislación');
      console.error(error);
      throw error;
    }
  }, [legislacionToEdit, cargarLegislacion]);

  const handleSaveLegislacion = useCallback(async (formData: LegislacionFormData) => {
    if (legislacionToEdit) {
      await handleEditarLegislacion(formData);
    } else {
      await handleCrearLegislacion(formData);
    }
  }, [legislacionToEdit, handleCrearLegislacion, handleEditarLegislacion]);

  const handleEliminarLegislacion = useCallback(async () => {
    if (!legislacionToDelete?.uid) return;
    
    try {
      await eliminarLegislacion(legislacionToDelete.uid, legislacionToDelete.archivoPath);
      toast.success('Legislación eliminada exitosamente');
      await cargarLegislacion();
      setLegislacionToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar legislación');
      console.error(error);
    }
  }, [legislacionToDelete, cargarLegislacion]);

  const handleDescargarLegislacion = useCallback(async (item: Legislacion) => {
    try {
      await incrementarVistaLegislacion(item.uid!);
      window.open(item.archivoUrl, '_blank');
      
      // Actualizar contador localmente
      setLegislacion(prev => prev.map(l => 
        l.uid === item.uid 
          ? { ...l, vecesVisto: (l.vecesVisto || 0) + 1 }
          : l
      ));
      
      toast.success('Descargando archivo...');
    } catch (error) {
      toast.error('Error al descargar');
      console.error(error);
    }
  }, []);

  const handleVerLegislacion = useCallback(async (item: Legislacion) => {
    setLegislacionToView(item);
    setViewModalOpen(true);
    await incrementarVistaLegislacion(item.uid!);
    setLegislacion(prev => prev.map(l => 
      l.uid === item.uid 
        ? { ...l, vecesVisto: (l.vecesVisto || 0) + 1 }
        : l
    ));
  }, []);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'constitucion': return 'bg-red-100 text-red-800';
      case 'codigo': return 'bg-blue-100 text-blue-800';
      case 'ley': return 'bg-green-100 text-green-800';
      case 'reglamento': return 'bg-yellow-100 text-yellow-800';
      case 'jurisprudencia': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'constitucion': return 'Constitución';
      case 'codigo': return 'Código';
      case 'ley': return 'Ley';
      case 'reglamento': return 'Reglamento';
      case 'jurisprudencia': return 'Jurisprudencia';
      default: return tipo;
    }
  };

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'federal': return 'Federal';
      case 'estatal': return 'Estatal';
      case 'municipal': return 'Municipal';
      default: return nivel;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const legislacionFiltrada = legislacion.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFiltro === 'todas' || item.tipo === tipoFiltro;
    
    return matchesSearch && matchesTipo;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legislación</h1>
          <p className="text-gray-600 mt-1">
            Biblioteca de leyes, códigos y normativas
          </p>
        </div>
        <button
          onClick={() => {
            setLegislacionToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Legislación
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTipoFiltro('todas')}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              tipoFiltro === 'todas'
                ? 'bg-[#C6A43F] text-black'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {(['constitucion', 'codigo', 'ley', 'reglamento', 'jurisprudencia'] as const).map(tipo => (
            <button
              key={tipo}
              onClick={() => setTipoFiltro(tipo)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                tipoFiltro === tipo
                  ? getTipoColor(tipo)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getTipoLabel(tipo)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de legislación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando legislación...</p>
          </div>
        ) : legislacionFiltrada.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || tipoFiltro !== 'todas' ? 'No se encontraron resultados' : 'No hay legislación registrada'}
            </h2>
            <p className="text-gray-500">
              {searchTerm || tipoFiltro !== 'todas'
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando leyes, códigos o normativas'}
            </p>
          </div>
        ) : (
          legislacionFiltrada.map((item) => (
            <div
              key={item.uid}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-[#C6A43F]" />
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {item.titulo}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDescargarLegislacion(item)}
                      className="p-1 text-gray-500 hover:text-[#C6A43F] transition-colors"
                      title="Descargar"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleVerLegislacion(item)}
                      className="p-1 text-gray-500 hover:text-[#C6A43F] transition-colors"
                      title="Ver"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setLegislacionToEdit(item);
                        setModalOpen(true);
                      }}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setLegislacionToDelete(item);
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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTipoColor(item.tipo)}`}>
                    {getTipoLabel(item.tipo)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {getNivelLabel(item.nivel)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {item.jurisdiccion}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {item.descripcion || 'Sin descripción'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    {item.fechaPublicacion && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(item.fechaPublicacion).getFullYear()}</span>
                      </div>
                    )}
                    {item.articulos > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText size={12} />
                        <span>{item.articulos} arts.</span>
                      </div>
                    )}
                    <span>{formatFileSize(item.tamanioBytes || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>{item.vecesVisto || 0} vistas</span>
                  </div>
                </div>
                
                {!item.vigente && (
                  <div className="mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      No vigente
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modales */}
      <LegislacionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setLegislacionToEdit(null);
        }}
        onSave={handleSaveLegislacion}
        initialData={legislacionToEdit || undefined}
        isEdit={!!legislacionToEdit}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setLegislacionToDelete(null);
        }}
        onConfirm={handleEliminarLegislacion}
        title="Eliminar Legislación"
        message={`¿Estás seguro de que deseas eliminar "${legislacionToDelete?.titulo}"? Se eliminará el archivo y no se podrá recuperar.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de visualización */}
      <AnimatePresence>
        {viewModalOpen && legislacionToView && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setViewModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-50"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{legislacionToView.titulo}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTipoColor(legislacionToView.tipo)}`}>
                      {getTipoLabel(legislacionToView.tipo)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {getNivelLabel(legislacionToView.nivel)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {legislacionToView.jurisdiccion}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                {legislacionToView.descripcion && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{legislacionToView.descripcion}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Vista previa del documento:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <FileText size={48} className="mx-auto text-[#C6A43F] mb-2" />
                    <p className="text-sm text-gray-600">{legislacionToView.nombreArchivo}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatFileSize(legislacionToView.tamanioBytes)}</p>
                    <button
                      onClick={() => handleDescargarLegislacion(legislacionToView)}
                      className="mt-3 inline-flex items-center gap-2 text-sm text-[#C6A43F] hover:text-[#B3922F]"
                    >
                      <Download size={16} />
                      Descargar archivo completo
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    {legislacionToView.fechaPublicacion && (
                      <span>Publicación: {new Date(legislacionToView.fechaPublicacion).toLocaleDateString('es-MX')}</span>
                    )}
                    {legislacionToView.articulos > 0 && (
                      <span>{legislacionToView.articulos} artículos</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>{legislacionToView.vecesVisto || 0} vistas</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}