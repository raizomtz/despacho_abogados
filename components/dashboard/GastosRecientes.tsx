'use client';

import { DollarSign, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Gasto } from '@/types/gasto';

interface GastosRecientesProps {
  gastos: Gasto[];
}

export default function GastosRecientes({ gastos }: GastosRecientesProps) {
  const gastosRecientes = [...gastos]
    .sort((a, b) => {
      const dateA = a.fecha?.toDate?.() || new Date();
      const dateB = b.fecha?.toDate?.() || new Date();
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const totalUltimos30Dias = gastos
    .filter(g => {
      const fecha = g.fecha?.toDate?.() || new Date();
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      return fecha >= hace30Dias;
    })
    .reduce((sum, g) => sum + g.total, 0);

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'pendiente': return 'text-yellow-600 bg-yellow-50';
      case 'reembolsado': return 'text-green-600 bg-green-50';
      case 'por-facturar': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (estatus: string) => {
    switch (estatus) {
      case 'pendiente': return 'Pendiente';
      case 'reembolsado': return 'Reembolsado';
      case 'por-facturar': return 'Por Facturar';
      default: return estatus;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-[#C6A43F]" />
          <h3 className="font-semibold text-gray-900">Gastos Recientes</h3>
        </div>
        <Link
          href="/dashboard/gastos"
          className="text-sm text-[#C6A43F] hover:text-[#B3922F] flex items-center gap-1"
        >
          Ver todos
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {gastosRecientes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No hay gastos registrados
            </p>
          ) : (
            gastosRecientes.map((gasto) => (
              <div key={gasto.uid} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">
                      {gasto.concepto}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{gasto.expedienteNum}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(gasto.estatusPago)}`}>
                      {getStatusLabel(gasto.estatusPago)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${gasto.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">
                    {gasto.fecha?.toDate().toLocaleDateString('es-MX')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {gastosRecientes.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total últimos 30 días</span>
              <span className="text-lg font-bold text-[#C6A43F]">${totalUltimos30Dias.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}