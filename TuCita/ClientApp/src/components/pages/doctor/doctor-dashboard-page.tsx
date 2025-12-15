import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  UserX,
  Eye,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { DoctorLayout } from '@/components/layout/doctor/DoctorLayout';
import { useTodayAppointments } from '@/hooks/queries/useAppointments';
import { DoctorAppointment } from '@/services/api/doctor/doctorAppointmentsService';

interface DoctorDashboardPageProps {
  onNavigate: (page: string, data?: any) => void;
  onLogout: () => void;
}

export function DoctorDashboardPage({ onNavigate, onLogout }: DoctorDashboardPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🎯 React Query: Reemplaza useState + useEffect + loadTodayAppointments
  const { data, isLoading, isError, error } = useTodayAppointments();

  // Extraer datos de React Query
  const todayAppointments = data?.appointments || [];
  const stats = data?.stats || { total: 0, completed: 0, pending: 0, cancelled: 0 };

  // Obtener nombre del doctor desde localStorage
  const getDoctorName = () => {
    try {
      const userStr = localStorage.getItem('doctorUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.nombre || 'Doctor';
      }
    } catch (error) {
      console.error('Error al obtener nombre del doctor:', error);
    }
    return 'Doctor';
  };

  const doctorName = getDoctorName();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🚨 Manejo de errores con React Query
  useEffect(() => {
    if (isError) {
      console.error('Error al cargar citas del día:', error);
      toast.error('Error al cargar las citas del día');
    }
  }, [isError, error]);

  const getNextAppointment = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const upcoming = todayAppointments.filter(apt => {
      if (apt.estado === 'CANCELADA' || apt.estado === 'ATENDIDA') return false;
      
      const inicio = new Date(apt.inicio);
      const hour = inicio.getHours();
      const minute = inicio.getMinutes();
      const aptTimeInMinutes = hour * 60 + minute;
      
      return aptTimeInMinutes > currentTimeInMinutes;
    });

    if (upcoming.length === 0) return null;
    
    // Ordenar por fecha/hora más cercana
    upcoming.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
    
    const next = upcoming[0];
    const inicio = new Date(next.inicio);
    const aptTimeInMinutes = inicio.getHours() * 60 + inicio.getMinutes();
    const minutesUntil = aptTimeInMinutes - currentTimeInMinutes;

    return { 
      ...next, 
      minutesUntil,
      time: inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const nextAppointment = getNextAppointment();

  const statusConfig = {
    CONFIRMADA: { 
      label: 'Confirmada', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle2,
      iconColor: 'text-blue-600'
    },
    ATENDIDA: { 
      label: 'Atendida', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-600'
    },
    CANCELADA: { 
      label: 'Cancelada', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600'
    },
    PENDIENTE: { 
      label: 'Pendiente', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-600'
    },
    NO_SHOW: { 
      label: 'No asistió', 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: UserX,
      iconColor: 'text-gray-600'
    },
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
      <span className="text-muted-foreground">Cargando citas del día...</span>
    </div>
  );

  return (
    <DoctorLayout 
      currentPage="doctor-dashboard" 
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, Dr. {doctorName}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {currentTime.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {currentTime.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total del día</p>
                    <p className="text-3xl font-bold text-gray-900">{isLoading ? '-' : stats.total}</p>
                  </div>
                  <div className="bg-[#2E8BC0]/10 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-[#2E8BC0]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 mb-1">Completadas</p>
                    <p className="text-3xl font-bold text-green-900">{isLoading ? '-' : stats.completed}</p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-xl">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-blue-900">{isLoading ? '-' : stats.pending}</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 mb-1">Canceladas</p>
                    <p className="text-3xl font-bold text-red-900">{isLoading ? '-' : stats.cancelled}</p>
                  </div>
                  <div className="bg-red-500 p-3 rounded-xl">
                    <XCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Citas del día - Tabla */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#2E8BC0]" />
                  Citas de hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingState />
                ) : todayAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No hay citas programadas para hoy</p>
                    <p className="text-sm text-gray-500 mt-2">Las citas aparecerán aquí cuando están agendadas</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayAppointments.map((appointment) => {
                        const config = statusConfig[appointment.estado as keyof typeof statusConfig];
                        const StatusIcon = config?.icon;
                        const inicio = new Date(appointment.inicio);
                        const hora = inicio.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                        
                        return (
                          <TableRow key={appointment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{hora}</TableCell>
                            <TableCell>{appointment.paciente.nombre}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {appointment.motivo || 'No especificado'}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${config?.color} border`}>
                                {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                                {config?.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onNavigate('doctor-appointment-detail', { appointmentId: appointment.id })}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Próxima cita */}
          <div className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Cargando próxima cita...</p>
                </CardContent>
              </Card>
            ) : nextAppointment ? (
              <Card className="bg-gradient-to-br from-[#2E8BC0] to-[#1a5a7d] text-white border-0">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Próxima cita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                      <p className="text-sm opacity-90 mb-1">
                        {nextAppointment.minutesUntil > 60 
                          ? `En ${Math.floor(nextAppointment.minutesUntil / 60)}h ${nextAppointment.minutesUntil % 60}m` 
                          : `En ${nextAppointment.minutesUntil} minutos`}
                      </p>
                      <p className="text-2xl font-bold">{nextAppointment.time}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Paciente</p>
                      <p className="font-semibold">{nextAppointment.paciente.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Motivo</p>
                      <p>{nextAppointment.motivo || 'No especificado'}</p>
                    </div>
                    <Button 
                      className="w-full bg-white text-[#2E8BC0] hover:bg-gray-100"
                      onClick={() => onNavigate('doctor-appointment-detail', { appointmentId: nextAppointment.id })}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">
                    No hay más citas pendientes
                  </p>
                  <p className="text-sm text-gray-600">
                    Has completado tu agenda del día
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate('doctor-appointments')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver todas las citas
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate('doctor-availability')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gestionar disponibilidad
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
