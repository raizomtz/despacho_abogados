'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  CheckSquare, 
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { obtenerExpedientes, obtenerExpedientesPorUsuario } from '@/lib/expedientes';
import { obtenerClientes } from '@/lib/clientes';
import { obtenerTodasTareas, obtenerTareasPorUsuario } from '@/lib/tareas';
import { obtenerGastos } from '@/lib/gastos';
import { obtenerUsuarios } from '@/lib/admin';
import { Expediente } from '@/types/expediente';
import { Cliente } from '@/types/cliente';
import { Tarea } from '@/types/tarea';
import { Gasto } from '@/types/gasto';
import KPICard from '@/components/dashboard/KPICard';
import TareasRecientes from '@/components/dashboard/TareasRecientes';
import ExpedientesPorEstatus from '@/components/dashboard/ExpedientesPorEstatus';
import GastosRecientes from '@/components/dashboard/GastosRecientes';
import UltimosClientes from '@/components/dashboard/UltimosClientes';
import toast from 'react-hot-toast';

export default function InicioPage() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener rol del usuario
  const obtenerRolUsuario = useCallback(async () => {
    if (!user) return null;
    
    try {
      const usuarios = await obtenerUsuarios();
      const currentUser = usuarios.find(u => u.uid === user.uid);
      const rol = currentUser?.rol || 'pasante';
      setUserRole(rol);
      return rol;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      return 'pasante';
    }
  }, [user]);

  const cargarDatos = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const rol = await obtenerRolUsuario();
      
      // Cargar expedientes según el rol
      let expedientesData: Expediente[] = [];
      if (rol === 'admin' || rol === 'abogado') {
        expedientesData = await obtenerExpedientes();
      } else {
        // Pasante: solo expedientes donde está asignado
        expedientesData = await obtenerExpedientesPorUsuario(user.uid);
      }
      setExpedientes(expedientesData);
      
      // Cargar tareas según el rol
      let tareasData: Tarea[] = [];
      if (rol === 'admin' || rol === 'abogado') {
        tareasData = await obtenerTodasTareas();
      } else {
        // Pasante: solo sus tareas
        tareasData = await obtenerTareasPorUsuario(user.uid);
      }
      setTareas(tareasData);
      
      // Cargar clientes (solo admin y abogado pueden ver todos los clientes)
      if (rol === 'admin' || rol === 'abogado') {
        const clientesData = await obtenerClientes();
        setClientes(clientesData);
      } else {
        // Pasante: solo ve los clientes relacionados con sus expedientes
        const clientesIds = new Set(expedientesData.map(exp => exp.clienteId));
        // Podríamos cargar solo esos clientes, pero por simplicidad dejamos vacío
        setClientes([]);
      }
      
      // Cargar gastos (solo admin y abogado pueden ver todos los gastos)
      if (rol === 'admin' || rol === 'abogado') {
        const gastosData = await obtenerGastos();
        setGastos(gastosData);
      } else {
        setGastos([]);
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [user, obtenerRolUsuario]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Calcular KPIs según los datos disponibles
  const expedientesActivos = expedientes.filter(e => e.estatus === 'Activo').length;
  const tareasPendientes = tareas.filter(t => t.estatus !== 'completada').length;
  
  const gastosMes = gastos.filter(g => {
    const fecha = g.fecha?.toDate?.() || new Date();
    const ahora = new Date();
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
  }).reduce((sum, g) => sum + g.total, 0);

  // Determinar si el usuario es admin o abogado (puede ver todo)
  const tieneAccesoTotal = userRole === 'admin' || userRole === 'abogado';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido de vuelta, {user?.email?.split('@')[0] || 'Usuario'}
          {userRole === 'pasante' && ' (Pasante)'}
        </p>
      </div>

      {/* KPIs principales - ajustados según el rol */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Expedientes Activos"
          value={expedientesActivos}
          icon={<FolderOpen size={24} />}
          color="#10B981"
        />
        <KPICard
          title="Clientes Totales"
          value={tieneAccesoTotal ? clientes.length : '—'}
          icon={<Users size={24} />}
          color="#3B82F6"
        />
        <KPICard
          title="Tareas Pendientes"
          value={tareasPendientes}
          icon={<CheckSquare size={24} />}
          color="#F59E0B"
        />
        <KPICard
          title="Gastos del Mes"
          value={tieneAccesoTotal ? `$${gastosMes.toFixed(2)}` : '—'}
          icon={<DollarSign size={24} />}
          color="#C6A43F"
        />
      </div>

      {/* Segunda fila - Tareas y Expedientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TareasRecientes tareas={tareas} />
        <ExpedientesPorEstatus expedientes={expedientes} />
      </div>

      {/* Tercera fila - Gastos y Clientes (solo para admin/abogado) */}
      {tieneAccesoTotal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GastosRecientes gastos={gastos} />
          <UltimosClientes clientes={clientes} />
        </div>
      )}

      {/* Resumen rápido - ajustado para pasante */}
      <div className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={24} className="text-[#C6A43F]" />
          <h3 className="text-lg font-semibold">Resumen General</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Total Expedientes</p>
            <p className="text-2xl font-bold">{expedientes.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Expedientes Activos</p>
            <p className="text-2xl font-bold text-green-400">{expedientesActivos}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Tareas Completadas</p>
            <p className="text-2xl font-bold text-green-400">{tareas.length - tareasPendientes}</p>
          </div>
          {tieneAccesoTotal && (
            <>
              <div>
                <p className="text-gray-400 text-sm">Total Clientes</p>
                <p className="text-2xl font-bold">{clientes.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Gasto Promedio</p>
                <p className="text-2xl font-bold text-[#C6A43F]">
                  ${gastos.length > 0 ? (gastos.reduce((s, g) => s + g.total, 0) / gastos.length).toFixed(2) : '0'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Mensaje informativo para pasantes */}
      {userRole === 'pasante' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            📋 Como pasante, solo puedes ver los expedientes y tareas en los que estás asignado. 
            Los datos de clientes y gastos no están disponibles para tu perfil.
          </p>
        </div>
      )}
    </div>
  );
}