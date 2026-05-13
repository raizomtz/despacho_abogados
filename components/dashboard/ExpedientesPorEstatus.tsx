'use client';

import { FolderOpen } from 'lucide-react';
import { Expediente } from '@/types/expediente';

interface ExpedientesPorEstatusProps {
  expedientes: Expediente[];
}

export default function ExpedientesPorEstatus({ expedientes }: ExpedientesPorEstatusProps) {
  const estatusCount = {
    Activo: expedientes.filter(e => e.estatus === 'Activo').length,
    Concluido: expedientes.filter(e => e.estatus === 'Concluido').length,
    Suspendido: expedientes.filter(e => e.estatus === 'Suspendido').length,
  };

  const total = expedientes.length;
  const getPercentage = (count: number) => total > 0 ? (count / total) * 100 : 0;

  const estatusConfig = {
    Activo: { color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    Concluido: { color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
    Suspendido: { color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <FolderOpen size={20} className="text-[#C6A43F]" />
        <h3 className="font-semibold text-gray-900">Expedientes por Estatus</h3>
      </div>
      <div className="p-4 space-y-4">
        {Object.entries(estatusCount).map(([estatus, count]) => {
          const percentage = getPercentage(count);
          const config = estatusConfig[estatus as keyof typeof estatusConfig];
          return (
            <div key={estatus}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{estatus}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${config.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="border-t border-gray-100 pt-3 mt-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Total Expedientes</span>
            <span className="font-bold text-gray-900">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}