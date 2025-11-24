import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppointmentCalendar } from '@/components/common/appointment-calendar';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Clock, 
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ReschedulePageProps {
  appointment: any;
  onNavigate: (page: string, data?: any) => void;
  onRescheduleAppointment: (appointmentId: string, newTurnoId: number) => Promise<boolean>;
}

interface TimeSlot {
  time: string;
  available: boolean;
  id: string;
}

export function ReschedulePage({ 
  appointment, 
  onNavigate, 
  onRescheduleAppointment 
}: ReschedulePageProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; slot: TimeSlot } | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleConfirmed, setRescheduleConfirmed] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState<any>(null);

  if (!appointment) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No se encontró información de la cita</p>
            <Button onClick={() => onNavigate('appointments')}>
              Volver a Mis Citas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSlotSelect = (date: Date, timeSlot: TimeSlot) => {
    setSelectedSlot({ date, slot: timeSlot });
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot) return;

    setIsRescheduling(true);
    
    try {
      // Convertir el ID del slot a número (turnoId)
      const newTurnoId = parseInt(selectedSlot.slot.id);
      
      // Llamar al servicio de reagendamiento
      const success = await onRescheduleAppointment(appointment.id, newTurnoId);
      
      if (success) {
        const newDate = selectedSlot.date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const newTime = selectedSlot.slot.time;

        setNewAppointmentData({
          date: newDate,
          time: newTime
        });

        setRescheduleConfirmed(true);
        
        toast.success('¡Cita reagendada exitosamente!', {
          description: `Tu cita con ${appointment.doctorName} ha sido reagendada para el ${newDate} a las ${newTime}.`,
        });
      } else {
        toast.error('Error al reagendar la cita', {
          description: 'No se pudo reagendar la cita. Por favor, intenta de nuevo.',
        });
      }
    } catch (error) {
      console.error('Error al reagendar cita:', error);
      toast.error('Error al reagendar la cita', {
        description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que deseas cancelar el reagendamiento?')) {
      onNavigate('appointments');
    }
  };

  if (rescheduleConfirmed && newAppointmentData) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <div className="mb-6">
              <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ¡Cita Reagendada!
              </h2>
              <p className="text-muted-foreground">
                Tu cita médica ha sido reagendada exitosamente
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <ImageWithFallback
                  src={appointment.doctorImage}
                  alt={appointment.doctorName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-left">
                  <h3 className="font-semibold">{appointment.doctorName}</h3>
                  <p className="text-muted-foreground">
                    {Array.isArray(appointment.doctorSpecialty) 
                      ? appointment.doctorSpecialty.join(', ') 
                      : appointment.doctorSpecialty}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Previous Date */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-900 mb-2">Fecha anterior:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-red-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="line-through">{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="line-through">{appointment.time}</span>
                    </div>
                  </div>
                </div>

                {/* New Date */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900 mb-2">Nueva fecha:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-green-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{newAppointmentData.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{newAppointmentData.time}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{appointment.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => onNavigate('appointments')}>
                Ver Mis Citas
              </Button>
              <Button variant="outline" onClick={() => onNavigate('home')}>
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('appointments')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Citas
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <RefreshCw className="h-8 w-8" />
            <span>Reagendar Cita Médica</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Selecciona una nueva fecha y horario para tu cita
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <span className="font-medium">Importante:</span> Los cambios de horario deben realizarse con 
            al menos 24 horas de anticipación. Si necesitas cancelar tu cita, por favor hazlo con el 
            tiempo suficiente para que otros pacientes puedan aprovechar el espacio.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Appointment Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Cita Actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Doctor Profile */}
                <div className="text-center">
                  <ImageWithFallback
                    src={appointment.doctorImage}
                    alt={appointment.doctorName}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold">{appointment.doctorName}</h3>
                  <p className="text-muted-foreground">
                    {Array.isArray(appointment.doctorSpecialty) 
                      ? appointment.doctorSpecialty.join(', ') 
                      : appointment.doctorSpecialty}
                  </p>
                  


                  <Badge 
                    variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {appointment.status === 'confirmed' ? 'Confirmada' : 
                     appointment.status === 'pending' ? 'Pendiente' : 'Reagendada'}
                  </Badge>
                </div>

                {/* Current Appointment Details */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium">Detalles de la Cita</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Fecha actual:</p>
                        <p className="text-muted-foreground">{appointment.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Hora actual:</p>
                        <p className="text-muted-foreground">{appointment.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">Ubicación:</p>
                        <p className="text-muted-foreground">{appointment.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tipo de cita:</span>
                    <Badge variant="outline">
                      {appointment.type === 'consultation' ? 'Consulta' :
                       appointment.type === 'follow-up' ? 'Seguimiento' : 'Chequeo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <AppointmentCalendar
                doctorName={appointment.doctorName}
                doctorId={appointment.medicoId}
                onSelectSlot={handleSlotSelect}
                selectedSlot={selectedSlot}
              />

              {/* Reschedule Confirmation */}
              {selectedSlot && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                      <span>Confirmar Reagendamiento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {/* Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Old */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-medium text-red-900 mb-3 flex items-center space-x-2">
                            <X className="h-4 w-4" />
                            <span>Fecha anterior</span>
                          </h4>
                          <div className="space-y-2 text-sm text-red-700">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span className="line-through">{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span className="line-through">{appointment.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* New */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-900 mb-3 flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Nueva fecha</span>
                          </h4>
                          <div className="space-y-2 text-sm text-green-700">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {selectedSlot.date.toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{selectedSlot.slot.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="bg-accent rounded-lg p-4">
                        <h4 className="font-medium mb-3">Información adicional:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Médico:</span>
                            <span className="font-medium">{appointment.doctorName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Especialidad:</span>
                            <span className="font-medium">
                              {Array.isArray(appointment.doctorSpecialty) 
                                ? appointment.doctorSpecialty.join(', ') 
                                : appointment.doctorSpecialty}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ubicación:</span>
                            <span className="font-medium">{appointment.location.split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={handleConfirmReschedule}
                        disabled={isRescheduling}
                        className="flex-1"
                      >
                        {isRescheduling ? (
                          <>

                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Reagendando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Confirmar Reagendamiento
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isRescheduling}
                      >
                        Cancelar
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Al confirmar, se cancelará tu cita anterior y se agendará una nueva. 
                      Recibirás un correo electrónico con la confirmación y los detalles actualizados.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
