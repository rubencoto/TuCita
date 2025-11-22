import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Search,
  Eye,
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  UserX,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import doctorAppointmentsService, { DoctorAppointment, DoctorPatient } from '../../services/doctorAppointmentsService';
import { DoctorLayout } from '../doctor/DoctorLayout';

interface DoctorAppointmentsPageProps {
  onNavigate: (page: string, data?: any) => void;
  onLogout: () => void;
}

export function DoctorAppointmentsPage({ onNavigate, onLogout }: DoctorAppointmentsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    pacienteId: 0,
    fecha: '',
    hora: '',
    motivo: '',
    observaciones: '',
    estado: 'PENDIENTE',
  });

  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [pacientes, setPacientes] = useState<DoctorPatient[]>([]);

  // Cargar citas y pacientes al montar el componente
  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  // Recargar citas cuando cambian los filtros de fecha o estado
  useEffect(() => {
    loadAppointments();
  }, [filterDate, filterStatus]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const fechaInicio = filterDate || undefined;
      const fechaFin = filterDate || undefined;
      const estado = filterStatus !== 'all' ? filterStatus : undefined;

      const data = await doctorAppointmentsService.getDoctorAppointments(
        fechaInicio,
        fechaFin,
        estado
      );

      setAppointments(data);
    } catch (error: any) {
      console.error('Error al cargar citas:', error);
      toast.error('Error al cargar las citas', {
        description: error.message || 'No se pudieron cargar las citas'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await doctorAppointmentsService.getDoctorPatients();
      setPacientes(data);
    } catch (error: any) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar pacientes', {
        description: error.message || 'No se pudieron cargar los pacientes'
      });
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    // Filtro por búsqueda (en memoria, ya que el backend filtra por fecha y estado)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!apt.paciente.nombre.toLowerCase().includes(searchLower) &&
          !apt.motivo?.toLowerCase().includes(searchLower) &&
          !apt.id.toString().includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  const statusConfig = {
    CONFIRMADA: { 
      label: 'Confirmada', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle2
    },
    ATENDIDA: { 
      label: 'Atendida', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2
    },
    EN_PROGRESO: { 
      label: 'En progreso', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Activity
    },
    CANCELADA: { 
      label: 'Cancelada', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle
    },
    PENDIENTE: { 
      label: 'Pendiente', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertCircle
    },
    RECHAZADA: { 
      label: 'Rechazada', 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: XCircle
    },
    NO_ATENDIDA: { 
      label: 'No asistió', 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: UserX
    },
  };

  const handleCreateAppointment = async () => {
    // Validaciones
    if (!newAppointment.pacienteId || !newAppointment.fecha || !newAppointment.hora) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setCreating(true);

      const result = await doctorAppointmentsService.createDoctorAppointment({
        pacienteId: newAppointment.pacienteId,
        fecha: newAppointment.fecha,
        hora: newAppointment.hora,
        motivo: newAppointment.motivo || undefined,
        observaciones: newAppointment.observaciones || undefined,
        estado: newAppointment.estado
      });

      toast.success('Cita creada correctamente', {
        description: `Cita programada para ${result.paciente.nombre}`
      });

      // Limpiar formulario
      setNewAppointment({
        pacienteId: 0,
        fecha: '',
        hora: '',
        motivo: '',
        observaciones: '',
        estado: 'PENDIENTE',
      });

      setShowCreateDialog(false);

      // Recargar lista de citas
      await loadAppointments();
    } catch (error: any) {
      console.error('Error al crear cita:', error);
      toast.error('Error al crear la cita', {
        description: error.message || 'No se pudo crear la cita. Verifica que el horario está disponible.'
      });
    } finally {
      setCreating(false);
    }
  };

  const getTabCount = (status: string) => {
    if (status === 'all') return appointments.length;
    return appointments.filter(apt => apt.estado === status).length;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterStatus('all');
  };

  return (
    <DoctorLayout 
      currentPage="doctor-appointments" 
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Citas
              </h1>
              <p className="text-gray-600">
                Administra todas las citas médicas de tus pacientes
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#2E8BC0]">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Cita Manualmente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear nueva cita</DialogTitle>
                  <DialogDescription>
                    Programa una cita para uno de tus pacientes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paciente">Paciente *</Label>
                      <Select
                        value={newAppointment.pacienteId.toString()}
                        onValueChange={(value: string) => setNewAppointment({ ...newAppointment, pacienteId: parseInt(value) })}
                        disabled={creating || pacientes.length === 0}
                      >
                        <SelectTrigger id="paciente">
                          <SelectValue placeholder={pacientes.length === 0 ? "No hay pacientes disponibles" : "Seleccionar paciente"} />
                        </SelectTrigger>
                        <SelectContent>
                          {pacientes.map((pac) => (
                            <SelectItem key={pac.idPaciente} value={pac.idPaciente.toString()}>
                              {pac.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {pacientes.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          No tienes pacientes registrados aún
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado inicial</Label>
                      <Select
                        value={newAppointment.estado}
                        onValueChange={(value: string) => setNewAppointment({ ...newAppointment, estado: value })}
                        disabled={creating}
                      >
                        <SelectTrigger id="estado">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                          <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fecha">Fecha *</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={newAppointment.fecha}
                        onChange={(e) => setNewAppointment({ ...newAppointment, fecha: e.target.value })}
                        disabled={creating}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hora">Hora *</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={newAppointment.hora}
                        onChange={(e) => setNewAppointment({ ...newAppointment, hora: e.target.value })}
                        disabled={creating}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="motivo">Motivo de consulta</Label>
                    <Input
                      id="motivo"
                      placeholder="Ej: Consulta general, seguimiento, etc."
                      value={newAppointment.motivo}
                      onChange={(e) => setNewAppointment({ ...newAppointment, motivo: e.target.value })}
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="observaciones">Observaciones iniciales</Label>
                    <Textarea
                      id="observaciones"
                      placeholder="Información adicional sobre la cita"
                      value={newAppointment.observaciones}
                      onChange={(e) => setNewAppointment({ ...newAppointment, observaciones: e.target.value })}
                      rows={3}
                      disabled={creating}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    disabled={creating}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateAppointment} 
                    className="bg-[#2E8BC0]"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear cita'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por paciente, ID o motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                      <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                      <SelectItem value="EN_PROGRESO">En progreso</SelectItem>
                      <SelectItem value="ATENDIDA">Atendida</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                      <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                      <SelectItem value="NO_ATENDIDA">No asistió</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchTerm || filterDate || filterStatus !== 'all') && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={clearFilters}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs por estado */}
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="all" disabled={loading}>
              Todas
              <Badge variant="secondary" className="ml-2">{getTabCount('all')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="PENDIENTE" disabled={loading}>
              Pendientes
              <Badge variant="secondary" className="ml-2">{getTabCount('PENDIENTE')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CONFIRMADA" disabled={loading}>
              Confirmadas
              <Badge variant="secondary" className="ml-2">{getTabCount('CONFIRMADA')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="EN_PROGRESO" disabled={loading}>
              En Progreso
              <Badge variant="secondary" className="ml-2">{getTabCount('EN_PROGRESO')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ATENDIDA" disabled={loading}>
              Atendidas
              <Badge variant="secondary" className="ml-2">{getTabCount('ATENDIDA')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CANCELADA" disabled={loading}>
              Canceladas
              <Badge variant="secondary" className="ml-2">{getTabCount('CANCELADA')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="RECHAZADA" disabled={loading}>
              Rechazadas
              <Badge variant="secondary" className="ml-2">{getTabCount('RECHAZADA')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="NO_ATENDIDA" disabled={loading}>
              No Asistió
              <Badge variant="secondary" className="ml-2">{getTabCount('NO_ATENDIDA')}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tabla de citas */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#2E8BC0]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <CalendarIcon className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-600 mb-1">No se encontraron citas</p>
                          <p className="text-sm text-gray-500">
                            {searchTerm || filterDate || filterStatus !== 'all'
                              ? 'Intenta ajustar los filtros de búsqueda'
                              : 'Aún no tienes citas programadas'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((apt) => {
                      const config = statusConfig[apt.estado as keyof typeof statusConfig];
                      const StatusIcon = config?.icon;

                      return (
                        <TableRow key={apt.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm">#{apt.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <ImageWithFallback
                                src={apt.paciente.foto || ''}
                                alt={apt.paciente.nombre}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium">{apt.paciente.nombre}</p>
                                <p className="text-sm text-gray-500">
                                  {apt.paciente.edad ? `${apt.paciente.edad} años` : 'Edad no disponible'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {doctorAppointmentsService.formatDate(apt.fecha)}
                          </TableCell>
                          <TableCell>{apt.hora}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {apt.motivo || 'Sin motivo especificado'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config?.color} border`}>
                              {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                              {config?.label || apt.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onNavigate('doctor-appointment-detail', { appointmentId: apt.id })}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
