import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Calendar } from '../ui/calendar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Video,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { DoctorLayout } from '../doctor/DoctorLayout';

interface Slot {
  id_slot: number;
  doctor_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: 'PRESENCIAL' | 'TELECONSULTA';
  estado: 'DISPONIBLE' | 'BLOQUEADO' | 'OCUPADO';
}

interface DoctorAvailabilityPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DoctorAvailabilityPage({ onNavigate, onLogout }: DoctorAvailabilityPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  const [newSlot, setNewSlot] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '10:00',
    tipo: 'PRESENCIAL' as 'PRESENCIAL' | 'TELECONSULTA',
    estado: 'DISPONIBLE' as 'DISPONIBLE' | 'BLOQUEADO',
  });

  // Mock data - slots de disponibilidad
  const [slots, setSlots] = useState<Slot[]>([
    {
      id_slot: 1,
      doctor_id: 'DOC-001',
      fecha: '2025-11-08',
      hora_inicio: '09:00',
      hora_fin: '10:00',
      tipo: 'PRESENCIAL',
      estado: 'DISPONIBLE',
    },
    {
      id_slot: 2,
      doctor_id: 'DOC-001',
      fecha: '2025-11-08',
      hora_inicio: '10:00',
      hora_fin: '11:00',
      tipo: 'PRESENCIAL',
      estado: 'OCUPADO',
    },
    {
      id_slot: 3,
      doctor_id: 'DOC-001',
      fecha: '2025-11-08',
      hora_inicio: '11:00',
      hora_fin: '12:00',
      tipo: 'TELECONSULTA',
      estado: 'DISPONIBLE',
    },
    {
      id_slot: 4,
      doctor_id: 'DOC-001',
      fecha: '2025-11-08',
      hora_inicio: '16:00',
      hora_fin: '17:00',
      tipo: 'PRESENCIAL',
      estado: 'BLOQUEADO',
    },
    {
      id_slot: 5,
      doctor_id: 'DOC-001',
      fecha: '2025-11-09',
      hora_inicio: '09:00',
      hora_fin: '10:00',
      tipo: 'TELECONSULTA',
      estado: 'DISPONIBLE',
    },
  ]);

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return slots.filter(slot => slot.fecha === dateStr)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  };

  const handleCreateSlot = () => {
    const newId = Math.max(...slots.map(s => s.id_slot), 0) + 1;
    const slot: Slot = {
      id_slot: newId,
      doctor_id: 'DOC-001',
      ...newSlot,
    };
    setSlots([...slots, slot]);
    toast.success('Horario creado correctamente');
    setShowCreateDialog(false);
    resetNewSlot();
  };

  const handleUpdateSlot = () => {
    if (!editingSlot) return;
    
    setSlots(slots.map(s => 
      s.id_slot === editingSlot.id_slot ? editingSlot : s
    ));
    toast.success('Horario actualizado correctamente');
    setEditingSlot(null);
  };

  const handleDeleteSlot = (slotId: number) => {
    setSlots(slots.filter(s => s.id_slot !== slotId));
    toast.success('Horario eliminado correctamente');
  };

  const resetNewSlot = () => {
    setNewSlot({
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '09:00',
      hora_fin: '10:00',
      tipo: 'PRESENCIAL',
      estado: 'DISPONIBLE',
    });
  };

  const estadoConfig = {
    DISPONIBLE: {
      label: 'Disponible',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
    },
    BLOQUEADO: {
      label: 'Bloqueado',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
    },
    OCUPADO: {
      label: 'Ocupado',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Clock,
    },
  };

  const tipoConfig = {
    PRESENCIAL: {
      label: 'Presencial',
      icon: MapPin,
      color: 'text-blue-600',
    },
    TELECONSULTA: {
      label: 'Teleconsulta',
      icon: Video,
      color: 'text-purple-600',
    },
  };

  const daySlots = getSlotsForDate(selectedDate);

  // Generar opciones de tiempo
  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <DoctorLayout 
      currentPage="doctor-availability" 
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Disponibilidad
              </h1>
              <p className="text-gray-600">
                Configura tus horarios disponibles para citas
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#2E8BC0]">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Disponibilidad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear nuevo horario</DialogTitle>
                  <DialogDescription>
                    Define un nuevo slot de disponibilidad
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={newSlot.fecha}
                      onChange={(e) => setNewSlot({ ...newSlot, fecha: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hora_inicio">Hora inicio</Label>
                      <Select
                        value={newSlot.hora_inicio}
                        onValueChange={(value) => setNewSlot({ ...newSlot, hora_inicio: value })}
                      >
                        <SelectTrigger id="hora_inicio">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hora_fin">Hora fin</Label>
                      <Select
                        value={newSlot.hora_fin}
                        onValueChange={(value) => setNewSlot({ ...newSlot, hora_fin: value })}
                      >
                        <SelectTrigger id="hora_fin">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo de consulta</Label>
                    <Select
                      value={newSlot.tipo}
                      onValueChange={(value: any) => setNewSlot({ ...newSlot, tipo: value })}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                        <SelectItem value="TELECONSULTA">Teleconsulta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={newSlot.estado}
                      onValueChange={(value: any) => setNewSlot({ ...newSlot, estado: value })}
                    >
                      <SelectTrigger id="estado">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                        <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSlot} className="bg-[#2E8BC0]">
                    Crear horario
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Seleccionar fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Disponible</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {slots.filter(s => s.estado === 'DISPONIBLE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Bloqueado</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {slots.filter(s => s.estado === 'BLOQUEADO').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Ocupado</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {slots.filter(s => s.estado === 'OCUPADO').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de slots del día */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Horarios del {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {daySlots.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">No hay horarios configurados</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Agrega disponibilidad para este día
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setNewSlot({ ...newSlot, fecha: selectedDate.toISOString().split('T')[0] });
                      setShowCreateDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar horario
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {daySlots.map((slot) => {
                    const estadoInfo = estadoConfig[slot.estado];
                    const tipoInfo = tipoConfig[slot.tipo];
                    const TipoIcon = tipoInfo.icon;
                    const EstadoIcon = estadoInfo.icon;

                    return (
                      <Card key={slot.id_slot} className="border-l-4" style={{ borderLeftColor: slot.estado === 'DISPONIBLE' ? '#10b981' : slot.estado === 'BLOQUEADO' ? '#ef4444' : '#9ca3af' }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="bg-[#2E8BC0]/10 p-3 rounded-lg">
                                <Clock className="h-5 w-5 text-[#2E8BC0]" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <p className="font-semibold text-lg">
                                    {slot.hora_inicio} - {slot.hora_fin}
                                  </p>
                                  <Badge className={estadoInfo.color}>
                                    <EstadoIcon className="h-3 w-3 mr-1" />
                                    {estadoInfo.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <TipoIcon className={`h-4 w-4 ${tipoInfo.color}`} />
                                  <span>{tipoInfo.label}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {slot.estado !== 'OCUPADO' && (
                                <>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingSlot(slot)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Editar horario</DialogTitle>
                                      </DialogHeader>
                                      {editingSlot && (
                                        <div className="space-y-4 py-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label>Hora inicio</Label>
                                              <Select
                                                value={editingSlot.hora_inicio}
                                                onValueChange={(value) => setEditingSlot({ ...editingSlot, hora_inicio: value })}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {timeOptions.map(time => (
                                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label>Hora fin</Label>
                                              <Select
                                                value={editingSlot.hora_fin}
                                                onValueChange={(value) => setEditingSlot({ ...editingSlot, hora_fin: value })}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {timeOptions.map(time => (
                                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          <div>
                                            <Label>Tipo</Label>
                                            <Select
                                              value={editingSlot.tipo}
                                              onValueChange={(value: any) => setEditingSlot({ ...editingSlot, tipo: value })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                                                <SelectItem value="TELECONSULTA">Teleconsulta</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <Label>Estado</Label>
                                            <Select
                                              value={editingSlot.estado}
                                              onValueChange={(value: any) => setEditingSlot({ ...editingSlot, estado: value })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                                                <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      )}
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditingSlot(null)}>
                                          Cancelar
                                        </Button>
                                        <Button onClick={handleUpdateSlot} className="bg-[#2E8BC0]">
                                          Guardar cambios
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteSlot(slot.id_slot)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
}
