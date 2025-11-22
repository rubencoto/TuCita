import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Pill,
  Download,
  Printer,
  File,
  ClipboardList,
  Stethoscope,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { toast } from 'sonner';
import medicalHistoryService, { CitaDetalleDto } from '../../services/medicalHistoryService';

interface AppointmentDetailPageProps {
  appointment: any;
  onNavigate: (page: string, data?: any) => void;
}

export function AppointmentDetailPage({ appointment, onNavigate }: AppointmentDetailPageProps) {
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [citaDetalle, setCitaDetalle] = useState<CitaDetalleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar detalles de la cita al montar el componente
  useEffect(() => {
    loadAppointmentDetail();
  }, [appointment?.id]);

  const loadAppointmentDetail = async () => {
    if (!appointment?.id) {
      setError('ID de cita no válido');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const appointmentId = typeof appointment.id === 'string' 
        ? parseInt(appointment.id) 
        : appointment.id;
        
      const detail = await medicalHistoryService.getAppointmentDetail(appointmentId);
      setCitaDetalle(detail);
    } catch (err: any) {
      console.error('Error al cargar detalle de cita:', err);
      setError(err.message || 'Error al cargar el detalle de la cita');
      toast.error('Error al cargar el detalle de la cita');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    ATENDIDA: { label: 'Atendida', color: 'bg-green-100 text-green-800' },
    CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMADA: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Atendida', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  };

  const EmptySection = ({ message }: { message: string }) => (
    <div className="text-center py-8">
      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground">Cargando detalles de la cita...</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Error al cargar la cita
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => onNavigate('medical-history')} variant="outline">
            Volver al historial
          </Button>
          <Button onClick={loadAppointmentDetail}>
            Reintentar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('medical-history')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al historial
          </Button>
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error || !citaDetalle) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('medical-history')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al historial
          </Button>
          <ErrorState />
        </div>
      </div>
    );
  }

  const formattedDate = medicalHistoryService.formatDate(citaDetalle.inicio);
  const formattedTime = new Date(citaDetalle.inicio).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => onNavigate('appointments')}
                  className="cursor-pointer hover:text-primary"
                >
                  Mis Citas
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => onNavigate('medical-history')}
                  className="cursor-pointer hover:text-primary"
                >
                  Historial Médico
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detalle de Cita</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header con botón volver */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate('medical-history')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al historial
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Detalle de Cita Médica
          </h1>
        </div>

        {/* Información principal de la cita */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:items-start lg:justify-between gap-6">
              {/* Información del doctor y cita */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                    <span className="text-2xl font-semibold text-primary">
                      {citaDetalle.nombreMedico.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {citaDetalle.nombreMedico}
                    </h2>
                    <p className="text-muted-foreground">
                      {citaDetalle.especialidad || 'Especialidad General'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="font-medium text-foreground">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hora</p>
                      <p className="font-medium text-foreground">{formattedTime}</p>
                    </div>
                  </div>

                  {citaDetalle.direccionMedico && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ubicación</p>
                        <p className="font-medium text-foreground">{citaDetalle.direccionMedico}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge className={statusConfig[citaDetalle.estado as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}>
                        {statusConfig[citaDetalle.estado as keyof typeof statusConfig]?.label || citaDetalle.estado}
                      </Badge>
                    </div>
                  </div>
                </div>

                {citaDetalle.motivo && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Motivo de la consulta</p>
                      <p className="text-foreground">{citaDetalle.motivo}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 lg:min-w-[180px]">
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pestañas de información clínica */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                <TabsTrigger value="diagnostics" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Diagnósticos</span>
                  <span className="sm:hidden">Diagn.</span>
                  {citaDetalle.diagnosticos.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {citaDetalle.diagnosticos.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Notas Clínicas</span>
                  <span className="sm:hidden">Notas</span>
                  {citaDetalle.notasClinicas.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {citaDetalle.notasClinicas.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  <span className="hidden sm:inline">Recetas</span>
                  <span className="sm:hidden">Recetas</span>
                  {citaDetalle.recetas.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {citaDetalle.recetas.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="hidden sm:inline">Documentos</span>
                  <span className="sm:hidden">Docs</span>
                  {citaDetalle.documentos.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {citaDetalle.documentos.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Diagnósticos */}
              <TabsContent value="diagnostics" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">Diagnósticos Registrados</h3>
                </div>
                
                {citaDetalle.diagnosticos.length > 0 ? (
                  <div className="space-y-3">
                    {citaDetalle.diagnosticos.map((diagnostico) => (
                      <Card key={diagnostico.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {diagnostico.codigo && (
                                  <Badge variant="outline">{diagnostico.codigo}</Badge>
                                )}
                              </div>
                              <p className="font-medium text-foreground">{diagnostico.descripcion}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Registrado: {medicalHistoryService.formatDateTime(diagnostico.fecha)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptySection message="No se registraron diagnósticos para esta cita" />
                )}
              </TabsContent>

              {/* Notas Clínicas */}
              <TabsContent value="notes" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">Notas y Observaciones</h3>
                </div>

                {citaDetalle.notasClinicas.length > 0 ? (
                  <div className="space-y-4">
                    {citaDetalle.notasClinicas.map((nota, index) => (
                      <div key={nota.id} className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0">
                        <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-muted-foreground">
                                {medicalHistoryService.formatDateTime(nota.fecha)}
                              </p>
                              <p className="text-sm font-medium text-primary">{citaDetalle.nombreMedico}</p>
                            </div>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{nota.contenido}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptySection message="Aún no hay notas clínicas para esta cita" />
                )}
              </TabsContent>

              {/* Recetas */}
              <TabsContent value="prescriptions" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">Medicamentos Recetados</h3>
                </div>

                {citaDetalle.recetas.length > 0 ? (
                  <div className="space-y-4">
                    {citaDetalle.recetas.map((receta) => (
                      <Card key={receta.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Receta del {medicalHistoryService.formatDate(receta.fecha)}</CardTitle>
                          </div>
                          {receta.indicaciones && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Indicaciones:</span> {receta.indicaciones}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Medicamento</th>
                                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Dosis</th>
                                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Frecuencia</th>
                                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duración</th>
                                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Notas</th>
                                </tr>
                              </thead>
                              <tbody>
                                {receta.medicamentos.map((med) => (
                                  <tr key={med.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="py-3 px-4 font-medium text-foreground">{med.medicamento}</td>
                                    <td className="py-3 px-4 text-foreground">{med.dosis || '-'}</td>
                                    <td className="py-3 px-4 text-foreground">{med.frecuencia || '-'}</td>
                                    <td className="py-3 px-4 text-foreground">{med.duracion || '-'}</td>
                                    <td className="py-3 px-4 text-muted-foreground text-sm">{med.notas || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptySection message="No se prescribieron medicamentos en esta cita" />
                )}
              </TabsContent>

              {/* Documentos */}
              <TabsContent value="documents" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">Documentos Adjuntos</h3>
                </div>

                {citaDetalle.documentos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {citaDetalle.documentos.map((documento) => (
                      <Card key={documento.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 rounded-lg p-3">
                              <File className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{documento.nombreArchivo}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {medicalHistoryService.getCategoryLabel(documento.categoria)}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                  {medicalHistoryService.formatFileSize(documento.tamanoBytes)}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {medicalHistoryService.formatDate(documento.fechaSubida)}
                              </p>
                              {documento.notas && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {documento.notas}
                                </p>
                              )}
                            </div>
                            <Button size="sm" variant="ghost" title="Descargar documento">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptySection message="No hay documentos adjuntos para esta cita" />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
