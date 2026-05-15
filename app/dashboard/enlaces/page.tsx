'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ExternalLink,
  Filter,
  GripVertical
} from 'lucide-react';
import { 
  obtenerEnlaces, 
  crearEnlace, 
  actualizarEnlace,
  eliminarEnlace,
  reordenarEnlaces
} from '@/lib/enlaces';
import { Enlace, EnlaceFormData, TipoEnlace } from '@/types/enlace';
import EnlaceModal from '@/components/enlaces/EnlaceModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export default function EnlacesPage() {
  const { user } = useAuth();
  const [enlaces, setEnlaces] = useState<Enlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoEnlace | 'todas'>('todas');
  const [enlaceToEdit, setEnlaceToEdit] = useState<Enlace | null>(null);
  const [enlaceToDelete, setEnlaceToDelete] = useState<Enlace | null>(null);

  const cargarEnlaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerEnlaces();
      setEnlaces(data);
    } catch (error) {
      toast.error('Error al cargar enlaces');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEnlaces();
  }, [cargarEnlaces]);

  const handleCrearEnlace = useCallback(async (formData: EnlaceFormData) => {
    if (!user) return;
    
    try {
      const userName = user.email?.split('@')[0] || 'Usuario';
      await crearEnlace(formData, user.uid, userName);
      toast.success('Enlace creado exitosamente');
      await cargarEnlaces();
    } catch (error) {
      toast.error('Error al crear enlace');
      console.error(error);
      throw error;
    }
  }, [user, cargarEnlaces]);

  const handleEditarEnlace = useCallback(async (formData: EnlaceFormData) => {
    if (!enlaceToEdit?.uid) return;
    
    try {
      await actualizarEnlace(enlaceToEdit.uid, formData);
      toast.success('Enlace actualizado exitosamente');
      await cargarEnlaces();
      setEnlaceToEdit(null);
    } catch (error) {
      toast.error('Error al actualizar enlace');
      console.error(error);
      throw error;
    }
  }, [enlaceToEdit, cargarEnlaces]);

  const handleSaveEnlace = useCallback(async (formData: EnlaceFormData) => {
    if (enlaceToEdit) {
      await handleEditarEnlace(formData);
    } else {
      await handleCrearEnlace(formData);
    }
  }, [enlaceToEdit, handleCrearEnlace, handleEditarEnlace]);

  const handleEliminarEnlace = useCallback(async () => {
    if (!enlaceToDelete?.uid) return;
    
    try {
      await eliminarEnlace(enlaceToDelete.uid);
      toast.success('Enlace eliminado exitosamente');
      await cargarEnlaces();
      setEnlaceToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar enlace');
      console.error(error);
    }
  }, [enlaceToDelete, cargarEnlaces]);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'tribunal': return 'bg-blue-100 text-blue-800';
      case 'junta': return 'bg-green-100 text-green-800';
      case 'federal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'tribunal': return 'Tribunal';
      case 'junta': return 'Junta';
      case 'federal': return 'Federal';
      default: return 'Otro';
    }
  };

  const enlacesFiltrados = enlaces.filter(enlace => {
    const matchesSearch = enlace.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (enlace.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          enlace.jurisdiccion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFiltro === 'todas' || enlace.tipo === tipoFiltro;
    
    return matchesSearch && matchesTipo;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enlaces Judiciales</h1>
          <p className="text-gray-600 mt-1">
            Acceso rápido a tribunales, juzgados y portales judiciales
          </p>
        </div>
        <button
          onClick={() => {
            setEnlaceToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Enlace
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, jurisdicción o descripción..."
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
          {(['tribunal', 'junta', 'federal', 'otro'] as const).map(tipo => (
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

      {/* Lista de enlaces */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando enlaces...</p>
          </div>
        ) : enlacesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Globe size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || tipoFiltro !== 'todas' ? 'No se encontraron resultados' : 'No hay enlaces registrados'}
            </h2>
            <p className="text-gray-500">
              {searchTerm || tipoFiltro !== 'todas'
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tus enlaces a tribunales y juzgados'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {enlacesFiltrados.map((enlace) => (
              <div key={enlace.uid} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{enlace.icono || '⚖️'}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{enlace.nombre}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTipoColor(enlace.tipo)}`}>
                          {getTipoLabel(enlace.tipo)}
                        </span>
                        <span className="text-xs text-gray-400">{enlace.jurisdiccion}</span>
                      </div>
                      {enlace.descripcion && (
                        <p className="text-sm text-gray-500 mt-1">{enlace.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={enlace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C6A43F] hover:text-[#B3922F] transition-colors flex items-center gap-1 text-sm"
                    >
                      <ExternalLink size={16} />
                      Abrir
                    </a>
                    <button
                      onClick={() => {
                        setEnlaceToEdit(enlace);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEnlaceToDelete(enlace);
                        setConfirmModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <EnlaceModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEnlaceToEdit(null);
        }}
        onSave={handleSaveEnlace}
        initialData={enlaceToEdit || undefined}
        isEdit={!!enlaceToEdit}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setEnlaceToDelete(null);
        }}
        onConfirm={handleEliminarEnlace}
        title="Eliminar Enlace"
        message={`¿Estás seguro de que deseas eliminar "${enlaceToDelete?.nombre}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}