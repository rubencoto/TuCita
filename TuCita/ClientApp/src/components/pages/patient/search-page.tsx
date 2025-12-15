import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Calendar,
  Heart,
  Loader2,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { useDoctors, useSpecialties, usePrefetchDoctorDetails } from '@/hooks/queries';
import { SelectErrorBoundary } from '@/components/common/SelectErrorBoundary';

interface SearchPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('__all__');
  const [selectedLocation, setSelectedLocation] = useState('__all__');

  // ✅ REACT QUERY: Fetch specialties
  const { data: specialties = [], isLoading: loadingSpecialties } = useSpecialties();

  // ✅ REACT QUERY: Fetch doctors with filters
  const filters = {
    ...(selectedSpecialty && selectedSpecialty !== '__all__' && { especialidad: selectedSpecialty }),
    ...(selectedLocation && selectedLocation !== '__all__' && { location: selectedLocation }),
  };
  
  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors(
    Object.keys(filters).length > 0 ? filters : undefined
  );
  
  // ✅ REACT QUERY: Prefetch doctor details on hover
  const prefetchDoctorDetails = usePrefetchDoctorDetails();

  const loading = loadingDoctors || loadingSpecialties;

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter((doctor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doctor.nombre.toLowerCase().includes(query) ||
      doctor.especialidades.some((esp: string) => esp.toLowerCase().includes(query)) ||
      (doctor.sedes && doctor.sedes.some((sede: any) => 
        sede.location?.toLowerCase().includes(query) ||
        sede.ciudad?.toLowerCase().includes(query)
      ))
    );
  });

  // Unique locations from doctors with robust filtering
  const locations = Array.from(
    new Set(
      doctors
        .flatMap((d) =>
          d.sedes
            ?.map((sede: any) => sede.location || sede.ciudad)
            .filter((loc): loc is string => typeof loc === 'string' && loc.trim().length > 0) || []
        )
        .filter((loc): loc is string => typeof loc === 'string' && loc.trim().length > 0)
    )
  );

  // Safe specialties with filtering
  const safeSpecialties = (specialties || []).filter(
    (s): s is string => typeof s === 'string' && s.trim().length > 0
  );

  const safeLocations = locations.filter(
    (l): l is string => typeof l === 'string' && l.trim().length > 0
  );

  const handleSelectDoctor = (doctor: any) => {
    onNavigate('booking', { doctor });
  };

  const DoctorCard = ({ doctor }: { doctor: any }) => (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => handleSelectDoctor(doctor)}
      onMouseEnter={() => prefetchDoctorDetails(doctor.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <ImageWithFallback
            src={doctor.imageUrl}
            alt={doctor.nombre}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {doctor.nombre}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {doctor.especialidades.map((esp: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {esp}
                    </Badge>
                  ))}
                </div>
              </div>
              {doctor.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                  {doctor.reviewCount && (
                    <span className="text-xs text-muted-foreground">
                      ({doctor.reviewCount})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {doctor.sedes && doctor.sedes.length > 0 && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{doctor.sedes[0].location || doctor.sedes[0].ciudad}</span>
                </div>
              )}

              {doctor.experienceYears && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{doctor.experienceYears} de experiencia</span>
                </div>
              )}

              {doctor.nextAvailable && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Próximo disponible: {doctor.nextAvailable}</span>
                </div>
              )}
            </div>

            {doctor.biografia && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {doctor.biografia}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {doctor.availableSlots > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Heart className="h-3 w-3 mr-1" />
                    {doctor.availableSlots} espacios disponibles
                  </Badge>
                )}
              </div>
              <Button size="sm">
                Ver Disponibilidad
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Buscar Médicos
          </h1>
          <p className="text-muted-foreground">
            Encuentra al especialista que necesitas y agenda tu cita
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Filtros de Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Buscar por nombre o especialidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <SelectErrorBoundary>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todas las especialidades</SelectItem>
                    {safeSpecialties.map((specialty, index) => (
                      <SelectItem key={`specialty-${index}-${specialty}`} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SelectErrorBoundary>

              <SelectErrorBoundary>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las ubicaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todas las ubicaciones</SelectItem>
                    {safeLocations.map((location, index) => (
                      <SelectItem key={`location-${index}-${location}`} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SelectErrorBoundary>
            </div>

            {(selectedSpecialty !== '__all__' || selectedLocation !== '__all__' || searchQuery) && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {filteredDoctors.length} {filteredDoctors.length === 1 ? 'médico encontrado' : 'médicos encontrados'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialty('__all__');
                    setSelectedLocation('__all__');
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No se encontraron médicos
              </h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar tus filtros de búsqueda
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('__all__');
                  setSelectedLocation('__all__');
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {!loading && filteredDoctors.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>¿No encuentras lo que buscas?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={() => onNavigate('appointments')}>
                  Ver Mis Citas
                </Button>
                <Button variant="outline" onClick={() => onNavigate('profile')}>
                  Mi Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}