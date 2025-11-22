import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, MapPin, Stethoscope, Filter } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  showFilters?: boolean;
}

interface SearchFilters {
  specialty: string;
  location: string;
  availability: string;
  query: string;
}

const specialties = [
  'Medicina General',
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Neurología',
  'Oftalmología',
  'Ortopedia',
  'Pediatría',
  'Psiquiatría',
  'Urología',
];

const locations = [
  'Ciudad de México',
  'Guadalajara',
  'Monterrey',
  'Puebla',
  'Tijuana',
  'León',
  'Juárez',
  'Torreón',
  'Querétaro',
  'Mérida',
];

const availabilityOptions = [
  { value: 'today', label: 'Hoy' },
  { value: 'tomorrow', label: 'Mañana' },
  { value: 'this-week', label: 'Esta semana' },
  { value: 'next-week', label: 'Próxima semana' },
  { value: 'any', label: 'Cualquier día' },
];

export function SearchBar({ onSearch, showFilters = false }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: 'all-specialties',
    location: 'all-locations',
    availability: 'all-availability',
    query: '',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    // Convert placeholder values back to empty strings for filtering
    const processedFilters = {
      ...filters,
      specialty: filters.specialty === 'all-specialties' ? '' : filters.specialty,
      location: filters.location === 'all-locations' ? '' : filters.location,
      availability: filters.availability === 'all-availability' ? '' : filters.availability,
    };
    onSearch(processedFilters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      specialty: 'all-specialties',
      location: 'all-locations',
      availability: 'all-availability',
      query: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Campo de búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por médico, especialidad o síntoma..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Especialidad */}
            <div className="lg:w-64">
              <Select
                value={filters.specialty || 'all-specialties'}
                onValueChange={(value) => handleFilterChange('specialty', value)}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Especialidad" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-specialties">Todas las especialidades</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ubicación */}
            <div className="lg:w-48">
              <Select
                value={filters.location || 'all-locations'}
                onValueChange={(value) => handleFilterChange('location', value)}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Ubicación" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-locations">Todas las ubicaciones</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón de búsqueda */}
            <Button onClick={handleSearch} className="lg:w-auto">
              Buscar
            </Button>

            {/* Botón de filtros avanzados */}
            {showFilters && (
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="lg:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros avanzados */}
      {showFilters && showAdvancedFilters && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Filtros Avanzados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Disponibilidad */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Disponibilidad
                </label>
                <Select
                  value={filters.availability || 'all-availability'}
                  onValueChange={(value) => handleFilterChange('availability', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-availability">Cualquier disponibilidad</SelectItem>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botones de acción */}
              <div className="md:col-span-3 flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Limpiar Filtros
                </Button>
                <Button onClick={handleSearch}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}