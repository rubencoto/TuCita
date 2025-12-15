import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, FileText, Filter, X, ChevronRight, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import medicalHistoryService, { HistorialMedicoDto } from '@/services/api/patient/medicalHistoryService';

interface MedicalHistoryPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function MedicalHistoryPage({ onNavigate }: MedicalHistoryPageProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<HistorialMedicoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar historial médico al montar el componente
  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const history = await medicalHistoryService.getCurrentUserMedicalHistory();
      setMedicalHistory(history);
    } catch (err: any) {
      console.error('Error al cargar historial médico:', err);
      setError(err.message || 'Error al cargar el historial médico');
      toast.error('Error al cargar el historial médico');
    } finally {
      setLoading(false);
    }
  };

  // Mapear historial médico a formato de appointments para compatibilidad
  const historicalAppointments = medicalHistory.map(item => ({
    id: item.citaId.toString(),
    doctorName: item.nombreMedico.replace('Dr. ', '').replace('Dra. ', ''),
    doctorSpecialty: item.especialidad || 'General',
    date: medicalHistoryService.formatDate(item.fechaCita),
    time: new Date(item.fechaCita).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    location: 'Consulta médica',
    status: item.estadoCita.toLowerCase() === 'atendida' ? 'completed' : 
            item.estadoCita.toLowerCase() === 'cancelada' ? 'cancelled' : 'pending',
    motivo: item.motivo,
    diagnosticos: item.diagnosticos,
    notasClinicas: item.notasClinicas,
    recetas: item.recetas,
    documentos: item.documentos
  }));

  // Aplicar filtros
  const filteredAppointments = historicalAppointments.filter(apt => {
    // Filtro por estado
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    
    // Filtro por especialidad
    if (specialtyFilter !== 'all' && apt.doctorSpecialty !== specialtyFilter) return false;
    
    // Filtro por búsqueda (médico)
    if (searchTerm && !apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Filtro por fecha
    if (dateFrom) {
      const aptDate = new Date(apt.date.split('/').reverse().join('-'));
      const filterDate = new Date(dateFrom);
      if (aptDate < filterDate) return false;
    }
    
    if (dateTo) {
      const aptDate = new Date(apt.date.split('/').reverse().join('-'));
      const filterDate = new Date(dateTo);
      if (aptDate > filterDate) return false;
    }
    
    return true;
  });

  // Obtener especialidades únicas
  const specialties = Array.from(new Set(historicalAppointments.map(apt => apt.doctorSpecialty)));

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setSpecialtyFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = dateFrom || dateTo || statusFilter !== 'all' || specialtyFilter !== 'all' || searchTerm;

  const statusConfig = {
    completed: { label: 'Atendida', color: 'bg-green-100 text-green-800', icon: '✓' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: '✗' },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏱' },
  };

  const LoadingState = () => (
    <Card>
      <CardContent className="py-12 text-center">
        <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Cargando historial médico...
        </h3>
        <p className="text-muted-foreground">
          Por favor espera un momento
        </p>
      </CardContent>
    </Card>
  );

  const ErrorState = () => (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="max-w-md mx-auto">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Error al cargar el historial
          </h3>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <Button onClick={loadMedicalHistory}>
            Intentar nuevamente
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Historial Médico del Paciente
            </h1>
            <p className="text-muted-foreground">
              Consulta tus citas anteriores y revisa diagnósticos, notas y recetas
            </p>
          </div>
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error && medicalHistory.length === 0) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Historial Médico del Paciente
            </h1>
            <p className="text-muted-foreground">
              Consulta tus citas anteriores y revisa diagnósticos, notas y recetas
            </p>
          </div>
          <ErrorState />
        </div>
      </div>
    );
  }

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
                    placeholder="Desde"
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
            {filteredAppointments.map((appointment) => (
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
                          } flex items-center justify-center text-sm font-semibold`}>
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
                        
                        {/* Badges de información médica */}
                        {appointment.diagnosticos?.length > 0 && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {appointment.diagnosticos.length} Diagnóstico{appointment.diagnosticos.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {appointment.recetas?.length > 0 && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {appointment.recetas.length} Receta{appointment.recetas.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {appointment.documentos?.length > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {appointment.documentos.length} Documento{appointment.documentos.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Doctor */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Dr. {appointment.doctorName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.doctorSpecialty}
                          </p>
                        </div>
                      </div>

                      {/* Motivo */}
                      {appointment.motivo && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Motivo:</span> {appointment.motivo}
                        </div>
                      )}
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
