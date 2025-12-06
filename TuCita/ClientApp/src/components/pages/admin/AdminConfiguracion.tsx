import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

export function AdminConfiguracion() {
  // Simplified state for easy admin usage
  const [workDays, setWorkDays] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
  const [holidays, setHolidays] = useState('');
  const [slotMinutes, setSlotMinutes] = useState('30');

  const [noShowLimit, setNoShowLimit] = useState('3');
  const [cancelHours, setCancelHours] = useState('24');

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderHours, setReminderHours] = useState('24');
  const [emailTemplate, setEmailTemplate] = useState('');

  const [autoBlock, setAutoBlock] = useState(true);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [sessionControl, setSessionControl] = useState(true);

  const days = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  const toggleDay = (d: string) => {
    setWorkDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleApply = () => {
    const config = {
      workDays,
      holidays,
      slotMinutes: Number(slotMinutes),
      noShowLimit: Number(noShowLimit),
      cancelHours: Number(cancelHours),
      remindersEnabled,
      reminderHours: Number(reminderHours),
      emailTemplate,
      autoBlock,
      adminNewPassword: adminNewPassword ? '***CHANGED***' : '(no change)',
      sessionControl,
    };

    console.log('Admin config (client):', config);
    toast.success('Cambios aplicados localmente. Implementa API para persistir.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Administrador del Sistema</h2>
        <p className="text-sm text-gray-500 mt-1">Gestiona horarios, reglas, seguridad y preferencias globales.</p>
      </div>

      <div className="space-y-4">
        {/* Control de Horarios */}
        <Card>
          <CardHeader>
            <CardTitle>1. Control de Horarios</CardTitle>
            <CardDescription>Configura los días laborales, feriados y el intervalo de turnos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Días laborales</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {days.map(d => (
                  <label key={d} className="inline-flex items-center space-x-2">
                    <Checkbox checked={workDays.includes(d)} onCheckedChange={() => toggleDay(d)} />
                    <span className="text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Feriados / días no laborables</Label>
              <Textarea
                placeholder="Escribe fechas o descripciones separadas por comas"
                rows={2}
                value={holidays}
                onChange={(e) => setHolidays(e.target.value)}
              />
            </div>

            <div>
              <Label>Intervalo por turno (minutos)</Label>
              <Input type="number" value={slotMinutes} onChange={(e) => setSlotMinutes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Políticas y Reglas */}
        <Card>
          <CardHeader>
            <CardTitle>2. Políticas y Reglas</CardTitle>
            <CardDescription>Define límites y tiempos para cancelaciones y no-shows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Límite de NO-SHOW</Label>
              <Input type="number" value={noShowLimit} onChange={(e) => setNoShowLimit(e.target.value)} />
            </div>
            <div>
              <Label>Tiempo mínimo de cancelación (horas)</Label>
              <Input type="number" value={cancelHours} onChange={(e) => setCancelHours(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>3. Notificaciones del Sistema</CardTitle>
            <CardDescription>Activa recordatorios y edita plantillas simples.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Recordatorios por email</Label>
                <p className="text-xs text-gray-500">Activar/desactivar envío automático.</p>
              </div>
              <Switch checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
            </div>

            {remindersEnabled && (
              <div>
                <Label>Horas antes del recordatorio</Label>
                <Input type="number" value={reminderHours} onChange={(e) => setReminderHours(e.target.value)} />
              </div>
            )}

            <div>
              <Label>Plantilla (texto simple)</Label>
              <Textarea rows={3} placeholder="Asunto / Cuerpo" value={emailTemplate} onChange={(e) => setEmailTemplate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle>4. Seguridad del Sistema</CardTitle>
            <CardDescription>Bloqueos por no-show, control de sesiones y contraseña:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Bloqueo automático por NO-SHOW</Label>
                <p className="text-xs text-gray-500">Bloquea usuarios que superen el límite.</p>
              </div>
              <Switch checked={autoBlock} onCheckedChange={setAutoBlock} />
            </div>

            <div>
              <Label>Cambiar contraseña (admin)</Label>
              <Input type="password" placeholder="Nueva contraseña (opcional)" value={adminNewPassword} onChange={(e) => setAdminNewPassword(e.target.value)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Control de sesiones básico</Label>
                <p className="text-xs text-gray-500">Forzar cierres o ver sesiones activas (back-end requerido).</p>
              </div>
              <Switch checked={sessionControl} onCheckedChange={setSessionControl} />
            </div>

            <div>
              <Button variant="outline" onClick={() => toast('Esta acción requiere implementación en backend')}>
                Terminar sesiones inactivas (demo)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleApply}>
          <Save className="h-4 w-4 mr-2" /> Aplicar cambios
        </Button>
      </div>
    </div>
  );
}
