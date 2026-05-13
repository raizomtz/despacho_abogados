'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Clock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { EstatusTarea } from '@/types/tarea';
import toast from 'react-hot-toast';

interface ActualizarEstatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (estatus: EstatusTarea, horasReales?: number, comentario?: string) => Promise<void>;
  estatusActual: EstatusTarea;
  tituloTarea: string;
}

const ESTATUS_OPCIONES: { value: EstatusTarea; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'en-progreso', label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  { value: 'completada', label: 'Completada', color: 'bg-green-100 text-green-800' },
  { value: 'atrasada', label: 'Atrasada', color: 'bg-red-100 text-red-800' },
];

export default function ActualizarEstatusModal({
  isOpen,
  onClose,
  onConfirm,
  estatusActual,
  tituloTarea
}: ActualizarEstatusModalProps) {
  const [estatusSeleccionado, setEstatusSeleccionado] = useState<EstatusTarea>(estatusActual);
  const [horasReales, setHorasReales] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (estatusSeleccionado === 'completada' && !horasReales) {
      toast.error('Registra las horas reales para completar la tarea');
      return;
    }
    
    setLoading(true);
    try {
      await onConfirm(
        estatusSeleccionado,
        estatusSeleccionado === 'completada' ? parseFloat(horasReales) : undefined,
        comentario || undefined
      );
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Actualizar Estatus
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Tarea: <span className="font-medium text-gray-900">{tituloTarea}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nuevo Estatus *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ESTATUS_OPCIONES.map(est => (
                      <button
                        key={est.value}
                        type="button"
                        onClick={() => setEstatusSeleccionado(est.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          estatusSeleccionado === est.value
                            ? `${est.color} ring-2 ring-offset-2 ring-[#C6A43F]`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {est.label}
                      </button>
                    ))}
                  </div>
                </div>

                {estatusSeleccionado === 'completada' && (
                  <>
                    <Input
                      label="Horas Reales *"
                      type="number"
                      step="0.5"
                      value={horasReales}
                      onChange={(e) => setHorasReales(e.target.value)}
                      placeholder="Ej: 2.5"
                      icon={<Clock size={16} />}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Comentario Final
                      </label>
                      <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                        placeholder="Describe cómo se completó la tarea..."
                      />
                    </div>
                  </>
                )}

                {estatusSeleccionado !== 'completada' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Comentario (opcional)
                    </label>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                      placeholder="Agrega un comentario sobre el cambio..."
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}