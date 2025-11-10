import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserX,
  ClipboardList,
  Activity,
  Plus,
  History,
  Stethoscope,
  Pill,
  Upload,
  Eye,
  Download,
  Trash2,
  Tag,
  FileUp
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Alert, AlertDescription } from '../ui/alert';

interface DoctorAppointmentDetailPageProps {
  appointmentId: number;
  onNavigate: (page: string, data?: any) => void;
}

export function DoctorAppointmentDetailPage({ appointmentId, onNavigate }: DoctorAppointmentDetailPageProps) {
  const [activeTab, setActiveTab] = useState('appointment');
  const [historySubTab, setHistorySubTab] = useState('diagnosticos');
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);

  // Estados para formularios
  const [diagnosisForm, setDiagnosisForm] = useState({
    codigo: '',
    descripcion: '',
    severidad: 'LEVE'
  });

  const [noteForm, setNoteForm] = useState({
    contenido: ''
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    indicaciones: '',
    medicamentos: [] as Array<{
      medicamento: string;
      dosis: string;
      frecuencia: string;
      duracion: string;
      notas: string;
    }>
  });

  const [currentMedicamento, setCurrentMedicamento] = useState({
    medicamento: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    notas: ''
  });

  const [documentForm, setDocumentForm] = useState({
    categoria: 'LAB',
    notas: '',
    etiquetas: ''
  });

  // Mock data - cita actual
  const appointment = {
    id_cita: appointmentId,
    fecha: '2025-11-08',
    hora: '09:00',
    estado: 'CONFIRMADA',
    motivo: 'Consulta general',
    observaciones: 'Paciente refiere dolor de cabeza recurrente en las últimas 2 semanas',
    paciente: {
      id_paciente: '1',
      nombre: 'Juan Pérez García',
      correo: 'juan.perez@email.com',
      telefono: '+34 612 345 678',
      fecha_nacimiento: '1979-05-15',
      edad: 45,
      foto: 'https://images.unsplash.com/photo-1598581681233-eee2272ddc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcGF0aWVudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MjYwNTI2NXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    tipo: 'PRESENCIAL',
    ubicacion: 'Consultorio 3B, Edificio Médico Central',
  };

  // Mock data - Diagnósticos
  const mockDiagnostics = [
    {
      id: 1,
      codigo: 'J06.9',
      descripcion: 'Infección aguda de las vías respiratorias superiores',
      severidad: 'LEVE',
      fecha: '2024-09-25',
      doctor: 'Dra. Ana Martínez'
    },
    {
      id: 2,
      codigo: 'R50.9',
      descripcion: 'Fiebre no especificada',
      severidad: 'MODERADA',
      fecha: '2024-09-25',
      doctor: 'Dra. Ana Martínez'
    }
  ];

  // Mock data - Notas Clínicas
  const mockNotes = [
    {
      id: 1,
      contenido: 'Paciente acude por cuadro de 3 días de evolución caracterizado por fiebre de 38.5°C, dolor de garganta y congestión nasal. Niega otros síntomas. Sin antecedentes de alergias medicamentosas.',
      fecha: '2024-09-25',
      hora: '09:00',
      doctor: 'Dra. Ana Martínez'
    },
    {
      id: 2,
      contenido: 'Exploración física: TA 120/80, FC 78 lpm, Temp 37.8°C. Faringe eritematosa sin exudado. Adenopatías cervicales pequeñas bilaterales. Auscultación pulmonar sin alteraciones.',
      fecha: '2024-09-25',
      hora: '09:00',
      doctor: 'Dra. Ana Martínez'
    },
    {
      id: 3,
      contenido: 'Plan: Se indica tratamiento sintomático. Reposo relativo. Abundantes líquidos. Control en 5 días o antes si presenta datos de alarma.',
      fecha: '2024-09-25',
      hora: '09:00',
      doctor: 'Dra. Ana Martínez'
    }
  ];

  // Mock data - Recetas
  const mockPrescriptions = [
    {
      id: 1,
      fecha: '2024-09-25',
      indicaciones: 'Tomar los medicamentos con abundante agua. Evitar consumo de alcohol durante el tratamiento.',
      medicamentos: [
        {
          medicamento: 'Paracetamol',
          dosis: '500 mg',
          frecuencia: 'Cada 8 horas',
          duracion: '5 días',
          notas: 'Tomar después de los alimentos'
        },
        {
          medicamento: 'Loratadina',
          dosis: '10 mg',
          frecuencia: 'Cada 24 horas',
          duracion: '7 días',
          notas: 'Tomar en las mañanas'
        },
        {
          medicamento: 'Ambroxol',
          dosis: '30 mg',
          frecuencia: 'Cada 12 horas',
          duracion: '5 días',
          notas: 'Tomar con abundante agua'
        }
      ],
      doctor: 'Dra. Ana Martínez'
    }
  ];

  // Mock data - Documentos
  const mockDocuments = [
    {
      id: 1,
      categoria: 'LAB',
      nombre: 'hemograma_completo.pdf',
      tipo_mime: 'application/pdf',
      tamano: 245760,
      notas: 'Hemograma completo solicitado para control rutinario',
      etiquetas: ['urgente', 'control'],
      fecha_subida: '2024-09-20',
      doctor: 'Dra. Ana Martínez'
    },
    {
      id: 2,
      categoria: 'IMAGEN',
      nombre: 'radiografia_torax.jpg',
      tipo_mime: 'image/jpeg',
      tamano: 1048576,
      notas: 'Radiografía de tórax PA y lateral - Sin alteraciones',
      etiquetas: ['imagenología', 'tórax'],
      fecha_subida: '2024-09-18',
      doctor: 'Dra. Ana Martínez'
    }
  ];

  const [currentStatus, setCurrentStatus] = useState(appointment.estado);

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
    NO_SHOW: { 
      label: 'No asistió', 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: UserX
    },
  };

  const severityConfig = {
    LEVE: { label: 'Leve', color: 'bg-green-100 text-green-800 border-green-200' },
    MODERADA: { label: 'Moderado', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    GRAVE: { label: 'Grave', color: 'bg-red-100 text-red-800 border-red-200' }
  };

  const documentCategoryConfig = {
    LAB: { label: 'Laboratorio', icon: FileText, color: 'text-blue-600' },
    IMAGEN: { label: 'Imagen', icon: FileText, color: 'text-purple-600' },
    REFERENCIA: { label: 'Referencia', icon: FileText, color: 'text-orange-600' },
    CONSTANCIA: { label: 'Constancia', icon: FileText, color: 'text-green-600' },
    OTRO: { label: 'Otro', icon: FileText, color: 'text-gray-600' }
  };

  const config = statusConfig[currentStatus as keyof typeof statusConfig];
  const StatusIcon = config?.icon;

  const canAddToHistory = currentStatus === 'EN_PROGRESO' || currentStatus === 'ATENDIDA';

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    toast.success(`Estado actualizado a: ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`);
  };

  // Handlers para Diagnósticos
  const handleSaveDiagnosis = () => {
    if (!diagnosisForm.descripcion) {
      toast.error('La descripción del diagnóstico es obligatoria');
      return;
    }

    const newDiagnosis = {
      id: Date.now(),
      codigo: diagnosisForm.codigo,
      descripcion: diagnosisForm.descripcion,
      severidad: diagnosisForm.severidad,
      fecha: new Date().toISOString().split('T')[0],
      cita_id: appointmentId,
      paciente_id: appointment.paciente.id_paciente
    };

    console.log('Guardando diagnóstico:', newDiagnosis);
    toast.success('Diagnóstico agregado correctamente');
    setShowDiagnosisForm(false);
    setDiagnosisForm({ codigo: '', descripcion: '', severidad: 'LEVE' });
  };

  // Handlers para Notas Clínicas
  const handleSaveNote = () => {
    if (!noteForm.contenido) {
      toast.error('El contenido de la nota es obligatorio');
      return;
    }

    const newNote = {
      id: Date.now(),
      contenido: noteForm.contenido,
      fecha: new Date().toISOString(),
      cita_id: appointmentId,
      paciente_id: appointment.paciente.id_paciente
    };

    console.log('Guardando nota clínica:', newNote);
    toast.success('Nota clínica agregada correctamente');
    setShowNoteForm(false);
    setNoteForm({ contenido: '' });
  };

  // Handlers para Recetas
  const handleAddMedicamento = () => {
    if (!currentMedicamento.medicamento) {
      toast.error('El nombre del medicamento es obligatorio');
      return;
    }

    setPrescriptionForm({
      ...prescriptionForm,
      medicamentos: [...prescriptionForm.medicamentos, currentMedicamento]
    });

    setCurrentMedicamento({
      medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      notas: ''
    });

    toast.success('Medicamento agregado a la receta');
  };

  const handleRemoveMedicamento = (index: number) => {
    const newMedicamentos = prescriptionForm.medicamentos.filter((_, i) => i !== index);
    setPrescriptionForm({ ...prescriptionForm, medicamentos: newMedicamentos });
  };

  const handleSavePrescription = () => {
    if (prescriptionForm.medicamentos.length === 0) {
      toast.error('Debe agregar al menos un medicamento');
      return;
    }

    const newPrescription = {
      id: Date.now(),
      indicaciones: prescriptionForm.indicaciones,
      medicamentos: prescriptionForm.medicamentos,
      fecha: new Date().toISOString().split('T')[0],
      cita_id: appointmentId,
      paciente_id: appointment.paciente.id_paciente
    };

    console.log('Guardando receta:', newPrescription);
    toast.success('Receta guardada correctamente');
    setShowPrescriptionForm(false);
    setPrescriptionForm({ indicaciones: '', medicamentos: [] });
  };

  // Handlers para Documentos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info(`Archivo seleccionado: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    }
  };

  const handleSaveDocument = () => {
    const newDocument = {
      id: Date.now(),
      categoria: documentForm.categoria,
      notas: documentForm.notas,
      etiquetas: documentForm.etiquetas.split(',').map(t => t.trim()),
      fecha_subida: new Date().toISOString().split('T')[0],
      cita_id: appointmentId,
      paciente_id: appointment.paciente.id_paciente
    };

    console.log('Guardando documento:', newDocument);
    toast.success('Documento subido correctamente');
    setShowDocumentForm(false);
    setDocumentForm({ categoria: 'LAB', notas: '', etiquetas: '' });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => onNavigate('doctor-appointments')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a citas
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Cita #{appointment.id_cita}
              </h1>
              <Badge className={`${config?.color} border text-base px-3 py-1`}>
                {StatusIcon && <StatusIcon className="h-4 w-4 mr-1" />}
                {config?.label}
              </Badge>
            </div>
            <p className="text-gray-600">
              Detalles de la consulta médica con {appointment.paciente.nombre}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div>
              <Label htmlFor="status" className="text-sm mb-2 block">Cambiar estado</Label>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger id="status" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                  <SelectItem value="EN_PROGRESO">En progreso</SelectItem>
                  <SelectItem value="ATENDIDA">Atendida</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  <SelectItem value="NO_SHOW">No asistió</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal con tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="appointment" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Información de la Cita
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial Médico
              </TabsTrigger>
            </TabsList>

            {/* Tab: Información de la cita */}
            <TabsContent value="appointment" className="space-y-6">
              {/* Detalles de la cita */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Cita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-[#2E8BC0]/10 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-[#2E8BC0]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Fecha</p>
                        <p className="font-semibold">
                          {new Date(appointment.fecha).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-[#2E8BC0]/10 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-[#2E8BC0]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Hora</p>
                        <p className="font-semibold">{appointment.hora}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-[#2E8BC0]/10 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-[#2E8BC0]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                      <p className="font-semibold">{appointment.ubicacion}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Motivo de consulta</p>
                    <p className="font-medium text-lg">{appointment.motivo}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Observaciones iniciales</p>
                    <p className="text-gray-700">{appointment.observaciones}</p>
                  </div>
                </CardContent>
              </Card>

              {!canAddToHistory && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Para agregar información al historial médico, cambia el estado de la cita a "En progreso" o "Atendida"
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Tab: Historial médico del paciente */}
            <TabsContent value="history">
              {!canAddToHistory ? (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Para agregar información al historial médico, cambia el estado de la cita a "En progreso" o "Atendida"
                  </AlertDescription>
                </Alert>
              ) : null}

              <Tabs value={historySubTab} onValueChange={setHistorySubTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="diagnosticos" className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Diagnósticos
                  </TabsTrigger>
                  <TabsTrigger value="notas" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas Clínicas
                  </TabsTrigger>
                  <TabsTrigger value="recetas" className="flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Recetas
                  </TabsTrigger>
                  <TabsTrigger value="documentos" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Documentos
                  </TabsTrigger>
                </TabsList>

                {/* Sub-tab: Diagnósticos */}
                <TabsContent value="diagnosticos">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Diagnósticos Registrados</CardTitle>
                          <CardDescription>
                            Historial de diagnósticos del paciente con códigos ICD-10
                          </CardDescription>
                        </div>
                        {canAddToHistory && (
                          <Button onClick={() => setShowDiagnosisForm(!showDiagnosisForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Diagnóstico
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {showDiagnosisForm && canAddToHistory && (
                        <Card className="border-2 border-[#2E8BC0] bg-blue-50/30">
                          <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="codigo">Código ICD-10 (opcional)</Label>
                                <Input
                                  id="codigo"
                                  placeholder="Ej: J06.9, E11.9, M54.5"
                                  value={diagnosisForm.codigo}
                                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, codigo: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Código de clasificación internacional de enfermedades
                                </p>
                              </div>
                              <div>
                                <Label htmlFor="severidad">Severidad</Label>
                                <Select 
                                  value={diagnosisForm.severidad} 
                                  onValueChange={(value) => setDiagnosisForm({ ...diagnosisForm, severidad: value })}
                                >
                                  <SelectTrigger id="severidad">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="LEVE">Leve</SelectItem>
                                    <SelectItem value="MODERADA">Moderado</SelectItem>
                                    <SelectItem value="GRAVE">Grave</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="descripcion">Descripción del Diagnóstico *</Label>
                              <Textarea
                                id="descripcion"
                                placeholder="Describe el diagnóstico médico detallado, hallazgos durante el examen físico, síntomas principales..."
                                value={diagnosisForm.descripcion}
                                onChange={(e) => setDiagnosisForm({ ...diagnosisForm, descripcion: e.target.value })}
                                rows={4}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Incluye nombre de la condición, hallazgos relevantes y observaciones clínicas
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={handleSaveDiagnosis} className="bg-[#2E8BC0]">
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Diagnóstico
                              </Button>
                              <Button variant="outline" onClick={() => setShowDiagnosisForm(false)}>
                                Cancelar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Separator />

                      {/* Lista de diagnósticos */}
                      {mockDiagnostics.length === 0 ? (
                        <div className="text-center py-12">
                          <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-1">Sin diagnósticos registrados</p>
                          <p className="text-sm text-gray-500">
                            Los diagnósticos aparecerán aquí una vez registrados
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {mockDiagnostics.map((diagnosis) => (
                            <Card key={diagnosis.id} className="border-l-4 border-l-[#2E8BC0]">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start gap-3">
                                    {diagnosis.codigo && (
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {diagnosis.codigo}
                                      </Badge>
                                    )}
                                    <Badge className={severityConfig[diagnosis.severidad as keyof typeof severityConfig].color}>
                                      {severityConfig[diagnosis.severidad as keyof typeof severityConfig].label}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {new Date(diagnosis.fecha).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <p className="font-semibold text-gray-900 mb-2">{diagnosis.descripcion}</p>
                                <p className="text-xs text-gray-500">
                                  Registrado por: {diagnosis.doctor}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sub-tab: Notas Clínicas */}
                <TabsContent value="notas">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Notas y Observaciones</CardTitle>
                          <CardDescription>
                            Registro cronológico de notas clínicas de la consulta
                          </CardDescription>
                        </div>
                        {canAddToHistory && (
                          <Button onClick={() => setShowNoteForm(!showNoteForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Nota
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {showNoteForm && canAddToHistory && (
                        <Card className="border-2 border-[#2E8BC0] bg-blue-50/30">
                          <CardContent className="pt-6 space-y-4">
                            <div>
                              <Label htmlFor="contenido">Contenido de la Nota *</Label>
                              <Textarea
                                id="contenido"
                                placeholder="Documenta motivo de consulta, antecedentes, signos vitales, hallazgos del examen físico, evolución, plan de seguimiento, recomendaciones..."
                                value={noteForm.contenido}
                                onChange={(e) => setNoteForm({ ...noteForm, contenido: e.target.value })}
                                rows={6}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Registra toda la información relevante de la consulta
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={handleSaveNote} className="bg-[#2E8BC0]">
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Nota
                              </Button>
                              <Button variant="outline" onClick={() => setShowNoteForm(false)}>
                                Cancelar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Separator />

                      {/* Timeline de notas */}
                      {mockNotes.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-1">Sin notas clínicas</p>
                          <p className="text-sm text-gray-500">
                            Las notas de la consulta aparecerán aquí
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6 relative">
                          {/* Línea vertical del timeline */}
                          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#2E8BC0]/20"></div>
                          
                          {mockNotes.map((note) => (
                            <div key={note.id} className="relative pl-10">
                              {/* Punto del timeline */}
                              <div className="absolute left-0 top-1 w-6 h-6 bg-[#2E8BC0] rounded-full border-4 border-white"></div>
                              
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-[#2E8BC0]">
                                      {new Date(`${note.fecha}T${note.hora}`).toLocaleString('es-ES', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                    <p className="text-xs text-gray-500">{note.doctor}</p>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed">{note.contenido}</p>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sub-tab: Recetas */}
                <TabsContent value="recetas">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Medicamentos Recetados</CardTitle>
                          <CardDescription>
                            Prescripciones médicas con indicaciones detalladas
                          </CardDescription>
                        </div>
                        {canAddToHistory && (
                          <Button onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Receta
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {showPrescriptionForm && canAddToHistory && (
                        <Card className="border-2 border-[#2E8BC0] bg-blue-50/30">
                          <CardContent className="pt-6 space-y-4">
                            <div>
                              <Label htmlFor="indicaciones">Indicaciones Generales (opcional)</Label>
                              <Textarea
                                id="indicaciones"
                                placeholder="Instrucciones generales sobre el tratamiento, precauciones especiales, recomendaciones de estilo de vida..."
                                value={prescriptionForm.indicaciones}
                                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, indicaciones: e.target.value })}
                                rows={2}
                              />
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-semibold mb-4 flex items-center">
                                <Pill className="h-4 w-4 mr-2 text-[#2E8BC0]" />
                                Agregar Medicamentos
                              </h4>
                              
                              <div className="space-y-3 mb-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="medicamento">Medicamento *</Label>
                                    <Input
                                      id="medicamento"
                                      placeholder="Nombre genérico o comercial"
                                      value={currentMedicamento.medicamento}
                                      onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, medicamento: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="dosis">Dosis</Label>
                                    <Input
                                      id="dosis"
                                      placeholder="Ej: 500mg, 10ml"
                                      value={currentMedicamento.dosis}
                                      onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, dosis: e.target.value })}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="frecuencia">Frecuencia</Label>
                                    <Input
                                      id="frecuencia"
                                      placeholder="Ej: Cada 8 horas"
                                      value={currentMedicamento.frecuencia}
                                      onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, frecuencia: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="duracion">Duración</Label>
                                    <Input
                                      id="duracion"
                                      placeholder="Ej: 7 días"
                                      value={currentMedicamento.duracion}
                                      onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, duracion: e.target.value })}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="notas_med">Notas</Label>
                                  <Input
                                    id="notas_med"
                                    placeholder="Instrucciones especiales para este medicamento"
                                    value={currentMedicamento.notas}
                                    onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, notas: e.target.value })}
                                  />
                                </div>

                                <Button type="button" variant="outline" onClick={handleAddMedicamento} className="w-full">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Agregar a la lista
                                </Button>
                              </div>

                              {/* Lista de medicamentos agregados */}
                              {prescriptionForm.medicamentos.length > 0 && (
                                <div className="border rounded-lg p-4 bg-white">
                                  <h5 className="font-medium mb-3">Medicamentos en esta receta:</h5>
                                  <div className="space-y-2">
                                    {prescriptionForm.medicamentos.map((med, index) => (
                                      <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900">{med.medicamento}</p>
                                          <p className="text-sm text-gray-600">
                                            {med.dosis && `${med.dosis} • `}
                                            {med.frecuencia && `${med.frecuencia} • `}
                                            {med.duracion && med.duracion}
                                          </p>
                                          {med.notas && (
                                            <p className="text-xs text-gray-500 mt-1">{med.notas}</p>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveMedicamento(index)}
                                        >
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={handleSavePrescription} className="bg-[#2E8BC0]">
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Receta
                              </Button>
                              <Button variant="outline" onClick={() => {
                                setShowPrescriptionForm(false);
                                setPrescriptionForm({ indicaciones: '', medicamentos: [] });
                              }}>
                                Cancelar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Separator />

                      {/* Lista de recetas */}
                      {mockPrescriptions.length === 0 ? (
                        <div className="text-center py-12">
                          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-1">Sin recetas registradas</p>
                          <p className="text-sm text-gray-500">
                            Las prescripciones médicas aparecerán aquí
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {mockPrescriptions.map((prescription) => (
                            <Card key={prescription.id} className="border-l-4 border-l-[#2E8BC0]">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-[#2E8BC0]/10 p-2 rounded-lg">
                                      <Pill className="h-5 w-5 text-[#2E8BC0]" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">Receta #{prescription.id}</p>
                                      <p className="text-sm text-gray-500">
                                        {new Date(prescription.fecha).toLocaleDateString('es-ES', {
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500">{prescription.doctor}</p>
                                </div>

                                {prescription.indicaciones && (
                                  <Alert className="mb-4 bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                      {prescription.indicaciones}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-gray-50">
                                        <TableHead>Medicamento</TableHead>
                                        <TableHead>Dosis</TableHead>
                                        <TableHead>Frecuencia</TableHead>
                                        <TableHead>Duración</TableHead>
                                        <TableHead>Notas</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {prescription.medicamentos.map((med, index) => (
                                        <TableRow key={index}>
                                          <TableCell className="font-semibold">{med.medicamento}</TableCell>
                                          <TableCell>{med.dosis}</TableCell>
                                          <TableCell>{med.frecuencia}</TableCell>
                                          <TableCell>{med.duracion}</TableCell>
                                          <TableCell className="text-sm text-gray-600">{med.notas}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sub-tab: Documentos */}
                <TabsContent value="documentos">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Documentos Médicos</CardTitle>
                          <CardDescription>
                            Archivos, estudios e imágenes del paciente
                          </CardDescription>
                        </div>
                        {canAddToHistory && (
                          <Button onClick={() => setShowDocumentForm(!showDocumentForm)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Documento
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {showDocumentForm && canAddToHistory && (
                        <Card className="border-2 border-[#2E8BC0] bg-blue-50/30">
                          <CardContent className="pt-6 space-y-4">
                            <div>
                              <Label htmlFor="categoria">Categoría *</Label>
                              <Select 
                                value={documentForm.categoria} 
                                onValueChange={(value) => setDocumentForm({ ...documentForm, categoria: value })}
                              >
                                <SelectTrigger id="categoria">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="LAB">LAB - Estudios de laboratorio</SelectItem>
                                  <SelectItem value="IMAGEN">IMAGEN - Imágenes médicas</SelectItem>
                                  <SelectItem value="REFERENCIA">REFERENCIA - Referencias a especialistas</SelectItem>
                                  <SelectItem value="CONSTANCIA">CONSTANCIA - Certificados médicos</SelectItem>
                                  <SelectItem value="OTRO">OTRO - Otros documentos</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="file">Archivo *</Label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2E8BC0] transition-colors cursor-pointer">
                                <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <input
                                  id="file"
                                  type="file"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                  accept=".pdf,.jpg,.jpeg,.png,.dicom"
                                />
                                <label htmlFor="file" className="cursor-pointer">
                                  <p className="text-sm text-gray-600 mb-1">
                                    Click para seleccionar archivo
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PDF, JPG, PNG, DICOM (máx. 10MB)
                                  </p>
                                </label>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="notas_doc">Notas (opcional)</Label>
                              <Textarea
                                id="notas_doc"
                                placeholder="Comentarios adicionales sobre el documento..."
                                value={documentForm.notas}
                                onChange={(e) => setDocumentForm({ ...documentForm, notas: e.target.value })}
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label htmlFor="etiquetas">Etiquetas (opcional)</Label>
                              <Input
                                id="etiquetas"
                                placeholder="Separadas por comas: urgente, control, prequirúrgico"
                                value={documentForm.etiquetas}
                                onChange={(e) => setDocumentForm({ ...documentForm, etiquetas: e.target.value })}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={handleSaveDocument} className="bg-[#2E8BC0]">
                                <Save className="h-4 w-4 mr-2" />
                                Subir Documento
                              </Button>
                              <Button variant="outline" onClick={() => setShowDocumentForm(false)}>
                                Cancelar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Separator />

                      {/* Lista de documentos */}
                      {mockDocuments.length === 0 ? (
                        <div className="text-center py-12">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-1">Sin documentos subidos</p>
                          <p className="text-sm text-gray-500">
                            Los archivos médicos aparecerán aquí
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {mockDocuments.map((doc) => {
                            const categoryConfig = documentCategoryConfig[doc.categoria as keyof typeof documentCategoryConfig];
                            const CategoryIcon = categoryConfig.icon;
                            
                            return (
                              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg bg-gray-100 ${categoryConfig.color}`}>
                                      <CategoryIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900 truncate">{doc.nombre}</p>
                                          <p className="text-sm text-gray-500">
                                            {categoryConfig.label} • {(doc.tamano / 1024).toFixed(2)} KB
                                          </p>
                                        </div>
                                        <Badge variant="outline">{doc.categoria}</Badge>
                                      </div>
                                      
                                      {doc.notas && (
                                        <p className="text-sm text-gray-600 mb-2">{doc.notas}</p>
                                      )}
                                      
                                      {doc.etiquetas && doc.etiquetas.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                          {doc.etiquetas.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                              <Tag className="h-3 w-3 mr-1" />
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">
                                          Subido el {new Date(doc.fecha_subida).toLocaleDateString('es-ES')} • {doc.doctor}
                                        </p>
                                        <div className="flex gap-2">
                                          <Button size="sm" variant="ghost">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver
                                          </Button>
                                          <Button size="sm" variant="ghost">
                                            <Download className="h-4 w-4 mr-1" />
                                            Descargar
                                          </Button>
                                        </div>
                                      </div>
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
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Información del paciente */}
        <div className="space-y-6">
          {/* Datos del paciente */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <ImageWithFallback
                  src={appointment.paciente.foto}
                  alt={appointment.paciente.nombre}
                  className="w-24 h-24 rounded-full object-cover mb-3 ring-4 ring-border"
                />
                <h3 className="font-semibold text-lg text-center">
                  {appointment.paciente.nombre}
                </h3>
                <p className="text-sm text-gray-600">{appointment.paciente.edad} años</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Correo</p>
                    <p className="text-sm font-medium break-all">{appointment.paciente.correo}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Teléfono</p>
                    <p className="text-sm font-medium">{appointment.paciente.telefono}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Fecha de nacimiento</p>
                    <p className="text-sm font-medium">
                      {new Date(appointment.paciente.fecha_nacimiento).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info adicional */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-900 mb-1">
                    Sistema de Historial Médico
                  </p>
                  <p className="text-sm text-blue-700">
                    Registra diagnósticos, notas, recetas y documentos en las pestañas correspondientes del historial médico.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
