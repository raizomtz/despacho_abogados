import { LayoutDashboard } from 'lucide-react';

export default function InicioPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard General</h1>
        <p className="text-gray-600 mt-1">
          Panel de control de GMG Estrategia Jurídica
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <LayoutDashboard size={40} className="text-[#C6A43F]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bienvenido al Sistema
          </h2>
          <p className="text-gray-500">
            Aquí encontrarás un resumen de tu actividad y métricas importantes
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Próximamente: estadísticas, casos recientes y notificaciones
          </p>
        </div>
      </div>
    </div>
  );
}