import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Ban,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import adminCitasService, { AdminCitaList } from '@/services/api/admin/adminCitasService';
import { toast } from 'sonner';
import { cn } from '@/components/ui/utils';

interface AdminCitaDetalleProps {
  isOpen: boolean;
  onClose: () => void;
  citaId: number | null;
  onUpdateSuccess?: () => void;
}

interface CitaDetallada extends AdminCitaList {
  pacienteEmail?: string;
  pacienteTelefono?: string;
  pacienteIdentificacion?: string;
  doctorEmail?: string;
  doctorTelefono?: string;
}

const statusColors: Record<string, string> = {
  PROGRAMADA: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMADA: 'bg-blue-100 text-blue-800 border-blue-200',
  ATENDIDA: 'bg-green-100 text-green-800 border-green-200',
  CANCELADA: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  NO_SHOW: 'bg-red-100 text-red-800 border-red-200',
  RECHAZADA: 'bg-red-100 text-red-800 border-red-200',
  REPROGRAMADA: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusIcons: Record<string, any> = {
  PROGRAMADA: Clock,
  CONFIRMADA: CheckCircle,
  ATENDIDA: CheckCircle,
  CANCELADA: XCircle,
  NO_SHOW: AlertCircle,
  RECHAZADA: Ban,
  REPROGRAMADA: Clock,
};

const origenColors: Record<string, string> = {
  PACIENTE: 'bg-teal-100 text-teal-800 border-teal-200',
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function AdminCitaDetalle({ isOpen, onClose, citaId, onUpdateSuccess }: AdminCitaDetalleProps) {
  const [cita, setCita] = useState<CitaDetallada | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && citaId) {
      loadCitaDetalle();
    } else {
      setCita(null);
    }
  }, [isOpen, citaId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const loadCitaDetalle = async () => {
    if (!citaId) return;

    setLoading(true);
    try {
      const data = await adminCitasService.getCitaDetalle(citaId);
      setCita(data as CitaDetallada);
    } catch (error: any) {
      console.error('Error al cargar detalle de cita:', error);
      toast.error(error.message || 'Error al cargar el detalle de la cita');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!citaId) return;

    const confirmado = confirm('¿Estós seguro de que deseas cancelar esta cita?');
    if (!confirmado) return;

    try {
      await adminCitasService.deleteCita(citaId);
      toast.success('Cita cancelada exitosamente');
      onUpdateSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error al cancelar cita:', error);
      toast.error(error.message || 'Error al cancelar la cita');
    }
  };

  const handleMarcarAtendida = async () => {
    if (!citaId) return;

    try {
      await adminCitasService.updateEstadoCita(citaId, {
        estado: 'ATENDIDA',
        notas: 'Marcada como atendida desde vista de detalle',
      });
      toast.success('Cita marcada como atendida');
      loadCitaDetalle(); // Recargar para ver el nuevo estado
      onUpdateSuccess?.();
    } catch (error: any) {
      console.error('Error al actualizar cita:', error);
      toast.error(error.message || 'Error al actualizar la cita');
    }
  };

  const formatearFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  const StatusIcon = cita ? statusIcons[cita.estado] : Clock;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-50 max-w-3xl w-full sm:max-w-[700px] max-h-[90vh] overflow-hidden bg-background rounded-lg border p-6 shadow-lg">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5 text-teal-600" />
                  Detalle de Cita
                </h3>
                <p className="text-sm text-muted-foreground">
                  Información completa de la cita médica
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {loading ? null : cita ? `ID: #${cita.id}` : ''}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : cita ? (
            <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border', statusColors[cita.estado])}>
                      {StatusIcon ? <StatusIcon className="h-4 w-4" /> : null}
                      <span className="font-medium">{cita.estado}</span>
                    </div>
                    <Badge className={cn('border', origenColors[cita.origen])}>
                      {cita.origen === 'PACIENTE' ? 'Agendada por Paciente' : 'Agendada por Admin'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-600" />
                    Información del Paciente
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nombre completo</p>
                        <p className="text-sm font-medium text-gray-900">{cita.paciente}</p>
                      </div>
                      {cita.pacienteEmail && (
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Email
                          </p>
                          <p className="text-sm text-gray-900">{cita.pacienteEmail}</p>
                        </div>
                      )}
                      {cita.pacienteTelefono && (
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Teléfono
                          </p>
                          <p className="text-sm text-gray-900">{cita.pacienteTelefono}</p>
                        </div>
                      )}
                      {cita.pacienteIdentificacion && (
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            Identificación
                          </p>
                          <p className="text-sm text-gray-900">{cita.pacienteIdentificacion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-teal-600" />
                    Información del Doctor
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nombre completo</p>
                        <p className="text-sm font-medium text-gray-900">{cita.doctor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Especialidad</p>
                        <Badge variant="outline" className="text-xs">{cita.especialidad}</Badge>
                      </div>
                      {cita.doctorEmail && (
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Email
                          </p>
                          <p className="text-sm text-gray-900">{cita.doctorEmail}</p>
                        </div>
                      )}
                      {cita.doctorTelefono && (
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Teléfono
                          </p>
                          <p className="text-sm text-gray-900">{cita.doctorTelefono}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    Detalles de la Cita
                  </h3>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-teal-700">Fecha</p>
                        <p className="text-sm font-medium text-teal-900">{formatearFecha(cita.fecha)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-teal-700 flex items-center gap-1"><Clock className="h-3 w-3" />Hora</p>
                        <p className="text-sm font-medium text-teal-900">{cita.hora}</p>
                      </div>
                    </div>
                    {cita.motivo && (
                      <div className="pt-2 border-t border-teal-200">
                        <p className="text-xs text-teal-700 mb-1">Motivo de consulta</p>
                        <p className="text-sm text-teal-900">{cita.motivo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {(cita.estado === 'PROGRAMADA' || cita.estado === 'CONFIRMADA') && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900">Acciones rápidas</h3>
                      <div className="flex gap-2">
                        {cita.estado === 'CONFIRMADA' && (
                          <Button onClick={handleMarcarAtendida} className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Atendida
                          </Button>
                        )}
                        <Button onClick={handleCancelar} variant="destructive" size="sm" className="flex-1">
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar Cita
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No se pudo cargar la Información de la cita</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
