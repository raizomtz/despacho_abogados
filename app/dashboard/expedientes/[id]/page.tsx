'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { obtenerExpedientePorId } from '@/lib/expedientes';
import { obtenerClientePorId } from '@/lib/clientes';
import { Expediente } from '@/types/expediente';
import { Cliente } from '@/types/cliente';
import toast from 'react-hot-toast';

import ExpedientePdfSection from '@/components/expedientes/sections/ExpedientePdfSection';
import DocumentosSection from '@/components/expedientes/sections/DocumentosSection';
import ClienteSection from '@/components/expedientes/sections/ClienteSection';
import AsignadosSection from '@/components/expedientes/sections/AsignadosSection';
import DiligenciasSection from '@/components/expedientes/sections/DilegenciasSection';
import VencimientosSection from '@/components/expedientes/sections/VencimientosSection';
import GastosHorasSection from '@/components/expedientes/sections/GastosHorasSection';

export default function ExpedienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const id = params.id as string;
      const expData = await obtenerExpedientePorId(id);
      
      if (!expData) {
        toast.error('Expediente no encontrado');
        router.push('/dashboard/expedientes');
        return;
      }
      
      setExpediente(expData);
      
      // Cargar datos del cliente
      const clienteData = await obtenerClientePorId(expData.clienteId);
      setCliente(clienteData);
      
    } catch (error) {
      console.error('Error al cargar expediente:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (!expediente) {
    return null;
  }

  // Obtener color según estatus
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Concluido': return 'bg-gray-100 text-gray-800';
      case 'Suspendido': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Regresar</span>
          </button>
          <div className="flex items-center gap-3">
            <FolderOpen size={32} className="text-[#C6A43F]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expediente {expediente.numExpediente}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-600">{expediente.clienteNombre}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(expediente.estatus)}`}>
                  {expediente.estatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de secciones */}
      <div className="space-y-4">
        <ExpedientePdfSection />
        <DocumentosSection />
        <ClienteSection cliente={cliente} />
        <AsignadosSection />
        <DiligenciasSection />
        <VencimientosSection />
        <GastosHorasSection />
      </div>
    </div>
  );
}