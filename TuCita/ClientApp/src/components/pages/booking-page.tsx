import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AppointmentCalendar } from '../appointment-calendar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Clock, 
  Calendar,
  CheckCircle,
  Phone,
  Mail,
  Heart
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AgendaTurno } from '@/services/doctorsService';

interface BookingPageProps {
  doctor: any;
  onNavigate: (page: string) => void;
  onBookAppointment: (appointment: any) => void;
}

export function BookingPage({ doctor, onNavigate, onBookAppointment }: BookingPageProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; slot: AgendaTurno } | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No se encontró información del médico</p>
            <Button onClick={() => onNavigate('search')}>
              Volver a la búsqueda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSlotSelect = (date: Date, timeSlot: AgendaTurno) => {
    setSelectedSlot({ date, slot: timeSlot });
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    
    // Simular proceso de booking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newAppointment = {
      id: Date.now().toString(),
      doctorName: doctor.nombre,
      doctorSpecialty: doctor.especialidades?.[0] || 'Especialidad General',
      doctorImage: doctor.imageUrl,
      date: selectedSlot.date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: selectedSlot.slot.time,
      location: doctor.sedes?.[0]?.location || doctor.direccion || 'Ubicación no especificada',
      status: 'confirmed' as const,
      type: 'consultation' as const,
    };

    onBookAppointment(newAppointment);
    setBookingConfirmed(true);
    setIsBooking(false);
    
    toast.success('¡Cita confirmada exitosamente!', {
      description: `Tu cita con ${doctor.nombre} ha sido agendada para el ${newAppointment.date} a las ${newAppointment.time}.`,
    });
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <div className="mb-6">
              <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ¡Cita Confirmada!
              </h2>
              <p className="text-muted-foreground">
                Tu cita médica ha sido agendada exitosamente
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <ImageWithFallback
                  src={doctor.imageUrl}
                  alt={doctor.nombre}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-left">
                  <h3 className="font-semibold">{doctor.nombre}</h3>
                  <p className="text-muted-foreground">{doctor.especialidades?.[0] || 'Especialidad General'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{selectedSlot?.date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{selectedSlot?.slot.time}</span>
                </div>
                <div className="flex items-center space-x-2 sm:col-span-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{doctor.sedes?.[0]?.location || doctor.direccion || 'Ubicación no especificada'}</span>
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
            onClick={() => onNavigate('search')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la búsqueda
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground">
            Agendar Cita Médica
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Información del Médico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Doctor Profile */}
                <div className="text-center">
                  <ImageWithFallback
                    src={doctor.imageUrl}
                    alt={doctor.nombre}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold">{doctor.nombre}</h3>
                  <p className="text-muted-foreground">{doctor.especialidades?.[0] || 'Especialidad General'}</p>
                  
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{doctor.rating}</span>
                    <span className="text-muted-foreground">({doctor.reviewCount} reseñas)</span>
                  </div>
                </div>

                {/* Hospital Info */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Consultorio</h4>
                    <p className="text-muted-foreground">
                      {doctor.sedes?.[0]?.nombre || 'Consultorio Principal'}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{doctor.sedes?.[0]?.location || doctor.direccion || 'Ubicación no especificada'}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium">Información de Contacto</h4>
                  <div className="space-y-2 text-sm">
                    {doctor.telefono && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{doctor.telefono}</span>
                      </div>
                    )}
                    {doctor.email && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{doctor.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Badge */}
                {doctor.availableSlots > 0 && (
                  <div className="pt-4 border-t border-border">
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      <Heart className="h-4 w-4 mr-2" />
                      {doctor.availableSlots} espacios disponibles
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <AppointmentCalendar
                doctorId={doctor.id}
                doctorName={doctor.nombre}
                onSelectSlot={handleSlotSelect}
                selectedSlot={selectedSlot}
              />

              {/* Booking Confirmation */}
              {selectedSlot && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Confirmar Cita</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-accent rounded-lg p-4">
                      <h4 className="font-medium mb-3">Resumen de tu cita:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Médico:</span>
                          <span className="font-medium">{doctor.nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Especialidad:</span>
                          <span className="font-medium">{doctor.especialidades?.[0] || 'Especialidad General'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha:</span>
                          <span className="font-medium">
                            {selectedSlot.date.toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hora:</span>
                          <span className="font-medium">{selectedSlot.slot.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ubicación:</span>
                          <span className="font-medium">{doctor.sedes?.[0]?.location || doctor.direccion || 'Ubicación no especificada'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={isBooking}
                        className="flex-1"
                      >
                        {isBooking ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Confirmando...
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Confirmar Cita
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSlot(null)}
                        disabled={isBooking}
                      >
                        Cancelar
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Al confirmar, recibirás un correo electrónico con los detalles de tu cita 
                      y las instrucciones de preparación si aplican.
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