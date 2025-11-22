import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Calendar } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  availableSlots: number;
  nextAvailable: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onViewSchedule: (doctorId: string) => void;
}

export function DoctorCard({ doctor, onViewSchedule }: DoctorCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Foto del doctor */}
          <div className="flex-shrink-0">
            <ImageWithFallback
              src={doctor.image}
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          {/* Información del doctor */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground truncate">
                  {doctor.name}
                </h3>
                <p className="text-muted-foreground">
                  {doctor.specialty}
                </p>
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-1 ml-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">({doctor.reviewCount})</span>
              </div>
            </div>

            {/* Hospital y ubicación */}
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                {doctor.hospital}
              </p>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{doctor.location}</span>
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {doctor.availableSlots} espacio{doctor.availableSlots !== 1 ? 's' : ''} disponible{doctor.availableSlots !== 1 ? 's' : ''} 
              </Badge>
              <p className="text-xs text-muted-foreground">
                Próximo: {doctor.nextAvailable}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 pt-0">
        <Button 
          onClick={() => onViewSchedule(doctor.id)}
          className="w-full"
        >
          Ver Horarios
        </Button>
      </CardFooter>
    </Card>
  );
}