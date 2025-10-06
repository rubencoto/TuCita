import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
  id: string;
}

interface DaySchedule {
  date: Date;
  slots: TimeSlot[];
}

interface AppointmentCalendarProps {
  doctorName: string;
  onSelectSlot: (date: Date, timeSlot: TimeSlot) => void;
  selectedSlot?: { date: Date; slot: TimeSlot } | null;
}

export function AppointmentCalendar({ 
  doctorName, 
  onSelectSlot, 
  selectedSlot 
}: AppointmentCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Generar fechas para las próximas 4 semanas
  const generateWeekDays = (weekOffset: number): DaySchedule[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (weekOffset * 7));
    
    const days: DaySchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() === 0) continue;
      
      // Generate time slots
      const slots: TimeSlot[] = [];
      const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
      const afternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
      
      [...morningSlots, ...afternoonSlots].forEach((time, index) => {
        // Randomly make some slots unavailable for demo
        const available = Math.random() > 0.3;
        slots.push({
          time,
          available,
          id: `${date.toISOString()}-${time}`,
        });
      });
      
      days.push({ date, slots });
    }
    
    return days;
  };

  const weekDays = generateWeekDays(currentWeek);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Horarios Disponibles - Dr. {doctorName}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevWeek}
              disabled={currentWeek === 0}
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
              disabled={currentWeek === 3}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weekDays.map((day) => (
            <div key={day.date.toISOString()} className="space-y-3">
              {/* Header del día */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-full p-2 rounded-lg ${
                  isToday(day.date) 
                    ? 'bg-primary text-primary-foreground' 
                    : isPast(day.date)
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  <span className="font-medium">
                    {formatDate(day.date)}
                  </span>
                  {isToday(day.date) && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Hoy
                    </Badge>
                  )}
                </div>
              </div>

              {/* Time slots */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {day.slots.map((slot) => {
                  const isSelected = selectedSlot?.date.toDateString() === day.date.toDateString() 
                    && selectedSlot?.slot.id === slot.id;
                  const isDisabled = !slot.available || isPast(day.date);
                  
                  return (
                    <Button
                      key={slot.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`w-full justify-center ${
                        isDisabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:scale-105 transition-transform'
                      }`}
                      disabled={isDisabled}
                      onClick={() => onSelectSlot(day.date, slot)}
                    >
                      {slot.time}
                    </Button>
                  );
                })}
                
                {day.slots.filter(slot => slot.available).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay horarios disponibles
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedSlot && (
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