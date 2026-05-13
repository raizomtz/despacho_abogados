'use client';

import { Users, ChevronRight, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { Cliente } from '@/types/cliente';

interface UltimosClientesProps {
  clientes: Cliente[];
}

export default function UltimosClientes({ clientes }: UltimosClientesProps) {
  const ultimosClientes = [...clientes]
    .sort((a, b) => {
      const dateA = a.fechaRegistro?.toDate?.() || new Date();
      const dateB = b.fechaRegistro?.toDate?.() || new Date();
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-[#C6A43F]" />
          <h3 className="font-semibold text-gray-900">Últimos Clientes</h3>
        </div>
        <Link
          href="/dashboard/clientes"
          className="text-sm text-[#C6A43F] hover:text-[#B3922F] flex items-center gap-1"
        >
          Ver todos
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="p-4 space-y-3">
        {ultimosClientes.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No hay clientes registrados
          </p>
        ) : (
          ultimosClientes.map((cliente) => (
            <div key={cliente.uid} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{cliente.nombre}</p>
                <p className="text-xs text-gray-500">{cliente.codigoUnico}</p>
              </div>
              <div className="flex gap-2">
                {cliente.celWhatsapp && (
                  <a
                    href={`https://wa.me/${cliente.celWhatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-green-600 hover:text-green-800 transition-colors"
                    title="WhatsApp"
                  >
                    <Phone size={16} />
                  </a>
                )}
                {cliente.email && (
                  <a
                    href={`mailto:${cliente.email}`}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Email"
                  >
                    <Mail size={16} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}