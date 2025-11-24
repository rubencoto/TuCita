import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AdminConfiguracion() {
  const [duracionCita, setDuracionCita] = useState('30');
  const [maxCitasPorDia, setMaxCitasPorDia] = useState('20');
  const [horasCancelacion, setHorasCancelacion] = useState('24');
  const [maxNoShow, setMaxNoShow] = useState('3');
  const [enviarRecordatorio, setEnviarRecordatorio] = useState(true);
  const [horasRecordatorio, setHorasRecordatorio] = useState('24');

  const handleSave = () => {
    const config = {
      duracionCita,
      maxCitasPorDia,
      horasCancelacion,
      maxNoShow,
      enviarRecordatorio,
      horasRecordatorio
    };
    console.log('Saving configuration:', config);
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración del sistema</h2>
        <p className="text-sm text-gray-500 mt-1">Ajusta los parámetros generales de TuCitaOnline</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Parámetros de citas</CardTitle>
            <CardDescription>Configuración de duración y límites</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="duracion">Duración estándar de cita (minutos)</Label>
              <Select value={duracionCita} onValueChange={setDuracionCita}>
                <SelectTrigger id="duracion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="20">20 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxCitas">Máximo de citas por día por doctor</Label>
              <Input
                id="maxCitas"
                type="number"
                value={maxCitasPorDia}
                onChange={(e) => setMaxCitasPorDia(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Políticas de cancelación</CardTitle>
            <CardDescription>Reglas para cancelar y bloquear usuarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="horasCancelacion">Cancelación permitida hasta (horas antes)</Label>
              <Input
                id="horasCancelacion"
                type="number"
                value={horasCancelacion}
                onChange={(e) => setHorasCancelacion(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Los pacientes deben cancelar al menos {horasCancelacion} horas antes
              </p>
            </div>

            <div>
              <Label htmlFor="maxNoShow">Máximo de NO_SHOW antes de bloqueo</Label>
              <Input
                id="maxNoShow"
                type="number"
                value={maxNoShow}
                onChange={(e) => setMaxNoShow(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Después de {maxNoShow} faltas sin aviso, el paciente será bloqueado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Configuración de recordatorios por email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="recordatorio">Enviar recordatorio por correo</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Envía un email automático antes de cada cita
                </p>
              </div>
              <Switch
                id="recordatorio"
                checked={enviarRecordatorio}
                onCheckedChange={setEnviarRecordatorio}
              />
            </div>

            {enviarRecordatorio && (
              <>
                <Separator />
                <div>
                  <Label htmlFor="horasRecordatorio">Enviar recordatorio (horas antes)</Label>
                  <Select value={horasRecordatorio} onValueChange={setHorasRecordatorio}>
                    <SelectTrigger id="horasRecordatorio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 horas antes</SelectItem>
                      <SelectItem value="6">6 horas antes</SelectItem>
                      <SelectItem value="12">12 horas antes</SelectItem>
                      <SelectItem value="24">24 horas antes</SelectItem>
                      <SelectItem value="48">48 horas antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del sistema</CardTitle>
            <CardDescription>Datos técnicos y versión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Versión:</span>
              <span className="font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Última actualización:</span>
              <span className="font-medium text-gray-900">2025-11-15</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Usuarios registrados:</span>
              <span className="font-medium text-gray-900">1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Citas totales:</span>
              <span className="font-medium text-gray-900">5,621</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
          <Save className="h-4 w-4 mr-2" />
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
