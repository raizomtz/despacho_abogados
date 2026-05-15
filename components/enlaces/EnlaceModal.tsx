'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Globe, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { EnlaceFormData, TipoEnlace } from '@/types/enlace';
import toast from 'react-hot-toast';

interface EnlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EnlaceFormData) => Promise<void>;
  initialData?: Partial<EnlaceFormData>;
  isEdit?: boolean;
}

const DEFAULT_FORM_DATA: EnlaceFormData = {
  nombre: '',
  url: '',
  tipo: 'tribunal',
  descripcion: '',
  jurisdiccion: '',
  icono: '⚖️',
};

const TIPOS_ENLACE: { value: TipoEnlace; label: string; color: string; iconoPorDefecto: string }[] = [
  { value: 'tribunal', label: 'Tribunal', color: 'bg-blue-100 text-blue-800', iconoPorDefecto: '⚖️' },
  { value: 'junta', label: 'Junta', color: 'bg-green-100 text-green-800', iconoPorDefecto: '🏛️' },
  { value: 'federal', label: 'Federal', color: 'bg-purple-100 text-purple-800', iconoPorDefecto: '🏢' },
  { value: 'otro', label: 'Otro', color: 'bg-gray-100 text-gray-800', iconoPorDefecto: '🔗' },
];

const ICONOS_DISPONIBLES = [
  '⚖️', '🏛️', '🏢', '📜', '⚙️', '🔗', '🌐', '📧', '📞', '📍', '🗺️', '📅'
];

export default function EnlaceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {},
  isEdit = false 
}: EnlaceModalProps) {
  const [formData, setFormData] = useState<EnlaceFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    if (!isOpen) return;

    const currentInitialData = initialDataRef.current;
    
    if (isEdit && currentInitialData && Object.keys(currentInitialData).length > 0) {
      setFormData({
        nombre: currentInitialData.nombre || '',
        url: currentInitialData.url || '',
        tipo: (currentInitialData.tipo as TipoEnlace) || 'tribunal',
        descripcion: currentInitialData.descripcion || '',
        jurisdiccion: currentInitialData.jurisdiccion || '',
        icono: currentInitialData.icono || '⚖️',
      });
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
    }
  }, [isOpen, isEdit]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value as TipoEnlace;
    const tipoInfo = TIPOS_ENLACE.find(t => t.value === tipo);
    setFormData({
      ...formData,
      tipo,
      icono: tipoInfo?.iconoPorDefecto || '⚖️'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!formData.url.trim()) {
      toast.error('La URL es obligatoria');
      return;
    }
    if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      toast.error('La URL debe comenzar con http:// o https://');
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-50 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Enlace' : 'Nuevo Enlace'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nombre *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Tribunal Superior de Justicia CDMX"
                  required
                />

                <Input
                  label="URL *"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://www.poderjudicialcdmx.gob.mx/"
                  icon={<LinkIcon size={16} />}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleTipoChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  >
                    {TIPOS_ENLACE.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Jurisdicción *
                  </label>
                  <select
                    name="jurisdiccion"
                    value={formData.jurisdiccion}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  >
                    <option value="">Seleccionar jurisdicción</option>
                    <option value="CDMX">CDMX</option>
                    <option value="EdoMex">Estado de México</option>
                    <option value="Jalisco">Jalisco</option>
                    <option value="Nuevo León">Nuevo León</option>
                    <option value="Querétaro">Querétaro</option>
                    <option value="Federal">Federal</option>
                    <option value="Nacional">Nacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Icono
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICONOS_DISPONIBLES.map(icono => (
                      <button
                        key={icono}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icono }))}
                        className={`w-10 h-10 text-xl rounded-lg border transition-all ${
                          formData.icono === icono
                            ? 'border-[#C6A43F] bg-[#C6A43F]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {icono}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <Input
                    label="Descripción"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe para qué sirve este enlace..."
                  />
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
  );
}