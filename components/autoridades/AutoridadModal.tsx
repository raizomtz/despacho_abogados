'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { AutoridadFormData } from '@/types/autoridad';
import toast from 'react-hot-toast';

interface AutoridadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AutoridadFormData) => Promise<void>;
  initialData?: Partial<AutoridadFormData>;
  isEdit?: boolean;
}

const DEFAULT_FORM_DATA: AutoridadFormData = {
  nombreCorto: '',
  nombreCompleto: '',
  fuero: 'Local',
  materia: 'Civil',
  direccion: '',
  ubicacionGPS: '',
  telefono: '',
  horario: '',
};

const FUEROS = [
  { value: 'Local', label: 'Local' },
  { value: 'Federal', label: 'Federal' },
];

const MATERIAS = [
  { value: 'Civil', label: 'Civil' },
  { value: 'Familiar', label: 'Familiar' },
  { value: 'Mercantil', label: 'Mercantil' },
  { value: 'Penal', label: 'Penal' },
  { value: 'Laboral', label: 'Laboral' },
  { value: 'Administrativo', label: 'Administrativo' },
];

export default function AutoridadModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {},
  isEdit = false 
}: AutoridadModalProps) {
  const [formData, setFormData] = useState<AutoridadFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    if (!isOpen) return;

    const currentInitialData = initialDataRef.current;
    
    if (isEdit && currentInitialData && Object.keys(currentInitialData).length > 0) {
      setFormData({
        nombreCorto: currentInitialData.nombreCorto || '',
        nombreCompleto: currentInitialData.nombreCompleto || '',
        fuero: (currentInitialData.fuero as 'Local' | 'Federal') || 'Local',
        materia: (currentInitialData.materia as any) || 'Civil',
        direccion: currentInitialData.direccion || '',
        ubicacionGPS: currentInitialData.ubicacionGPS || '',
        telefono: currentInitialData.telefono || '',
        horario: currentInitialData.horario || '',
      });
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
    }
  }, [isOpen, isEdit]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombreCorto.trim()) {
      toast.error('El nombre corto es obligatorio');
      return;
    }
    if (!formData.nombreCompleto.trim()) {
      toast.error('El nombre completo es obligatorio');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-50 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Autoridad' : 'Nueva Autoridad'}
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
                <Input
                  label="Nombre Corto *"
                  name="nombreCorto"
                  value={formData.nombreCorto}
                  onChange={handleChange}
                  placeholder="Ej: SJR-CIV-4"
                  required
                />

                <div className="md:col-span-2">
                  <Input
                    label="Nombre Completo *"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    placeholder="Ej: Juzgado Cuarto de lo Civil del Distrito Judicial de San Juan del Río"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Fuero *
                  </label>
                  <select
                    name="fuero"
                    value={formData.fuero}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  >
                    {FUEROS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Materia *
                  </label>
                  <select
                    name="materia"
                    value={formData.materia}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  >
                    {MATERIAS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Calle, número, colonia, CP, ciudad"
                    icon={<MapPin size={18} />}
                  />
                </div>

                <Input
                  label="Ubicación GPS (Link Google Maps)"
                  name="ubicacionGPS"
                  value={formData.ubicacionGPS}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  icon={<Navigation size={18} />}
                />

                <Input
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="442 123 4567 ext. 123"
                  icon={<Phone size={18} />}
                />

                <Input
                  label="Horario de atención"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  placeholder="09:00 - 15:00"
                  icon={<Clock size={18} />}
                />
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
  );
}