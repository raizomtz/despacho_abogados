'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText, Upload, File, FileUp } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { LegislacionFormData, TipoLegislacion, NivelLegislacion } from '@/types/legislacion';
import toast from 'react-hot-toast';

interface LegislacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LegislacionFormData) => Promise<void>;
  initialData?: Partial<LegislacionFormData>;
  isEdit?: boolean;
}

const DEFAULT_FORM_DATA: LegislacionFormData = {
  titulo: '',
  descripcion: '',
  tipo: 'ley',
  nivel: 'federal',
  jurisdiccion: '',
  fechaPublicacion: '',
  articulos: 0,
  vigente: true,
  archivo: null,
};

const TIPOS_LEGISLACION: { value: TipoLegislacion; label: string; color: string }[] = [
  { value: 'constitucion', label: 'Constitución', color: 'bg-red-100 text-red-800' },
  { value: 'codigo', label: 'Código', color: 'bg-blue-100 text-blue-800' },
  { value: 'ley', label: 'Ley', color: 'bg-green-100 text-green-800' },
  { value: 'reglamento', label: 'Reglamento', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'jurisprudencia', label: 'Jurisprudencia', color: 'bg-purple-100 text-purple-800' },
];

const NIVELES_LEGISLACION: { value: NivelLegislacion; label: string }[] = [
  { value: 'federal', label: 'Federal' },
  { value: 'estatal', label: 'Estatal' },
  { value: 'municipal', label: 'Municipal' },
];

const JURISDICCIONES = [
  'CDMX', 'EdoMex', 'Jalisco', 'Nuevo León', 'Querétaro', 'Puebla',
  'Guanajuato', 'Chihuahua', 'Sonora', 'Veracruz', 'Yucatán', 'Nacional'
];

export default function LegislacionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {},
  isEdit = false 
}: LegislacionModalProps) {
  const [formData, setFormData] = useState<LegislacionFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const initialDataRef = useRef(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const currentInitialData = initialDataRef.current;
    
    if (isEdit && currentInitialData && Object.keys(currentInitialData).length > 0) {
      setFormData({
        titulo: currentInitialData.titulo || '',
        descripcion: currentInitialData.descripcion || '',
        tipo: (currentInitialData.tipo as TipoLegislacion) || 'ley',
        nivel: (currentInitialData.nivel as NivelLegislacion) || 'federal',
        jurisdiccion: currentInitialData.jurisdiccion || '',
        fechaPublicacion: currentInitialData.fechaPublicacion || '',
        articulos: currentInitialData.articulos || 0,
        vigente: currentInitialData.vigente ?? true,
        archivo: null,
      });
      setFileName(currentInitialData.nombreArchivo || '');
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
      setFileName('');
      setSelectedFile(null);
    }
  }, [isOpen, isEdit]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validarYSeleccionarArchivo(file);
    }
  };

  const validarYSeleccionarArchivo = (file: File) => {
    const tiposPermitidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Solo se permiten archivos PDF o Word (doc, docx)');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('El archivo no debe superar los 10MB');
      return;
    }
    
    setSelectedFile(file);
    setFileName(file.name);
    setFormData(prev => ({ ...prev, archivo: file }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validarYSeleccionarArchivo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    
    if (!isEdit && !selectedFile) {
      toast.error('Debes seleccionar un archivo PDF o Word');
      return;
    }
    
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        archivo: selectedFile,
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      vigente: e.target.checked
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
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pt-2 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Legislación' : 'Nueva Legislación'}
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
                    placeholder="Ej: Constitución Política de los Estados Unidos Mexicanos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  >
                    {TIPOS_LEGISLACION.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nivel *
                  </label>
                  <select
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  >
                    {NIVELES_LEGISLACION.map(nivel => (
                      <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
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
                    required
                  >
                    <option value="">Seleccionar jurisdicción</option>
                    {JURISDICCIONES.map(jur => (
                      <option key={jur} value={jur}>{jur}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Fecha de Publicación"
                  name="fechaPublicacion"
                  type="date"
                  value={formData.fechaPublicacion}
                  onChange={handleChange}
                />

                <Input
                  label="Número de Artículos"
                  name="articulos"
                  type="number"
                  value={formData.articulos}
                  onChange={handleChange}
                  placeholder="0"
                />

                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vigente}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 rounded border-gray-300 text-[#C6A43F] focus:ring-[#C6A43F]"
                    />
                    <span className="text-sm text-gray-700">Vigente</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Descripción"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Breve descripción de esta legislación..."
                  />
                </div>

                {/* Área de subida de archivos */}
                {!isEdit && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Archivo * (PDF o Word)
                    </label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                        dragActive
                          ? 'border-[#C6A43F] bg-[#C6A43F]/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <File size={24} className="text-green-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              setFileName('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FileUp size={40} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Arrastra o haz clic para subir tu archivo
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PDF, DOC, DOCX (máx. 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Información del archivo existente (modo edición) */}
                {isEdit && fileName && (
                  <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#C6A43F]" />
                      <span className="text-sm text-gray-600">Archivo actual:</span>
                      <span className="text-sm font-medium text-gray-900">{fileName}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Para cambiar el archivo, elimina la legislación y crea una nueva
                    </p>
                  </div>
                )}
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