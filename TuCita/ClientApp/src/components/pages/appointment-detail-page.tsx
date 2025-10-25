import { useState } from 'react';
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

interface AppointmentDetailPageProps {
  appointment: any;
  onNavigate: (page: string, data?: any) => void;
}

export function AppointmentDetailPage({ appointment, onNavigate }: AppointmentDetailPageProps) {
  const [activeTab, setActiveTab] = useState('diagnostics');

  // Mock data clínica para la cita
  const clinicalData = {
    diagnostics: [
      {
        id: '1',
        code: 'J06.9',
        description: 'Infección aguda de las vías respiratorias superiores',
        date: appointment.date,
        severity: 'Leve',
      },
      {
        id: '2',
        code: 'R50.9',
        description: 'Fiebre no especificada',
        date: appointment.date,
        severity: 'Moderado',
      },
    ],
    clinicalNotes: [
      {
        id: '1',
        timestamp: `${appointment.date} - ${appointment.time}`,
        note: 'Paciente acude por cuadro de 3 días de evolución caracterizado por fiebre de 38.5°C, dolor de garganta y congestión nasal. Niega otros síntomas. Sin antecedentes de alergias medicamentosas.',
        author: appointment.doctorName,
      },
      {
        id: '2',
        timestamp: `${appointment.date} - ${appointment.time}`,
        note: 'Exploración física: TA 120/80, FC 78 lpm, Temp 37.8°C. Faringe eritematosa sin exudado. Adenopatías cervicales pequeñas bilaterales. Auscultación pulmonar sin alteraciones.',
        author: appointment.doctorName,
      },
      {
        id: '3',
        timestamp: `${appointment.date} - ${appointment.time}`,
        note: 'Plan: Se indica tratamiento sintomático. Reposo relativo. Abundantes líquidos. Control en 5 días o antes si presenta datos de alarma.',
        author: appointment.doctorName,
      },
    ],
    prescriptions: [
      {
        id: '1',
        medication: 'Paracetamol',
        dose: '500 mg',
        frequency: 'Cada 8 horas',
        duration: '5 días',
        notes: 'Tomar después de los alimentos',
      },
      {
        id: '2',
        medication: 'Loratadina',
        dose: '10 mg',
        frequency: 'Cada 24 horas',
        duration: '7 días',
        notes: 'Tomar en las mañanas',
      },
      {
        id: '3',
        medication: 'Ambroxol',
        dose: '30 mg',
        frequency: 'Cada 12 horas',
        duration: '5 días',
        notes: 'Tomar con abundante agua',
      },
    ],
    documents: [
      {
        id: '1',
        name: 'Receta Médica',
        type: 'PDF',
        size: '245 KB',
        date: appointment.date,
      },
      {
        id: '2',
        name: 'Resultados de Laboratorio',
        type: 'PDF',
        size: '1.2 MB',
        date: appointment.date,
      },
      {
        id: '3',
        name: 'Orden de Estudios',
        type: 'PDF',
        size: '180 KB',
        date: appointment.date,
      },
    ],
  };

  const statusConfig = {
    completed: { label: 'Atendida', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  };

  const severityColors = {
    Leve: 'bg-green-100 text-green-800',
    Moderado: 'bg-yellow-100 text-yellow-800',
    Severo: 'bg-red-100 text-red-800',
  };

  const EmptySection = ({ message }: { message: string }) => (
    <div className="text-center py-8">
      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

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
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Información del doctor y cita */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <ImageWithFallback
                    src={appointment.doctorImage}
                    alt={appointment.doctorName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Dr. {appointment.doctorName}
                    </h2>
                    <p className="text-muted-foreground">
                      {appointment.doctorSpecialty}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="font-medium text-foreground">{appointment.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hora</p>
                      <p className="font-medium text-foreground">{appointment.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ubicación</p>
                      <p className="font-medium text-foreground">{appointment.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge className={statusConfig[appointment.status as keyof typeof statusConfig]?.color}>
                        {statusConfig[appointment.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 lg:min-w-[180px]">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar resumen
                </Button>
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
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Notas Clínicas</span>
                  <span className="sm:hidden">Notas</span>
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  <span className="hidden sm:inline">Recetas</span>
                  <span className="sm:hidden">Recetas</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="hidden sm:inline">Documentos</span>
                  <span className="sm:hidden">Docs</span>
                </TabsTrigger>
              </TabsList>

              {/* Diagnósticos */}
              <TabsContent value="diagnostics" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">Diagnósticos Registrados</h3>
                </div>
                
                {appointment.status === 'completed' && clinicalData.diagnostics.length > 0 ? (
                  <div className="space-y-3">
                    {clinicalData.diagnostics.map((diagnosis) => (
                      <Card key={diagnosis.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{diagnosis.code}</Badge>
                                <Badge className={severityColors[diagnosis.severity as keyof typeof severityColors]}>
                                  {diagnosis.severity}
                                </Badge>
                              </div>
                              <p className="font-medium text-foreground">{diagnosis.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Registrado: {diagnosis.date}
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

                {appointment.status === 'completed' && clinicalData.clinicalNotes.length > 0 ? (
                  <div className="space-y-4">
                    {clinicalData.clinicalNotes.map((note, index) => (
                      <div key={note.id} className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0">
                        <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-muted-foreground">{note.timestamp}</p>
                              <p className="text-sm font-medium text-primary">Dr. {note.author}</p>
                            </div>
                            <p className="text-foreground leading-relaxed">{note.note}</p>
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

                {appointment.status === 'completed' && clinicalData.prescriptions.length > 0 ? (
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
                        {clinicalData.prescriptions.map((prescription) => (
                          <tr key={prescription.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium text-foreground">{prescription.medication}</td>
                            <td className="py-3 px-4 text-foreground">{prescription.dose}</td>
                            <td className="py-3 px-4 text-foreground">{prescription.frequency}</td>
                            <td className="py-3 px-4 text-foreground">{prescription.duration}</td>
                            <td className="py-3 px-4 text-muted-foreground text-sm">{prescription.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

                {appointment.status === 'completed' && clinicalData.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clinicalData.documents.map((document) => (
                      <Card key={document.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 rounded-lg p-3">
                              <File className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{document.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {document.type} • {document.size}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{document.date}</p>
                            </div>
                            <Button size="sm" variant="ghost">
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
