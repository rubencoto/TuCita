import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/common/search-bar';
import { DoctorCard } from '@/components/common/doctor-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, SortAsc, MapPin, Loader2 } from 'lucide-react';
import doctorsService, { Doctor } from '@/services/api/doctor/doctorsService';
import { toast } from 'sonner';

interface SearchPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface SearchFilters {
  specialty: string;
  location: string;
  availability: string;
  query: string;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    specialty: '',
    location: '',
    availability: '',
    query: '',
  });
  const [sortBy, setSortBy] = useState('rating');

  // Cargar doctores al montar el componente
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorsService.getDoctors();
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      toast.error('Error al cargar la lista de médicos');
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setActiveFilters(filters);
    setLoading(true);

    try {
      // Si hay filtros de especialidad o ubicación, hacer búsqueda en el backend
      if (filters.specialty || filters.location) {
        const data = await doctorsService.getDoctors({
          especialidad: filters.specialty || undefined,
          location: filters.location || undefined,
        });
        setDoctors(data);
        
        // Aplicar filtro de query localmente
        let filtered = data;
        if (filters.query) {
          filtered = data.filter((doctor: Doctor) =>
            doctor.nombre.toLowerCase().includes(filters.query.toLowerCase()) ||
            doctor.especialidades.some((e: string) => e.toLowerCase().includes(filters.query.toLowerCase())) ||
            doctor.sedes.some((s: any) => s.location.toLowerCase().includes(filters.query.toLowerCase()))
          );
        }
        
        setFilteredDoctors(sortDoctors(filtered, sortBy));
      } else {
        // Filtrar localmente
        let filtered = doctors.filter(doctor => {
          const matchesQuery = !filters.query ||
            doctor.nombre.toLowerCase().includes(filters.query.toLowerCase()) ||
            doctor.especialidades.some((e: string) => e.toLowerCase().includes(filters.query.toLowerCase())) ||
            doctor.sedes.some((s: any) => s.location.toLowerCase().includes(filters.query.toLowerCase()));

          return matchesQuery;
        });

        setFilteredDoctors(sortDoctors(filtered, sortBy));
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error('Error al buscar médicos');
    } finally {
      setLoading(false);
    }
  };

  const sortDoctors = (doctorsList: Doctor[], sortType: string): Doctor[] => {
    return [...doctorsList].sort((a, b) => {
      switch (sortType) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.nombre.localeCompare(b.nombre);
        case 'experience':
          return b.experienceYears.localeCompare(a.experienceYears);
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    if (filteredDoctors.length > 0) {
      setFilteredDoctors(sortDoctors(filteredDoctors, sortBy));
    }
  }, [sortBy]);

  const handleViewSchedule = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === Number(doctorId));
    if (doctor) {
      onNavigate('booking', { doctor });
    }
  };

  const clearFilters = () => {
    const emptyFilters = { specialty: '', location: '', availability: '', query: '' };
    setActiveFilters(emptyFilters);
    setFilteredDoctors(doctors);
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  // Transformar Doctor a formato esperado por DoctorCard
  const transformDoctorForCard = (doctor: Doctor) => ({
    id: doctor.id.toString(),
    name: doctor.nombre,
    specialty: doctor.especialidades.length > 0 
      ? doctor.especialidades.join(', ') 
      : 'Especialista',
    hospital: doctor.sedes[0]?.nombre || 'Consultorio',
    location: doctor.sedes[0]?.location || doctor.sedes[0]?.direccion || 'Ubicación no disponible',
    rating: doctor.rating,
    reviewCount: doctor.reviewCount,
    image: doctor.imageUrl,
    availableSlots: doctor.availableSlots || 0,
    nextAvailable: doctor.nextAvailable || 'Consultar disponibilidad',
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Buscar Médicos Especialistas
          </h1>
          <p className="text-muted-foreground">
            Encuentra y agenda citas con los mejores profesionales de la salud
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} showFilters={true} />
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <h2 className="text-xl font-semibold">
              {loading ? 'Buscando...' : `${filteredDoctors.length} médicos encontrados`}
            </h2>
            
            {activeFilterCount > 0 && !loading && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}

                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Limpiar
                </Button>
              </div>
            )}
          </div>

          {/* Sort Options */}
          {!loading && filteredDoctors.length > 0 && (
            <div className="flex items-center space-x-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-background border border-border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="rating">Mejor calificación</option>
                <option value="name">Nombre A-Z</option>
                <option value="experience">Más experiencia</option>
              </select>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && !loading && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {activeFilters.query && (
                <Badge variant="outline">
                  Búsqueda: "{activeFilters.query}"
                </Badge>
              )}
              {activeFilters.specialty && (
                <Badge variant="outline">
                  Especialidad: {activeFilters.specialty}
                </Badge>
              )}
              {activeFilters.location && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {activeFilters.location}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Results */}
        {!loading && filteredDoctors.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={transformDoctorForCard(doctor)}
                onViewSchedule={handleViewSchedule}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDoctors.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No se encontraron médicos
                </h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar tus filtros de búsqueda o explora diferentes especialidades.
                </p>
                <Button onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}