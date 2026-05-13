'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, MapPin, Phone, Clock, Navigation, Calendar, User } from 'lucide-react';
import { obtenerAutoridadPorId } from '@/lib/autoridades';
import { Autoridad } from '@/types/autoridad';
import toast from 'react-hot-toast';

export default function AutoridadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [autoridad, setAutoridad] = useState<Autoridad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const id = params.id as string;
      const data = await obtenerAutoridadPorId(id);
      
      if (!data) {
        toast.error('Autoridad no encontrada');
        router.push('/dashboard/autoridades');
        return;
      }
      
      setAutoridad(data);
    } catch (error) {
      console.error('Error al cargar autoridad:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getFueroColor = (fuero: string) => {
    return fuero === 'Federal' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando autoridad...</p>
        </div>
      </div>
    );
  }

  if (!autoridad) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Regresar</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Building2 size={40} className="text-[#C6A43F]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {autoridad.nombreCorto}
              </h1>
              <p className="text-gray-600 mt-1 max-w-2xl">
                {autoridad.nombreCompleto}
              </p>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getFueroColor(autoridad.fuero)}`}>
                  {autoridad.fuero}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {autoridad.materia}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de contacto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone size={20} className="text-[#C6A43F]" />
            Información de Contacto
          </h2>
          <div className="space-y-4">
            {autoridad.telefono && (
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm text-gray-900">{autoridad.telefono}</p>
                </div>
              </div>
            )}
            {autoridad.horario && (
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Horario de Atención</p>
                  <p className="text-sm text-gray-900">{autoridad.horario}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-[#C6A43F]" />
            Ubicación
          </h2>
          <div className="space-y-4">
            {autoridad.direccion && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Dirección</p>
                  <p className="text-sm text-gray-900">{autoridad.direccion}</p>
                </div>
              </div>
            )}
            {autoridad.ubicacionGPS && (
              <div className="flex items-start gap-3">
                <Navigation size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Google Maps</p>
                  <a 
                    href={autoridad.ubicacionGPS} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#C6A43F] hover:text-[#B3922F] transition-colors"
                  >
                    Ver en Google Maps →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadatos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-[#C6A43F]" />
            Información del Registro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Creado por</p>
                <p className="text-sm text-gray-900">{autoridad.creadoPor}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Fecha de Registro</p>
                <p className="text-sm text-gray-900">
                  {autoridad.fechaRegistro?.toDate().toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}