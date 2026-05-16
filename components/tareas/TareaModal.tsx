'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, AlertCircle, FileText, Users, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { TareaFormData, TipoTarea, Prioridad } from '@/types/tarea';
import { Expediente } from '@/types/expediente';
import { Usuario } from '@/types/usuario';
import BuscadorExpedienteModal from './BuscadorExpedienteModal';
import BuscadorUsuarioModal from './BuscadorUsuarioModal';
import toast from 'react-hot-toast';

interface TareaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TareaFormData) => Promise<void>;
  expedientes: Expediente[];
  usuarios: Usuario[];
  usuariosAsignadosExpediente?: string[]; // UIDs de usuarios asignados al expediente seleccionado
  currentUser: any;
  initialData?: Partial<TareaFormData>;
  isEdit?: boolean;
}

const DEFAULT_FORM_DATA: TareaFormData = {
  titulo: '',
  descripcion: '',
  tipo: 'documento',
  expedienteId: '',
  expedienteNum: '',
  clienteNombre: '',
  asignadoA: '',
  fechaLimite: '',
  prioridad: 'media',
};

const TIPOS_TAREA: { value: TipoTarea; label: string; color: string }[] = [
  { value: 'diligencia', label: 'Diligencia', color: 'bg-purple-100 text-purple-800' },
  { value: 'vencimiento', label: 'Vencimiento', color: 'bg-red-100 text-red-800' },
  { value: 'documento', label: 'Documento', color: 'bg-blue-100 text-blue-800' },
  { value: 'administrativa', label: 'Administrativa', color: 'bg-gray-100 text-gray-800' },
];

const PRIORIDADES: { value: Prioridad; label: string; color: string }[] = [
  { value: 'alta', label: 'Alta', color: 'text-red-600' },
  { value: 'media', label: 'Media', color: 'text-yellow-600' },
  { value: 'baja', label: 'Baja', color: 'text-green-600' },
];

export default function TareaModal({ 
  isOpen, 
  onClose, 
  onSave, 
  expedientes,
  usuarios,
  usuariosAsignadosExpediente = [],
  currentUser,
  initialData = {},
  isEdit = false 
}: TareaModalProps) {
  const [formData, setFormData] = useState<TareaFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const initialDataRef = useRef(initialData);
  
  // Estados para modales de búsqueda
  const [buscadorExpedienteOpen, setBuscadorExpedienteOpen] = useState(false);
  const [buscadorUsuarioOpen, setBuscadorUsuarioOpen] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen) return;

    const currentInitialData = initialDataRef.current;
    
    if (isEdit && currentInitialData && Object.keys(currentInitialData).length > 0) {
      setFormData({
        titulo: currentInitialData.titulo || '',
        descripcion: currentInitialData.descripcion || '',
        tipo: (currentInitialData.tipo as TipoTarea) || 'documento',
        expedienteId: currentInitialData.expedienteId || '',
        expedienteNum: currentInitialData.expedienteNum || '',
        clienteNombre: currentInitialData.clienteNombre || '',
        asignadoA: currentInitialData.asignadoA || '',
        fechaLimite: currentInitialData.fechaLimite || '',
        prioridad: (currentInitialData.prioridad as Prioridad) || 'media',
      });
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
    }
  }, [isOpen, isEdit]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const handleSelectExpediente = (expedienteId: string, expedienteNum: string, clienteNombre: string) => {
    setFormData(prev => ({
      ...prev,
      expedienteId,
      expedienteNum,
      clienteNombre,
    }));
  };

  const handleSelectUsuario = (usuarioId: string) => {
    setFormData(prev => ({ ...prev, asignadoA: usuarioId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    if (!formData.expedienteId) {
      toast.error('Selecciona un expediente');
      return;
    }
    if (!formData.asignadoA) {
      toast.error('Selecciona a quién asignas la tarea');
      return;
    }
    if (!formData.fechaLimite) {
      toast.error('La fecha límite es obligatoria');
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

  const getUsuarioNombre = (usuarioId: string) => {
    const user = usuarios.find(u => u.uid === usuarioId);
    return user?.nombre || user?.email || 'Seleccionar...';
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Editar Tarea' : 'Nueva Tarea'}
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
                  <div className="md:col-span-2">
                    <Input
                      label="Título *"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      placeholder="Ej: Elaborar escrito de alegatos"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                      placeholder="Describe los detalles de la tarea..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tipo de Tarea *
                    </label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                    >
                      {TIPOS_TAREA.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Prioridad *
                    </label>
                    <select
                      name="prioridad"
                      value={formData.prioridad}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                    >
                      {PRIORIDADES.map(pri => (
                        <option key={pri.value} value={pri.value}>{pri.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Expediente - con modal de búsqueda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Expediente *
                    </label>
                    <button
                      type="button"
                      onClick={() => setBuscadorExpedienteOpen(true)}
                      className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg text-gray-900 hover:border-[#C6A43F] transition-colors flex items-center justify-between"
                    >
                      <span>
                        {formData.expedienteNum 
                          ? `${formData.expedienteNum} - ${formData.clienteNombre}` 
                          : 'Seleccionar expediente...'}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>
                  </div>

                  {/* Asignar a - con modal de búsqueda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Asignar a *
                    </label>
                    <button
                      type="button"
                      onClick={() => setBuscadorUsuarioOpen(true)}
                      className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg text-gray-900 hover:border-[#C6A43F] transition-colors flex items-center justify-between"
                    >
                      <span>{getUsuarioNombre(formData.asignadoA)}</span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>
                  </div>

                  <div>
                    <Input
                      label="Fecha Límite *"
                      name="fechaLimite"
                      type="date"
                      value={formData.fechaLimite}
                      onChange={handleChange}
                      min={minDate}
                      required
                    />
                  </div>
                </div>

                {/* Resumen del expediente seleccionado */}
                {formData.expedienteId && formData.expedienteNum && (
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2 text-sm">
                    <FileText size={16} className="text-[#C6A43F]" />
                    <span className="text-gray-600">Expediente:</span>
                    <span className="font-medium text-gray-900">{formData.expedienteNum}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium text-gray-900">{formData.clienteNombre}</span>
                  </div>
                )}

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
      <BuscadorExpedienteModal
        isOpen={buscadorExpedienteOpen}
        onClose={() => setBuscadorExpedienteOpen(false)}
        expedientes={expedientes}
        onSelectExpediente={handleSelectExpediente}
      />

      <BuscadorUsuarioModal
        isOpen={buscadorUsuarioOpen}
        onClose={() => setBuscadorUsuarioOpen(false)}
        usuarios={usuarios}
        usuariosAsignadosExpediente={usuariosAsignadosExpediente}
        onSelectUsuario={handleSelectUsuario}
      />
    </>
  );
}