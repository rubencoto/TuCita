import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, MapPin, FileText, Filter, X, ChevronRight, Search } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface MedicalHistoryPageProps {
  appointments: any[];
  onNavigate: (page: string, data?: any) => void;
}

export function MedicalHistoryPage({ appointments, onNavigate }: MedicalHistoryPageProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar solo citas completadas y canceladas para el historial
  const historicalAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  );

  // Aplicar filtros
  const filteredAppointments = historicalAppointments.filter(apt => {
    // Filtro por estado
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    
    // Filtro por especialidad
    if (specialtyFilter !== 'all' && apt.doctorSpecialty !== specialtyFilter) return false;
    
    // Filtro por búsqueda (médico)
    if (searchTerm && !apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  // Obtener especialidades únicas
  const specialties = Array.from(new Set(appointments.map(apt => apt.doctorSpecialty)));

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setSpecialtyFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = dateFrom || dateTo || statusFilter !== 'all' || specialtyFilter !== 'all' || searchTerm;

  const statusConfig = {
    completed: { label: 'Atendida', color: 'bg-green-100 text-green-800', icon: '?' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: '?' },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '?' },
  };

  const EmptyState = () => (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="max-w-md mx-auto">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {hasActiveFilters ? 'No se encontraron citas' : 'Aún no tienes citas en tu historial'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters 
              ? 'Intenta ajustar los filtros para ver más resultados' 
              : 'Las citas completadas y canceladas aparecerán aquí'
            }
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
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
            Historial Médico del Paciente
          </h1>
          <p className="text-muted-foreground">
            Consulta tus citas anteriores y revisa diagnósticos, notas y recetas
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                Filtros de búsqueda
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por médico */}
              <div>
                <Label htmlFor="search-doctor">Médico</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-doctor"
                    placeholder="Buscar médico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por especialidad */}
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger id="specialty" className="mt-1">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especialidades</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por estado */}
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="completed">Atendida</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por fecha */}
              <div>
                <Label htmlFor="date-range">Rango de fecha</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Mostrando <span className="font-medium text-foreground">{filteredAppointments.length}</span> de {historicalAppointments.length} citas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de citas */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment, index) => (
              <Card 
                key={appointment.id} 
                className="hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Línea de timeline */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/30" />
                
                <CardContent className="p-6 pl-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex-1 space-y-4">
                      {/* Fecha y estado */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full ${
                            appointment.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                          } flex items-center justify-center text-sm`}>
                            {statusConfig[appointment.status as keyof typeof statusConfig]?.icon || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{appointment.date}</p>
                            <p className="text-sm text-muted-foreground">{appointment.time}</p>
                          </div>
                        </div>
                        <Badge className={statusConfig[appointment.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}>
                          {statusConfig[appointment.status as keyof typeof statusConfig]?.label || appointment.status}
                        </Badge>
                      </div>

                      {/* Doctor */}
                      <div className="flex items-center space-x-3">
                        <ImageWithFallback
                          src={appointment.doctorImage}
                          alt={appointment.doctorName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
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

                      {/* Ubicación */}
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.location}</span>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="lg:ml-4">
                      <Button 
                        onClick={() => onNavigate('appointment-detail', { appointment })}
                        className="w-full lg:w-auto"
                      >
                        Ver Detalles
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Estadísticas */}
        {historicalAppointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-3 mr-4">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {historicalAppointments.filter(apt => apt.status === 'completed').length}
                    </p>
                    <p className="text-muted-foreground">Citas Atendidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {specialties.length}
                    </p>
                    <p className="text-muted-foreground">Especialidades Visitadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-3 mr-4">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {historicalAppointments.length}
                    </p>
                    <p className="text-muted-foreground">Total de Citas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
