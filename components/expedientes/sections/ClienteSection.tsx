'use client';

import { Users, Phone, Mail, MapPin, Building, User, MessageCircle } from 'lucide-react';
import Section from './Section';
import { Cliente } from '@/types/cliente';

interface ClienteSectionProps {
  cliente: Cliente | null;
}

export default function ClienteSection({ cliente }: ClienteSectionProps) {
  if (!cliente) return null;

  return (
    <Section title="Cliente" icon={<Users size={22} />} defaultOpen={true}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Nombre / Empresa</p>
            <p className="text-sm font-medium text-gray-900">{cliente.nombre}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">RFC</p>
            <p className="text-sm text-gray-900">{cliente.rfc || 'No registrado'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Correo Electrónico</p>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              <span className="text-sm text-gray-900">{cliente.email}</span>
              <button className="ml-auto text-[#C6A43F] hover:text-[#B3922F] text-sm">
                Abrir Gmail
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Celular / WhatsApp</p>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-green-500" />
              <span className="text-sm text-gray-900">{cliente.celWhatsapp}</span>
              <button className="ml-auto text-[#C6A43F] hover:text-[#B3922F] text-sm">
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>

        {cliente.telefono && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Teléfono</p>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm text-gray-900">{cliente.telefono}</span>
            </div>
          </div>
        )}

        {cliente.representanteLegal && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Representante Legal</p>
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="text-sm text-gray-900">{cliente.representanteLegal}</span>
            </div>
          </div>
        )}

        {cliente.domicilio && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Domicilio</p>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-sm text-gray-900">{cliente.domicilio}</span>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}