'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { ClienteFormData } from '@/types/cliente';
import toast from 'react-hot-toast';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClienteFormData) => Promise<void>;
  initialData?: Partial<ClienteFormData>;
  isEdit?: boolean;
}

// Valores iniciales por defecto
const DEFAULT_FORM_DATA: ClienteFormData = {
  codigoUnico: '',
  nombre: '',
  rfc: '',
  domicilio: '',
  representanteLegal: '',
  contactoPrincipal: '',
  email: '',
  celWhatsapp: '',
  telefono: '',
};

export default function ClienteModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {},
  isEdit = false 
}: ClienteModalProps) {
  const [formData, setFormData] = useState<ClienteFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({
          codigoUnico: initialData.codigoUnico || '',
          nombre: initialData.nombre || '',
          rfc: initialData.rfc || '',
          domicilio: initialData.domicilio || '',
          representanteLegal: initialData.representanteLegal || '',
          contactoPrincipal: initialData.contactoPrincipal || '',
          email: initialData.email || '',
          celWhatsapp: initialData.celWhatsapp || '',
          telefono: initialData.telefono || '',
        });
      } else {
        setFormData(DEFAULT_FORM_DATA);
      }
    }
  }, [isOpen, isEdit]); // Solo depende de isOpen e isEdit, no de initialData

  // No necesitamos este useEffect porque ya reseteamos arriba
  // useEffect(() => {
  //   if (initialData) {
  //     setFormData(...)
  //   }
  // }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('El email es obligatorio');
      return;
    }
    if (!formData.celWhatsapp.trim()) {
      toast.error('El celular/WhatsApp es obligatorio');
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
      // Resetear formulario después de guardar
      setFormData(DEFAULT_FORM_DATA);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []); // useCallback para evitar recrear la función

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
                {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
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
                  label="Código Único"
                  name="codigoUnico"
                  value={formData.codigoUnico}
                  onChange={handleChange}
                  placeholder="CLI-001"
                  disabled={isEdit}
                  required
                />
                <Input
                  label="Nombre del Cliente/Empresa"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez o Empresa SA"
                  required
                />
                <Input
                  label="RFC"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleChange}
                  placeholder="XAXX010101000"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cliente@ejemplo.com"
                  required
                />
                <Input
                  label="Celular/WhatsApp"
                  name="celWhatsapp"
                  value={formData.celWhatsapp}
                  onChange={handleChange}
                  placeholder="4421234567"
                  required
                />
                <Input
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="4421234567"
                />
                <Input
                  label="Representante Legal"
                  name="representanteLegal"
                  value={formData.representanteLegal}
                  onChange={handleChange}
                  placeholder="Nombre del representante"
                />
                <Input
                  label="Contacto Principal"
                  name="contactoPrincipal"
                  value={formData.contactoPrincipal}
                  onChange={handleChange}
                  placeholder="Persona de contacto"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Domicilio"
                    name="domicilio"
                    value={formData.domicilio}
                    onChange={handleChange}
                    placeholder="Calle, Número, Colonia, CP, Ciudad"
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