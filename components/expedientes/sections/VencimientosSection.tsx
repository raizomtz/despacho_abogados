'use client';

import { AlertTriangle, Plus, Clock } from 'lucide-react';
import Section from './Section';

const vencimientosPrueba = [
  { id: 1, titulo: 'Entrega de pruebas', fecha: '25/01/2024', diasRestantes: 5, prioridad: 'alta' },
  { id: 2, titulo: 'Pago de costas', fecha: '30/01/2024', diasRestantes: 10, prioridad: 'media' },
  { id: 3, titulo: 'Firma de convenio', fecha: '15/02/2024', diasRestantes: 26, prioridad: 'baja' },
];

const getPrioridadColor = (prioridad: string) => {
  if (prioridad === 'alta') return 'text-red-600 bg-red-50';
  if (prioridad === 'media') return 'text-yellow-600 bg-yellow-50';
  return 'text-blue-600 bg-blue-50';
};

export default function VencimientosSection() {
  return (
    <Section title="Vencimientos" icon={<AlertTriangle size={22} />}>
      <div className="space-y-3">
        {vencimientosPrueba.map(vencimiento => (
          <div key={vencimiento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{vencimiento.titulo}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">Vence: {vencimiento.fecha}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadColor(vencimiento.prioridad)}`}>
                {vencimiento.diasRestantes} días
              </span>
            </div>
          </div>
        ))}
        
        <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#C6A43F] hover:text-[#C6A43F] transition-colors">
          <Plus size={16} />
          Agregar vencimiento
        </button>
      </div>
    </Section>
  );
}