'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, UserCog, Trash2, AlertCircle, CheckCircle, Clock, GraduationCap} from 'lucide-react';
import { obtenerUsuarios, cambiarRolUsuario, desactivarUsuario } from '@/lib/admin';
import { Usuario, RolUsuario } from '@/types/usuario';
import CambiarRolModal from '@/components/admin/CambiarRolModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import UsuarioDetailModal from '@/components/admin/UsuarioDetailModal';

export default function AdminPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [modalRolOpen, setModalRolOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  //const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleCambiarRol = async (nuevoRol: RolUsuario) => {
    if (!usuarioSeleccionado) return;
    
    try {
      await cambiarRolUsuario(usuarioSeleccionado.uid, nuevoRol);
      toast.success(`Rol cambiado a ${nuevoRol}`);
      await cargarUsuarios();
      setUsuarioSeleccionado(null);
    } catch (error) {
      toast.error('Error al cambiar rol');
      console.error(error);
      throw error;
    }
  };

  const handleDesactivarUsuario = async () => {
    if (!usuarioSeleccionado) return;
    
    // No permitir desactivarse a sí mismo
    if (usuarioSeleccionado.uid === user?.uid) {
      toast.error('No puedes desactivar tu propia cuenta');
      setModalEliminarOpen(false);
      setUsuarioSeleccionado(null);
      return;
    }
    
    try {
      await desactivarUsuario(usuarioSeleccionado.uid);
      toast.success('Usuario desactivado');
      await cargarUsuarios();
      setUsuarioSeleccionado(null);
    } catch (error) {
      toast.error('Error al desactivar usuario');
      console.error(error);
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'abogado': return 'bg-blue-100 text-blue-800';
      case 'pasante': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'abogado': return 'Abogado';
      case 'pasante': return 'Pasante';
      default: return rol;
    }
  };

  // Separar usuario actual del resto
  const usuarioActual = usuarios.find(u => u.uid === user?.uid);
  const otrosUsuarios = usuarios.filter(u => u.uid !== user?.uid);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-[#C6A43F]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administración</h1>
              <p className="text-gray-600 mt-1">
                Gestión de usuarios y permisos del despacho
              </p>
            </div>
          </div>
        </div>
      </div>

{/* Resumen rápido */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Total Usuarios</p>
        <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
      </div>
      <Users size={32} className="text-[#C6A43F] opacity-50" />
    </div>
  </div>
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Administradores</p>
        <p className="text-2xl font-bold text-purple-600">
          {usuarios.filter(u => u.rol === 'admin').length}
        </p>
      </div>
      <Shield size={32} className="text-purple-500 opacity-50" />
    </div>
  </div>
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Abogados</p>
        <p className="text-2xl font-bold text-blue-600">
          {usuarios.filter(u => u.rol === 'abogado').length}
        </p>
      </div>
      <UserCog size={32} className="text-blue-500 opacity-50" />
    </div>
  </div>
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Pasantes</p>
        <p className="text-2xl font-bold text-green-600">
          {usuarios.filter(u => u.rol === 'pasante').length}
        </p>
      </div>
      <GraduationCap size={32} className="text-green-500 opacity-50" />
    </div>
  </div>
</div>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Miembros del Equipo</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Usuario actual primero */}
            {usuarioActual && (
              <div className="p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C6A43F] rounded-full flex items-center justify-center text-black font-bold">
                      {usuarioActual.nombre?.charAt(0) || usuarioActual.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{usuarioActual.nombre || 'Sin nombre'}</p>
                        <span className="text-xs text-gray-500">(Tú)</span>
                      </div>
                      <p className="text-sm text-gray-500">{usuarioActual.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRolColor(usuarioActual.rol)}`}>
                      {getRolLabel(usuarioActual.rol)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Otros usuarios */}
            {otrosUsuarios.map((usuario) => (
              <div key={usuario.uid} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                      {usuario.nombre?.charAt(0) || usuario.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{usuario.nombre || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-500">{usuario.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRolColor(usuario.rol)}`}>
                      {getRolLabel(usuario.rol)}
                    </span>
                      <button
                        onClick={() => {
                            setUsuarioSeleccionado(usuario);
                            setDetailModalOpen(true);
                        }}
                        className="text-[#C6A43F] hover:text-[#B3922F] transition-colors text-sm"
                        title="Ver detalles"
                    >
                        Ver Detalle
                    </button>
                    <button
                      onClick={() => {
                        setUsuarioSeleccionado(usuario);
                        setModalRolOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Cambiar rol"
                    >
                      <UserCog size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setUsuarioSeleccionado(usuario);
                        setModalEliminarOpen(true);
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Desactivar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nota sobre permisos */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Nota sobre permisos</p>
            <p className="text-xs text-yellow-700 mt-1">
              Los administradores tienen acceso total al sistema. Los abogados pueden gestionar expedientes, 
              clientes y tareas. Los pasantes tienen acceso limitado a las tareas que se les asignan.
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      {usuarioSeleccionado && (
        <>
        <UsuarioDetailModal
            isOpen={detailModalOpen}
            onClose={() => {
            setDetailModalOpen(false);
            setUsuarioSeleccionado(null);
            }}
            usuario={usuarioSeleccionado}
            />
          <CambiarRolModal
            isOpen={modalRolOpen}
            onClose={() => {
              setModalRolOpen(false);
              setUsuarioSeleccionado(null);
            }}
            onConfirm={handleCambiarRol}
            usuarioNombre={usuarioSeleccionado.nombre || usuarioSeleccionado.email}
            rolActual={usuarioSeleccionado.rol}
          />

          <ConfirmModal
            isOpen={modalEliminarOpen}
            onClose={() => {
              setModalEliminarOpen(false);
              setUsuarioSeleccionado(null);
            }}
            onConfirm={handleDesactivarUsuario}
            title="Desactivar Usuario"
            message={`¿Estás seguro de que deseas desactivar a "${usuarioSeleccionado.nombre || usuarioSeleccionado.email}"? El usuario no podrá acceder al sistema hasta que sea reactivado.`}
            confirmText="Desactivar"
            cancelText="Cancelar"
            type="warning"
          />
        </>
      )}
    </div>
  );
}