'use client';

import { DollarSign, Clock, Plus, TrendingUp } from 'lucide-react';
import Section from './Section';

export default function GastosHorasSection() {
  return (
    <>
      <Section title="Gastos" icon={<DollarSign size={22} />}>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Gastos de copias y certificaciones</p>
              <p className="text-xs text-gray-500">15/01/2024</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">$850.00</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Honorarios peritos</p>
              <p className="text-xs text-gray-500">10/01/2024</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">$5,000.00</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Gastos de notificación</p>
              <p className="text-xs text-gray-500">05/01/2024</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">$320.00</p>
          </div>
          
          <div className="border-t border-gray-200 pt-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-[#C6A43F]">$6,170.00</span>
            </div>
          </div>
          
          <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#C6A43F] hover:text-[#C6A43F] transition-colors">
            <Plus size={16} />
            Agregar gasto
          </button>
        </div>
      </Section>

      <Section title="Horas" icon={<Clock size={22} />}>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Revisión de expediente</p>
              <p className="text-xs text-gray-500">Dr. Carlos Méndez - 15/01/2024</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">3.5 hrs</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Audiencia preliminar</p>
              <p className="text-xs text-gray-500">Dr. Carlos Méndez - 20/01/2024</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">2.0 hrs</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Elaboración de alegatos</p>
              <p className="text-xs text-gray-500">Lic. Ana García - 22/01/2024</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">4.0 hrs</p>
          </div>
          
          <div className="border-t border-gray-200 pt-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Total horas</span>
              <span className="text-lg font-bold text-[#C6A43F]">9.5 hrs</span>
            </div>
          </div>
          
          <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#C6A43F] hover:text-[#C6A43F] transition-colors">
            <Plus size={16} />
            Registrar horas
          </button>
        </div>
      </Section>
    </>
  );
}