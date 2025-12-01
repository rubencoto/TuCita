import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  CalendarRange,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { DoctorLayout } from '@/components/layout/doctor/DoctorLayout';
import { WeeklyScheduleBuilder } from '@/components/doctor/weekly-schedule-builder';
import * as availabilityService from '@/services/api/doctor/doctorAvailabilityService';
import type { DoctorSlot, SlotTipo, SlotEstado, WeeklyTimeSlot } from '@/services/api/doctor/doctorAvailabilityService';

interface DoctorAvailabilityPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DoctorAvailabilityPage({ onNavigate, onLogout }: DoctorAvailabilityPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<DoctorSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newSlot, setNewSlot] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '09:00',
    horaFin: '10:00',
    tipo: 'PRESENCIAL' as SlotTipo,
    estado: 'DISPONIBLE' as SlotEstado,
  });

  const [slots, setSlots] = useState<DoctorSlot[]>([]);

  // Cargar slots al montar el componente
  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const data = await availabilityService.getSlots('DOC-001');
      setSlots(data);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast.error('Error al cargar los horarios');
    } finally {
      setLoading(false);
    }
  };

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return slots.filter(slot => slot.fecha === dateStr)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  };

  const handleCreateSlot = async () => {
    try {
      setSubmitting(true);
      const created = await availabilityService.createSlot({
        doctorId: 'DOC-001',
        ...newSlot,
      });
      
      setSlots([...slots, created]);
      toast.success('Horario creado correctamente');
      setShowCreateDialog(false);
      resetNewSlot();
    } catch (error: any) {
      console.error('Error creating slot:', error);
      toast.error(error.message || 'Error al crear el horario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;
    
    try {
      setSubmitting(true);
      const updated = await availabilityService.updateSlot(editingSlot.idSlot, {
        horaInicio: editingSlot.horaInicio,
        horaFin: editingSlot.horaFin,
        tipo: editingSlot.tipo,
        estado: editingSlot.estado,
      });

      setSlots(slots.map(s => 
        s.idSlot === updated.idSlot ? updated : s
      ));
      toast.success('Horario actualizado correctamente');
      setEditingSlot(null);
    } catch (error: any) {
      console.error('Error updating slot:', error);
      toast.error(error.message || 'Error al actualizar el horario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      await availabilityService.deleteSlot(slotId);
      setSlots(slots.filter(s => s.idSlot !== slotId));
      toast.success('Horario eliminado correctamente');
    } catch (error: any) {
      console.error('Error deleting slot:', error);
      toast.error(error.message || 'Error al eliminar el horario');
    }
  };

  const resetNewSlot = () => {
    setNewSlot({
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFin: '10:00',
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
        const hour = h < 10 ? '0' + h : '' + h;
        const minute = m < 10 ? '0' + m : '' + m;
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  if (loading) {
    return (
      <DoctorLayout 
        currentPage="doctor-availability" 
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#2E8BC0]" />
        </div>
      </DoctorLayout>
    );
  }

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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-[#2E8BC0] text-[#2E8BC0]"
                onClick={() => onNavigate('doctor-schedule-config')}
              >
                <CalendarRange className="h-4 w-4 mr-2" />
                Horario Mensual
              </Button>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2E8BC0]">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Horario Individual
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
                        onChange={(e: any) => setNewSlot({ ...newSlot, fecha: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hora_inicio">Hora inicio</Label>
                        <Select
                          value={newSlot.horaInicio}
                          onValueChange={(value: string) => setNewSlot({ ...newSlot, horaInicio: value })}
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
                          value={newSlot.horaFin}
                          onValueChange={(value: string) => setNewSlot({ ...newSlot, horaFin: value })}
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
                        onValueChange={(value: SlotTipo) => setNewSlot({ ...newSlot, tipo: value })}
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
                        onValueChange={(value: SlotEstado) => setNewSlot({ ...newSlot, estado: value })}
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
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={submitting}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateSlot} className="bg-[#2E8BC0]" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        'Crear horario'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
                onSelect={(date: any) => date && setSelectedDate(date)}
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
                    
                    // Safety check: skip slot if config is missing
                    if (!estadoInfo || !tipoInfo) {
                      console.warn('Missing config for slot:', slot);
                      return null;
                    }
                    
                    const TipoIcon = tipoInfo.icon;
                    const EstadoIcon = estadoInfo.icon;

                    return (
                      <Card key={slot.idSlot} className="border-l-4" style={{ borderLeftColor: slot.estado === 'DISPONIBLE' ? '#10b981' : slot.estado === 'BLOQUEADO' ? '#ef4444' : '#9ca3af' }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="bg-[#2E8BC0]/10 p-3 rounded-lg">
                                <Clock className="h-5 w-5 text-[#2E8BC0]" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <p className="font-semibold text-lg">
                                    {slot.horaInicio} - {slot.horaFin}
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
                                                value={editingSlot.horaInicio}
                                                onValueChange={(value: string) => setEditingSlot({ ...editingSlot, horaInicio: value })}
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
                                                value={editingSlot.horaFin}
                                                onValueChange={(value: string) => setEditingSlot({ ...editingSlot, horaFin: value })}
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
                                              onValueChange={(value: SlotTipo) => setEditingSlot({ ...editingSlot, tipo: value })}
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
                                              onValueChange={(value: SlotEstado) => setEditingSlot({ ...editingSlot, estado: value })}
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
                                        <Button variant="outline" onClick={() => setEditingSlot(null)} disabled={submitting}>
                                          Cancelar
                                        </Button>
                                        <Button onClick={handleUpdateSlot} className="bg-[#2E8BC0]" disabled={submitting}>
                                          {submitting ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Actualizando...
                                            </>
                                          ) : (
                                            'Guardar cambios'
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteSlot(slot.idSlot)}
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
