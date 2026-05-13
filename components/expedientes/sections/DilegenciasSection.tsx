'use client';

import { Gavel, Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import Section from './Section';

const diligenciasPrueba = [
  { 
    id: 1, 
    titulo: 'Audiencia Preliminar', 
    fecha: '20/01/2024', 
    estado: 'Completada',
    descripcion: 'Se llevó a cabo la audiencia preliminar con acuerdo parcial'
  },
  { 
    id: 2, 
    titulo: 'Presentación de Pruebas', 
    fecha: '25/01/2024', 
    estado: 'Pendiente',
    descripcion: 'Presentar documentación probatoria ante el juzgado'
  },
  { 
    id: 3, 
    titulo: 'Alegatos Finales', 
    fecha: '05/02/2024', 
    estado: 'Próxima',
    descripcion: 'Presentación de alegatos finales'
  },
];

const getEstadoColor = (estado: string) => {
  if (estado === 'Completada') return 'text-green-600 bg-green-50';
  if (estado === 'Pendiente') return 'text-yellow-600 bg-yellow-50';
  return 'text-blue-600 bg-blue-50';
};

export default function DiligenciasSection() {
  return (
    <Section title="Diligencias" icon={<Gavel size={22} />}>
      <div className="space-y-3">
        {diligenciasPrueba.map(diligencia => (
          <div key={diligencia.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">{diligencia.fecha}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(diligencia.estado)}`}>
                {diligencia.estado}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{diligencia.titulo}</p>
            <p className="text-xs text-gray-600">{diligencia.descripcion}</p>
          </div>
        ))}
        
        <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#C6A43F] hover:text-[#C6A43F] transition-colors">
          <Plus size={16} />
          Agregar diligencia
        </button>
      </div>
    </Section>
  );
}