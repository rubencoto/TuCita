import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CalendarRange, Loader2, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DoctorLayout } from '@/components/layout/doctor/DoctorLayout';
import { WeeklyScheduleBuilder } from '@/components/pages/doctor/weekly-schedule-builder';
import * as availabilityService from '@/services/api/doctor/doctorAvailabilityService';
import type { WeeklyTimeSlot } from '@/services/api/doctor/doctorAvailabilityService';

interface DoctorScheduleConfigPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DoctorScheduleConfigPage({ onNavigate, onLogout }: DoctorScheduleConfigPageProps) {
  const [bulkSchedule, setBulkSchedule] = useState<Record<number, WeeklyTimeSlot[]>>(
    availabilityService.getDefaultWeeklySchedule()
  );
  const [bulkDateRange, setBulkDateRange] = useState(() => {
    const range = availabilityService.getNextMonthRange();
    return range;
  });
  const [submitting, setSubmitting] = useState(false);

  const handleBulkCreate = async () => {
    // Validar que hay al menos un día configurado
    const totalSlots = Object.values(bulkSchedule).reduce((sum, slots) => sum + slots.length, 0);
    if (totalSlots === 0) {
      toast.error('Debe configurar al menos un horario');
      return;
    }

    setSubmitting(true);
    try {
      const result = await availabilityService.bulkCreateSlots({
        doctorId: 'DOC-001',
        fechaInicio: bulkDateRange.start,
        fechaFin: bulkDateRange.end,
        horarioSemanal: bulkSchedule,
      });

      toast.success(`${result.slotsCreados} horarios creados correctamente`, {
        description: result.errores.length > 0 
          ? `${result.errores.length} conflictos encontrados` 
          : undefined
      });

      if (result.errores.length > 0) {
        console.warn('Errores en creación masiva:', result.errores);
      }

      // Volver a la página de disponibilidad
      onNavigate('doctor-availability');
    } catch (error: any) {
      console.error('Error creating bulk slots:', error);
      toast.error(error.message || 'Error al crear horarios masivos');
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedSlots = (() => {
    const start = new Date(bulkDateRange.start + 'T00:00:00');
    const end = new Date(bulkDateRange.end + 'T00:00:00');
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalSlots = Object.values(bulkSchedule).reduce((sum, slots) => sum + slots.length, 0);
    const weeksCount = Math.ceil(days / 7);
    return Math.min(totalSlots * weeksCount, totalSlots * days);
  })();

  return (
    <DoctorLayout 
      currentPage="doctor-availability" 
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="p-4 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate('doctor-availability')}
              disabled={submitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Disponibilidad
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onNavigate('doctor-availability')} 
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleBulkCreate} 
                className="bg-[#2E8BC0]" 
                disabled={submitting || estimatedSlots === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Horarios ({estimatedSlots})
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crear Horario Mensual
            </h1>
            <p className="text-gray-600">
              Configura tu horario semanal y se aplicará automáticamente al rango de fechas seleccionado
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Selector de rango de fechas */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fecha inicio</Label>
                  <Input
                    type="date"
                    value={bulkDateRange.start}
                    onChange={(e) => setBulkDateRange({ ...bulkDateRange, start: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label>Fecha fin</Label>
                  <Input
                    type="date"
                    value={bulkDateRange.end}
                    onChange={(e) => setBulkDateRange({ ...bulkDateRange, end: e.target.value })}
                    min={bulkDateRange.start}
                    disabled={submitting}
                  />
                </div>
              </div>
              <p className="text-sm text-blue-700 mt-3">
                Se crearán horarios desde el {new Date(bulkDateRange.start + 'T00:00:00').toLocaleDateString('es-ES')} 
                {' '}hasta el {new Date(bulkDateRange.end + 'T00:00:00').toLocaleDateString('es-ES')}
              </p>
            </CardContent>
          </Card>

          {/* Constructor de horario semanal */}
          <WeeklyScheduleBuilder
            initialSchedule={bulkSchedule}
            onChange={setBulkSchedule}
          />

          {/* Vista previa */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Se crearán aproximadamente <strong>{estimatedSlots}</strong> slots. 
              Los horarios que se solapen con slots existentes serán ignorados.
            </AlertDescription>
          </Alert>

          {/* Footer con botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onNavigate('doctor-availability')} 
              disabled={submitting}
              size="lg"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleBulkCreate} 
              className="bg-[#2E8BC0]" 
              disabled={submitting || estimatedSlots === 0}
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando {estimatedSlots} horarios...
                </>
              ) : (
                <>
                  <CalendarRange className="h-4 w-4 mr-2" />
                  Crear {estimatedSlots} horarios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
