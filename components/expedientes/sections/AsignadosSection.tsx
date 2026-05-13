'use client';

import { Users, UserPlus, UserMinus, Crown } from 'lucide-react';
import Section from './Section';

const asignadosPrueba = [
  { id: 1, nombre: 'Dr. Carlos Méndez', rol: 'Abogado Principal', email: 'carlos@gmg.com' },
  { id: 2, nombre: 'Lic. Ana García', rol: 'Abogado Asociado', email: 'ana@gmg.com' },
  { id: 3, nombre: 'Laura Torres', rol: 'Pasante', email: 'laura@gmg.com' },
];

export default function AsignadosSection() {
  return (
    <Section title="Asignados / Encargados" icon={<Users size={22} />}>
      <div className="space-y-3">
        {asignadosPrueba.map(asignado => (
          <div key={asignado.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                {asignado.rol === 'Abogado Principal' && <Crown size={14} className="text-[#C6A43F]" />}
                <p className="text-sm font-medium text-gray-900">{asignado.nombre}</p>
              </div>
              <p className="text-xs text-gray-500">{asignado.rol} • {asignado.email}</p>
            </div>
            <button className="text-red-600 hover:text-red-800 transition-colors">
              <UserMinus size={16} />
            </button>
          </div>
        ))}
        
        <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#C6A43F] hover:text-[#C6A43F] transition-colors">
          <UserPlus size={16} />
          Agregar encargado
        </button>
      </div>
    </Section>
  );
}