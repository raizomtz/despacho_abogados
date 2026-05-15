'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, UserPlus, UserMinus, Users, ChevronDown, Star, StarOff, Search, UserCheck } from 'lucide-react';
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
  const initialDataRef = useRef(initialData);
  
  const [buscadorClienteOpen, setBuscadorClienteOpen] = useState(false);
  const [buscadorAutoridadOpen, setBuscadorAutoridadOpen] = useState(false);
  
  // Estados para los modales de búsqueda de actor/demandado
  const [buscadorActorOpen, setBuscadorActorOpen] = useState(false);
  const [buscadorDemandadoOpen, setBuscadorDemandadoOpen] = useState(false);
  
  // Estado para saber qué campo estamos buscando
  const [campoBuscando, setCampoBuscando] = useState<'actor' | 'demandado' | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const currentInitialData = initialDataRef.current;
    
    if (isEdit && currentInitialData && Object.keys(currentInitialData).length > 0) {
      setFormData({
        unidadNegocio: currentInitialData.unidadNegocio || 'GEJ',
        clienteId: currentInitialData.clienteId || '',
        clienteNombre: currentInitialData.clienteNombre || '',
        objeto: currentInitialData.objeto || '',
        tipoAsunto: currentInitialData.tipoAsunto || '',
        autoridadId: currentInitialData.autoridadId || '',
        numExpediente: currentInitialData.numExpediente || '',
        expedienteOrigen: currentInitialData.expedienteOrigen || '',
        actorInteresado: currentInitialData.actorInteresado || '',
        demandadoInculpado: currentInitialData.demandadoInculpado || '',
        estatus: (currentInitialData.estatus as 'Activo' | 'Concluido' | 'Suspendido') || 'Activo',
        asignados: currentInitialData.asignados || [],
        encargadoPrincipal: currentInitialData.encargadoPrincipal || null,
      });
      setSelectedUsers(currentInitialData.asignados || []);
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
      setSelectedUsers([]);
    }
  }, [isOpen, isEdit]);

  useEffect(() => {
    initialDataRef.current = initialData;
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

  // Función para marcar como cliente
  const marcarComoCliente = (campo: 'actor' | 'demandado') => {
    setCampoBuscando(campo);
    if (campo === 'actor') {
      setBuscadorActorOpen(true);
    } else {
      setBuscadorDemandadoOpen(true);
    }
  };

// Función para seleccionar cliente y asignarlo al campo correspondiente
const handleSelectClienteParaCampo = (cliente: Cliente, campo: 'actor' | 'demandado') => {
  // Solo el nombre del cliente
  const nombreCompleto = cliente.nombre;
  
  if (campo === 'actor') {
    setFormData(prev => ({ ...prev, actorInteresado: nombreCompleto }));
  } else {
    setFormData(prev => ({ ...prev, demandadoInculpado: nombreCompleto }));
  }
  
  toast.success(`Cliente asignado como ${campo === 'actor' ? 'Actor' : 'Demandado'}`);
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

  // Modal de búsqueda para Actor/Demandado (reutiliza el buscador de clientes)
  const BuscadorClienteCampoModal = () => (
    <AnimatePresence>
      {(buscadorActorOpen || buscadorDemandadoOpen) && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setBuscadorActorOpen(false);
              setBuscadorDemandadoOpen(false);
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-[#C6A43F]" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Seleccionar Cliente como {campoBuscando === 'actor' ? 'Actor' : 'Demandado'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setBuscadorActorOpen(false);
                  setBuscadorDemandadoOpen(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre o código..."
                  onChange={(e) => {
                    // Filtro en tiempo real
                    const searchTerm = e.target.value.toLowerCase();
                    const items = document.querySelectorAll('.cliente-item');
                    items.forEach(item => {
                      const text = item.textContent?.toLowerCase() || '';
                      (item as HTMLElement).style.display = text.includes(searchTerm) ? 'flex' : 'none';
                    });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {clientes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay clientes registrados
                  </div>
                ) : (
                  clientes.map((cliente) => (
                    <button
                      key={cliente.uid}
                      className="cliente-item w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                      onClick={() => {
                        if (campoBuscando === 'actor') {
                          handleSelectClienteParaCampo(cliente, 'actor');
                          setBuscadorActorOpen(false);
                        } else if (campoBuscando === 'demandado') {
                          handleSelectClienteParaCampo(cliente, 'demandado');
                          setBuscadorDemandadoOpen(false);
                        }
                        setCampoBuscando(null);
                      }}
                    >
                      <p className="font-medium text-gray-900">{cliente.nombre}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-mono">{cliente.codigoUnico}</span>
                        {cliente.rfc && (
                          <span className="text-xs text-gray-400">RFC: {cliente.rfc}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

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

                  {/* Actor / Interesado con botón ícono */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Actor / Interesado
                      </label>
                      <button
                        type="button"
                        onClick={() => marcarComoCliente('actor')}
                        className="p-1 text-gray-400 hover:text-[#C6A43F] transition-colors"
                        title="Marcar como cliente"
                      >
                        <UserCheck size={16} />
                      </button>
                    </div>
                    <textarea
                      name="actorInteresado"
                      value={formData.actorInteresado}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                      placeholder="Nombre de quien demanda o solicita..."
                    />
                  </div>

                  {/* Demandado / Inculpado con botón ícono */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Demandado / Inculpado
                      </label>
                      <button
                        type="button"
                        onClick={() => marcarComoCliente('demandado')}
                        className="p-1 text-gray-400 hover:text-[#C6A43F] transition-colors"
                        title="Marcar como cliente"
                      >
                        <UserCheck size={16} />
                      </button>
                    </div>
                    <textarea
                      name="demandadoInculpado"
                      value={formData.demandadoInculpado}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                      placeholder="Nombre de la contraparte..."
                    />
                  </div>

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

      {/* Modales de búsqueda */}
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

      <BuscadorClienteCampoModal />
    </>
  );
}