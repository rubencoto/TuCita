import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  UserX,
  Eye,
  TrendingUp
} from 'lucide-react';

interface DoctorDashboardPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function DoctorDashboardPage({ onNavigate }: DoctorDashboardPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - En producción vendría del backend
  const doctorName = "Laura Martínez";
  
  const todayAppointments = [
    {
      id: 1,
      time: '09:00',
      patient: 'Juan Pérez García',
      reason: 'Consulta general',
      status: 'CONFIRMADA',
    },
    {
      id: 2,
      time: '10:30',
      patient: 'María López Torres',
      reason: 'Seguimiento de tratamiento',
      status: 'CONFIRMADA',
    },
    {
      id: 3,
      time: '11:00',
      patient: 'Carlos Rodríguez Sanz',
      reason: 'Revisión de análisis',
      status: 'ATENDIDA',
    },
    {
      id: 4,
      time: '12:00',
      patient: 'Ana García Ruiz',
      reason: 'Primera consulta',
      status: 'PENDIENTE',
    },
    {
      id: 5,
      time: '13:00',
      patient: 'Pedro Sánchez Mora',
      reason: 'Control de presión',
      status: 'CANCELADA',
    },
    {
      id: 6,
      time: '16:00',
      patient: 'Lucía Fernández Gil',
      reason: 'Consulta general',
      status: 'CONFIRMADA',
    },
  ];

  const stats = {
    total: todayAppointments.length,
    completed: todayAppointments.filter(a => a.status === 'ATENDIDA').length,
    pending: todayAppointments.filter(a => a.status === 'CONFIRMADA' || a.status === 'PENDIENTE').length,
    cancelled: todayAppointments.filter(a => a.status === 'CANCELADA').length,
  };

  const getNextAppointment = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const upcoming = todayAppointments.filter(apt => {
      if (apt.status === 'CANCELADA' || apt.status === 'ATENDIDA') return false;
      const [hour, minute] = apt.time.split(':').map(Number);
      const aptTimeInMinutes = hour * 60 + minute;
      return aptTimeInMinutes > currentTimeInMinutes;
    });

    if (upcoming.length === 0) return null;
    
    const next = upcoming[0];
    const [hour, minute] = next.time.split(':').map(Number);
    const aptTimeInMinutes = hour * 60 + minute;
    const minutesUntil = aptTimeInMinutes - currentTimeInMinutes;

    return { ...next, minutesUntil };
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

  return (
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
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
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
                  <p className="text-3xl font-bold text-blue-900">{stats.pending}</p>
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
                  <p className="text-3xl font-bold text-red-900">{stats.cancelled}</p>
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
                    const config = statusConfig[appointment.status as keyof typeof statusConfig];
                    const StatusIcon = config?.icon;
                    
                    return (
                      <TableRow key={appointment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{appointment.time}</TableCell>
                        <TableCell>{appointment.patient}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{appointment.reason}</TableCell>
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Próxima cita */}
        <div className="space-y-6">
          {nextAppointment ? (
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
                    <p className="text-sm opacity-90 mb-1">En {nextAppointment.minutesUntil} minutos</p>
                    <p className="text-2xl font-bold">{nextAppointment.time}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Paciente</p>
                    <p className="font-semibold">{nextAppointment.patient}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Motivo</p>
                    <p>{nextAppointment.reason}</p>
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
  );
}
