import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, XCircle, UserCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import adminDashboardService, { 
  AdminDashboard,
  WeeklyChartData,
  StatusDistribution,
  UpcomingAppointment,
  SystemAlert
} from '@/services/api/admin/adminDashboardService';
import { toast } from 'sonner';

interface MetricCardData {
  title: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  trend: string;
}

const statusColors: Record<string, string> = {
  PROGRAMADA: 'bg-blue-100 text-blue-800',
  ATENDIDA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-yellow-100 text-yellow-800',
  NO_SHOW: 'bg-red-100 text-red-800',
};

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error al cargar datos del dashboard', {
        description: error.response?.data?.message || 'Por favor intenta nuevamente'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error al cargar los datos del dashboard</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const metricsData: MetricCardData[] = [
    {
      title: 'Citas de hoy',
      value: dashboardData.metricas.citasHoy.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: `${dashboardData.metricas.cambioVsAyer >= 0 ? '+' : ''}${dashboardData.metricas.cambioVsAyer}% vs ayer`
    },
    {
      title: 'Citas atendidas',
      value: dashboardData.metricas.citasAtendidas.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'Esta semana'
    },
    {
      title: 'Citas NO_SHOW',
      value: dashboardData.metricas.citasNoShow.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: `${dashboardData.metricas.porcentajeNoShow}% del total`
    },
    {
      title: 'Doctores activos',
      value: dashboardData.metricas.doctoresConectados.toString(),
      icon: UserCheck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      trend: `${dashboardData.metricas.doctoresActivos} activos en total`
    },
  ];

  // Transformar datos semanales para el gráfico de barras
  const chartData = dashboardData.datosSemanales.map(item => ({
    name: item.dia,
    PROGRAMADA: item.programada,
    ATENDIDA: item.atendida,
    CANCELADA: item.cancelada,
    NO_SHOW: item.noShow
  }));

  // Transformar datos de distribución para el gráfico de pastel
  const pieData = dashboardData.distribucionEstados.map(item => ({
    name: item.estado,
    value: item.cantidad,
    color: item.color
  }));

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.trend}</p>
                  </div>
                  <div className={`${metric.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Citas por estado (últimos 7 días)</CardTitle>
            <CardDescription>Evolución semanal del estado de las citas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="PROGRAMADA" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ATENDIDA" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="CANCELADA" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="NO_SHOW" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>distribución total</CardTitle>
            <CardDescription>Por estado de cita</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximas citas de hoy</CardTitle>
            <CardDescription>Agenda del dóa en curso</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.proximasCitas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay citas programadas para el resto del dóa
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Paciente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Doctor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.proximasCitas.map((apt, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{apt.hora}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{apt.paciente}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{apt.doctor}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[apt.estado]}>
                            {apt.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas del sistema</CardTitle>
            <CardDescription>Notificaciones importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.alertas.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    alert.tipo === 'error'
                      ? 'bg-red-50 border-red-200'
                      : alert.tipo === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 flex-shrink-0 ${
                        alert.tipo === 'error'
                          ? 'text-red-600'
                          : alert.tipo === 'warning'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.tiempoRelativo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
