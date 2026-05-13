'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { GastoFormData, EstatusPago } from '@/types/gasto';
import { Expediente } from '@/types/expediente';
import toast from 'react-hot-toast';

interface GastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GastoFormData) => Promise<void>;
  expedientes: Expediente[];
  initialData?: Partial<GastoFormData>;
  isEdit?: boolean;
}

const DEFAULT_FORM_DATA: GastoFormData = {
  fecha: new Date().toISOString().split('T')[0],
  clienteId: '',
  clienteNombre: '',
  expedienteId: '',
  expedienteNum: '',
  concepto: '',
  subtotal: 0,
  iva: 0,
  total: 0,
  estatusPago: 'pendiente',
};

const ESTATUS_PAGO: { value: EstatusPago; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'reembolsado', label: 'Reembolsado', color: 'bg-green-100 text-green-800' },
  { value: 'por-facturar', label: 'Por Facturar', color: 'bg-blue-100 text-blue-800' },
];

export default function GastoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  expedientes,
  initialData = {},
  isEdit = false 
}: GastoModalProps) {
  const [formData, setFormData] = useState<GastoFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const initialDataRef = useRef(initialData);

  // Calcular total automáticamente
  const calcularTotal = (subtotal: number, iva: number) => {
    return subtotal + (subtotal * iva / 100);
  };

  const handleSubtotalChange = (value: number) => {
    const nuevoTotal = calcularTotal(value, formData.iva);
    setFormData(prev => ({
      ...prev,
      subtotal: value,
      total: nuevoTotal
    }));
  };

  const handleIvaChange = (value: number) => {
    const nuevoTotal = calcularTotal(formData.subtotal, value);
    setFormData(prev => ({
      ...prev,
      iva: value,
      total: nuevoTotal
    }));
  };

  useEffect(() => {
    if (!isOpen) return;

    const currentInitialData = initialDataRef.current;
    
    if (isEdit && currentInitialData && Object.keys(currentInitialData).length > 0) {
      setFormData({
        fecha: currentInitialData.fecha || DEFAULT_FORM_DATA.fecha,
        clienteId: currentInitialData.clienteId || '',
        clienteNombre: currentInitialData.clienteNombre || '',
        expedienteId: currentInitialData.expedienteId || '',
        expedienteNum: currentInitialData.expedienteNum || '',
        concepto: currentInitialData.concepto || '',
        subtotal: currentInitialData.subtotal || 0,
        iva: currentInitialData.iva || 0,
        total: currentInitialData.total || 0,
        estatusPago: (currentInitialData.estatusPago as EstatusPago) || 'pendiente',
      });
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
    }
  }, [isOpen, isEdit]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const handleExpedienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const expedienteId = e.target.value;
    const expediente = expedientes.find(exp => exp.uid === expedienteId);
    
    setFormData({
      ...formData,
      expedienteId,
      expedienteNum: expediente?.numExpediente || '',
      clienteId: expediente?.clienteId || '',
      clienteNombre: expediente?.clienteNombre || '',
    });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.concepto.trim()) {
    toast.error('El concepto es obligatorio');
    return;
  }
  if (!formData.expedienteId) {
    toast.error('Selecciona un expediente');
    return;
  }
  if (formData.subtotal <= 0) {
    toast.error('El subtotal debe ser mayor a 0');
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
    const { name, value } = e.target;
    
    if (name === 'subtotal') {
      handleSubtotalChange(parseFloat(value) || 0);
    } else if (name === 'iva') {
      handleIvaChange(parseFloat(value) || 0);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-50 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Gasto' : 'Nuevo Gasto'}
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
                  label="Fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Expediente *
                  </label>
                  <select
                    value={formData.expedienteId}
                    onChange={handleExpedienteChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                    required
                    disabled={isEdit}
                  >
                    <option value="">Seleccionar expediente</option>
                    {expedientes.map(exp => (
                      <option key={exp.uid} value={exp.uid}>
                        {exp.numExpediente} - {exp.clienteNombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Concepto *"
                    name="concepto"
                    value={formData.concepto}
                    onChange={handleChange}
                    placeholder="Ej: Copias certificadas, Viáticos, Peritaje"
                    required
                  />
                </div>

                <Input
                  label="Subtotal *"
                  name="subtotal"
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />

                <Input
                  label="IVA (%)"
                  name="iva"
                  type="number"
                  step="0.01"
                  value={formData.iva}
                  onChange={handleChange}
                  placeholder="16"
                />

                <div className="md:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator size={18} className="text-[#C6A43F]" />
                      <span className="text-sm font-medium text-gray-700">Total</span>
                    </div>
                    <span className="text-xl font-bold text-[#C6A43F]">
                      ${formData.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Estatus de Pago *
                  </label>
                  <select
                    name="estatusPago"
                    value={formData.estatusPago}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  >
                    {ESTATUS_PAGO.map(est => (
                      <option key={est.value} value={est.value}>{est.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen del expediente */}
              {formData.expedienteId && formData.expedienteNum && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <span className="font-medium">Cliente:</span> {formData.clienteNombre}
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
  );
}