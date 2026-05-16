'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, UserPlus, UserMinus, Users, ChevronDown, Star } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { ExpedienteFormData } from '@/types/expediente';
import { Cliente } from '@/types/cliente';
import { Usuario } from '@/types/usuario';
import { Autoridad } from '@/types/autoridad';
import BuscadorClienteModal from './BuscadorClienteModal';
import BuscadorAutoridadModal from './BuscadorAutoridadModal';
import toast from 'react-hot-toast';

interface ExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExpedienteFormData) => Promise<void>;
  clientes: Cliente[];
  autoridades?: Autoridad[];
  usuarios?: Usuario[];
  currentUser?: any;
  initialData?: Partial<ExpedienteFormData>;
  isEdit?: boolean;
}

const DEFAULT_FORM_DATA: ExpedienteFormData = {
  unidadNegocio: 'GEJ',
  clienteId: '',
  clienteNombre: '',
  objeto: '',
  tipoAsunto: '',
  autoridadId: '',
  numExpediente: '',
  expedienteOrigen: '',
  actorInteresado: '',
  demandadoInculpado: '',
  estatus: 'Activo',
  asignados: [],
  encargadoPrincipal: null,
};

const UNIDADES_NEGOCIO = [
  { value: 'GEJ', label: 'GEJ - Gestión Estratégica Jurídica' },
  { value: 'DLAS', label: 'DLAS - Derecho Laboral y Administrativo' },
];

const TIPOS_ASUNTO = [
  'Ejecutivo Mercantil',
  'Ordinario Civil',
  'Juicio Laboral',
  'Amparo',
  'Procedimiento Administrativo',
];

const OBJETOS = [
  'Prescripción Positiva',
  'Sucesión',
  'Divorcio',
  'Desahucio',
  'Cobro de Pagarés',
  'Reclamación Laboral',
];

