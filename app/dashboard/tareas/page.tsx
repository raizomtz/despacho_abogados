'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckSquare, 
  Plus, 
  Eye,
  Clock,
  Calendar,
  AlertCircle,
  Filter,
  Users,
  FileText
} from 'lucide-react';
import { 
  obtenerTodasTareas, 
  obtenerTareasPorUsuario,
  crearTarea,
  actualizarEstatusTarea,
  eliminarTarea
} from '@/lib/tareas';
import { obtenerExpedientes } from '@/lib/expedientes';
import { obtenerClientes } from '@/lib/clientes';
import { obtenerUsuarios } from '@/lib/usuarios';
import { Tarea, TareaFormData, EstatusTarea } from '@/types/tarea';
import { Expediente } from '@/types/expediente';
import TareaModal from '@/components/tareas/TareaModal';
import ActualizarEstatusModal from '@/components/tareas/ActualizarEstatusModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

type VistaTareas = 'mis-tareas' | 'equipo';

export default function TareasPage() {
  const { user } = useAuth();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<VistaTareas>('mis-tareas');
  const [modalOpen, setModalOpen] = useState(false);
  const [estatusModalOpen, setEstatusModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [filterEstatus, setFilterEstatus] = useState<EstatusTarea | 'todas'>('todas');
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [usuariosAsignadosExpediente, setUsuariosAsignadosExpediente] = useState<string[]>([]);


const cargarDatos = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Cargar expedientes y usuarios
      const [expData, usersData] = await Promise.all([
        obtenerExpedientes(),
        obtenerUsuarios()
      ]);
      setExpedientes(expData);
      setUsuarios(usersData);
      
      // Cargar tareas según la vista
      let tareasData: Tarea[];
      if (vista === 'mis-tareas') {
        tareasData = await obtenerTareasPorUsuario(user.uid);
      } else {
        tareasData = await obtenerTodasTareas();
      }
      
      // Enriquecer tareas con nombres de usuarios
      const tareasEnriquecidas = tareasData.map(tarea => ({
        ...tarea,
        asignadoANombre: usersData.find(u => u.uid === tarea.asignadoA)?.nombre || tarea.asignadoA,
        asignadoPorNombre: usersData.find(u => u.uid === tarea.asignadoPor)?.nombre || tarea.asignadoPor
      }));
      
      setTareas(tareasEnriquecidas);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user, vista]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // 👇 PEGA AQUÍ el nuevo useEffect
  useEffect(() => {
    if (tareaSeleccionada?.expedienteId) {
      const expediente = expedientes.find(e => e.uid === tareaSeleccionada.expedienteId);
      setUsuariosAsignadosExpediente(expediente?.asignados || []);
    }
  }, [tareaSeleccionada, expedientes]);
  

  const handleCrearTarea = useCallback(async (formData: TareaFormData) => {
    if (!user) return;
    
    try {
      const userNombre = usuarios.find(u => u.uid === user.uid)?.nombre || user.email || '';
      await crearTarea(formData, user.uid, userNombre);
      toast.success('Tarea creada exitosamente');
      await cargarDatos();
    } catch (error) {
      toast.error('Error al crear tarea');
      console.error(error);
      throw error;
    }
  }, [user, usuarios, cargarDatos]);

  const handleActualizarEstatus = useCallback(async (
    estatus: EstatusTarea,
    horasReales?: number,
    comentario?: string
  ) => {
    if (!tareaSeleccionada?.uid || !user) return;
    
    try {
      const userNombre = usuarios.find(u => u.uid === user.uid)?.nombre || user.email || '';
      await actualizarEstatusTarea(
        tareaSeleccionada.uid,
        { estatus, horasReales, comentarioFinal: comentario },
        user.uid,
        userNombre
      );
      toast.success('Estatus actualizado');
      await cargarDatos();
      setTareaSeleccionada(null);
    } catch (error) {
      toast.error('Error al actualizar estatus');
      console.error(error);
      throw error;
    }
  }, [tareaSeleccionada, user, usuarios, cargarDatos]);

  const handleEliminarTarea = useCallback(async () => {
    if (!tareaSeleccionada?.uid) return;
    
    try {
      await eliminarTarea(tareaSeleccionada.uid);
      toast.success('Tarea eliminada');
      await cargarDatos();
      setTareaSeleccionada(null);
    } catch (error) {
      toast.error('Error al eliminar tarea');
      console.error(error);
    }
  }, [tareaSeleccionada, cargarDatos]);

  const getStatusColor = (estatus: EstatusTarea) => {
    switch (estatus) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en-progreso': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'atrasada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'text-red-600 border-red-200 bg-red-50';
      case 'media': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'baja': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const tareasFiltradas = tareas.filter(tarea => {
    if (filterEstatus === 'todas') return true;
    return tarea.estatus === filterEstatus;
  });

  const tareasPendientes = tareas.filter(t => t.estatus !== 'completada').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600 mt-1">
            Gestión de actividades y seguimiento
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Tarea
        </button>
      </div>

      {/* Vista toggle */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setVista('mis-tareas')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            vista === 'mis-tareas'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock size={16} className="inline mr-2" />
          Mis Tareas
        </button>
        <button
          onClick={() => setVista('equipo')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            vista === 'equipo'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={16} className="inline mr-2" />
          Tareas del Equipo
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de tareas</p>
              <p className="text-2xl font-bold text-gray-900">{tareas.length}</p>
            </div>
            <CheckSquare size={32} className="text-[#C6A43F] opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{tareasPendientes}</p>
            </div>
            <AlertCircle size={32} className="text-yellow-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completadas</p>
              <p className="text-2xl font-bold text-green-600">{tareas.length - tareasPendientes}</p>
            </div>
            <CheckSquare size={32} className="text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filtro por estatus */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterEstatus('todas')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filterEstatus === 'todas'
              ? 'bg-[#C6A43F] text-black'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {(['pendiente', 'en-progreso', 'completada', 'atrasada'] as EstatusTarea[]).map(est => (
          <button
            key={est}
            onClick={() => setFilterEstatus(est)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterEstatus === est
                ? getStatusColor(est)
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {est === 'pendiente' ? 'Pendiente' :
             est === 'en-progreso' ? 'En Progreso' :
             est === 'completada' ? 'Completada' : 'Atrasada'}
          </button>
        ))}
      </div>

      {/* Lista de tareas */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tareas...</p>
          </div>
        ) : tareasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <CheckSquare size={48} className="text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No hay tareas
            </h2>
            <p className="text-gray-500">
              {filterEstatus !== 'todas' 
                ? 'No hay tareas con este estatus'
                : vista === 'mis-tareas' 
                  ? 'No tienes tareas asignadas' 
                  : 'No hay tareas registradas'}
            </p>
          </div>
        ) : (
          tareasFiltradas.map((tarea) => (
            <div
              key={tarea.uid}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(tarea.estatus)}`}>
                      {tarea.estatus === 'pendiente' ? 'Pendiente' :
                       tarea.estatus === 'en-progreso' ? 'En Progreso' :
                       tarea.estatus === 'completada' ? 'Completada' : 'Atrasada'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPrioridadColor(tarea.prioridad)}`}>
                      {tarea.prioridad === 'alta' ? 'Alta Prioridad' :
                       tarea.prioridad === 'media' ? 'Media Prioridad' : 'Baja Prioridad'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {tarea.titulo}
                  </h3>
                  
                  {tarea.descripcion && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {tarea.descripcion}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{tarea.expedienteNum}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Límite: {new Date(tarea.fechaLimite.seconds * 1000).toLocaleDateString('es-MX')}</span>
                    </div>
                    {vista === 'equipo' && (
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>Asignado: {tarea.asignadoANombre}</span>
                      </div>
                    )}
                    {tarea.horasReales > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{tarea.horasReales} hrs</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {tarea.estatus !== 'completada' && (
                    <button
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setEstatusModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-[#C6A43F] transition-colors"
                      title="Actualizar estatus"
                    >
                      <Clock size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Aquí podrías abrir un modal de detalle
                      //toast.info('Detalle de tarea - Próximamente');
                    }}
                    className="p-2 text-gray-600 hover:text-[#C6A43F] transition-colors"
                    title="Ver detalles"
                  >
                    <Eye size={18} />
                  </button>
                  {vista === 'equipo' && (
                    <button
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setConfirmModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <AlertCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modales */}
      <TareaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCrearTarea}
        expedientes={expedientes}
        usuarios={usuarios}
        usuariosAsignadosExpediente={usuariosAsignadosExpediente}
        currentUser={user}
      />

      {tareaSeleccionada && (
        <ActualizarEstatusModal
          isOpen={estatusModalOpen}
          onClose={() => {
            setEstatusModalOpen(false);
            setTareaSeleccionada(null);
          }}
          onConfirm={handleActualizarEstatus}
          estatusActual={tareaSeleccionada.estatus}
          tituloTarea={tareaSeleccionada.titulo}
        />
      )}

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setTareaSeleccionada(null);
        }}
        onConfirm={handleEliminarTarea}
        title="Eliminar Tarea"
        message={`¿Estás seguro de que deseas eliminar la tarea "${tareaSeleccionada?.titulo}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}