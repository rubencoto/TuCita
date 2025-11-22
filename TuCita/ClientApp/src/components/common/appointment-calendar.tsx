import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import doctorsService, { AgendaTurno } from '@/services/doctorsService';

interface AppointmentCalendarProps {
  doctorId: number;
  doctorName: string;
  onSelectSlot: (date: Date, timeSlot: AgendaTurno) => void;
  selectedSlot?: { date: Date; slot: AgendaTurno } | null;
}

export function AppointmentCalendar({ 
  doctorId,
  doctorName, 
  onSelectSlot, 
  selectedSlot 
}: AppointmentCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [loading, setLoading] = useState(false);
  const [weekSlots, setWeekSlots] = useState<Record<string, AgendaTurno[]>>({});

  // Generar fechas para la semana actual
  const generateWeekDays = (weekOffset: number): Date[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (weekOffset * 7));
    
    const days: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() !== 0) {
        days.push(date);
      }
    }
    
    return days;
  };

  const weekDays = generateWeekDays(currentWeek);

  // Cargar turnos disponibles cuando cambia la semana o el doctor
  useEffect(() => {
    const loadWeekSlots = async () => {
      if (!doctorId) return;
      
      setLoading(true);
      try {
        const days = generateWeekDays(currentWeek);
        const startDate = days[0];
        const endDate = days[days.length - 1];
        const slots = await doctorsService.getAvailableSlotsRange(doctorId, startDate, endDate);
        setWeekSlots(slots);
      } catch (error) {
        console.error('Error al cargar los turnos:', error);
        setWeekSlots({});
      } finally {
        setLoading(false);
      }
    };

    loadWeekSlots();
  }, [doctorId, currentWeek]); // Solo depende de doctorId y currentWeek

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const nextWeek = () => setCurrentWeek(prev => Math.min(prev + 1, 3));
  const prevWeek = () => setCurrentWeek(prev => Math.max(prev - 1, 0));

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Horarios Disponibles - {doctorName}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevWeek}
              disabled={currentWeek === 0 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Semana {currentWeek + 1}/4
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextWeek}
              disabled={currentWeek === 3 || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Cargando horarios...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weekDays.map((day) => {
              const dateKey = getDateKey(day);
              const daySlots = weekSlots[dateKey] || [];
              const isDisabledDay = isPast(day);

              return (
                <div key={dateKey} className="space-y-3">
                  {/* Header del día */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-full p-2 rounded-lg ${
                      isToday(day) 
                        ? 'bg-primary text-primary-foreground' 
                        : isDisabledDay
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      <span className="font-medium">
                        {formatDate(day)}
                      </span>
                      {isToday(day) && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Hoy
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {daySlots.length > 0 ? (
                      daySlots.map((slot) => {
                        const isSelected = selectedSlot?.date.toDateString() === day.toDateString() 
                          && selectedSlot?.slot.id === slot.id;
                        
                        return (
                          <Button
                            key={slot.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={`w-full justify-center ${
                              isDisabledDay
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:scale-105 transition-transform'
                            }`}
                            disabled={isDisabledDay}
                            onClick={() => onSelectSlot(day, slot)}
                          >
                            {slot.time}
                          </Button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {isDisabledDay ? 'Fecha pasada' : 'No hay horarios disponibles'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedSlot && !loading && (
          <div className="mt-6 p-4 bg-accent rounded-lg">
            <p className="text-sm text-accent-foreground">
              <span className="font-medium">Horario seleccionado:</span>{' '}
              {formatDate(selectedSlot.date)} a las {selectedSlot.slot.time}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}