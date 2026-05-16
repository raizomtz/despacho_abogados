'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, UserCheck, Star, Shield, User, GraduationCap, Info } from 'lucide-react';
import { Usuario } from '@/types/usuario';

interface BuscadorUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarios: Usuario[];
  usuariosAsignadosExpediente?: string[];
  onSelectUsuario: (usuarioId: string) => void;
}

export default function BuscadorUsuarioModal({
  isOpen,
  onClose,
  usuarios,
  usuariosAsignadosExpediente = [],
  onSelectUsuario
}: BuscadorUsuarioModalProps) {
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFiltro('');
    }
  }, [isOpen]);

  const usuariosOrdenados = [...usuarios].sort((a, b) => {
    const aAsignado = usuariosAsignadosExpediente.includes(a.uid);
    const bAsignado = usuariosAsignadosExpediente.includes(b.uid);
    
    if (aAsignado && !bAsignado) return -1;
    if (!aAsignado && bAsignado) return 1;
    
    const roles = { admin: 1, abogado: 2, pasante: 3 };
    return (roles[a.rol as keyof typeof roles] || 4) - (roles[b.rol as keyof typeof roles] || 4);
  });

  const usuariosFiltrados = usuariosOrdenados.filter(user => {
    const nombre = user.nombre?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const search = filtro.toLowerCase();
    return nombre.includes(search) || email.includes(search);
  }).slice(0, 50);

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'admin': return <Shield size={14} className="text-purple-500" />;
      case 'abogado': return <User size={14} className="text-blue-500" />;
      default: return <GraduationCap size={14} className="text-green-500" />;
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'abogado': return 'Abogado';
      default: return 'Pasante';
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'abogado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
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
                <Users size={20} className="text-[#C6A43F]" />
                <h3 className="text-lg font-semibold text-gray-900">Asignar a...</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {/* Información sobre asignados al expediente - con estilo dorado */}
              {usuariosAsignadosExpediente.length > 0 && (
                <div className="mb-4 p-3 bg-[#C6A43F]/5 rounded-lg border border-[#C6A43F]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={16} className="text-[#C6A43F]" />
                    <span className="text-sm font-medium text-gray-700">Usuarios asignados a este expediente</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {usuariosAsignadosExpediente.map(uid => {
                      const user = usuarios.find(u => u.uid === uid);
                      if (!user) return null;
                      return (
                        <span key={uid} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#C6A43F]/10 text-[#8B6914] border border-[#C6A43F]/20">
                          <UserCheck size={12} className="text-[#C6A43F]" />
                          {user.nombre || user.email}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C6A43F] focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {usuariosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filtro ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                  </div>
                ) : (
                  usuariosFiltrados.map((user) => {
                    const isAsignado = usuariosAsignadosExpediente.includes(user.uid);
                    return (
                      <button
                        key={user.uid}
                        onClick={() => {
                          onSelectUsuario(user.uid);
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors border ${
                          isAsignado 
                            ? 'bg-[#C6A43F]/5 border-[#C6A43F]/30 hover:bg-[#C6A43F]/10' 
                            : 'bg-white border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRolIcon(user.rol)}
                            <p className="font-medium text-gray-900">
                              {user.nombre || user.email}
                            </p>
                          </div>
                          {isAsignado && (
                            <span className="flex items-center gap-1 text-xs text-[#8B6914] bg-[#C6A43F]/10 px-2 py-0.5 rounded-full">
                              <UserCheck size={12} className="text-[#C6A43F]" />
                              Asignado al expediente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getRolColor(user.rol)}`}>
                            {getRolLabel(user.rol)}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}