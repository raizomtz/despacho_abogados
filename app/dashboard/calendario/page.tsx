'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon } from 'lucide-react';
import { obtenerTodasTareas, obtenerTareasPorUsuario } from '@/lib/tareas';
import { Tarea } from '@/types/tarea';
import CalendarioView from '@/components/calendar/CalendarioView';
import toast from 'react-hot-toast';

export default function CalendarioPage() {
  const { user } = useAuth();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<'mis-tareas' | 'equipo'>('mis-tareas');

  const cargarTareas = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let tareasData: Tarea[];
      
      if (vista === 'mis-tareas') {
        tareasData = await obtenerTareasPorUsuario(user.uid);
      } else {
        tareasData = await obtenerTodasTareas();
      }
      
      setTareas(tareasData);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  }, [user, vista]);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon size={28} className="text-[#C6A43F]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
            <p className="text-gray-600 mt-1">
              Visualiza tus tareas y vencimientos organizados por fecha
            </p>
          </div>
        </div>
      </div>

      <CalendarioView
        tareas={tareas}
        loading={loading}
        vista={vista}
        onVistaChange={setVista}
      />
    </div>
  );
}