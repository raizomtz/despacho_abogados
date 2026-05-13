'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { ExpedienteFormData } from '@/types/expediente';
import { Cliente } from '@/types/cliente';
import toast from 'react-hot-toast';

interface ExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExpedienteFormData) => Promise<void>;
  clientes: Cliente[];
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

const AUTORIDADES = [
  { value: 'QRO-CIV-1', label: 'Juzgado Civil de Querétaro' },
  { value: 'QRO-CIV-2', label: 'Juzgado Civil de Querétaro #2' },
  { value: 'QRO-FAM-1', label: 'Juzgado Familiar de Querétaro' },
  { value: 'CDMX-CIV-1', label: 'Juzgado Civil CDMX' },
];

export default function ExpedienteModal({ 
  isOpen, 
  onClose, 
  onSave, 
  clientes,
  initialData = {},
  isEdit = false 
}: ExpedienteModalProps) {
  const [formData, setFormData] = useState<ExpedienteFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
      });
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
    }
  }, [isOpen, isEdit]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = e.target.value;
    const cliente = clientes.find(c => c.uid === clienteId);
    setFormData({
      ...formData,
      clienteId,
      clienteNombre: cliente?.nombre || '',
    });
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
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
                  <select
                    name="clienteId"
                    value={formData.clienteId}
                    onChange={handleClienteChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                    required
                    disabled={isEdit}
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.uid} value={cliente.uid}>
                        {cliente.codigoUnico} - {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Objeto *
                  </label>
                  <select
                    name="objeto"
                    value={formData.objeto}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
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
                  <select
                    name="autoridadId"
                    value={formData.autoridadId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar autoridad</option>
                    {AUTORIDADES.map(aut => (
                      <option key={aut.value} value={aut.value}>{aut.label}</option>
                    ))}
                  </select>
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Concluido">Concluido</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
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