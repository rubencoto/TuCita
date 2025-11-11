import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
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
  FileUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Alert, AlertDescription } from '../ui/alert';
import doctorAppointmentsService from '../../services/doctorAppointmentsService';
import { DoctorLayout } from '../doctor/DoctorLayout';

interface DoctorAppointmentDetailPageProps {
  appointmentId: number;
  onNavigate: (page: string, data?: any) => void;
  onLogout: () => void;
}

export function DoctorAppointmentDetailPage({ appointmentId, onNavigate, onLogout }: DoctorAppointmentDetailPageProps) {
  const [activeTab, setActiveTab] = useState('appointment');
  const [historySubTab, setHistorySubTab] = useState('diagnosticos');
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  
  // Estados para datos del backend
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentDetail, setAppointmentDetail] = useState<any>(null);

  // Estados para el modal de completar cita
  const [showCompleteAppointmentModal, setShowCompleteAppointmentModal] = useState(false);
  const [completeAppointmentData, setCompleteAppointmentData] = useState({
    addDiagnostico: false,
    addNota: false,
    addReceta: false,
    diagnostico: { codigo: '', descripcion: '' },
    nota: { contenido: '' },
    receta: { 
      indicaciones: '', 
      medicamentos: [] as Array<{
        medicamento: string;
        dosis: string;
        frecuencia: string;
        duracion: string;
        notas: string;
      }>
    }
  });
  const [currentMedicamentoComplete, setCurrentMedicamentoComplete] = useState({
    medicamento: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    notas: ''
  });

  // Estados para formularios
  const [diagnosisForm, setDiagnosisForm] = useState({
    codigo: '',
    descripcion: ''
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
    categoria: 'LAB' as 'LAB' | 'IMAGEN' | 'REFERENCIA' | 'CONSTANCIA' | 'OTRO',
    notas: '',
    etiquetas: '',
    selectedFile: null as File | null
  });

  // Cargar datos de la cita al montar el componente
  useEffect(() => {
    loadAppointmentDetail();
  }, [appointmentId]);

  const loadAppointmentDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const detail = await doctorAppointmentsService.getAppointmentDetail(appointmentId);
      setAppointmentDetail(detail);
    } catch (err: any) {
      console.error('Error al cargar detalle de cita:', err);
      setError(err.message || 'Error al cargar el detalle de la cita');
      toast.error('Error al cargar el detalle de la cita');
    } finally {
      setLoading(false);
    }
  };

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

  const documentCategoryConfig = {
    LAB: { label: 'Laboratorio', icon: FileText, color: 'text-blue-600' },
    IMAGEN: { label: 'Imagen', icon: FileText, color: 'text-purple-600' },
    REFERENCIA: { label: 'Referencia', icon: FileText, color: 'text-orange-600' },
    CONSTANCIA: { label: 'Constancia', icon: FileText, color: 'text-green-600' },
    OTRO: { label: 'Otro', icon: FileText, color: 'text-gray-600' }
  };

  const currentStatus = appointmentDetail?.estado || 'PENDIENTE';
  const config = statusConfig[currentStatus as keyof typeof statusConfig];
  const StatusIcon = config?.icon;

  const canAddToHistory = currentStatus === 'EN_PROGRESO' || currentStatus === 'ATENDIDA';

  const handleStatusChange = async (newStatus: string) => {
    // Si el nuevo estado es ATENDIDA, mostrar el modal para agregar información al historial
    if (newStatus === 'ATENDIDA' && currentStatus !== 'ATENDIDA') {
      setShowCompleteAppointmentModal(true);
      return;
    }

    // Para otros estados, actualizar directamente
    try {
      setSaving(true);
      await doctorAppointmentsService.updateAppointmentStatus(appointmentId, {
        estado: newStatus
      });
      
      toast.success(`Estado actualizado a: ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`);
      
      // Recargar los datos de la cita
      await loadAppointmentDetail();
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      toast.error(err.message || 'Error al actualizar el estado de la cita');
    } finally {
      setSaving(false);
    }
  };

  // Handlers para el modal de completar cita
  const handleAddMedicamentoComplete = () => {
    if (!currentMedicamentoComplete.medicamento) {
      toast.error('El nombre del medicamento es obligatorio');
      return;
    }

    setCompleteAppointmentData({
      ...completeAppointmentData,
      receta: {
        ...completeAppointmentData.receta,
        medicamentos: [...completeAppointmentData.receta.medicamentos, currentMedicamentoComplete]
      }
    });

    setCurrentMedicamentoComplete({
      medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      notas: ''
    });

    toast.success('Medicamento agregado a la receta');
  };

  const handleRemoveMedicamentoComplete = (index: number) => {
    const newMedicamentos = completeAppointmentData.receta.medicamentos.filter((_, i) => i !== index);
    setCompleteAppointmentData({
      ...completeAppointmentData,
      receta: {
        ...completeAppointmentData.receta,
        medicamentos: newMedicamentos
      }
    });
  };

  const handleCompleteAppointment = async () => {
    // Validar que si se marcó agregar información, esté completa
    if (completeAppointmentData.addDiagnostico && !completeAppointmentData.diagnostico.descripcion) {
      toast.error('La descripción del diagnóstico es obligatoria');
      return;
    }

    if (completeAppointmentData.addNota && !completeAppointmentData.nota.contenido) {
      toast.error('El contenido de la nota es obligatorio');
      return;
    }

    if (completeAppointmentData.addReceta && completeAppointmentData.receta.medicamentos.length === 0) {
      toast.error('Debe agregar al menos un medicamento a la receta');
      return;
    }

    try {
      setSaving(true);

      // 1. Guardar diagnóstico si está marcado
      if (completeAppointmentData.addDiagnostico) {
        await doctorAppointmentsService.createDiagnostico(appointmentId, {
          codigo: completeAppointmentData.diagnostico.codigo || undefined,
          descripcion: completeAppointmentData.diagnostico.descripcion
        });
        toast.success('Diagnóstico guardado');
      }

      // 2. Guardar nota clínica si está marcada
      if (completeAppointmentData.addNota) {
        await doctorAppointmentsService.createNotaClinica(appointmentId, {
          contenido: completeAppointmentData.nota.contenido
        });
        toast.success('Nota clínica guardada');
      }

      // 3. Guardar receta si está marcada
      if (completeAppointmentData.addReceta) {
        await doctorAppointmentsService.createReceta(appointmentId, {
          indicaciones: completeAppointmentData.receta.indicaciones || undefined,
          medicamentos: completeAppointmentData.receta.medicamentos.map(m => ({
            medicamento: m.medicamento,
            dosis: m.dosis || undefined,
            frecuencia: m.frecuencia || undefined,
            duracion: m.duracion || undefined,
            notas: m.notas || undefined
          }))
        });
        toast.success('Receta guardada');
      }

      // 4. Actualizar estado a ATENDIDA
      await doctorAppointmentsService.updateAppointmentStatus(appointmentId, {
        estado: 'ATENDIDA'
      });
      
      toast.success('Cita completada exitosamente');
      
      // Cerrar modal y limpiar datos
      setShowCompleteAppointmentModal(false);
      setCompleteAppointmentData({
        addDiagnostico: false,
        addNota: false,
        addReceta: false,
        diagnostico: { codigo: '', descripcion: '' },
        nota: { contenido: '' },
        receta: { indicaciones: '', medicamentos: [] }
      });
      
      // Recargar los datos de la cita
      await loadAppointmentDetail();
    } catch (err: any) {
      console.error('Error al completar cita:', err);
      toast.error(err.message || 'Error al completar la cita');
    } finally {
      setSaving(false);
    }
  };

  // Handlers para Diagnósticos
  const handleSaveDiagnosis = async () => {
    if (!diagnosisForm.descripcion) {
      toast.error('La descripción del diagnóstico es obligatoria');
      return;
    }

    try {
      setSaving(true);
      await doctorAppointmentsService.createDiagnostico(appointmentId, {
        codigo: diagnosisForm.codigo || undefined,
        descripcion: diagnosisForm.descripcion
      });

      toast.success('Diagnóstico agregado correctamente');
      setShowDiagnosisForm(false);
      setDiagnosisForm({ codigo: '', descripcion: '' });
      
      // Recargar los datos de la cita
      await loadAppointmentDetail();
    } catch (err: any) {
      console.error('Error al guardar diagnóstico:', err);
      toast.error(err.message || 'Error al guardar el diagnóstico');
    } finally {
      setSaving(false);
    }
  };

  // Handlers para Notas Clínicas
  const handleSaveNote = async () => {
    if (!noteForm.contenido) {
      toast.error('El contenido de la nota es obligatorio');
      return;
    }

    try {
      setSaving(true);
      await doctorAppointmentsService.createNotaClinica(appointmentId, {
        contenido: noteForm.contenido
      });

      toast.success('Nota clínica agregada correctamente');
      setShowNoteForm(false);
      setNoteForm({ contenido: '' });
      
      // Recargar los datos de la cita
      await loadAppointmentDetail();
    } catch (err: any) {
      console.error('Error al guardar nota:', err);
      toast.error(err.message || 'Error al guardar la nota clínica');
    } finally {
      setSaving(false);
    }
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

  const handleSavePrescription = async () => {
    if (prescriptionForm.medicamentos.length === 0) {
      toast.error('Debe agregar al menos un medicamento');
      return;
    }

    try {
      setSaving(true);
      await doctorAppointmentsService.createReceta(appointmentId, {
        indicaciones: prescriptionForm.indicaciones || undefined,
        medicamentos: prescriptionForm.medicamentos.map(m => ({
          medicamento: m.medicamento,
          dosis: m.dosis || undefined,
          frecuencia: m.frecuencia || undefined,
          duracion: m.duracion || undefined,
          notas: m.notas || undefined
        }))
      });

      toast.success('Receta guardada correctamente');
      setShowPrescriptionForm(false);
      setPrescriptionForm({ indicaciones: '', medicamentos: [] });
      
      // Recargar los datos de la cita
      await loadAppointmentDetail();
    } catch (err: any) {
      console.error('Error al guardar receta:', err);
      toast.error(err.message || 'Error al guardar la receta');
    } finally {
      setSaving(false);
    }
  };

  // Handlers para Documentos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (50MB máximo)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 50MB');
        return;
      }
      
      setDocumentForm({
        ...documentForm,
        selectedFile: file
      });
      
      toast.info(`Archivo seleccionado: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    }
  };

  const handleSaveDocument = async () => {
    if (!documentForm.selectedFile) {
      toast.error('Debe seleccionar un archivo');
      return;
    }

    try {
      setSaving(true);
      
      // TODO: Implementar upload real a storage
      // Por ahora, simulamos que el archivo se subió
      const mockStorageData = {
        storageId: 1,
        blobNombre: `doc_${Date.now()}_${documentForm.selectedFile.name}`,
        blobCarpeta: `citas/${appointmentId}`,
        blobContainer: 'medical-documents'
      };

      await doctorAppointmentsService.uploadDocument(appointmentId, {
        categoria: documentForm.categoria,
        nombreArchivo: documentForm.selectedFile.name,
        mimeType: documentForm.selectedFile.type,
        tamanoBytes: documentForm.selectedFile.size,
        storageId: mockStorageData.storageId,
        blobNombre: mockStorageData.blobNombre,
        blobCarpeta: mockStorageData.blobCarpeta,
        blobContainer: mockStorageData.blobContainer,
        notas: documentForm.notas || undefined,
        etiquetas: documentForm.etiquetas ? documentForm.etiquetas.split(',').map(t => t.trim()) : undefined
      });

      toast.success('Documento subido correctamente');
      setShowDocumentForm(false);
      setDocumentForm({ categoria: 'LAB', notas: '', etiquetas: '', selectedFile: null });
      
      // Recargar los datos de la cita
      await loadAppointmentDetail();
    } catch (err: any) {
      console.error('Error al subir documento:', err);
      toast.error(err.message || 'Error al subir el documento');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <DoctorLayout 
        currentPage="doctor-appointments" 
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="p-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => onNavigate('doctor-appointments')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a citas
          </Button>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Cargando detalles de la cita...</p>
            </div>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  // Error state
  if (error || !appointmentDetail) {
    return (
      <DoctorLayout 
        currentPage="doctor-appointments" 
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="p-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => onNavigate('doctor-appointments')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a citas
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Error al cargar la cita
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => onNavigate('doctor-appointments')} variant="outline">
                  Volver a citas
                </Button>
                <Button onClick={loadAppointmentDetail}>
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  const diagnosticos = appointmentDetail.diagnosticos || [];
  const notasClinicas = appointmentDetail.notasClinicas || [];
  const recetas = appointmentDetail.recetas || [];
  const documentos = appointmentDetail.documentos || [];

  return (
    <DoctorLayout 
      currentPage="doctor-appointments" 
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="p-8">
        {/* Modal para completar cita con información médica */}
        <Dialog open={showCompleteAppointmentModal} onOpenChange={setShowCompleteAppointmentModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Completar Cita
              </DialogTitle>
              <DialogDescription>
                Agrega la información médica relevante antes de marcar la cita como atendida. Puedes seleccionar qué información deseas registrar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Opciones de qué agregar */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-diagnostico"
                    checked={completeAppointmentData.addDiagnostico}
                    onCheckedChange={(checked) => setCompleteAppointmentData({
                      ...completeAppointmentData,
                      addDiagnostico: checked as boolean
                    })}
                  />
                  <Label htmlFor="add-diagnostico" className="text-base font-medium cursor-pointer">
                    Agregar Diagnóstico
                  </Label>
                </div>

                {completeAppointmentData.addDiagnostico && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6 space-y-3">
                      <div>
                        <Label htmlFor="diag-codigo">Código ICD-10 (opcional)</Label>
                        <Input
                          id="diag-codigo"
                          placeholder="Ej: J06.9, E11.9, M54.5"
                          value={completeAppointmentData.diagnostico.codigo}
                          onChange={(e) => setCompleteAppointmentData({
                            ...completeAppointmentData,
                            diagnostico: { ...completeAppointmentData.diagnostico, codigo: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="diag-descripcion">Descripción del Diagnóstico *</Label>
                        <Textarea
                          id="diag-descripcion"
                          placeholder="Describe el diagnóstico médico detallado..."
                          value={completeAppointmentData.diagnostico.descripcion}
                          onChange={(e) => setCompleteAppointmentData({
                            ...completeAppointmentData,
                            diagnostico: { ...completeAppointmentData.diagnostico, descripcion: e.target.value }
                          })}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-nota"
                    checked={completeAppointmentData.addNota}
                    onCheckedChange={(checked) => setCompleteAppointmentData({
                      ...completeAppointmentData,
                      addNota: checked as boolean
                    })}
                  />
                  <Label htmlFor="add-nota" className="text-base font-medium cursor-pointer">
                    Agregar Nota Clínica
                  </Label>
                </div>

                {completeAppointmentData.addNota && (
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div>
                        <Label htmlFor="nota-contenido">Contenido de la Nota *</Label>
                        <Textarea
                          id="nota-contenido"
                          placeholder="Motivo de consulta, antecedentes, signos vitales, hallazgos, evolución, plan de seguimiento..."
                          value={completeAppointmentData.nota.contenido}
                          onChange={(e) => setCompleteAppointmentData({
                            ...completeAppointmentData,
                            nota: { ...completeAppointmentData.nota, contenido: e.target.value }
                          })}
                          rows={5}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-receta"
                    checked={completeAppointmentData.addReceta}
                    onCheckedChange={(checked) => setCompleteAppointmentData({
                      ...completeAppointmentData,
                      addReceta: checked as boolean
                    })}
                  />
                  <Label htmlFor="add-receta" className="text-base font-medium cursor-pointer">
                    Agregar Receta
                  </Label>
                </div>

                {completeAppointmentData.addReceta && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <Label htmlFor="receta-indicaciones">Indicaciones Generales (opcional)</Label>
                        <Textarea
                          id="receta-indicaciones"
                          placeholder="Instrucciones generales sobre el tratamiento..."
                          value={completeAppointmentData.receta.indicaciones}
                          onChange={(e) => setCompleteAppointmentData({
                            ...completeAppointmentData,
                            receta: { ...completeAppointmentData.receta, indicaciones: e.target.value }
                          })}
                          rows={2}
                        />
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Pill className="h-4 w-4 mr-2 text-green-600" />
                          Agregar Medicamentos
                        </h4>
                        
                        <div className="space-y-3 mb-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="med-nombre">Medicamento *</Label>
                              <Input
                                id="med-nombre"
                                placeholder="Nombre del medicamento"
                                value={currentMedicamentoComplete.medicamento}
                                onChange={(e) => setCurrentMedicamentoComplete({ ...currentMedicamentoComplete, medicamento: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="med-dosis">Dosis</Label>
                              <Input
                                id="med-dosis"
                                placeholder="Ej: 500mg"
                                value={currentMedicamentoComplete.dosis}
                                onChange={(e) => setCurrentMedicamentoComplete({ ...currentMedicamentoComplete, dosis: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="med-frecuencia">Frecuencia</Label>
                              <Input
                                id="med-frecuencia"
                                placeholder="Ej: Cada 8 horas"
                                value={currentMedicamentoComplete.frecuencia}
                                onChange={(e) => setCurrentMedicamentoComplete({ ...currentMedicamentoComplete, frecuencia: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="med-duracion">Duración</Label>
                              <Input
                                id="med-duracion"
                                placeholder="Ej: 7 días"
                                value={currentMedicamentoComplete.duracion}
                                onChange={(e) => setCurrentMedicamentoComplete({ ...currentMedicamentoComplete, duracion: e.target.value })}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="med-notas">Notas</Label>
                            <Input
                              id="med-notas"
                              placeholder="Instrucciones especiales"
                              value={currentMedicamentoComplete.notas}
                              onChange={(e) => setCurrentMedicamentoComplete({ ...currentMedicamentoComplete, notas: e.target.value })}
                            />
                          </div>

                          <Button type="button" variant="outline" onClick={handleAddMedicamentoComplete} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar a la lista
                          </Button>
                        </div>

                        {completeAppointmentData.receta.medicamentos.length > 0 && (
                          <div className="border rounded-lg p-3 bg-white">
                            <h5 className="font-medium mb-2 text-sm">Medicamentos agregados:</h5>
                            <div className="space-y-2">
                              {completeAppointmentData.receta.medicamentos.map((med, index) => (
                                <div key={index} className="flex items-start justify-between p-2 bg-gray-50 rounded text-sm">
                                  <div className="flex-1">
                                    <p className="font-semibold">{med.medicamento}</p>
                                    <p className="text-xs text-gray-600">
                                      {med.dosis && `${med.dosis} • `}
                                      {med.frecuencia && `${med.frecuencia} • `}
                                      {med.duracion && med.duracion}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMedicamentoComplete(index)}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompleteAppointmentModal(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCompleteAppointment} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completar Cita
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  Cita #{appointmentDetail.id}
                </h1>
                <Badge className={`${config?.color} border text-base px-3 py-1`}>
                  {StatusIcon && <StatusIcon className="h-4 w-4 mr-1" />}
                  {config?.label}
                </Badge>
              </div>
              <p className="text-gray-600">
                Detalles de la consulta médica con {appointmentDetail.paciente?.nombre || 'Paciente'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div>
                <Label htmlFor="status" className="text-sm mb-2 block">Cambiar estado</Label>
                <Select value={currentStatus} onValueChange={handleStatusChange} disabled={saving}>
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
                            {new Date(appointmentDetail.fecha).toLocaleDateString('es-ES', {
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
                          <p className="font-semibold">{appointmentDetail.hora}</p>
                        </div>
                      </div>
                    </div>

                    {appointmentDetail.ubicacion && (
                      <div className="flex items-start space-x-3">
                        <div className="bg-[#2E8BC0]/10 p-2 rounded-lg">
                          <MapPin className="h-5 w-5 text-[#2E8BC0]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                          <p className="font-semibold">{appointmentDetail.ubicacion}</p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {appointmentDetail.motivo && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Motivo de consulta</p>
                        <p className="font-medium text-lg">{appointmentDetail.motivo}</p>
                      </div>
                    )}

                    {appointmentDetail.observaciones && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Observaciones iniciales</p>
                        <p className="text-gray-700">{appointmentDetail.observaciones}</p>
                      </div>
                    )}
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
                      {diagnosticos.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {diagnosticos.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="notas" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notas
                      {notasClinicas.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {notasClinicas.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="recetas" className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Recetas
                      {recetas.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {recetas.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="documentos" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Documentos
                      {documentos.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {documentos.length}
                        </Badge>
                      )}
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
                            <Button onClick={() => setShowDiagnosisForm(!showDiagnosisForm)} disabled={saving}>
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
                              <div>
                                <Label htmlFor="codigo">Código ICD-10 (opcional)</Label>
                                <Input
                                  id="codigo"
                                  placeholder="Ej: J06.9, E11.9, M54.5"
                                  value={diagnosisForm.codigo}
                                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, codigo: e.target.value })}
                                  disabled={saving}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Código de clasificación internacional de enfermedades
                                </p>
                              </div>

                              <div>
                                <Label htmlFor="descripcion">Descripción del Diagnóstico *</Label>
                                <Textarea
                                  id="descripcion"
                                  placeholder="Describe el diagnóstico médico detallado, hallazgos durante el examen físico, síntomas principales..."
                                  value={diagnosisForm.descripcion}
                                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, descripcion: e.target.value })}
                                  rows={4}
                                  disabled={saving}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Incluye nombre de la condición, hallazgos relevantes y observaciones clínicas
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={handleSaveDiagnosis} className="bg-[#2E8BC0]" disabled={saving}>
                                  {saving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Guardando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Guardar Diagnóstico
                                    </>
                                  )}
                                </Button>
                                <Button variant="outline" onClick={() => setShowDiagnosisForm(false)} disabled={saving}>
                                  Cancelar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <Separator />

                        {/* Lista de diagnósticos */}
                        {diagnosticos.length === 0 ? (
                          <div className="text-center py-12">
                            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-1">Sin diagnósticos registrados</p>
                            <p className="text-sm text-gray-500">
                              Los diagnósticos aparecerán aquí una vez registrados
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {diagnosticos.map((diagnosis: any) => (
                              <Card key={diagnosis.id} className="border-l-4 border-l-[#2E8BC0]">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                      {diagnosis.codigo && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                          {diagnosis.codigo}
                                        </Badge>
                                      )}
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
                            <Button onClick={() => setShowNoteForm(!showNoteForm)} disabled={saving}>
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
                                  disabled={saving}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Registra toda la información relevante de la consulta
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={handleSaveNote} className="bg-[#2E8BC0]" disabled={saving}>
                                  {saving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Guardando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Guardar Nota
                                    </>
                                  )}
                                </Button>
                                <Button variant="outline" onClick={() => setShowNoteForm(false)} disabled={saving}>
                                  Cancelar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <Separator />

                        {/* Timeline de notas */}
                        {notasClinicas.length === 0 ? (
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
                          
                            {notasClinicas.map((note: any) => (
                              <div key={note.id} className="relative pl-10">
                                {/* Punto del timeline */}
                                <div className="absolute left-0 top-1 w-6 h-6 bg-[#2E8BC0] rounded-full border-4 border-white"></div>
                              
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-sm font-medium text-[#2E8BC0]">
                                        {new Date(note.fecha).toLocaleString('es-ES', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
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
                            <Button onClick={() => setShowPrescriptionForm(!showPrescriptionForm)} disabled={saving}>
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
                                  disabled={saving}
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
                                        disabled={saving}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="dosis">Dosis</Label>
                                      <Input
                                        id="dosis"
                                        placeholder="Ej: 500mg, 10ml"
                                        value={currentMedicamento.dosis}
                                        onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, dosis: e.target.value })}
                                        disabled={saving}
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
                                        disabled={saving}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="duracion">Duración</Label>
                                      <Input
                                        id="duracion"
                                        placeholder="Ej: 7 días"
                                        value={currentMedicamento.duracion}
                                        onChange={(e) => setCurrentMedicamento({ ...currentMedicamento, duracion: e.target.value })}
                                        disabled={saving}
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
                                      disabled={saving}
                                    />
                                  </div>

                                  <Button type="button" variant="outline" onClick={handleAddMedicamento} className="w-full" disabled={saving}>
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
                                            disabled={saving}
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
                                <Button onClick={handleSavePrescription} className="bg-[#2E8BC0]" disabled={saving}>
                                  {saving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Guardando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Guardar Receta
                                    </>
                                  )}
                                </Button>
                                <Button variant="outline" onClick={() => {
                                  setShowPrescriptionForm(false);
                                  setPrescriptionForm({ indicaciones: '', medicamentos: [] });
                                }} disabled={saving}>
                                  Cancelar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <Separator />

                        {/* Lista de recetas */}
                        {recetas.length === 0 ? (
                          <div className="text-center py-12">
                            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-1">Sin recetas registradas</p>
                            <p className="text-sm text-gray-500">
                              Las prescripciones médicas aparecerán aquí
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recetas.map((prescription: any) => (
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
                                        {prescription.medicamentos?.map((med: any, index: number) => (
                                          <TableRow key={index}>
                                            <TableCell className="font-semibold">{med.medicamento}</TableCell>
                                            <TableCell>{med.dosis || '-'}</TableCell>
                                            <TableCell>{med.frecuencia || '-'}</TableCell>
                                            <TableCell>{med.duracion || '-'}</TableCell>
                                            <TableCell className="text-sm text-gray-600">{med.notas || '-'}</TableCell>
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
                            <Button onClick={() => setShowDocumentForm(!showDocumentForm)} disabled={saving}>
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
                                  onValueChange={(value: any) => setDocumentForm({ ...documentForm, categoria: value })}
                                  disabled={saving}
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
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2E8BC0] transition-colores cursor-pointer">
                                  <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <input
                                    id="file"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept=".pdf,.jpg,.jpeg,.png,.dicom"
                                    disabled={saving}
                                  />
                                  <label htmlFor="file" className="cursor-pointer">
                                    <p className="text-sm text-gray-600 mb-1">
                                      {documentForm.selectedFile ? documentForm.selectedFile.name : 'Click para seleccionar archivo'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      PDF, JPG, PNG, DICOM (máx. 50MB)
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
                                  disabled={saving}
                                />
                              </div>

                              <div>
                                <Label htmlFor="etiquetas">Etiquetas (opcional)</Label>
                                <Input
                                  id="etiquetas"
                                  placeholder="Separadas por comas: urgente, control, prequirúrgico"
                                  value={documentForm.etiquetas}
                                  onChange={(e) => setDocumentForm({ ...documentForm, etiquetas: e.target.value })}
                                  disabled={saving}
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={handleSaveDocument} className="bg-[#2E8BC0]" disabled={saving}>
                                  {saving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Guardando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Subir Documento
                                    </>
                                  )}
                                </Button>
                                <Button variant="outline" onClick={() => setShowDocumentForm(false)} disabled={saving}>
                                  Cancelar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <Separator />

                        {/* Lista de documentos */}
                        {documentos.length === 0 ? (
                          <div className="text-center py-12">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-1">Sin documentos subidos</p>
                            <p className="text-sm text-gray-500">
                              Los archivos médicos aparecerán aquí
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {documentos.map((doc: any) => {
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
                                            <p className="font-semibold text-gray-900 truncate">{doc.nombreArchivo}</p>
                                            <p className="text-sm text-gray-500">
                                              {categoryConfig.label} • {(doc.tamanoBytes / 1024).toFixed(2)} KB
                                            </p>
                                          </div>
                                          <Badge variant="outline">{doc.categoria}</Badge>
                                        </div>
                                        
                                        {doc.notas && (
                                          <p className="text-sm text-gray-600 mb-2">{doc.notas}</p>
                                        )}
                                        
                                        {doc.etiquetas && doc.etiquetas.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mb-3">
                                            {doc.etiquetas.map((tag: string, index: number) => (
                                              <Badge key={index} variant="secondary" className="text-xs">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {tag}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs text-gray-500">
                                            Subido el {new Date(doc.fechaSubida).toLocaleDateString('es-ES')}
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
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-border mb-3">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-center">
                    {appointmentDetail.paciente?.nombre || 'Paciente'}
                  </h3>
                  {appointmentDetail.paciente?.edad && (
                    <p className="text-sm text-gray-600">{appointmentDetail.paciente.edad} años</p>
                  )}
                </div>

                <div className="space-y-3">
                  {appointmentDetail.paciente?.correo && (
                    <div className="flex items-start space-x-3">
                      <Mail className="h-4 w-4 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Correo</p>
                        <p className="text-sm font-medium break-all">{appointmentDetail.paciente.correo}</p>
                      </div>
                    </div>
                  )}

                  {appointmentDetail.paciente?.telefono && (
                    <div className="flex items-start space-x-3">
                      <Phone className="h-4 w-4 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Teléfono</p>
                        <p className="text-sm font-medium">{appointmentDetail.paciente.telefono}</p>
                      </div>
                    </div>
                  )}

                  {appointmentDetail.paciente?.fechaNacimiento && (
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Fecha de nacimiento</p>
                        <p className="text-sm font-medium">
                          {new Date(appointmentDetail.paciente.fechaNacimiento).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  )}
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
                      Al cambiar el estado a "Atendida", podrás agregar diagnósticos, notas y recetas en un solo paso.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
