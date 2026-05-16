'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FolderOpen, Users, Calendar } from 'lucide-react';
import { Expediente } from '@/types/expediente';

interface BuscadorExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  expedientes: Expediente[];
  onSelectExpediente: (expedienteId: string, expedienteNum: string, clienteNombre: string, asignados?: string[]) => void;
}

export default function BuscadorExpedienteModal({
  isOpen,
  onClose,
  expedientes,
  onSelectExpediente
}: BuscadorExpedienteModalProps) {
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFiltro('');
    }
  }, [isOpen]);

  const expedientesFiltrados = expedientes.filter(exp => {
    const numExpediente = exp.numExpediente?.toLowerCase() || '';
    const clienteNombre = exp.clienteNombre?.toLowerCase() || '';
    const search = filtro.toLowerCase();
    return numExpediente.includes(search) || clienteNombre.includes(search);
  }).slice(0, 50);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Concluido': return 'bg-gray-100 text-gray-800';
      case 'Suspendido': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FolderOpen size={20} className="text-[#C6A43F]" />
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar Expediente</h3>
              </div>
              <button
                onClick={onClose}
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
                  placeholder="Buscar por número o cliente..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {expedientesFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filtro ? 'No se encontraron expedientes' : 'No hay expedientes registrados'}
                  </div>
                ) : (
                  expedientesFiltrados.map((exp) => (
                    <button
                      key={exp.uid}
                      onClick={() => {
                        onSelectExpediente(exp.uid!, exp.numExpediente, exp.clienteNombre, exp.asignados);
                        onClose();
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-mono font-medium text-gray-900">{exp.numExpediente}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(exp.estatus)}`}>
                          {exp.estatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{exp.clienteNombre}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{exp.unidadNegocio}</span>
                        <span>{exp.objeto}</span>
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
}