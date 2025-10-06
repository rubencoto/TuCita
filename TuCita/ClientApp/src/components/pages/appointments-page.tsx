import { useState } from 'react';
import { AppointmentCard } from '../appointment-card';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Plus, Filter, Search, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';

interface AppointmentsPageProps {
  appointments: any[];
  onNavigate: (page: string) => void;
  onUpdateAppointment: (appointmentId: string, status: string) => void;
  onCancelAppointment: (appointmentId: string) => Promise<boolean>;
  loading?: boolean;
}

export function AppointmentsPage({ 
  appointments, 
  onNavigate, 
  onUpdateAppointment,
  onCancelAppointment,
  loading = false
}: AppointmentsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  // Separar citas por estado
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'rescheduled'
  );
  
  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show'
  );

  // Filtrar por búsqueda
  const filterAppointments = (appointmentsList: any[]) => {
    if (!searchTerm) return appointmentsList;
    
    return appointmentsList.filter(apt =>
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(apt.doctorSpecialty) 
        ? apt.doctorSpecialty.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
        : apt.doctorSpecialty?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      apt.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredUpcoming = filterAppointments(upcomingAppointments);
  const filteredPast = filterAppointments(pastAppointments);

  const handleReschedule = (appointmentId: string) => {
    // En una aplicación real, aquí abriríamos un modal o navegaríamos a una página de reprogramación
    onUpdateAppointment(appointmentId, 'REPROGRAMADA');
  };

  const handleCancel = async (appointmentId: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      const success = await onCancelAppointment(appointmentId);
      if (!success) {
        alert('No se pudo cancelar la cita. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const getTabCount = (tabType: string) => {
    switch (tabType) {
      case 'upcoming':
        return filteredUpcoming.length;
      case 'past':
        return filteredPast.length;
      default:
        return 0;
    }
  };

  const EmptyState = ({ type }: { type: 'upcoming' | 'past' | 'search' }) => {
    const configs = {
      upcoming: {
        icon: Calendar,
        title: 'No tienes citas próximas',
        description: 'Agenda tu primera cita médica con nuestros especialistas',
        action: (
          <Button onClick={() => onNavigate('search')}>
            <Plus className="h-4 w-4 mr-2" />
            Agendar Nueva Cita
          </Button>
        )
      },
      past: {
        icon: Clock,
        title: 'No tienes historial de citas',
        description: 'Aquí aparecerán tus citas completadas y canceladas',
        action: null
      },
      search: {
        icon: Search,
        title: 'No se encontraron citas',
        description: 'Intenta con otros términos de búsqueda',
        action: (
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Limpiar búsqueda
          </Button>
        )
      }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="max-w-md mx-auto">
            <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {config.title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {config.description}
            </p>
            {config.action}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Transformar appointment para que coincida con el formato esperado por AppointmentCard
  const transformAppointment = (apt: any) => ({
    ...apt,
    doctorSpecialty: Array.isArray(apt.doctorSpecialty) ? apt.doctorSpecialty.join(', ') : apt.doctorSpecialty,
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Mis Citas Médicas
              </h1>
              <p className="text-muted-foreground">
                Gestiona y revisa todas tus citas médicas
              </p>
            </div>
            <Button onClick={() => onNavigate('search')} className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Stats Cards */}
        {!loading && appointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {upcomingAppointments.length}
                    </p>
                    <p className="text-muted-foreground">Próximas Citas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-3 mr-4">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {pastAppointments.filter(apt => apt.status === 'completed').length}
                    </p>
                    <p className="text-muted-foreground">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-lg p-3 mr-4">
                    <Filter className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {appointments.filter(apt => apt.status === 'pending').length}
                    </p>
                    <p className="text-muted-foreground">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        {!loading && appointments.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por médico, especialidad o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appointments Tabs */}
        {!loading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming" className="relative">
                Próximas Citas
                {getTabCount('upcoming') > 0 && (
                  <Badge className="ml-2 px-2 py-0 text-xs">
                    {getTabCount('upcoming')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="relative">
                Historial
                {getTabCount('past') > 0 && (
                  <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs">
                    {getTabCount('past')}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Appointments */}
            <TabsContent value="upcoming">
              {searchTerm && filteredUpcoming.length === 0 && upcomingAppointments.length > 0 ? (
                <EmptyState type="search" />
              ) : filteredUpcoming.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredUpcoming.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={transformAppointment(appointment)}
                      onReschedule={handleReschedule}
                      onCancel={handleCancel}
                      showActions={true}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="upcoming" />
              )}
            </TabsContent>

            {/* Past Appointments */}
            <TabsContent value="past">
              {searchTerm && filteredPast.length === 0 && pastAppointments.length > 0 ? (
                <EmptyState type="search" />
              ) : filteredPast.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredPast.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={transformAppointment(appointment)}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="past" />
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Quick Actions */}
        {!loading && appointments.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('search')}
                  className="justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Nueva Cita
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('profile')}
                  className="justify-start"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Configurar Recordatorios
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.print()}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Exportar Calendario
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}