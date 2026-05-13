'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';
import { 
  obtenerClientes, 
  crearCliente, 
  actualizarCliente,
  generarCodigoCliente,
  eliminarCliente 
} from '@/lib/clientes';
import { Cliente, ClienteFormData } from '@/types/cliente';
import ClienteModal from '@/components/clients/ClientModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export default function ClientesPage() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerClientes();
      const clientesConExpedientes = data.map(cliente => ({
        ...cliente,
        expedientes: cliente.expedientes || [],
        nombre: cliente.nombre || '',
        codigoUnico: cliente.codigoUnico || '',
        email: cliente.email || ''
      }));
      setClientes(clientesConExpedientes);
    } catch (error) {
      toast.error('Error al cargar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const handleCrearCliente = useCallback(async (formData: ClienteFormData) => {
    if (!user) return;
    
    try {
      const codigo = await generarCodigoCliente();
      const clienteConCodigo = { ...formData, codigoUnico: codigo };
      await crearCliente(clienteConCodigo, user.uid);
      toast.success('Cliente creado exitosamente');
      await cargarClientes();
    } catch (error) {
      toast.error('Error al crear cliente');
      console.error(error);
      throw error;
    }
  }, [user, cargarClientes]);

  const handleEditarCliente = useCallback(async (formData: ClienteFormData) => {
    if (!clienteToEdit?.uid) return;
    
    try {
      const dataToUpdate = {
        nombre: formData.nombre,
        rfc: formData.rfc,
        domicilio: formData.domicilio,
        representanteLegal: formData.representanteLegal,
        contactoPrincipal: formData.contactoPrincipal,
        email: formData.email,
        celWhatsapp: formData.celWhatsapp,
        telefono: formData.telefono,
      };
      await actualizarCliente(clienteToEdit.uid, dataToUpdate);
      toast.success('Cliente actualizado exitosamente');
      await cargarClientes();
      setClienteToEdit(null);
    } catch (error) {
      toast.error('Error al actualizar cliente');
      console.error(error);
      throw error;
    }
  }, [clienteToEdit, cargarClientes]);

  const handleSaveCliente = useCallback(async (formData: ClienteFormData) => {
    if (clienteToEdit) {
      await handleEditarCliente(formData);
    } else {
      await handleCrearCliente(formData);
    }
  }, [clienteToEdit, handleCrearCliente, handleEditarCliente]);

  const handleEliminarCliente = useCallback(async () => {
    if (!clienteToDelete?.uid) return;
    
    try {
      await eliminarCliente(clienteToDelete.uid);
      toast.success('Cliente eliminado exitosamente');
      await cargarClientes();
      setClienteToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar cliente');
      console.error(error);
    }
  }, [clienteToDelete, cargarClientes]);

  const clientesFiltrados = clientes.filter(cliente => {
    const nombre = cliente.nombre?.toLowerCase() || '';
    const codigo = cliente.codigoUnico?.toLowerCase() || '';
    const email = cliente.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return nombre.includes(search) || 
           codigo.includes(search) || 
           email.includes(search);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Directorio de clientes del despacho
          </p>
        </div>
        <button
          onClick={() => {
            setClienteToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, código o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay clientes registrados'}
            </h2>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza agregando tu primer cliente'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expedientes
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {cliente.codigoUnico}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.nombre}
                      </div>
                      {cliente.representanteLegal && (
                        <div className="text-xs text-gray-500">
                          Rep: {cliente.representanteLegal}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cliente.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cliente.celWhatsapp}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cliente.expedientes?.length || 0} expedientes
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setClienteToEdit(cliente);
                          setModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setClienteToDelete(cliente);
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

      <ClienteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setClienteToEdit(null);
        }}
        onSave={handleSaveCliente}
        initialData={clienteToEdit || undefined}
        isEdit={!!clienteToEdit}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setClienteToDelete(null);
        }}
        onConfirm={handleEliminarCliente}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar a "${clienteToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}