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

export default function TareasRecientes({ tareas }: TareasRecientesProps) {
  const tareasProximas = tareas
    .filter(t => t.estatus !== 'completada')
    .sort((a, b) => {
      const dateA = a.fechaLimite?.toDate?.() || new Date();
      const dateB = b.fechaLimite?.toDate?.() || new Date();
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const getDiasRestantes = (fechaLimite: any) => {
    const hoy = new Date();
    const limite = fechaLimite?.toDate?.() || new Date();
    const diffTime = limite.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
                      {tarea.expedienteNum}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {tarea.titulo}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${diasRestantes <= 2 ? 'text-red-600' : diasRestantes <= 5 ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {diasRestantes <= 0 ? 'Vencida' : `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`}
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