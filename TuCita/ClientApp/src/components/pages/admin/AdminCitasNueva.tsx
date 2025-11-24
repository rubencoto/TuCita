import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Search, User, Calendar, Check, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import adminCitasService, { 
  PacienteSearch, 
  DoctorConEspecialidad, 
  SlotDisponible 
} from '@/services/api/admin/adminCitasService';

interface AdminCitasNuevaProps {
  onBack?: () => void;
}

export function AdminCitasNueva({ onBack }: AdminCitasNuevaProps) {
  // Estados del wizard
  const [step, setStep] = useState(1);
  
  // Estados de datos
  const [selectedPatient, setSelectedPatient] = useState<PacienteSearch | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorConEspecialidad | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotDisponible | null>(null);
  
  // Estados de búsqueda
  const [searchPatient, setSearchPatient] = useState('');
  const [pacientesEncontrados, setPacientesEncontrados] = useState<PacienteSearch[]>([]);
  const [doctores, setDoctores] = useState<DoctorConEspecialidad[]>([]);
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  
  // Estados de formulario
  const [selectedDate, setSelectedDate] = useState('');
  const [motivo, setMotivo] = useState('');
  const [notasInternas, setNotasInternas] = useState('');
  const [enviarEmail, setEnviarEmail] = useState(true);
  
  // Estados de loading/error
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar pacientes cuando cambia el término de búsqueda
  useEffect(() => {
    const searchPacientes = async () => {
      if (searchPatient.length < 2) {
        setPacientesEncontrados([]);
        return;
      }

      setSearchingPatients(true);
      setError(null);

      try {
        const results = await adminCitasService.searchPacientes(searchPatient);
        setPacientesEncontrados(results);
      } catch (err: any) {
        console.error('Error al buscar pacientes:', err);
        setError(err.message || 'Error al buscar pacientes');
        setPacientesEncontrados([]);
      } finally {
        setSearchingPatients(false);
      }
    };

    const timeoutId = setTimeout(searchPacientes, 300);
    return () => clearTimeout(timeoutId);
  }, [searchPatient]);

  // Cargar doctores cuando se avanza al paso 2
  useEffect(() => {
    const loadDoctores = async () => {
      if (step !== 2) return;

      setLoadingDoctors(true);
      setError(null);

      try {
        const result = await adminCitasService.getDoctores();
        setDoctores(result);
      } catch (err: any) {
        console.error('Error al cargar doctores:', err);
        setError(err.message || 'Error al cargar doctores');
        toast.error('Error al cargar doctores');
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctores();
  }, [step]);

  // Cargar slots cuando se selecciona una fecha
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setSlots([]);
        return;
      }

      setLoadingSlots(true);
      setError(null);

      try {
        const result = await adminCitasService.getSlotsDisponibles(
          selectedDoctor.id,
          selectedDate
        );
        setSlots(result);

        if (result.length === 0) {
          toast.warning('No hay horarios disponibles para esta fecha');
        }
      } catch (err: any) {
        console.error('Error al cargar slots:', err);
        setError(err.message || 'Error al cargar horarios');
        toast.error('Error al cargar horarios disponibles');
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDoctor, selectedDate]);

  const handlePatientSelect = (patient: PacienteSearch) => {
    setSelectedPatient(patient);
    setSearchPatient('');
    setPacientesEncontrados([]);
  };

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctores.find(d => d.id.toString() === doctorId);
    setSelectedDoctor(doctor || null);
    // Reset slot selection when doctor changes
    setSelectedSlot(null);
    setSlots([]);
  };

  const handleSlotSelect = (slot: SlotDisponible) => {
    setSelectedSlot(slot);
  };

  const handleCreateAppointment = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedSlot) {
      toast.error('Faltan datos requeridos');
      return;
    }

    setCreatingAppointment(true);
    setError(null);

    try {
      const citaCreada = await adminCitasService.createCita({
        pacienteId: selectedPatient.id,
        medicoId: selectedDoctor.id,
        turnoId: selectedSlot.turnoId,
        motivo: motivo || undefined,
        notasInternas: notasInternas || undefined,
        enviarEmail: enviarEmail
      });

      toast.success(
        `óCita creada exitosamente!${citaCreada.emailEnviado ? ' Email enviado al paciente.' : ''}`,
        {
          description: `Cita para ${citaCreada.nombrePaciente} con ${citaCreada.nombreMedico}`
        }
      );

      // Volver a la vista anterior
      onBack?.();
    } catch (err: any) {
      console.error('Error al crear cita:', err);
      const errorMsg = err.message || 'Error al crear la cita';
      setError(errorMsg);
      toast.error('Error al crear la cita', {
        description: errorMsg
      });
    } finally {
      setCreatingAppointment(false);
    }
  };

  const canGoToNextStep = () => {
    switch (step) {
      case 1:
        return !!selectedPatient;
      case 2:
        return !!selectedDoctor;
      case 3:
        return !!selectedSlot;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} disabled={creatingAppointment}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nueva cita</h2>
          <p className="text-sm text-gray-500 mt-1">Crea una cita en nombre de un paciente</p>
        </div>
      </div>

      {/* Error Global */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Paciente' },
              { num: 2, label: 'Doctor' },
              { num: 3, label: 'Fecha/Hora' },
              { num: 4, label: 'Detalles' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s.num ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                  </div>
                  <p className="text-xs mt-2 text-gray-600">{s.label}</p>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s.num ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Patient */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>1. Seleccionar paciente</CardTitle>
            <CardDescription>Busca y selecciona el paciente para la cita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o ID (mínimo 2 caracteres)..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="pl-10"
                disabled={searchingPatients}
              />
              {searchingPatients && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>

            {pacientesEncontrados.length > 0 && (
              <div className="border border-gray-200 rounded-lg divide-y max-h-96 overflow-y-auto">
                {pacientesEncontrados.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{patient.nombreCompleto}</p>
                        <p className="text-xs text-gray-500">
                          {patient.email}
                          {patient.telefono && ` ó ${patient.telefono}`}
                          {patient.identificacion && ` ó ID: ${patient.identificacion}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchPatient.length >= 2 && pacientesEncontrados.length === 0 && !searchingPatients && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No se encontraron pacientes con "{searchPatient}"</p>
              </div>
            )}

            {selectedPatient && (
              <Card className="bg-teal-50 border-teal-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedPatient.nombreCompleto}</p>
                        <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                        {selectedPatient.telefono && (
                          <p className="text-sm text-gray-600">{selectedPatient.telefono}</p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-teal-600 text-white">Seleccionado</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" disabled>Anterior</Button>
              <Button 
                onClick={() => setStep(2)}
                disabled={!canGoToNextStep()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Doctor */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Seleccionar doctor</CardTitle>
            <CardDescription>Elige el médico para la cita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingDoctors ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <p className="ml-3 text-gray-600">Cargando doctores...</p>
              </div>
            ) : (
              <div>
                <Label>Doctor</Label>
                <Select 
                  value={selectedDoctor?.id.toString() || ''} 
                  onValueChange={handleDoctorSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {doctores.map(doc => (
                      <SelectItem key={doc.id} value={doc.id.toString()}>
                        {doc.nombreCompleto}
                        {doc.especialidades.length > 0 && ` - ${doc.especialidades.join(', ')}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {doctores.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No hay doctores disponibles</p>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Anterior</Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!canGoToNextStep()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Date & Time */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Seleccionar fecha y hora</CardTitle>
            <CardDescription>Elige la fecha y horario disponible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Fecha de la cita</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null); // Reset slot when date changes
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {selectedDate && (
              <div>
                <Label>Horario disponible</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                    <p className="ml-3 text-gray-600">Cargando horarios...</p>
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {slots.map(slot => (
                      <Button
                        key={slot.turnoId}
                        variant={selectedSlot?.turnoId === slot.turnoId ? 'default' : 'outline'}
                        onClick={() => handleSlotSelect(slot)}
                        className={selectedSlot?.turnoId === slot.turnoId ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      >
                        {slot.hora}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg mt-2">
                    <p className="text-sm">No hay horarios disponibles para esta fecha</p>
                    <p className="text-xs mt-1">Selecciona otra fecha</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>Anterior</Button>
              <Button 
                onClick={() => setStep(4)}
                disabled={!canGoToNextStep()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Details */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>4. Detalles de la cita</CardTitle>
            <CardDescription>información adicional y confirmación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="motivo">Motivo de la consulta</Label>
              <Input
                id="motivo"
                placeholder="Ej: Consulta de control"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="notas">Notas internas (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Notas para el staff médico..."
                value={notasInternas}
                onChange={(e) => setNotasInternas(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email">Enviar correo de confirmación al paciente</Label>
                <p className="text-xs text-gray-500">Se enviará un email con los detalles de la cita</p>
              </div>
              <Switch
                id="email"
                checked={enviarEmail}
                onCheckedChange={setEnviarEmail}
              />
            </div>

            <Separator />

            {/* Summary */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-base">Resumen de la cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paciente:</span>
                  <span className="font-medium text-gray-900">{selectedPatient?.nombreCompleto}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium text-gray-900">{selectedDoctor?.nombreCompleto}</span>
                </div>
                {selectedDoctor && selectedDoctor.especialidades.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Especialidad:</span>
                    <span className="font-medium text-gray-900">{selectedDoctor.especialidades[0]}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-medium text-gray-900">{selectedSlot?.hora}</span>
                </div>
                {motivo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Motivo:</span>
                    <span className="font-medium text-gray-900">{motivo}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)} disabled={creatingAppointment}>
                Anterior
              </Button>
              <Button 
                onClick={handleCreateAppointment}
                disabled={creatingAppointment}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {creatingAppointment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Crear cita
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
