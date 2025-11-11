import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Calendar, Users, Clock, Stethoscope, LogOut, Bell } from 'lucide-react';
import { DoctorAuthResponse, doctorAuthService } from '../../services/doctorAuthService';
import { toast } from 'sonner';

interface DoctorDashboardPageProps {
  user: DoctorAuthResponse;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DoctorDashboardPage({ user, onNavigate, onLogout }: DoctorDashboardPageProps) {
  const [stats, setStats] = useState({
    citasHoy: 0,
    pacientesTotal: 0,
    proximaCita: null as string | null,
    citasPendientes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Aquí puedes implementar las llamadas a la API para obtener estadísticas
      // Por ahora, usamos datos de ejemplo
      setStats({
        citasHoy: 8,
        pacientesTotal: 156,
        proximaCita: '10:30 AM',
        citasPendientes: 3
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error', {
        description: 'No se pudieron cargar los datos del dashboard'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await doctorAuthService.logout();
      toast.success('Sesión cerrada', {
        description: 'Has salido del portal médico correctamente'
      });
      onLogout();
      onNavigate('home');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-[#2E8BC0] rounded-lg p-2 mr-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Portal Médico</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Resumen de tu actividad médica</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Citas Hoy
              </CardTitle>
              <Calendar className="h-4 w-4 text-[#2E8BC0]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.citasHoy}</div>
              <p className="text-xs text-gray-600">
                {stats.citasPendientes} pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-[#2E8BC0]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pacientesTotal}</div>
              <p className="text-xs text-gray-600">
                En tu consulta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Próxima Cita
              </CardTitle>
              <Clock className="h-4 w-4 text-[#2E8BC0]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.proximaCita || 'N/A'}</div>
              <p className="text-xs text-gray-600">
                Hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Especialidades
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-[#2E8BC0]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {user.especialidades?.length || 1}
              </div>
              <p className="text-xs text-gray-600">
                Activas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start bg-[#2E8BC0] hover:bg-[#145A8C]">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Agenda del Día
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Pacientes
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Historial Médico
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-900">{user.name}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <Separator />
                {user.numeroLicencia && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Licencia Médica</label>
                      <p className="text-gray-900">{user.numeroLicencia}</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Especialidades</label>
                  <p className="text-gray-900">
                    {user.especialidades?.join(', ') || 'No especificadas'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
