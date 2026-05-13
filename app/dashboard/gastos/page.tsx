'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  Receipt,
  TrendingUp
} from 'lucide-react';
import { 
  obtenerGastos, 
  crearGasto, 
  actualizarEstatusGasto,
  eliminarGasto 
} from '@/lib/gastos';
import { obtenerExpedientes } from '@/lib/expedientes';
import { Gasto, GastoFormData, EstatusPago } from '@/types/gasto';
import { Expediente } from '@/types/expediente';
import GastoModal from '@/components/gastos/GastoModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export default function GastosPage() {
  const { user } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstatus, setFilterEstatus] = useState<EstatusPago | 'todas'>('todas');
  const [gastoToEdit, setGastoToEdit] = useState<Gasto | null>(null);
  const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [gastosData, expedientesData] = await Promise.all([
        obtenerGastos(),
        obtenerExpedientes()
      ]);
      
      setGastos(gastosData);
      setExpedientes(expedientesData);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearGasto = useCallback(async (formData: GastoFormData) => {
    if (!user) return;
    
    try {
      const userName = user.email?.split('@')[0] || 'Usuario';
      await crearGasto(formData, user.uid, userName);
      toast.success('Gasto registrado exitosamente');
      await cargarDatos();
    } catch (error) {
      toast.error('Error al registrar gasto');
      console.error(error);
      throw error;
    }
  }, [user, cargarDatos]);

  const handleEditarGasto = useCallback(async (formData: GastoFormData) => {
    if (!gastoToEdit?.uid) return;
    
    try {
      await actualizarEstatusGasto(gastoToEdit.uid, formData.estatusPago);
      toast.success('Estatus actualizado');
      await cargarDatos();
      setGastoToEdit(null);
    } catch (error) {
      toast.error('Error al actualizar');
      console.error(error);
      throw error;
    }
  }, [gastoToEdit, cargarDatos]);

  const handleSaveGasto = useCallback(async (formData: GastoFormData) => {
    if (gastoToEdit) {
      await handleEditarGasto(formData);
    } else {
      await handleCrearGasto(formData);
    }
  }, [gastoToEdit, handleCrearGasto, handleEditarGasto]);

  const handleEliminarGasto = useCallback(async () => {
    if (!gastoToDelete?.uid) return;
    
    try {
      await eliminarGasto(gastoToDelete.uid);
      toast.success('Gasto eliminado');
      await cargarDatos();
      setGastoToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar gasto');
      console.error(error);
    }
  }, [gastoToDelete, cargarDatos]);

  const getStatusColor = (estatus: EstatusPago) => {
    switch (estatus) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'reembolsado': return 'bg-green-100 text-green-800';
      case 'por-facturar': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estatus: EstatusPago) => {
    switch (estatus) {
      case 'pendiente': return 'Pendiente';
      case 'reembolsado': return 'Reembolsado';
      case 'por-facturar': return 'Por Facturar';
      default: return estatus;
    }
  };

  const gastosFiltrados = gastos.filter(gasto => {
    const matchesSearch = gasto.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gasto.expedienteNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gasto.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstatus = filterEstatus === 'todas' || gasto.estatusPago === filterEstatus;
    
    return matchesSearch && matchesEstatus;
  });

  const totalGastos = gastosFiltrados.reduce((sum, g) => sum + g.total, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-gray-600 mt-1">
            Registro de gastos por expediente
          </p>
        </div>
        <button
          onClick={() => {
            setGastoToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Gasto
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Gastos</p>
              <p className="text-2xl font-bold text-gray-900">${totalGastos.toFixed(2)}</p>
            </div>
            <DollarSign size={32} className="text-[#C6A43F] opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${gastosFiltrados.filter(g => g.estatusPago === 'pendiente').reduce((s, g) => s + g.total, 0).toFixed(2)}
              </p>
            </div>
            <Receipt size={32} className="text-yellow-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Reembolsados</p>
              <p className="text-2xl font-bold text-green-600">
                ${gastosFiltrados.filter(g => g.estatusPago === 'reembolsado').reduce((s, g) => s + g.total, 0).toFixed(2)}
              </p>
            </div>
            <TrendingUp size={32} className="text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Por Facturar</p>
              <p className="text-2xl font-bold text-blue-600">
                ${gastosFiltrados.filter(g => g.estatusPago === 'por-facturar').reduce((s, g) => s + g.total, 0).toFixed(2)}
              </p>
            </div>
            <Receipt size={32} className="text-blue-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por concepto, expediente o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {['todas', 'pendiente', 'reembolsado', 'por-facturar'].map(est => (
            <button
              key={est}
              onClick={() => setFilterEstatus(est as any)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                filterEstatus === est
                  ? est === 'todas' 
                    ? 'bg-[#C6A43F] text-black'
                    : getStatusColor(est as EstatusPago)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {est === 'todas' ? 'Todas' : 
               est === 'pendiente' ? 'Pendientes' :
               est === 'reembolsado' ? 'Reembolsados' : 'Por Facturar'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de gastos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando gastos...</p>
          </div>
        ) : gastosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <DollarSign size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No hay gastos registrados
            </h2>
            <p className="text-gray-500">
              Comienza agregando tu primer gasto
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expediente
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
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
                {gastosFiltrados.map((gasto) => (
                  <tr key={gasto.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {gasto.fecha?.toDate().toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {gasto.expedienteNum}
                      </div>
                      <div className="text-xs text-gray-500">
                        {gasto.clienteNombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {gasto.concepto}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${gasto.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(gasto.estatusPago)}`}>
                        {getStatusLabel(gasto.estatusPago)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setGastoToEdit(gasto);
                          setModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Cambiar estatus"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setGastoToDelete(gasto);
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

<GastoModal
  isOpen={modalOpen}
  onClose={() => {
    setModalOpen(false);
    setGastoToEdit(null);
  }}
  onSave={handleSaveGasto}
  expedientes={expedientes}
  initialData={gastoToEdit ? {
    fecha: gastoToEdit.fecha?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    clienteId: gastoToEdit.clienteId,
    clienteNombre: gastoToEdit.clienteNombre,
    expedienteId: gastoToEdit.expedienteId,
    expedienteNum: gastoToEdit.expedienteNum,
    concepto: gastoToEdit.concepto,
    subtotal: gastoToEdit.subtotal,
    iva: gastoToEdit.iva,
    total: gastoToEdit.total,
    estatusPago: gastoToEdit.estatusPago,
  } : undefined}
  isEdit={!!gastoToEdit}
/>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setGastoToDelete(null);
        }}
        onConfirm={handleEliminarGasto}
        title="Eliminar Gasto"
        message={`¿Estás seguro de que deseas eliminar este gasto?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}