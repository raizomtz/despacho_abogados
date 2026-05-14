'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  CheckSquare, 
  FolderOpen, 
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Usuario } from '@/types/usuario';
import { Tarea } from '@/types/tarea';
import { 
  obtenerEstadisticasUsuario, 
  obtenerTareasPendientesUsuario,
  obtenerExpedientesUsuario
} from '@/lib/admin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UsuarioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

export default function UsuarioDetailModal({ isOpen, onClose, usuario }: UsuarioDetailModalProps) {
  const [estadisticas, setEstadisticas] = useState({
    tareasPendientes: 0,
    tareasCompletadas: 0,
    tareasTotales: 0,
    expedientesAsignados: 0,
    horasTotales: 0
  });
  const [tareasPendientes, setTareasPendientes] = useState<Tarea[]>([]);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroPrioridad, setFiltroPrioridad] = useState<'todas' | 'alta' | 'media' | 'baja'>('todas');

  useEffect(() => {
    if (isOpen && usuario) {
      cargarDatos();
    }
  }, [isOpen, usuario]);

  const cargarDatos = async () => {
    if (!usuario) return;
    
    setLoading(true);
    try {
      const [stats, tareas, expedientesData] = await Promise.all([
        obtenerEstadisticasUsuario(usuario.uid),
        obtenerTareasPendientesUsuario(usuario.uid),
        obtenerExpedientesUsuario(usuario.uid)
      ]);
      
      setEstadisticas(stats);
      setTareasPendientes(tareas);
      setExpedientes(expedientesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return <AlertCircle size={14} className="text-red-500" />;
      case 'media': return <Clock size={14} className="text-yellow-500" />;
      default: return <CheckSquare size={14} className="text-green-500" />;
    }
  };

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en-progreso': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'atrasada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tareasFiltradas = tareasPendientes.filter(tarea => {
    if (filtroPrioridad === 'todas') return true;
    return tarea.prioridad === filtroPrioridad;
  });

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'abogado': return 'Abogado';
      default: return 'Pasante';
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'abogado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (!usuario) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#C6A43F] rounded-full flex items-center justify-center text-black font-bold text-lg">
                  {usuario.nombre?.charAt(0) || usuario.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{usuario.nombre || 'Sin nombre'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">{usuario.email}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRolColor(usuario.rol)}`}>
                      {getRolLabel(usuario.rol)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando datos...</p>
                </div>
              ) : (
                <>
                  {/* Tarjetas de resumen */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <FolderOpen size={20} className="text-[#C6A43F] mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900">{estadisticas.expedientesAsignados}</p>
                      <p className="text-xs text-gray-500">Expedientes</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <AlertCircle size={20} className="text-yellow-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-yellow-600">{estadisticas.tareasPendientes}</p>
                      <p className="text-xs text-gray-500">Pendientes</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <CheckSquare size={20} className="text-green-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-600">{estadisticas.tareasCompletadas}</p>
                      <p className="text-xs text-gray-500">Completadas</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Clock size={20} className="text-blue-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-600">{estadisticas.horasTotales.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">Horas</p>
                    </div>
                  </div>

                  {/* Tareas Pendientes */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={18} className="text-[#C6A43F]" />
                        <h3 className="font-semibold text-gray-900">Tareas Pendientes</h3>
                        <span className="text-xs text-gray-400">{tareasPendientes.length} tareas</span>
                      </div>
                      <div className="flex gap-1">
                        {(['todas', 'alta', 'media', 'baja'] as const).map(pri => (
                          <button
                            key={pri}
                            onClick={() => setFiltroPrioridad(pri)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              filtroPrioridad === pri
                                ? 'bg-[#C6A43F] text-black'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {pri === 'todas' ? 'Todas' : pri === 'alta' ? '🔴 Alta' : pri === 'media' ? '🟡 Media' : '🟢 Baja'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {tareasFiltradas.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <CheckSquare size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No hay tareas pendientes</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tareasFiltradas.map((tarea) => (
                          <div key={tarea.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getPriorityIcon(tarea.prioridad)}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(tarea.estatus)}`}>
                                  {tarea.estatus === 'pendiente' ? 'Pendiente' : 'En Progreso'}
                                </span>
                                <span className="text-xs text-gray-400">{tarea.expedienteNum}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{tarea.titulo}</p>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-xs text-gray-500">
                                {tarea.fechaLimite?.toDate().toLocaleDateString('es-MX')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expedientes con actividad */}
                  {expedientes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FolderOpen size={18} className="text-[#C6A43F]" />
                        <h3 className="font-semibold text-gray-900">Expedientes con Actividad</h3>
                      </div>
                      <div className="space-y-2">
                        {expedientes.map((exp) => (
                          <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{exp.numero}</p>
                              <p className="text-xs text-gray-500">{exp.cliente}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                exp.estatus === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {exp.estatus}
                              </span>
                              <span className="text-xs text-gray-400">{exp.tareasCount} tareas</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}