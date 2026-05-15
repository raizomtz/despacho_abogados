'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Building2 } from 'lucide-react';
import { Autoridad } from '@/types/autoridad';

interface BuscadorAutoridadModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoridades: Autoridad[];
  onSelectAutoridad: (autoridadId: string) => void;
}

export default function BuscadorAutoridadModal({
  isOpen,
  onClose,
  autoridades,
  onSelectAutoridad
}: BuscadorAutoridadModalProps) {
  const [filtro, setFiltro] = useState('');

  // Resetear filtro cuando se abre/cierra
  useEffect(() => {
    if (!isOpen) {
      setFiltro('');
    }
  }, [isOpen]);

  const autoridadesFiltradas = autoridades.filter(aut => {
    const nombre = aut.nombreCompleto?.toLowerCase() || '';
    const corto = aut.nombreCorto?.toLowerCase() || '';
    const search = filtro.toLowerCase();
    return nombre.includes(search) || corto.includes(search);
  }).slice(0, 50);

  const handleSelect = (autoridad: Autoridad) => {
    onSelectAutoridad(autoridad.uid!);
    onClose();
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
                <Building2 size={20} className="text-[#C6A43F]" />
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar Autoridad</h3>
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
                  placeholder="Buscar por nombre o clave..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {autoridadesFiltradas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filtro ? 'No se encontraron autoridades' : 'No hay autoridades registradas'}
                  </div>
                ) : (
                  autoridadesFiltradas.map((autoridad) => (
                    <button
                      key={autoridad.uid}
                      onClick={() => handleSelect(autoridad)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <p className="font-medium text-gray-900 line-clamp-1">{autoridad.nombreCompleto}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Clave: {autoridad.nombreCorto} • {autoridad.fuero} • {autoridad.materia}
                      </p>
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