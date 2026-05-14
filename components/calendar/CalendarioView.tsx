'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Tarea } from '@/types/tarea';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarioViewProps {
  tareas: Tarea[];
  loading: boolean;
  vista: 'mis-tareas' | 'equipo';
  onVistaChange: (vista: 'mis-tareas' | 'equipo') => void;
}

export default function CalendarioView({ tareas, loading, vista, onVistaChange }: CalendarioViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  // Calcular días de la semana actual
  useEffect(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Lunes
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });
      setWeekDays(days);
    }
  }, [selectedDate, viewMode]);

  // Contar tareas por día
  const getTareasCount = (date: Date) => {
    return tareas.filter(tarea => {
      if (!tarea.fechaLimite) return false;
      const fechaLimite = tarea.fechaLimite.toDate();
      return isSameDay(fechaLimite, date);
    }).length;
  };

  // Obtener tareas del día seleccionado
  const getTareasPorDia = (date: Date) => {
    return tareas.filter(tarea => {
      if (!tarea.fechaLimite) return false;
      const fechaLimite = tarea.fechaLimite.toDate();
      return isSameDay(fechaLimite, date);
    }).sort((a, b) => {
      const dateA = a.fechaLimite.toDate();
      const dateB = b.fechaLimite.toDate();
      return dateA.getTime() - dateB.getTime();
    });
  };

  const tareasDelDia = getTareasPorDia(selectedDate);

  // Personalizar contenido del tile del calendario
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const count = getTareasCount(date);
      if (count > 0) {
        return (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-1">
            <div className="w-5 h-5 bg-[#C6A43F] rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-black">{count > 9 ? '9+' : count}</span>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Navegación entre semanas
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return <AlertCircle size={14} className="text-red-500" />;
      case 'media': return <Clock size={14} className="text-yellow-500" />;
      default: return <CheckCircle size={14} className="text-green-500" />;
    }
  };

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en-progreso': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'atrasada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estatus: string) => {
    switch (estatus) {
      case 'pendiente': return 'Pendiente';
      case 'en-progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      case 'atrasada': return 'Atrasada';
      default: return estatus;
    }
  };

  // Estilos personalizados para el calendario
  const calendarStyles = `
    .react-calendar {
      border: none;
      border-radius: 12px;
      font-family: inherit;
      width: 100%;
      background: transparent;
    }
    .react-calendar__navigation {
      margin-bottom: 1rem;
    }
    .react-calendar__navigation button {
      color: #1a1a1a;
      font-weight: 500;
      font-size: 1rem;
    }
    .react-calendar__navigation button:enabled:hover,
    .react-calendar__navigation button:enabled:focus {
      background-color: #f3f4f6;
      border-radius: 8px;
    }
    .react-calendar__month-view__weekdays {
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.75rem;
    }
    .react-calendar__month-view__weekdays__weekday {
      padding: 0.5rem;
    }
    .react-calendar__tile {
      padding: 1rem 0.5rem;
      position: relative;
      font-size: 0.875rem;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .react-calendar__tile:enabled:hover,
    .react-calendar__tile:enabled:focus {
      background-color: #f3f4f6;
    }
    .react-calendar__tile--now {
      background-color: #fef3c7;
    }
    .react-calendar__tile--now:enabled:hover,
    .react-calendar__tile--now:enabled:focus {
      background-color: #fde68a;
    }
    .react-calendar__tile--active {
      background-color: #C6A43F !important;
      color: black !important;
    }
    .react-calendar__tile--active:enabled:hover,
    .react-calendar__tile--active:enabled:focus {
      background-color: #B3922F !important;
    }
    .react-calendar__tile--hasActive {
      background-color: #C6A43F;
    }
    .react-calendar__tile abbr {
      position: relative;
      z-index: 1;
    }
  `;

  return (
    <>
      <style jsx global>{calendarStyles}</style>
      
      <div className="space-y-6">
        {/* Header con controles */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onVistaChange('mis-tareas')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  vista === 'mis-tareas'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mis Tareas
              </button>
              <button
                onClick={() => onVistaChange('equipo')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  vista === 'equipo'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tareas del Equipo
              </button>
            </div>
          </div>
        </div>

        {/* Vista Semanal */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(selectedDate, "MMMM yyyy", { locale: es })}
                </h3>
                <button
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <button
                onClick={goToToday}
                className="text-sm text-[#C6A43F] hover:text-[#B3922F] px-3 py-1 rounded-lg transition-colors"
              >
                Hoy
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const tareasCount = getTareasCount(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`p-3 text-center rounded-lg transition-all ${
                      isSelected
                        ? 'bg-[#C6A43F] text-black'
                        : isToday
                        ? 'bg-yellow-50 hover:bg-yellow-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className={`text-sm font-medium ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                      {format(day, 'EEEE', { locale: es }).substring(0, 3)}
                    </p>
                    <p className={`text-xl font-bold mt-1 ${isSelected ? 'text-black' : 'text-gray-900'}`}>
                      {format(day, 'd')}
                    </p>
                    {tareasCount > 0 && (
                      <div className={`mt-1 text-xs font-semibold ${isSelected ? 'text-black' : 'text-[#C6A43F]'}`}>
                        {tareasCount} tarea{tareasCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Vista Mensual */}
        {viewMode === 'month' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <Calendar
              onChange={(value: Value) => {
                if (value instanceof Date) {
                  setSelectedDate(value);
                }
              }}
              value={selectedDate}
              locale="es"
              tileContent={tileContent}
              className="w-full"
              prevLabel={<ChevronLeft size={20} />}
              nextLabel={<ChevronRight size={20} />}
            />
          </div>
        )}

        {/* Lista de tareas del día seleccionado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <CalendarIcon size={20} className="text-[#C6A43F]" />
              <h3 className="font-semibold text-gray-900">
                Tareas para {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </h3>
            </div>
            <span className="text-sm text-gray-500">
              {tareasDelDia.length} tarea{tareasDelDia.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Cargando tareas...</p>
              </div>
            ) : tareasDelDia.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={40} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay tareas para este día</p>
                <p className="text-sm text-gray-400 mt-1">¡Disfruta el día!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tareasDelDia.map((tarea) => (
                  <div
                    key={tarea.uid}
                    className="flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          {getPriorityIcon(tarea.prioridad)}
                          <span className="text-xs font-medium">
                            {tarea.prioridad === 'alta' ? 'Alta' : tarea.prioridad === 'media' ? 'Media' : 'Baja'}
                          </span>
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(tarea.estatus)}`}>
                          {getStatusLabel(tarea.estatus)}
                        </span>
                        <span className="text-xs text-gray-400">{tarea.expedienteNum}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{tarea.titulo}</p>
                      {tarea.descripcion && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{tarea.descripcion}</p>
                      )}
                      {vista === 'equipo' && tarea.asignadoANombre && (
                        <p className="text-xs text-gray-400 mt-1">
                          Asignado: {tarea.asignadoANombre}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-500">
                        {tarea.fechaLimite.toDate().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}