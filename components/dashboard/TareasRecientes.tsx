'use client';

import { Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Tarea } from '@/types/tarea';

interface TareasRecientesProps {
  tareas: Tarea[];
}

const getPriorityColor = (prioridad: string) => {
  switch (prioridad) {
    case 'alta': return 'text-red-600 bg-red-50 border-red-200';
    case 'media': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'baja': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getPriorityIcon = (prioridad: string) => {
  switch (prioridad) {
    case 'alta': return '🔴';
    case 'media': return '🟡';
    case 'baja': return '🟢';
    default: return '⚪';
  }
};

// Función para obtener días restantes (siempre retorna número)
const getDiasRestantes = (fechaLimite: any): number => {
  if (!fechaLimite) return Infinity;
  
  try {
    const hoy = new Date();
    // Si es Timestamp de Firebase
    const limite = fechaLimite.toDate ? fechaLimite.toDate() : new Date(fechaLimite);
    const diffTime = limite.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return Infinity;
  }
};

// Función para obtener texto de días restantes
const getDiasRestantesTexto = (dias: number): string => {
  if (dias === Infinity) return 'Sin fecha';
  if (dias < 0) return 'Vencida';
  if (dias === 0) return 'Hoy';
  return `${dias} día${dias !== 1 ? 's' : ''}`;
};

// Función para obtener color según días restantes
const getDiasColor = (dias: number): string => {
  if (dias === Infinity) return 'text-gray-500';
  if (dias < 0) return 'text-red-600';
  if (dias === 0) return 'text-orange-600';
  if (dias <= 2) return 'text-red-600';
  if (dias <= 5) return 'text-yellow-600';
  return 'text-gray-500';
};

export default function TareasRecientes({ tareas }: TareasRecientesProps) {
  // Asegurar que tareas es un array
  const tareasArray = Array.isArray(tareas) ? tareas : [];
  
  const tareasProximas = tareasArray
    .filter(t => t.estatus !== 'completada')
    .sort((a, b) => {
      const dateA = a.fechaLimite?.toDate?.() || new Date();
      const dateB = b.fechaLimite?.toDate?.() || new Date();
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-[#C6A43F]" />
          <h3 className="font-semibold text-gray-900">Tareas Próximas</h3>
        </div>
        <Link
          href="/dashboard/tareas"
          className="text-sm text-[#C6A43F] hover:text-[#B3922F] flex items-center gap-1"
        >
          Ver todas
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="p-4 space-y-3">
        {tareasProximas.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No hay tareas pendientes
          </p>
        ) : (
          tareasProximas.map((tarea) => {
            const diasRestantes = getDiasRestantes(tarea.fechaLimite);
            const color = getDiasColor(diasRestantes);
            const texto = getDiasRestantesTexto(diasRestantes);
            
            return (
              <div
                key={tarea.uid}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{getPriorityIcon(tarea.prioridad)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(tarea.prioridad)}`}>
                      {tarea.prioridad === 'alta' ? 'Alta' : tarea.prioridad === 'media' ? 'Media' : 'Baja'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {tarea.expedienteNum || 'Sin expediente'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {tarea.titulo}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${color}`}>
                    {texto}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}