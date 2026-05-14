'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye
} from 'lucide-react';
import { 
  obtenerExpedientes, 
  crearExpediente, 
  actualizarExpediente,
  eliminarExpediente 
} from '@/lib/expedientes';
import { obtenerClientes } from '@/lib/clientes';
import { Expediente, ExpedienteFormData } from '@/types/expediente';
import { Cliente } from '@/types/cliente';
import ExpedienteModal from '@/components/expedientes/ExpedienteModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { obtenerUsuarios } from '@/lib/admin';
import { Usuario } from '@/types/usuario';

export default function ExpedientesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expedienteToEdit, setExpedienteToEdit] = useState<Expediente | null>(null);
  const [expedienteToDelete, setExpedienteToDelete] = useState<Expediente | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

const cargarDatos = useCallback(async () => {
  try {
    setLoading(true);
    const [expedientesData, clientesData, usuariosData] = await Promise.all([
      obtenerExpedientes(),
      obtenerClientes(),
      obtenerUsuarios()
    ]);
    setExpedientes(expedientesData);
    setClientes(clientesData);
    setUsuarios(usuariosData);
  } catch (error) {
    toast.error('Error al cargar datos');
    console.error(error);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearExpediente = useCallback(async (formData: ExpedienteFormData) => {
    if (!user) return;
    
    try {
      await crearExpediente(formData, user.uid);
      toast.success('Expediente creado exitosamente');
      await cargarDatos();
    } catch (error) {
      toast.error('Error al crear expediente');
      console.error(error);
      throw error;
    }
  }, [user, cargarDatos]);

  const handleEditarExpediente = useCallback(async (formData: ExpedienteFormData) => {
    if (!expedienteToEdit?.uid) return;
    
    try {
      const dataToUpdate = {
        unidadNegocio: formData.unidadNegocio,
        objeto: formData.objeto,
        tipoAsunto: formData.tipoAsunto,
        autoridadId: formData.autoridadId,
        numExpediente: formData.numExpediente,
        expedienteOrigen: formData.expedienteOrigen,
        actorInteresado: formData.actorInteresado,
        demandadoInculpado: formData.demandadoInculpado,
        estatus: formData.estatus,
      };
      await actualizarExpediente(expedienteToEdit.uid, dataToUpdate);
      toast.success('Expediente actualizado exitosamente');
      await cargarDatos();
      setExpedienteToEdit(null);
    } catch (error) {
      toast.error('Error al actualizar expediente');
      console.error(error);
      throw error;
    }
  }, [expedienteToEdit, cargarDatos]);

  const handleSaveExpediente = useCallback(async (formData: ExpedienteFormData) => {
    if (expedienteToEdit) {
      await handleEditarExpediente(formData);
    } else {
      await handleCrearExpediente(formData);
    }
  }, [expedienteToEdit, handleCrearExpediente, handleEditarExpediente]);

  const handleEliminarExpediente = useCallback(async () => {
    if (!expedienteToDelete?.uid || !expedienteToDelete?.clienteId) return;
    
    try {
      await eliminarExpediente(expedienteToDelete.uid, expedienteToDelete.clienteId);
      toast.success('Expediente eliminado exitosamente');
      await cargarDatos();
      setExpedienteToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar expediente');
      console.error(error);
    }
  }, [expedienteToDelete, cargarDatos]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Concluido': return 'bg-gray-100 text-gray-800';
      case 'Suspendido': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const expedientesFiltrados = expedientes.filter(exp => {
    const numExpediente = exp.numExpediente?.toLowerCase() || '';
    const clienteNombre = exp.clienteNombre?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return numExpediente.includes(search) || clienteNombre.includes(search);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-gray-600 mt-1">
            Gestión de casos y expedientes legales
          </p>
        </div>
        <button
          onClick={() => {
            setExpedienteToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Expediente
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por número de expediente o nombre del cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando expedientes...</p>
          </div>
        ) : expedientesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FolderOpen size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay expedientes registrados'}
            </h2>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza agregando tu primer expediente'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Expediente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Expediente
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objeto
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estatus
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expedientesFiltrados.map((expediente) => (
                  <tr key={expediente.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {expediente.numExpediente}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {expediente.clienteNombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {expediente.unidadNegocio}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {expediente.objeto}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expediente.estatus)}`}>
                        {expediente.estatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
    onClick={() => router.push(`/dashboard/expedientes/${expediente.uid}`)}
    className="text-gray-600 hover:text-[#C6A43F] transition-colors"
    title="Ver detalles"
  >
    <Eye size={18} />
  </button>
  
                      <button
                        onClick={() => {
                          setExpedienteToEdit(expediente);
                          setModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setExpedienteToDelete(expediente);
                          setConfirmModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

<ExpedienteModal
  isOpen={modalOpen}
  onClose={() => {
    setModalOpen(false);
    setExpedienteToEdit(null);
  }}
  onSave={handleSaveExpediente}
  clientes={clientes}
  usuarios={usuarios}
  currentUser={user}
  initialData={expedienteToEdit || undefined}
  isEdit={!!expedienteToEdit}
/>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setExpedienteToDelete(null);
        }}
        onConfirm={handleEliminarExpediente}
        title="Eliminar Expediente"
        message={`¿Estás seguro de que deseas eliminar el expediente "${expedienteToDelete?.numExpediente}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}