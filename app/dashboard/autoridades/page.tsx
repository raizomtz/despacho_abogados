'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  MapPin,
  Phone,
  Clock
} from 'lucide-react';
import { 
  obtenerAutoridades, 
  crearAutoridad, 
  actualizarAutoridad,
  eliminarAutoridad 
} from '@/lib/autoridades';
import { Autoridad, AutoridadFormData } from '@/types/autoridad';
import AutoridadModal from '@/components/autoridades/AutoridadModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export default function AutoridadesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [autoridades, setAutoridades] = useState<Autoridad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoridadToEdit, setAutoridadToEdit] = useState<Autoridad | null>(null);
  const [autoridadToDelete, setAutoridadToDelete] = useState<Autoridad | null>(null);

  const cargarAutoridades = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerAutoridades();
      setAutoridades(data);
    } catch (error) {
      toast.error('Error al cargar autoridades');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarAutoridades();
  }, [cargarAutoridades]);

  const handleCrearAutoridad = useCallback(async (formData: AutoridadFormData) => {
    if (!user) return;
    
    try {
      await crearAutoridad(formData, user.uid);
      toast.success('Autoridad creada exitosamente');
      await cargarAutoridades();
    } catch (error) {
      toast.error('Error al crear autoridad');
      console.error(error);
      throw error;
    }
  }, [user, cargarAutoridades]);

  const handleEditarAutoridad = useCallback(async (formData: AutoridadFormData) => {
    if (!autoridadToEdit?.uid) return;
    
    try {
      await actualizarAutoridad(autoridadToEdit.uid, formData);
      toast.success('Autoridad actualizada exitosamente');
      await cargarAutoridades();
      setAutoridadToEdit(null);
    } catch (error) {
      toast.error('Error al actualizar autoridad');
      console.error(error);
      throw error;
    }
  }, [autoridadToEdit, cargarAutoridades]);

  const handleSaveAutoridad = useCallback(async (formData: AutoridadFormData) => {
    if (autoridadToEdit) {
      await handleEditarAutoridad(formData);
    } else {
      await handleCrearAutoridad(formData);
    }
  }, [autoridadToEdit, handleCrearAutoridad, handleEditarAutoridad]);

  const handleEliminarAutoridad = useCallback(async () => {
    if (!autoridadToDelete?.uid) return;
    
    try {
      await eliminarAutoridad(autoridadToDelete.uid);
      toast.success('Autoridad eliminada exitosamente');
      await cargarAutoridades();
      setAutoridadToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar autoridad');
      console.error(error);
    }
  }, [autoridadToDelete, cargarAutoridades]);

  const autoridadesFiltradas = autoridades.filter(aut => {
    const nombreCorto = aut.nombreCorto?.toLowerCase() || '';
    const nombreCompleto = aut.nombreCompleto?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return nombreCorto.includes(search) || nombreCompleto.includes(search);
  });

  const getFueroColor = (fuero: string) => {
    return fuero === 'Federal' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Autoridades</h1>
          <p className="text-gray-600 mt-1">
            Gestión de juzgados y autoridades judiciales
          </p>
        </div>
        <button
          onClick={() => {
            setAutoridadToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Autoridad
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre corto o completo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando autoridades...</p>
          </div>
        ) : autoridadesFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Building2 size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay autoridades registradas'}
            </h2>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza agregando tu primera autoridad'}
            </p>
          </div>
        ) : (
          autoridadesFiltradas.map((autoridad) => (
            <div
              key={autoridad.uid}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {autoridad.nombreCorto}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getFueroColor(autoridad.fuero)}`}>
                      {autoridad.fuero}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 ml-2">
                      {autoridad.materia}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/autoridades/${autoridad.uid}`)}
                      className="p-1 text-gray-600 hover:text-[#C6A43F] transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setAutoridadToEdit(autoridad);
                        setModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setAutoridadToDelete(autoridad);
                        setConfirmModalOpen(true);
                      }}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {autoridad.nombreCompleto}
                </p>
                {autoridad.direccion && (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{autoridad.direccion}</span>
                  </div>
                )}
                {autoridad.telefono && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} />
                    <span>{autoridad.telefono}</span>
                  </div>
                )}
                {autoridad.horario && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{autoridad.horario}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AutoridadModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setAutoridadToEdit(null);
        }}
        onSave={handleSaveAutoridad}
        initialData={autoridadToEdit || undefined}
        isEdit={!!autoridadToEdit}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setAutoridadToDelete(null);
        }}
        onConfirm={handleEliminarAutoridad}
        title="Eliminar Autoridad"
        message={`¿Estás seguro de que deseas eliminar "${autoridadToDelete?.nombreCorto}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}