import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Trash, Edit, Plus, X, Check } from 'lucide-react';
import doctorsService, { AgendaTurno } from '@/services/doctorsService';
import { toast } from 'sonner';

function isoLocalDatetime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export function DoctorTurnosPage() {
  const [loading, setLoading] = useState(false);
  const [turnos, setTurnos] = useState<AgendaTurno[]>([]);
  const [editing, setEditing] = useState<AgendaTurno | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [inicioInput, setInicioInput] = useState('');
  const [finInput, setFinInput] = useState('');
  const medicoId = 1; // demo, in real app get from user

  const load = async () => {
    setLoading(true);
    try {
      const data = await doctorsService.getTurnos(medicoId);
      setTurnos(data);
    } catch (err) {
      toast.error('No se pudieron cargar los turnos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setInicioInput('');
    setFinInput('');
    setShowForm(true);
  };

  const openEdit = (t: AgendaTurno) => {
    setEditing(t);
    setInicioInput(isoLocalDatetime(t.inicio));
    setFinInput(isoLocalDatetime(t.fin));
    setShowForm(true);
  };

  const handleDelete = async (t: AgendaTurno) => {
    if (!confirm('Eliminar turno?')) return;
    try {
      const ok = await doctorsService.deleteTurno(t.id);
      if (ok) {
        toast.success('Turno eliminado');
        setTurnos(prev => prev.filter(x => x.id !== t.id));
      } else {
        toast.error('No se pudo eliminar el turno');
      }
    } catch {
      toast.error('Error eliminando turno');
    }
  };

  const validateNoOverlap = (startIso: string, endIso: string, skipId?: number) => {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Fechas inválidas';
    if (s >= e) return 'Inicio debe ser anterior a fin';
    for (const t of turnos) {
      if (skipId && t.id === skipId) continue;
      const ts = new Date(t.inicio);
      const te = new Date(t.fin);
      if (overlaps(s, e, ts, te)) return `Traslapa con ${t.time ?? t.inicio}`;
    }
    return null;
  };

  const handleSubmit = async (e?: any) => {
    e?.preventDefault();
    const inicioIso = new Date(inicioInput).toISOString();
    const finIso = new Date(finInput).toISOString();
    const validation = validateNoOverlap(inicioIso, finIso, editing?.id);
    if (validation) { toast.error(validation); return; }

    try {
      if (editing) {
        const updated = await doctorsService.updateTurno(editing.id, { inicio: inicioIso, fin: finIso, estado: editing.estado });
        setTurnos(prev => prev.map(t => t.id === editing.id ? updated : t));
        toast.success('Turno actualizado');
      } else {
        const created = await doctorsService.createTurno({ medicoId, inicio: inicioIso, fin: finIso });
        setTurnos(prev => [created, ...prev]);
        toast.success('Turno creado');
      }
      setShowForm(false);
    } catch (err:any) {
      toast.error(err.response?.data || 'Error al guardar turno');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <CardHeader>
          <CardTitle>Gestión de Turnos</CardTitle>
        </CardHeader>

        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="flex items-center"><Plus className="h-4 w-4 mr-2"/>Nuevo turno</Button>
          <Button variant="outline" onClick={load}>Refrescar</Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="py-6 text-center">Cargando...</TableCell></TableRow>
                ) : turnos.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="py-6 text-center">No hay turnos</TableCell></TableRow>
                ) : (
                  turnos.map(t => (
                    <TableRow key={t.id} className="hover:bg-muted/50">
                      <TableCell>{new Date(t.inicio).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{`${new Date(t.inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${new Date(t.fin).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`}</TableCell>
                      <TableCell>{t.estado}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Edit className="h-4 w-4"/></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(t)}><Trash className="h-4 w-4 text-red-600"/></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{editing ? 'Editar Turno' : 'Crear Turno'}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4"/></Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Inicio</Label>
                  <Input type="datetime-local" value={inicioInput} onChange={(e) => setInicioInput(e.target.value)} required />
                </div>
                <div>
                  <Label>Fin</Label>
                  <Input type="datetime-local" value={finInput} onChange={(e) => setFinInput(e.target.value)} required />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)} type="button"><X className="h-4 w-4 mr-2"/>Cancelar</Button>
                <Button type="submit"><Check className="h-4 w-4 mr-2"/>{editing ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorTurnosPage;
