import { useState } from 'react';
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
  X
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Alert, AlertDescription } from '../ui/alert';

interface DoctorMedicalHistoryPageProps {
  patientId?: string;
  onNavigate: (page: string, data?: any) => void;
}

export function DoctorMedicalHistoryPage({ patientId, onNavigate }: DoctorMedicalHistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState(patientId || 'all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Mock data - historial médico completo
  const medicalHistory = [
    {
      id_historial: 1,
      fecha_registro: '2025-11-08',
      cita_id: 3,
      paciente: {
        id: '1',
        nombre: 'Juan Pérez García',
        edad: 45,
        foto: 'https://images.unsplash.com/photo-1598581681233-eee2272ddc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcGF0aWVudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MjYwNTI2NXww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      diagnostico: 'Cefalea tensional crónica',
      tratamiento: 'Ibuprofeno 400mg cada 8 horas por 7 días. Relajantes musculares si persiste el dolor.',
      indicaciones: 'Evitar estrés, mantener horarios regulares de sueño. Control en 2 semanas si no mejora.',
      doctor: 'Dra. Laura Martínez',
    },
    {
      id_historial: 2,
      fecha_registro: '2025-10-15',
      cita_id: 12,
      paciente: {
        id: '1',
        nombre: 'Juan Pérez García',
        edad: 45,
        foto: 'https://images.unsplash.com/photo-1598581681233-eee2272ddc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcGF0aWVudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MjYwNTI2NXww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      diagnostico: 'Hipertensión arterial leve (140/90 mmHg)',
      tratamiento: 'Enalapril 10mg una vez al día. Dieta baja en sodio.',
      indicaciones: 'Monitoreo de presión arterial diario. Control mensual. Realizar ejercicio moderado 30 min diarios.',
      doctor: 'Dra. Laura Martínez',
    },
    {
      id_historial: 3,
      fecha_registro: '2025-11-05',
      cita_id: 8,
      paciente: {
        id: '2',
        nombre: 'María López Torres',
        edad: 32,
        foto: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBwYXRpZW50JTIwbWVkaWNhbHxlbnwxfHx8fDE3NjI2MDUyNjV8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      diagnostico: 'Revisión post-operatoria - Evolución favorable',
      tratamiento: 'Continuar con antibiótico profiláctico (Amoxicilina 500mg) hasta completar 10 días.',
      indicaciones: 'Curación de herida cada 48 horas. Reposo relativo. Evitar esfuerzos. Control en 1 semana.',
      doctor: 'Dra. Laura Martínez',
    },
    {
      id_historial: 4,
      fecha_registro: '2025-10-20',
      cita_id: 15,
      paciente: {
        id: '3',
        nombre: 'Carlos Rodríguez Sanz',
        edad: 58,
        foto: 'https://images.unsplash.com/photo-1758691462321-9b6c98c40f7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwcGF0aWVudCUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzYyNjA1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      diagnostico: 'Diabetes Mellitus tipo 2 controlada. Hemoglobina glicosilada: 6.8%',
      tratamiento: 'Metformina 850mg dos veces al día. Mantener dieta.',
      indicaciones: 'Control glucémico en ayunas diario. Dieta hipocalórica. Ejercicio regular. Control en 3 meses.',
      doctor: 'Dra. Laura Martínez',
    },
    {
      id_historial: 5,
      fecha_registro: '2025-09-20',
      cita_id: 22,
      paciente: {
        id: '1',
        nombre: 'Juan Pérez García',
        edad: 45,
        foto: 'https://images.unsplash.com/photo-1598581681233-eee2272ddc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcGF0aWVudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MjYwNTI2NXww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      diagnostico: 'Control de rutina - Sin hallazgos patológicos',
      tratamiento: 'No requiere tratamiento farmacológico.',
      indicaciones: 'Mantener hábitos saludables. Control anual. Vacunación contra influenza.',
      doctor: 'Dra. Laura Martínez',
    },
  ];

  // Lista de pacientes únicos
  const patients = Array.from(new Set(medicalHistory.map(h => h.paciente.id)))
    .map(id => {
      const record = medicalHistory.find(h => h.paciente.id === id);
      return record?.paciente;
    })
    .filter(Boolean);

  const filteredHistory = medicalHistory.filter(record => {
    // Filtro por paciente
    if (filterPatient !== 'all' && record.paciente.id !== filterPatient) {
      return false;
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !record.paciente.nombre.toLowerCase().includes(searchLower) &&
        !record.diagnostico.toLowerCase().includes(searchLower) &&
        !record.doctor.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Filtro por fecha
    if (filterDate && record.fecha_registro !== filterDate) {
      return false;
    }

    return true;
  }).sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime());

  const handleExport = () => {
    const content = filteredHistory.map(record => 
      `FECHA: ${record.fecha_registro}
PACIENTE: ${record.paciente.nombre}
DIAGNÓSTICO: ${record.diagnostico}
TRATAMIENTO: ${record.tratamiento}
INDICACIONES: ${record.indicaciones}
DOCTOR: ${record.doctor}
${'='.repeat(80)}`
    ).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-medico-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
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
                filteredHistory.map((record) => (
                  <TableRow key={record.id_historial} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(record.fecha_registro).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <ImageWithFallback
                          src={record.paciente.foto}
                          alt={record.paciente.nombre}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{record.paciente.nombre}</p>
                          <p className="text-sm text-gray-500">{record.paciente.edad} años</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate font-medium">{record.diagnostico}</p>
                    </TableCell>
                    <TableCell>{record.doctor}</TableCell>
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
                                <ImageWithFallback
                                  src={selectedRecord.paciente.foto}
                                  alt={selectedRecord.paciente.nombre}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-semibold text-lg">{selectedRecord.paciente.nombre}</p>
                                  <p className="text-sm text-gray-600">{selectedRecord.paciente.edad} años</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Fecha de registro</p>
                                  <p className="font-medium">
                                    {new Date(selectedRecord.fecha_registro).toLocaleDateString('es-ES', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Doctor</p>
                                  <p className="font-medium">{selectedRecord.doctor}</p>
                                </div>
                              </div>

                              <Separator />

                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="bg-red-100 p-2 rounded-lg">
                                    <FileText className="h-5 w-5 text-red-600" />
                                  </div>
                                  <h3 className="font-semibold text-lg">Diagnóstico</h3>
                                </div>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                  {selectedRecord.diagnostico}
                                </p>
                              </div>

                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <ClipboardList className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <h3 className="font-semibold text-lg">Tratamiento</h3>
                                </div>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                  {selectedRecord.tratamiento || 'No especificado'}
                                </p>
                              </div>

                              <div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="bg-green-100 p-2 rounded-lg">
                                    <ClipboardList className="h-5 w-5 text-green-600" />
                                  </div>
                                  <h3 className="font-semibold text-lg">Indicaciones</h3>
                                </div>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                  {selectedRecord.indicaciones || 'No especificadas'}
                                </p>
                              </div>

                              <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500">
                                  Registro ID: #{selectedRecord.id_historial} • Cita ID: #{selectedRecord.cita_id}
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
