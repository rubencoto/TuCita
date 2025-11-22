import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, MoreHorizontal } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  type: 'consultation' | 'follow-up' | 'checkup';
}

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  showActions?: boolean;
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  rescheduled: { label: 'Reprogramada', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800' },
};

const typeConfig = {
  consultation: 'Consulta',
  'follow-up': 'Seguimiento',
  checkup: 'Chequeo',
};

export function AppointmentCard({ 
  appointment, 
  onReschedule, 
  onCancel, 
  showActions = true 
}: AppointmentCardProps) {
  const status = statusConfig[appointment.status];
  const canModify = appointment.status === 'pending' || appointment.status === 'confirmed';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {typeConfig[appointment.type]}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={status.color}>
              {status.label}
            </Badge>
            {showActions && canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onReschedule && (
                    <DropdownMenuItem onClick={() => onReschedule(appointment.id)}>
                      Reprogramar
                    </DropdownMenuItem>
                  )}
                  {onCancel && (
                    <DropdownMenuItem 
                      onClick={() => onCancel(appointment.id)}
                      className="text-destructive"
                    >
                      Cancelar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información del doctor */}
        <div className="flex items-center space-x-3">
          <ImageWithFallback
            src={appointment.doctorImage}
            alt={appointment.doctorName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-foreground">
              Dr. {appointment.doctorName}
            </p>
            <p className="text-sm text-muted-foreground">
              {appointment.doctorSpecialty}
            </p>
          </div>
        </div>

        {/* Detalles de la cita */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground sm:col-span-2">
            <MapPin className="h-4 w-4" />
            <span>{appointment.location}</span>
          </div>
        </div>

        {/* Acciones rápidas para citas próximas */}
        {showActions && appointment.status === 'confirmed' && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700">
                Recordatorio: Tu cita es pronto
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}