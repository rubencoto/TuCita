import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Eye, Loader2, MoreVertical, CheckCircle, XCircle, Clock, AlertCircle, Ban } from 'lucide-react';
import { Label } from '@/components/ui/label';
import adminCitasService, { AdminCitaList, CitasFilter, DoctorConEspecialidad } from '@/services/api/admin/adminCitasService';
import adminAuthService from '@/services/api/auth/adminAuthService';
import { toast } from 'sonner';
import { AdminCitasNueva } from './AdminCitasNueva';
import { AdminCitaDetalle } from './AdminCitaDetalle';

const statusColors: Record<string, string> = {
  PROGRAMADA: 'bg-blue-100 text-blue-800',
  CONFIRMADA: 'bg-blue-100 text-blue-800',
  ATENDIDA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-yellow-100 text-yellow-800',
  NO_SHOW: 'bg-red-100 text-red-800',
  RECHAZADA: 'bg-red-100 text-red-800',
  REPROGRAMADA: 'bg-purple-100 text-purple-800',
};

// configuración de acciones por estado
const statusActions = {
  PROGRAMADA: [
    { estado: 'CONFIRMADA', label: 'Confirmar', icon: CheckCircle, color: 'text-blue-600' },
    { estado: 'ATENDIDA', label: 'Marcar Atendida', icon: CheckCircle, color: 'text-green-600' },
    { estado: 'CANCELADA', label: 'Cancelar', icon: XCircle, color: 'text-yellow-600' },
    { estado: 'NO_SHOW', label: 'Marcar No Show', icon: AlertCircle, color: 'text-red-600' },
  ],
  CONFIRMADA: [
    { estado: 'ATENDIDA', label: 'Marcar Atendida', icon: CheckCircle, color: 'text-green-600' },
    { estado: 'CANCELADA', label: 'Cancelar', icon: XCircle, color: 'text-yellow-600' },
    { estado: 'NO_SHOW', label: 'Marcar No Show', icon: AlertCircle, color: 'text-red-600' },
  ],
  ATENDIDA: [],
  CANCELADA: [
    { estado: 'CONFIRMADA', label: 'Reactivar', icon: Clock, color: 'text-blue-600' },
  ],
  NO_SHOW: [
    { estado: 'CONFIRMADA', label: 'Reactivar', icon: Clock, color: 'text-blue-600' },
  ],
  RECHAZADA: [],
  REPROGRAMADA: [
    { estado: 'CONFIRMADA', label: 'Confirmar', icon: CheckCircle, color: 'text-blue-600' },
    { estado: 'CANCELADA', label: 'Cancelar', icon: XCircle, color: 'text-yellow-600' },
  ],
};

interface AdminCitasProps {
  onCreateNew?: () => void;
}

interface StatusUpdateDialog {
  isOpen: boolean;
  citaId: number | null;
  nuevoEstado: string | null;
  citaNombre: string;
}

interface DeleteDialog {
  isOpen: boolean;
  citaId: number | null;
  citaNombre: string;
}

// Extensión local para incluir quién agendó la cita
type AdminCitaListExtended = AdminCitaList & { agendadoPor?: string };

