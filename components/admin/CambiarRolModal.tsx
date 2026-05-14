'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, User, GraduationCap } from 'lucide-react';
import { RolUsuario } from '@/types/usuario';
import toast from 'react-hot-toast';

interface CambiarRolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nuevoRol: RolUsuario) => Promise<void>;
  usuarioNombre: string;
  rolActual: RolUsuario;
}

const ROLES: { value: RolUsuario; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'admin', 
    label: 'Administrador', 
    icon: <Shield size={20} />,
    description: 'Acceso total al sistema, puede gestionar usuarios y configuraciones'
  },
  { 
    value: 'abogado', 
    label: 'Abogado', 
    icon: <User size={20} />,
    description: 'Acceso a expedientes, clientes, tareas y gastos'
  },
  { 
    value: 'pasante', 
    label: 'Pasante', 
    icon: <GraduationCap size={20} />,
    description: 'Acceso limitado, solo puede ver tareas asignadas y expedientes específicos'
  },
];

export default function CambiarRolModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  usuarioNombre,
  rolActual 
}: CambiarRolModalProps) {
  const [selectedRol, setSelectedRol] = useState<RolUsuario>(rolActual);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedRol === rolActual) {
      //toast.info('El usuario ya tiene ese rol');
      onClose();
      return;
    }
    
    setLoading(true);
    try {
      await onConfirm(selectedRol);
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
                  Cambiar Rol
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Usuario: <span className="font-medium text-gray-900">{usuarioNombre}</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Rol actual: <span className="font-medium">{ROLES.find(r => r.value === rolActual)?.label}</span>
              </p>

              <div className="space-y-3 mb-6">
                {ROLES.map((rol) => (
                  <label
                    key={rol.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedRol === rol.value
                        ? 'border-[#C6A43F] bg-[#C6A43F]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value={rol.value}
                      checked={selectedRol === rol.value}
                      onChange={() => setSelectedRol(rol.value)}
                      className="mt-0.5 text-[#C6A43F] focus:ring-[#C6A43F]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`${selectedRol === rol.value ? 'text-[#C6A43F]' : 'text-gray-500'}`}>
                          {rol.icon}
                        </div>
                        <span className="font-medium text-gray-900">{rol.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{rol.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedRol === rolActual}
                  className="bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Cambiar Rol'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}