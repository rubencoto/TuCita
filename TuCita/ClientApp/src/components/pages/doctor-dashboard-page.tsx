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
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import appointmentsService from '../../services/appointmentsService';

interface TodayAppointment {
  id: number;
  time: string; // 'HH:mm'
  pacienteNombre: string;
  motivo?: string;
  estado: string; // normalized to upper case strings like 'CONFIRMADA'
}

interface DoctorDashboardPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function DoctorDashboardPage({ onNavigate }: DoctorDashboardPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(60); // seconds
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      loadTodayAppointments();
    }, Math.max(5, refreshInterval) * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval]);

  const loadTodayAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.getTodayForDoctor();
      const mapped: TodayAppointment[] = (data || []).map((apt: any) => {
        const inicio = apt.inicio || apt.date || apt.fecha || apt.start || null;
        let time = '00:00';
        try {
          if (inicio) time = new Date(inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          else if (apt.time) time = apt.time;
        } catch {
          if (apt.time) time = apt.time;
        }

        return {
          id: Number(apt.id),
          time,
          pacienteNombre: apt.pacienteNombre || apt.patientName || (apt.paciente && apt.paciente.nombre) || 'N/D',
          motivo: apt.motivo || apt.reason || '',
          // keep raw estado/status for normalization later
          estado: (apt.estado || apt.status || 'PENDIENTE').toString().toUpperCase(),
        } as TodayAppointment;
      }).sort((a,b) => a.time.localeCompare(b.time));

      setTodayAppointments(mapped);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error al cargar citas del día:', err);
      setError(err?.message || 'Error al cargar citas del día');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: todayAppointments.length,
    completed: todayAppointments.filter(a => normalizeEstado(a.estado) === 'ATENDIDA').length,
    pending: todayAppointments.filter(a => normalizeEstado(a.estado) === 'PENDIENTE').length,
    cancelled: todayAppointments.filter(a => normalizeEstado(a.estado) === 'CANCELADA').length,
  };

  const getNextAppointment = () => {
    const now = new Date();
    const upcoming = todayAppointments.filter(apt => {
      const norm = normalizeEstado(apt.estado);
      if (norm === 'CANCELADA' || norm === 'ATENDIDA') return false;
      const [hh, mm] = apt.time.split(':').map(Number);
      if (isNaN(hh) || isNaN(mm)) return false;
      const aptDate = new Date(now);
      aptDate.setHours(hh, mm, 0, 0);
      return aptDate.getTime() > now.getTime();
    }).sort((a,b) => a.time.localeCompare(b.time));

    if (upcoming.length === 0) return null;
    const next = upcoming[0];
    const [hour, minute] = next.time.split(':').map(Number);
    const aptDate = new Date();
    aptDate.setHours(hour, minute, 0, 0);
    const minutesUntil = Math.max(0, Math.round((aptDate.getTime() - new Date().getTime()) / 60000));
    return { ...next, minutesUntil };
  };

  const nextAppointment = getNextAppointment();

  const statusConfig = {
    CONFIRMADA: {
      label: 'Confirmada',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    ATENDIDA: {
      label: 'Atendida',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    CANCELADA: {
      label: 'Cancelada',
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    PENDIENTE: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    REPROGRAMADA: {
      label: 'Reprogramada',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
  } as const;

  // attach icons to status config for rendering
  const statusMeta: Record<string, any> = {
    CONFIRMADA: { icon: CheckCircle2 },
    ATENDIDA: { icon: CheckCircle2 },
    CANCELADA: { icon: XCircle },
    PENDIENTE: { icon: AlertCircle },
    REPROGRAMADA: { icon: TrendingUp }
  };

  // Normalize estados that can come in Spanish or English into Spanish canonical values
  function normalizeEstado(raw: string | undefined | null) {
    if (!raw) return 'PENDIENTE';
    const r = raw.toString().trim().toUpperCase ? raw.toString().toUpperCase() : String(raw).toUpperCase();
    switch (r) {
      case 'PENDING':
      case 'PENDIENTE':
        return 'PENDIENTE';
      case 'CONFIRMED':
      case 'CONFIRMADA':
      case 'CONFIRMADO':
        return 'CONFIRMADA';
      case 'CANCELLED':
      case 'CANCELADA':
      case 'CANCELADO':
        return 'CANCELADA';
      case 'COMPLETED':
      case 'ATENDIDA':
      case 'ATENDIDO':
        return 'ATENDIDA';
      case 'RESCHEDULED':
      case 'REPROGRAMADA':
        return 'REPROGRAMADA';
      default:
        return r;
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('doctor-auth')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>

            <div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel del Médico</h1>
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
                  {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                 </span>
               </div>
             </div>
           </div>
         </div>
       </div>

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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#2E8BC0]" />
                  Citas de hoy
                </CardTitle>
                {lastUpdated && (
                  <span className="text-sm text-muted-foreground ml-4">Última actualización: {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={loadTodayAppointments}>
                  <svg className={`animate-${loading ? 'spin' : ''} h-4 w-4 mr-2`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-3.22-6.72"></path><path d="M21 3v6h-6"></path></svg>
                  Refrescar
                </Button>
                <Button size="sm" variant={autoRefresh ? 'default' : 'outline'} onClick={() => setAutoRefresh(prev => !prev)}>
                  {autoRefresh ? 'Auto ON' : 'Auto OFF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="text-sm text-destructive mb-4">{error}</div>
              )}

              <div className="overflow-x-auto">
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center">Cargando...</TableCell>
                      </TableRow>
                    ) : todayAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center">No hay citas para hoy</TableCell>
                      </TableRow>
                    ) : (
                      todayAppointments.map((appointment) => {
                        const norm = normalizeEstado(appointment.estado);
                        const config = statusConfig[norm as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800' } as any;
                        const meta = statusMeta[norm] || {};
                        const Icon = meta.icon;
                        return (
                          <TableRow key={appointment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{appointment.time}</TableCell>
                            <TableCell>{appointment.pacienteNombre}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{appointment.motivo || '-'}</TableCell>
                            <TableCell>
                              <Badge className={`${config.color} border flex items-center gap-2`}> {Icon && <Icon className="h-4 w-4" />} {config.label || norm}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onNavigate?.('doctor-appointment-detail', { appointmentId: appointment.id })}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <p className="font-semibold">{nextAppointment.pacienteNombre}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Motivo</p>
                    <p>{nextAppointment.motivo}</p>
                  </div>
                  <Button 
                    className="w-full bg-white text-[#2E8BC0] hover:bg-gray-100"
                    onClick={() => onNavigate?.('doctor-appointment-detail', { appointmentId: nextAppointment.id })}
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
                <p className="font-semibold text-gray-900 mb-1">No hay más citas pendientes</p>
                <p className="text-sm text-gray-600">Has completado tu agenda del día</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate?.('doctor-appointments')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Ver todas las citas
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate?.('doctor-availability')}
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
