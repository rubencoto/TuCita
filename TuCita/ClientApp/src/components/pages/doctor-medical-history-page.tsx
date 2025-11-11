import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { 
  Search,
  FileText,
  Calendar,
  User,
  Eye,
  ClipboardList,
  Download,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Alert, AlertDescription } from '../ui/alert';
import { medicalHistoryService, HistorialMedicoExtendidoDto } from '../../services/medicalHistoryService';
import { DoctorLayout } from '../doctor/DoctorLayout';

interface DoctorMedicalHistoryPageProps {
  patientId?: string;
  onNavigate: (page: string, data?: any) => void;
  onLogout: () => void;
}

interface PatientInfo {
  id: number;
  nombre: string;
  edad?: number;
  foto?: string;
}

export function DoctorMedicalHistoryPage({ patientId, onNavigate, onLogout }: DoctorMedicalHistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState(patientId || 'all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<HistorialMedicoExtendidoDto | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<HistorialMedicoExtendidoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar historial médico
  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await medicalHistoryService.getDoctorAllPatientsHistory();
      setMedicalHistory(data);
    } catch (err: any) {
      console.error('Error al cargar historial médico:', err);
      setError(err.message || 'Error al cargar el historial médico');
    } finally {
      setLoading(false);
    }
  };

  // Lista de pacientes únicos
  const patients: PatientInfo[] = Array.from(
    new Map(
      medicalHistory.map(h => [
        h.pacienteId,
        {
          id: h.pacienteId,
          nombre: h.nombrePaciente,
          edad: h.edadPaciente,
          foto: h.fotoPaciente
        }
      ])
    ).values()
  );

  const filteredHistory = medicalHistory.filter(record => {
    // Filtro por paciente
    if (filterPatient !== 'all' && record.pacienteId.toString() !== filterPatient) {
      return false;
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const diagnosticos = record.diagnosticos.map(d => d.descripcion).join(' ').toLowerCase();
      
      if (
        !record.nombrePaciente.toLowerCase().includes(searchLower) &&
        !diagnosticos.includes(searchLower) &&
        !record.nombreMedico.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Filtro por fecha
    if (filterDate) {
      const recordDate = new Date(record.fechaCita).toISOString().split('T')[0];
      if (recordDate !== filterDate) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => new Date(b.fechaCita).getTime() - new Date(a.fechaCita).getTime());

  const handleExport = () => {
    const content = filteredHistory.map(record => {
      const diagnostico = record.diagnosticos.length > 0 
        ? record.diagnosticos[0].descripcion 
        : 'Sin diagnóstico';
      const tratamiento = record.recetas.length > 0 
        ? record.recetas[0].indicaciones || 'Sin tratamiento especificado' 
        : 'Sin tratamiento';
      const indicaciones = record.notasClinicas.length > 0 
        ? record.notasClinicas[0].contenido 
        : 'Sin indicaciones';
      
      return `FECHA: ${new Date(record.fechaCita).toLocaleDateString('es-ES')}
PACIENTE: ${record.nombrePaciente}
DIAGNÓSTICO: ${diagnostico}
TRATAMIENTO: ${tratamiento}
INDICACIONES: ${indicaciones}
DOCTOR: ${record.nombreMedico}
${'='.repeat(80)}`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-medico-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <DoctorLayout 
        currentPage="doctor-medical-history" 
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Cargando historial médico...</p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout 
        currentPage="doctor-medical-history" 
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="p-8">
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout 
      currentPage="doctor-medical-history" 
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Historial Médico
              </h1>
              <p className="text-gray-600">
                Consulta el historial médico completo de todos tus pacientes
              </p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar paciente o diagnóstico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterPatient} onValueChange={setFilterPatient}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los pacientes</SelectItem>
                    {patients.map((patient: any) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  placeholder="Fecha"
                />

                {(searchTerm || filterPatient !== 'all' || filterDate) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterPatient('all');
                      setFilterDate('');
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Mostrando {filteredHistory.length} de {medicalHistory.length} registros
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información importante */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <ClipboardList className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Este es el historial médico completo en modo <strong>solo lectura</strong>. 
            Para agregar nuevos registros, accede desde el detalle de una cita específica.
          </AlertDescription>
        </Alert>

        {/* Tabla de historial */}
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-1">No se encontraron registros</p>
                        <p className="text-sm text-gray-500">
                          Intenta ajustar los filtros de búsqueda
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((record) => {
                    const diagnostico = record.diagnosticos.length > 0 
                      ? record.diagnosticos[0].descripcion 
                      : 'Sin diagnóstico registrado';
                    
                    return (
                      <TableRow key={record.citaId} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(record.fechaCita).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {record.fotoPaciente ? (
                              <ImageWithFallback
                                src={record.fotoPaciente}
                                alt={record.nombrePaciente}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{record.nombrePaciente}</p>
                              {record.edadPaciente && (
                                <p className="text-sm text-gray-500">{record.edadPaciente} años</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="truncate font-medium">{diagnostico}</p>
                        </TableCell>
                        <TableCell>{record.nombreMedico}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Detalle del Registro Médico</DialogTitle>
                              </DialogHeader>
                              {selectedRecord && (
                                <div className="space-y-6 py-4">
                                  {/* Información del paciente */}
                                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    {selectedRecord.fotoPaciente ? (
                                      <ImageWithFallback
                                        src={selectedRecord.fotoPaciente}
                                        alt={selectedRecord.nombrePaciente}
                                        className="w-16 h-16 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-8 w-8 text-gray-500" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-semibold text-lg">{selectedRecord.nombrePaciente}</p>
                                      {selectedRecord.edadPaciente && (
                                        <p className="text-sm text-gray-600">{selectedRecord.edadPaciente} años</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">Fecha de registro</p>
                                      <p className="font-medium">
                                        {new Date(selectedRecord.fechaCita).toLocaleDateString('es-ES', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">Doctor</p>
                                      <p className="font-medium">{selectedRecord.nombreMedico}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div>
                                    <div className="flex items-center space-x-2 mb-3">
                                      <div className="bg-red-100 p-2 rounded-lg">
                                        <FileText className="h-5 w-5 text-red-600" />
                                      </div>
                                      <h3 className="font-semibold text-lg">Diagnósticos</h3>
                                    </div>
                                    {selectedRecord.diagnosticos.length > 0 ? (
                                      <div className="space-y-2">
                                        {selectedRecord.diagnosticos.map((diag) => (
                                          <div key={diag.id} className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{diag.descripcion}</p>
                                            {diag.codigo && (
                                              <p className="text-sm text-gray-500 mt-1">Código: {diag.codigo}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">
                                        No hay diagnósticos registrados
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center space-x-2 mb-3">
                                      <div className="bg-blue-100 p-2 rounded-lg">
                                        <ClipboardList className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <h3 className="font-semibold text-lg">Recetas y Tratamiento</h3>
                                    </div>
                                    {selectedRecord.recetas.length > 0 ? (
                                      <div className="space-y-4">
                                        {selectedRecord.recetas.map((receta) => (
                                          <div key={receta.id} className="bg-gray-50 p-4 rounded-lg">
                                            {receta.indicaciones && (
                                              <p className="text-gray-700 mb-3">{receta.indicaciones}</p>
                                            )}
                                            {receta.medicamentos.length > 0 && (
                                              <div className="space-y-2">
                                                <p className="text-sm font-semibold text-gray-700">Medicamentos:</p>
                                                {receta.medicamentos.map((med) => (
                                                  <div key={med.id} className="pl-4 border-l-2 border-blue-300">
                                                    <p className="font-medium">{med.medicamento}</p>
                                                    {med.dosis && <p className="text-sm text-gray-600">Dosis: {med.dosis}</p>}
                                                    {med.frecuencia && <p className="text-sm text-gray-600">Frecuencia: {med.frecuencia}</p>}
                                                    {med.duracion && <p className="text-sm text-gray-600">Duración: {med.duracion}</p>}
                                                    {med.notas && <p className="text-sm text-gray-500 italic mt-1">{med.notas}</p>}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">
                                        No hay recetas registradas
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center space-x-2 mb-3">
                                      <div className="bg-green-100 p-2 rounded-lg">
                                        <ClipboardList className="h-5 w-5 text-green-600" />
                                      </div>
                                      <h3 className="font-semibold text-lg">Notas Clínicas</h3>
                                    </div>
                                    {selectedRecord.notasClinicas.length > 0 ? (
                                      <div className="space-y-2">
                                        {selectedRecord.notasClinicas.map((nota) => (
                                          <div key={nota.id} className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{nota.contenido}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                              {new Date(nota.fecha).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">
                                        No hay notas clínicas registradas
                                      </p>
                                    )}
                                  </div>

                                  {selectedRecord.documentos.length > 0 && (
                                    <div>
                                      <div className="flex items-center space-x-2 mb-3">
                                        <div className="bg-purple-100 p-2 rounded-lg">
                                          <FileText className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Documentos</h3>
                                      </div>
                                      <div className="space-y-2">
                                        {selectedRecord.documentos.map((doc) => (
                                          <div key={doc.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                                            <div>
                                              <p className="font-medium">{doc.nombreArchivo}</p>
                                              <p className="text-sm text-gray-500">
                                                {medicalHistoryService.getCategoryLabel(doc.categoria)} • 
                                                {medicalHistoryService.formatFileSize(doc.tamanoBytes)}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="pt-4 border-t">
                                    <p className="text-xs text-gray-500">
                                      Cita ID: #{selectedRecord.citaId}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
    </DoctorLayout>
  );
}