export default function ExpedienteModal({ 
  isOpen, 
  onClose, 
  onSave, 
  clientes,
  autoridades = [],
  usuarios = [],
  currentUser,
  initialData = {},
  isEdit = false 
}: ExpedienteModalProps) {
  const [formData, setFormData] = useState<ExpedienteFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [buscadorClienteOpen, setBuscadorClienteOpen] = useState(false);
  const [buscadorAutoridadOpen, setBuscadorAutoridadOpen] = useState(false);
  
  // Usar una ref para saber si ya se cargaron los datos iniciales
  const datosCargadosRef = useRef(false);
  const prevInitialDataRef = useRef(initialData);

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      datosCargadosRef.current = false;
    }
  }, [isOpen]);

  // Cargar datos solo cuando se abre el modal y hay datos para editar
  useEffect(() => {
    if (!isOpen) return;
    
    // Evitar cargar múltiples veces
    if (datosCargadosRef.current) return;
    
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      console.log('Cargando datos para edición');
      setFormData({
        unidadNegocio: initialData.unidadNegocio || 'GEJ',
        clienteId: initialData.clienteId || '',
        clienteNombre: initialData.clienteNombre || '',
        objeto: initialData.objeto || '',
        tipoAsunto: initialData.tipoAsunto || '',
        autoridadId: initialData.autoridadId || '',
        numExpediente: initialData.numExpediente || '',
        expedienteOrigen: initialData.expedienteOrigen || '',
        actorInteresado: initialData.actorInteresado || '',
        demandadoInculpado: initialData.demandadoInculpado || '',
        estatus: (initialData.estatus as 'Activo' | 'Concluido' | 'Suspendido') || 'Activo',
        asignados: initialData.asignados || [],
        encargadoPrincipal: initialData.encargadoPrincipal || null,
      });
      setSelectedUsers(initialData.asignados || []);
      datosCargadosRef.current = true;
    } else if (!isEdit) {
      // Modo creación: resetear formulario
      setFormData({ ...DEFAULT_FORM_DATA });
      setSelectedUsers([]);
      datosCargadosRef.current = true;
    }
  }, [isOpen, isEdit, initialData]);

  // Actualizar la ref cuando initialData cambie (para futuras aperturas)
  useEffect(() => {
    prevInitialDataRef.current = initialData;
  }, [initialData]);

  const handleAddUser = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      const newSelected = [...selectedUsers, userId];
      setSelectedUsers(newSelected);
      setFormData(prev => ({ ...prev, asignados: newSelected }));
    }
  };

  const handleRemoveUser = (userId: string) => {
    const newSelected = selectedUsers.filter(id => id !== userId);
    setSelectedUsers(newSelected);
    setFormData(prev => ({ 
      ...prev, 
      asignados: newSelected,
      encargadoPrincipal: prev.encargadoPrincipal === userId ? null : prev.encargadoPrincipal
    }));
  };

  const handleSetEncargadoPrincipal = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setFormData(prev => ({ ...prev, encargadoPrincipal: userId }));
      toast.success('Encargado principal asignado');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (!formData.numExpediente.trim()) {
      toast.error('El número de expediente es obligatorio');
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getAutoridadNombre = (autoridadId: string) => {
    const autoridad = autoridades.find(a => a.uid === autoridadId);
    return autoridad?.nombreCompleto || 'Autoridad seleccionada';
  };

  const getUserName = (userId: string) => {
    const user = usuarios.find(u => u.uid === userId);
    return user?.nombre || user?.email || userId;
  };

  const getUserRol = (userId: string) => {
    const user = usuarios.find(u => u.uid === userId);
    if (user?.rol === 'abogado') return 'Abogado';
    if (user?.rol === 'admin') return 'Administrador';
    return 'Pasante';
  };

  return (
    <>
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-50 p-6"
            >
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pt-2 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Editar Expediente' : 'Nuevo Expediente'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Unidad de Negocio *
                    </label>
                    <select
                      name="unidadNegocio"
                      value={formData.unidadNegocio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                      required
                    >
                      {UNIDADES_NEGOCIO.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Cliente *
                    </label>
                    <button
                      type="button"
                      onClick={() => setBuscadorClienteOpen(true)}
                      className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg text-gray-900 hover:border-[#C6A43F] transition-colors flex items-center justify-between"
                    >
                      <span>{formData.clienteNombre || 'Seleccionar cliente...'}</span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Objeto *
                    </label>
                    <select
                      name="objeto"
                      value={formData.objeto}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar objeto</option>
                      {OBJETOS.map(obj => (
                        <option key={obj} value={obj}>{obj}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tipo de Asunto *
                    </label>
                    <select
                      name="tipoAsunto"
                      value={formData.tipoAsunto}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      {TIPOS_ASUNTO.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Autoridad *
                    </label>
                    <button
                      type="button"
                      onClick={() => setBuscadorAutoridadOpen(true)}
                      className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg text-gray-900 hover:border-[#C6A43F] transition-colors flex items-center justify-between"
                    >
                      <span>{formData.autoridadId ? getAutoridadNombre(formData.autoridadId) : 'Seleccionar autoridad...'}</span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>
                  </div>

                  <Input
                    label="Número de Expediente *"
                    name="numExpediente"
                    value={formData.numExpediente}
                    onChange={handleChange}
                    placeholder="123/2026"
                    required
                  />

                  <Input
                    label="Expediente de Origen"
                    name="expedienteOrigen"
                    value={formData.expedienteOrigen}
                    onChange={handleChange}
                    placeholder="Origen del expediente"
                  />

                  <Input
                    label="Actor / Interesado"
                    name="actorInteresado"
                    value={formData.actorInteresado}
                    onChange={handleChange}
                    placeholder="Quién demanda o solicita"
                  />

                  <Input
                    label="Demandado / Inculpado"
                    name="demandadoInculpado"
                    value={formData.demandadoInculpado}
                    onChange={handleChange}
                    placeholder="Contraparte"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Estatus *
                    </label>
                    <select
                      name="estatus"
                      value={formData.estatus}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Concluido">Concluido</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                  </div>

                  {/* Campo de Asignados con Encargado Principal */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <Users size={16} className="inline mr-1" />
                      Personas Asignadas al Expediente
                    </label>
                    
                    <div className="mb-3">
                      <select
                        onChange={(e) => handleAddUser(e.target.value)}
                        value=""
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                      >
                        <option value="">Agregar persona...</option>
                        {usuarios
                          .filter(u => !selectedUsers.includes(u.uid))
                          .map(user => (
                            <option key={user.uid} value={user.uid}>
                              {user.nombre || user.email} - {user.rol === 'abogado' ? 'Abogado' : user.rol === 'admin' ? 'Admin' : 'Pasante'}
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    {selectedUsers.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUsers.map(userId => {
                          const isEncargado = formData.encargadoPrincipal === userId;
                          return (
                            <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900">
                                    {getUserName(userId)}
                                  </p>
                                  {isEncargado && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#C6A43F] text-black">
                                      Encargado Principal
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {getUserRol(userId)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!isEncargado && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetEncargadoPrincipal(userId)}
                                    className="text-gray-500 hover:text-[#C6A43F] transition-colors"
                                    title="Marcar como encargado principal"
                                  >
                                    <Star size={18} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUser(userId)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Remover"
                                >
                                  <UserMinus size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No hay personas asignadas a este expediente</p>
                    )}
                    
                    {selectedUsers.length > 0 && !formData.encargadoPrincipal && (
                      <p className="text-xs text-yellow-600 mt-2">
                        ⚠️ Selecciona un encargado principal para este expediente
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BuscadorClienteModal
        isOpen={buscadorClienteOpen}
        onClose={() => setBuscadorClienteOpen(false)}
        clientes={clientes}
        onSelectCliente={(clienteId, clienteNombre) => {
          setFormData(prev => ({ ...prev, clienteId, clienteNombre }));
        }}
      />

      <BuscadorAutoridadModal
        isOpen={buscadorAutoridadOpen}
        onClose={() => setBuscadorAutoridadOpen(false)}
        autoridades={autoridades}
        onSelectAutoridad={(autoridadId) => {
          setFormData(prev => ({ ...prev, autoridadId }));
        }}
      />
    </>
  );
}