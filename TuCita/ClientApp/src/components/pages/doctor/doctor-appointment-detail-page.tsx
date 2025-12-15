import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { Alert, AlertDescription } from '@/components/ui/alert';
import doctorAppointmentsService from '@/services/api/doctor/doctorAppointmentsService';
import { DoctorLayout } from '@/components/layout/doctor/DoctorLayout';
import { useAppointmentDetail, useUpdateAppointmentStatus } from '@/hooks/queries';

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
  
  // ✅ REACT QUERY: Reemplazar useState + useEffect con hooks
  const { 
    data: appointmentDetail, 
    isLoading: loading, 
    isError, 
    error: queryError,
    refetch 
  } = useAppointmentDetail(appointmentId);
  
  const updateStatus = useUpdateAppointmentStatus();
  const [saving, setSaving] = useState(false);
  const error = queryError ? (queryError as Error).message : null;

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
      }>,
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

    // Para otros estados, actualizar directamente con React Query
    try {
      setSaving(true);
      
      // ✅ USAR MUTATION de React Query
      updateStatus.mutate({
        citaId: appointmentId,
        data: { estado: newStatus }
      });
      
      toast.success(`Estado actualizado a: ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`);
    } catch (err: any) {
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
    // Validar que si se marcó agregar información, está completa
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

      // 4. Actualizar estado a ATENDIDA usando mutation
      updateStatus.mutate({
        citaId: appointmentId,
        data: { estado: 'ATENDIDA' }
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
      
      // ✅ React Query: refetch automático
      refetch();
    } catch (err: any) {
      console.error('Error al completar cita:', err);
      toast.error(err.message || 'Error al completar la cita');
      refetch();
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
      await refetch();
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
      await refetch();
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
      await refetch();
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
      
      console.log('📤 Subiendo archivo real a S3:', {
        archivo: documentForm.selectedFile.name,
        tamaño: documentForm.selectedFile.size,
        tipo: documentForm.selectedFile.type,
        categoría: documentForm.categoria
      });

      // ✅ USAR EL NUEVO MÉTODO QUE SUBE ARCHIVOS REALES
      await doctorAppointmentsService.uploadDocumentFile(
        appointmentId,
        documentForm.selectedFile,
        documentForm.categoria,
        documentForm.notas || undefined,
        documentForm.etiquetas || undefined
      );

      toast.success('Documento subido correctamente a S3');
      setShowDocumentForm(false);
      setDocumentForm({ categoria: 'LAB', notas: '', etiquetas: '', selectedFile: null });
      
      // Recargar los datos de la cita
      await refetch();
    } catch (err: any) {
      console.error('❌ Error al subir documento:', err);
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
                <Button onClick={refetch}>
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
                Agrega la información médica relevante antes de marcar la cita como atendida. Puedes seleccionarquê información deseas registrar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Opciones de quê agregar */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-diagnostico"
                    checked={completeAppointmentData.addDiagnostico}
                    onCheckedChange={(checked: boolean) => setCompleteAppointmentData({
                      ...completeAppointmentData,
                      addDiagnostico: checked
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
                        <Label htmlFor="diag-codigo">Códígo ICD-10 (opcional)</Label>
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
                        <Label htmlFor="diag-descripcion">Descripcíon del Diagnóstico *</Label>
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
                    onCheckedChange={(checked: boolean) => setCompleteAppointmentData({
                      ...completeAppointmentData,
                      addNota: checked
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
                          placeholder="Motivo de consulta, antecedentes, signos vitales, hallazgos, evolucián, plan de seguimiento..."
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
                    onCheckedChange={(checked: boolean) => setCompleteAppointmentData({
                      ...completeAppointmentData,
                      addReceta: checked
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
                              <Label htmlFor="med-duracion">Duracián</Label>
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
                                      {med.dosis && `${med.dosis} á `}
                                      {med.frecuencia && `${med.frecuencia} á `}
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

                              {completeAppointmentData.receta.medicamentos.length > 3 && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Y {completeAppointmentData.receta.medicamentos.length - 3} medicamento(s) más...
                                </p>
                              )}
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
                    <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                    <SelectItem value="NO_ATENDIDA">No asistió</SelectItem>
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

                {/* Alerta informativa sobre agregar información al historial */}
                {!canAddToHistory && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Para agregar información al historial mádico, cambia el estado de la cita a "En progreso" o "Atendida"
                    </AlertDescription>
                  </Alert>
                )}

                {/* Tarjeta de acceso rápido cuando se puede agregar información */}
                {canAddToHistory && (
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-800">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Agregar Información Médica
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        Esta cita permite agregar diagnósticos, notas, recetas y documentos al historial médico del paciente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="justify-start bg-white hover:bg-blue-50 border-blue-200"
                          onClick={() => setActiveTab('history')}
                        >
                          <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Ir a Historial Médico</span>
                        </Button>
                        {currentStatus === 'EN_PROGRESO' && (
                          <Button
                            className="justify-start bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setShowCompleteAppointmentModal(true)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            <span>Completar Cita</span>
                          </Button>
                        )}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          {diagnosticos.length} diagnóstico(s)
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                          {notasClinicas.length} nota(s) clínica(s)
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          {recetas.length} receta(s)
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                          {documentos.length} documento(s)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab: Historial mádico del paciente */}
              <TabsContent value="history">
                {!canAddToHistory ? (
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Para agregar información al historial mádico, cambia el estado de la cita a "En progreso" o "Atendida"
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
                        {/* Alerta de acceso disponible */}
                        {canAddToHistory && !showDiagnosisForm && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <ClipboardList className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                              <div className="flex items-center justify-between">
                                <span>Puedes agregar diagnósticos a esta cita</span>
                                <Button 
                                  size="sm" 
                                  onClick={() => setShowDiagnosisForm(true)}
                                  className="bg-blue-600 hover:bg-blue-700 ml-2"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Agregar Ahora
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {showDiagnosisForm && canAddToHistory && (
                          <Card className="border-2 border-[#2E8BC0] bg-blue-50/30">
                            <CardContent className="pt-6 space-y-4">
                              <div>
                                <Label htmlFor="codigo">Códígo ICD-10 (opcional)</Label>
                                <Input
                                  id="codigo"
                                  placeholder="Ej: J06.9, E11.9, M54.5"
                                  value={diagnosisForm.codigo}
                                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, codigo: e.target.value })}
                                  disabled={saving}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Códígo de clasificación internacional de enfermedades
                                </p>
                              </div>

                              <div>
                                <Label htmlFor="descripcion">Descripcíon del Diagnóstico *</Label>
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
                              Los diagnósticos aparecerán aquá una vez registrados
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
                        {/* Alerta de acceso disponible */}
                        {canAddToHistory && !showNoteForm && (
                          <Alert className="bg-purple-50 border-purple-200">
                            <FileText className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-purple-800">
                              <div className="flex items-center justify-between">
                                <span>Puedes agregar notas clínicas a esta cita</span>
                                <Button 
                                  size="sm" 
                                  onClick={() => setShowNoteForm(true)}
                                  className="bg-purple-600 hover:bg-purple-700 ml-2"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Agregar Ahora
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

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
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}