export function AdminCitas({ onCreateNew }: AdminCitasProps) {
  const [citas, setCitas] = useState<AdminCitaListExtended[]>([]);
  const [doctores, setDoctores] = useState<DoctorConEspecialidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterDoctor, setFilterDoctor] = useState('Todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedDay, setSelectedDay] = useState(''); // yyyy-MM-dd
  
  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const pageSize = 20;

  // Diálogos
  const [statusUpdateDialog, setStatusUpdateDialog] = useState<StatusUpdateDialog>({
    isOpen: false,
    citaId: null,
    nuevoEstado: null,
    citaNombre: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    isOpen: false,
    citaId: null,
    citaNombre: '',
  });
  const [notas, setNotas] = useState('');
  const [updating, setUpdating] = useState(false);

  // Nuevo estado para el modal de detalle
  const [detalleModal, setDetalleModal] = useState<{
    isOpen: boolean;
    citaId: number | null;
  }>({
    isOpen: false,
    citaId: null,
  });

  // Modal Nueva Cita
  const [showNuevaCitaModal, setShowNuevaCitaModal] = useState(false);

  // Cargar doctores al montar el componente
  useEffect(() => {
    loadDoctores();
  }, []);

  // Si se selecciona un día, sincronizar fechaDesde/fechaHasta para filtrar ese día
  useEffect(() => {
    if (selectedDay) {
      setFechaDesde(selectedDay);
      setFechaHasta(selectedDay);
      setCurrentPage(1);
    } else {
      setFechaDesde('');
      setFechaHasta('');
    }
  }, [selectedDay]);

  // Cargar citas cuando cambien los filtros
  useEffect(() => {
    loadCitas();
  }, [searchQuery, filterStatus, filterDoctor, fechaDesde, fechaHasta, currentPage]);

  const loadDoctores = async () => {
    try {
      // Verificar autenticación de admin antes de llamar al API
      if (!adminAuthService.isAuthenticated() || !adminAuthService.isAdminRole()) {
        console.warn('Acceso no autorizado a getDoctores: admin no autenticado');
        toast.error('Sesión de administrador no iniciada. Por favor inicia sesión.');
        return;
      }

      const data = await adminCitasService.getDoctores();
      setDoctores(data);
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      toast.error('Error al cargar la lista de doctores');
    }
  };

  const loadCitas = async () => {
    setLoading(true);
    try {
      // Verificar autenticación de admin antes de llamar al API
      if (!adminAuthService.isAuthenticated() || !adminAuthService.isAdminRole()) {
        console.warn('Acceso no autorizado a getCitasPaginadas: admin no autenticado');
        toast.error('Sesión de administrador no iniciada. Por favor inicia sesión.');
        setCitas([]);
        setLoading(false);
        return;
      }

      const filtros: CitasFilter = {
        pagina: currentPage,
        tamanoPagina: pageSize,
      };

      if (searchQuery.trim()) {
        filtros.busqueda = searchQuery.trim();
      }

      if (filterStatus !== 'Todos') {
        filtros.estado = filterStatus;
      }

      if (filterDoctor !== 'Todos') {
        filtros.medicoId = parseInt(filterDoctor);
      }

      if (fechaDesde) {
        filtros.fechaDesde = fechaDesde;
      }

      if (fechaHasta) {
        filtros.fechaHasta = fechaHasta;
      }

      const response = await adminCitasService.getCitasPaginadas(filtros);

      // Enriquecer con quien agendó la cita (si el endpoint de detalle lo provee)
      const enriched: AdminCitaListExtended[] = await Promise.all(
        response.citas.map(async (c) => {
          try {
            const detalle = await adminCitasService.getCitaDetalle(c.id);
            const detalleAny = detalle as any;
            const agendadoPor = detalleAny?.agendadoPor || detalleAny?.usuarioAgendo || (c.origen === 'ADMIN' ? 'Administrador' : c.paciente);
            return { ...c, agendadoPor } as AdminCitaListExtended;
          } catch (err) {
            const agendadoPor = c.origen === 'ADMIN' ? 'Administrador' : c.paciente;
            return { ...c, agendadoPor } as AdminCitaListExtended;
          }
        })
      );

      setCitas(enriched);
      setTotalPages(response.totalPaginas);
      setTotalRegistros(response.totalRegistros);
    } catch (error: any) {
      console.error('Error al cargar citas:', error);
      toast.error(error.message || 'Error al cargar las citas');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (citaId: number) => {
    // debug log to confirm click
    console.debug('handleViewDetails called for citaId=', citaId);
    setDetalleModal({
      isOpen: true,
      citaId,
    });
  };

  const handleDetalleClose = () => {
    console.debug('handleDetalleClose called');
    setDetalleModal({
      isOpen: false,
      citaId: null,
    });
  };

  const handleDetalleUpdateSuccess = () => {
    loadCitas(); // Recargar lista despuós de actualizar desde el detalle
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('Todos');
    setFilterDoctor('Todos');
    setFechaDesde('');
    setFechaHasta('');
    setSelectedDay('');
    setCurrentPage(1);
  };

  const openStatusUpdateDialog = (cita: AdminCitaList, nuevoEstado: string) => {
    setStatusUpdateDialog({
      isOpen: true,
      citaId: cita.id,
      nuevoEstado,
      citaNombre: `${cita.paciente} - ${cita.fechaStr} ${cita.hora}`,
    });
    setNotas('');
  };

  const openDeleteDialog = (cita: AdminCitaList) => {
    setDeleteDialog({
      isOpen: true,
      citaId: cita.id,
      citaNombre: `${cita.paciente} - ${cita.fechaStr} ${cita.hora}`,
    });
    setNotas('');
  };

  const handleOpenNuevaCita = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setShowNuevaCitaModal(true);
    }
  };

  const handleNuevaCitaSuccess = () => {
    loadCitas(); // Recargar lista de citas
  };

  const handleUpdateEstado = async () => {
    if (!statusUpdateDialog.citaId || !statusUpdateDialog.nuevoEstado) return;

    setUpdating(true);
    try {
      await adminCitasService.updateEstadoCita(statusUpdateDialog.citaId, {
        estado: statusUpdateDialog.nuevoEstado,
        notas: notas.trim() || undefined,
      });

      toast.success(`Estado actualizado a ${statusUpdateDialog.nuevoEstado}`);
      
      // Actualizar la cita en el estado local
      setCitas(prev => prev.map(cita => 
        cita.id === statusUpdateDialog.citaId 
          ? { ...cita, estado: statusUpdateDialog.nuevoEstado! }
          : cita
      ));

      setStatusUpdateDialog({ isOpen: false, citaId: null, nuevoEstado: null, citaNombre: '' });
      setNotas('');
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      toast.error(error.message || 'Error al actualizar el estado de la cita');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCita = async () => {
    if (!deleteDialog.citaId) return;

    setUpdating(true);
    try {
      await adminCitasService.deleteCita(deleteDialog.citaId);
      
      toast.success('Cita cancelada exitosamente');
      
      // Recargar las citas
      await loadCitas();

      setDeleteDialog({ isOpen: false, citaId: null, citaNombre: '' });
      setNotas('');
    } catch (error: any) {
      console.error('Error al cancelar cita:', error);
      toast.error(error.message || 'Error al cancelar la cita');
    } finally {
      setUpdating(false);
    }
  };

  const getAvailableActions = (estado: string) => {
    return statusActions[estado as keyof typeof statusActions] || [];
  };

  // Quick status counts for summary
  const counts = citas.reduce((acc, c) => {
    acc.total++;
    acc[c.estado] = (acc[c.estado] || 0) + 1;
    return acc;
  }, { total: 0 } as any);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Citas</h2>
          <p className="text-sm text-gray-500 mt-1">Selecciona un día para ver y administrar todas las citas.</p>
        </div>
        <Button
          onClick={handleOpenNuevaCita}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva cita
        </Button>
      </div>

      {/* Summary badges (compact) */}
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-gray-100 text-gray-800">Total: {counts.total}</Badge>
        <Badge className="bg-blue-50 text-blue-800">Programadas: {counts.PROGRAMADA || 0}</Badge>
        <Badge className="bg-blue-50 text-blue-800">Confirmadas: {counts.CONFIRMADA || 0}</Badge>
        <Badge className="bg-green-50 text-green-800">Atendidas: {counts.ATENDIDA || 0}</Badge>
        <Badge className="bg-yellow-50 text-yellow-800">Canceladas: {counts.CANCELADA || 0}</Badge>
        <Badge className="bg-red-50 text-red-800">No show: {counts.NO_SHOW || 0}</Badge>
      </div>

      {/* Filters - compact and clear (agregado selector de día) */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por paciente, ID o motivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="PROGRAMADA">Programada</SelectItem>
                  <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                  <SelectItem value="ATENDIDA">Atendida</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                  <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {doctores.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.nombreCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 md:col-span-4 mt-2">
              <Input type="date" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} title="Seleccionar día" />
              <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
              <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
              <Button variant="outline" onClick={handleResetFilters}>Limpiar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Mostrando {citas.length} de {totalRegistros} citas{ (searchQuery || filterStatus !== 'Todos' || filterDoctor !== 'Todos' || fechaDesde || fechaHasta) ? ' (filtradas)' : '' }
      </div>

      {/* Table - ahora incluye columna 'Agendó' y es totalmente manipulable via detalle/acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : citas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron citas</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Paciente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Doctor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Agendó</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita) => {
                    const availableActions = getAvailableActions(cita.estado);

                    return (
                      <tr key={cita.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-700">#{cita.id}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{cita.paciente}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{cita.doctor}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{cita.agendadoPor || (cita.origen === 'ADMIN' ? 'Administrador' : cita.paciente)}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{cita.fechaStr} • {cita.hora}</td>
                        <td className="py-4 px-4">
                          <Badge className={statusColors[cita.estado] || 'bg-gray-100 text-gray-800'}>
                            {cita.estado}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDetails(cita.id)}
                              title="Ver / Editar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Only the primary quick action shown */}
                            {availableActions.slice(0, 1).map((action) => {
                              const Icon = action.icon;
                              return (
                                <Button
                                  key={action.estado}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openStatusUpdateDialog(cita, action.estado)}
                                  title={action.label}
                                >
                                  <Icon className={`h-4 w-4 ${action.color}`} />
                                </Button>
                              );
                            })}

                            {/* Dropdown for remaining actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {availableActions.length > 0 ? (
                                  <>
                                    {availableActions.map((action) => {
                                      const Icon = action.icon;
                                      return (
                                        <DropdownMenuItem
                                          key={action.estado}
                                          onClick={() => openStatusUpdateDialog(cita, action.estado)}
                                        >
                                          <Icon className={`h-4 w-4 mr-2 ${action.color}`} />
                                          {action.label}
                                        </DropdownMenuItem>
                                      );
                                    })}
                                    <DropdownMenuSeparator />
                                  </>
                                ) : (
                                  <DropdownMenuItem disabled>
                                    <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                                    Sin acciones disponibles
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => openDeleteDialog(cita)}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Eliminar cita
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de actualización de Estado */}
      <AlertDialog open={statusUpdateDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setStatusUpdateDialog({ isOpen: false, citaId: null, nuevoEstado: null, citaNombre: '' });
          setNotas('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Actualizar Estado de Cita</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estós seguro de cambiar el estado a <strong>{statusUpdateDialog.nuevoEstado}</strong> para:
              <br />
              <span className="font-medium text-gray-900">{statusUpdateDialog.citaNombre}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Agrega notas sobre este cambio de estado..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateEstado}
              disabled={updating}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Eliminación */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog({ isOpen: false, citaId: null, citaNombre: '' });
          setNotas('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Cita</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estós seguro de eliminar permanentemente esta cita?
              <br />
              <span className="font-medium text-gray-900">{deleteDialog.citaNombre}</span>
              <br />
              <br />
              Esta acción no se puede deshacer y el turno se liberaró para otros pacientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="delete-notas">Motivo de Eliminación (opcional)</Label>
            <Textarea
              id="delete-notas"
              placeholder="Describe el motivo de la Eliminación..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCita}
              disabled={updating}
              className="bg-red-600 hover:bg-red-700"
            >             
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Nueva Cita */}
      <AdminCitasNueva
        isOpen={showNuevaCitaModal}
        onClose={() => setShowNuevaCitaModal(false)}
        onSuccess={handleNuevaCitaSuccess}
      />

      {/* Modal Detalle de Cita */}
      <AdminCitaDetalle
        isOpen={detalleModal.isOpen}
        onClose={handleDetalleClose}
        citaId={detalleModal.citaId}
        onUpdateSuccess={handleDetalleUpdateSuccess}
      />

      {/* Debug: show current detalleModal state when open (temporary, remove when fixed) */}
      {detalleModal.isOpen && (
        <div className="fixed bottom-4 right-4 z-50 rounded-md bg-black/70 text-white px-3 py-2 text-sm">
          Detalle abierta: {detalleModal.citaId}
        </div>
      )}

    </div>
  );
}
