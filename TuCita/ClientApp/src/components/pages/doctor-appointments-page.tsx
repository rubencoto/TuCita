import { useState } from 'react';
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
  UserX,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface DoctorAppointmentsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function DoctorAppointmentsPage({ onNavigate }: DoctorAppointmentsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    paciente_id: '',
    fecha: '',
    hora: '',
    motivo: '',
    observaciones: '',
    estado: 'PENDIENTE',
  });

  // Mock data - pacientes disponibles
  const pacientes = [
    { id_paciente: '1', nombre: 'Juan Pérez García', correo: 'juan@email.com' },
    { id_paciente: '2', nombre: 'María López Torres', correo: 'maria@email.com' },
    { id_paciente: '3', nombre: 'Carlos Rodríguez Sanz', correo: 'carlos@email.com' },
    { id_paciente: '4', nombre: 'Ana García Ruiz', correo: 'ana@email.com' },
  ];

  // Mock data - citas
  const [appointments] = useState([
    {
      id_cita: 1,
      paciente: { 
        id: '1', 
        nombre: 'Juan Pérez García', 
        edad: 45,
        foto: 'https://images.unsplash.com/photo-1598581681233-eee2272ddc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcGF0aWVudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MjYwNTI2NXww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      fecha: '2025-11-08',
      hora: '09:00',
      estado: 'CONFIRMADA',
      motivo: 'Consulta general',
      observaciones: 'Dolor de cabeza recurrente'
    },
    {
      id_cita: 2,
      paciente: { 
        id: '2', 
        nombre: 'María López Torres', 
        edad: 32,
        foto: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBwYXRpZW50JTIwbWVkaWNhbHxlbnwxfHx8fDE3NjI2MDUyNjV8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      fecha: '2025-11-08',
      hora: '10:30',
      estado: 'CONFIRMADA',
      motivo: 'Seguimiento de tratamiento',
      observaciones: 'Control post-operatorio'
    },
    {
      id_cita: 3,
      paciente: { 
        id: '3', 
        nombre: 'Carlos Rodríguez Sanz', 
        edad: 58,
        foto: 'https://images.unsplash.com/photo-1758691462321-9b6c98c40f7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwcGF0aWVudCUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzYyNjA1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      fecha: '2025-11-08',
      hora: '11:00',
      estado: 'ATENDIDA',
      motivo: 'Revisión de análisis',
      observaciones: 'Resultados de exámenes de sangre'
    },
    {
      id_cita: 4,
      paciente: { 
        id: '4', 
        nombre: 'Ana García Ruiz', 
        edad: 28,
        foto: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBwYXRpZW50JTIwbWVkaWNhbHxlbnwxfHx8fDE3NjI2MDUyNjV8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      fecha: '2025-11-09',
      hora: '12:00',
      estado: 'PENDIENTE',
      motivo: 'Primera consulta',
      observaciones: 'Paciente nuevo'
    },
    {
      id_cita: 5,
      paciente: { 
        id: '1', 
        nombre: 'Juan Pérez García', 
        edad: 45,
        foto: 'https://images.unsplash.com/photo-1598581681233-eee2272ddc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcGF0aWVudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MjYwNTI2NXww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      fecha: '2025-11-10',
      hora: '13:00',
      estado: 'CANCELADA',
      motivo: 'Control de presión',
      observaciones: 'Cancelada por el paciente'
    },
  ]);

  const filteredAppointments = appointments.filter(apt => {
    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!apt.paciente.nombre.toLowerCase().includes(searchLower) &&
          !apt.motivo.toLowerCase().includes(searchLower) &&
          !apt.id_cita.toString().includes(searchLower)) {
        return false;
      }
    }

    // Filtro por estado
    if (filterStatus !== 'all' && apt.estado !== filterStatus) {
      return false;
    }

    // Filtro por fecha
    if (filterDate && apt.fecha !== filterDate) {
      return false;
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
    NO_SHOW: { 
      label: 'No asistió', 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: UserX
    },
  };

  const handleCreateAppointment = () => {
    // Validaciones
    if (!newAppointment.paciente_id || !newAppointment.fecha || !newAppointment.hora) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Aquí iría la llamada al backend
    toast.success('Cita creada correctamente');
    setShowCreateDialog(false);
    setNewAppointment({
      paciente_id: '',
      fecha: '',
      hora: '',
      motivo: '',
      observaciones: '',
      estado: 'PENDIENTE',
    });
  };

  const getTabCount = (status: string) => {
    if (status === 'all') return appointments.length;
    return appointments.filter(apt => apt.estado === status).length;
  };

  return (
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
                      value={newAppointment.paciente_id}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, paciente_id: value })}
                    >
                      <SelectTrigger id="paciente">
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientes.map((pac) => (
                          <SelectItem key={pac.id_paciente} value={pac.id_paciente}>
                            {pac.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado inicial</Label>
                    <Select
                      value={newAppointment.estado}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, estado: value })}
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="hora">Hora *</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={newAppointment.hora}
                      onChange={(e) => setNewAppointment({ ...newAppointment, hora: e.target.value })}
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
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAppointment} className="bg-[#2E8BC0]">
                  Crear cita
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
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                    <SelectItem value="ATENDIDA">Atendida</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    <SelectItem value="NO_SHOW">No asistió</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || filterDate || filterStatus !== 'all') && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDate('');
                      setFilterStatus('all');
                    }}
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            Todas
            <Badge variant="secondary" className="ml-2">{getTabCount('all')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="PENDIENTE">
            Pendientes
            <Badge variant="secondary" className="ml-2">{getTabCount('PENDIENTE')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="CONFIRMADA">
            Confirmadas
            <Badge variant="secondary" className="ml-2">{getTabCount('CONFIRMADA')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ATENDIDA">
            Atendidas
            <Badge variant="secondary" className="ml-2">{getTabCount('ATENDIDA')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="CANCELADA">
            Canceladas
            <Badge variant="secondary" className="ml-2">{getTabCount('CANCELADA')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="NO_SHOW">
            No asistió
            <Badge variant="secondary" className="ml-2">{getTabCount('NO_SHOW')}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabla de citas */}
      <Card>
        <CardContent className="p-6">
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
                        Intenta ajustar los filtros de búsqueda
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => {
                  const config = statusConfig[apt.estado as keyof typeof statusConfig];
                  const StatusIcon = config?.icon;

                  return (
                    <TableRow key={apt.id_cita} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">#{apt.id_cita}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <ImageWithFallback
                            src={apt.paciente.foto}
                            alt={apt.paciente.nombre}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{apt.paciente.nombre}</p>
                            <p className="text-sm text-gray-500">{apt.paciente.edad} años</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(apt.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{apt.hora}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{apt.motivo}</TableCell>
                      <TableCell>
                        <Badge className={`${config?.color} border`}>
                          {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                          {config?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onNavigate('doctor-appointment-detail', { appointmentId: apt.id_cita })}
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
        </CardContent>
      </Card>
    </div>
  );
}
