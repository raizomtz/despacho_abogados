'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users } from 'lucide-react';
import { Cliente } from '@/types/cliente';

interface BuscadorClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: Cliente[];
  onSelectCliente: (clienteId: string, clienteNombre: string) => void;
}

export default function BuscadorClienteModal({
  isOpen,
  onClose,
  clientes,
  onSelectCliente
}: BuscadorClienteModalProps) {
  const [filtro, setFiltro] = useState('');

  // Resetear filtro cuando se abre/cierra
  useEffect(() => {
    if (!isOpen) {
      setFiltro('');
    }
  }, [isOpen]);

  const clientesFiltrados = clientes.filter(cliente => {
    const nombre = cliente.nombre?.toLowerCase() || '';
    const codigo = cliente.codigoUnico?.toLowerCase() || '';
    const search = filtro.toLowerCase();
    return nombre.includes(search) || codigo.includes(search);
  }).slice(0, 50);

  const handleSelect = (cliente: Cliente) => {
    onSelectCliente(cliente.uid!, cliente.nombre);
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
                <Users size={20} className="text-[#C6A43F]" />
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar Cliente</h3>
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
                  placeholder="Buscar por nombre o código..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {clientesFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filtro ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                  </div>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <button
                      key={cliente.uid}
                      onClick={() => handleSelect(cliente)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <p className="font-medium text-gray-900">{cliente.nombre}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-mono">{cliente.codigoUnico}</span>
                        {cliente.rfc && (
                          <span className="text-xs text-gray-400">RFC: {cliente.rfc}</span>
                        )}
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