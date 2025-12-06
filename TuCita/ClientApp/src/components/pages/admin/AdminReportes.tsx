import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import adminReportesService from '@/services/api/admin/adminReportesService';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export function AdminReportes() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [preset, setPreset] = useState('7d');
  const [summary, setSummary] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);

  useEffect(() => {
    applyPreset(preset);
  }, []);

  useEffect(() => {
    loadAll();
  }, [desde, hasta]);

  const applyPreset = (p: string) => {
    setPreset(p);
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    let from = '';

    if (p === 'today') {
      from = to;
    } else if (p === '7d') {
      const d = new Date(); d.setDate(d.getDate() - 6); from = d.toISOString().split('T')[0];
    } else if (p === '30d') {
      const d = new Date(); d.setDate(d.getDate() - 29); from = d.toISOString().split('T')[0];
    }

    setDesde(from);
    setHasta(to);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const s = await adminReportesService.getSummary(desde, hasta);
      setSummary(s);

      const sr = await adminReportesService.getSeries(desde, hasta, 'day');
      setSeries(sr.map((p:any) => ({ ...p, name: p.fecha })));

      const pie = [
        { name: 'Atendidas', value: s.atendidas || 0, color: '#10B981' },
        { name: 'Canceladas', value: s.canceladas || 0, color: '#F59E0B' },
        { name: 'No Show', value: s.noShow || 0, color: '#EF4444' },
      ];
      setPieData(pie);

      const list = await adminReportesService.getList(desde, hasta, undefined, undefined, 1, 20);
      setItems(list.items);
      setTotalRegistros(list.totalRegistros);
      setPage(1);
    } catch (err:any) {
      console.error('Error loading reports', err);
      toast.error(err.message || 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminReportesService.exportCsv({ desde, hasta });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reportes_${desde || 'all'}_${hasta || 'all'}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Export iniciado');
    } catch (err:any) {
      console.error('Export error', err);
      toast.error('Error al exportar CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
        <p className="text-sm text-gray-500 mt-1">Resumen y exportación de datos. Filtra por rango de fechas.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          <Button variant={preset === 'today' ? 'default' : 'ghost'} onClick={() => applyPreset('today')}>Hoy</Button>
          <Button variant={preset === '7d' ? 'default' : 'ghost'} onClick={() => applyPreset('7d')}>Últimos 7 días</Button>
          <Button variant={preset === '30d' ? 'default' : 'ghost'} onClick={() => applyPreset('30d')}>Últimos 30 días</Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <Button onClick={loadAll} className="bg-teal-600 hover:bg-teal-700">Aplicar</Button>
          <Button variant="outline" onClick={handleExport}>Exportar CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Indicadores clave</CardDescription>
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="space-y-2">
                <div>Total citas: <strong>{summary.total}</strong></div>
                <div>Atendidas: <strong>{summary.atendidas}</strong></div>
                <div>Canceladas: <strong>{summary.canceladas}</strong></div>
                <div>No Show: <strong>{summary.noShow}</strong></div>
                {summary.ingresos !== undefined && <div>Ingresos: <strong>{summary.ingresos}</strong></div>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Series de citas (por día)</CardTitle>
            <CardDescription>Visualización temporal</CardDescription>
          </CardHeader>
          <CardContent>
            {series.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={series}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="programada" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="confirmada" stroke="#2563EB" strokeWidth={2} />
                  <Line type="monotone" dataKey="atendida" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">Sin series</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución</CardTitle>
            <CardDescription>Por estado</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Listado (muestra primera página)</CardTitle>
          <CardDescription>Tabla resumida de citas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm text-gray-600">Fecha</th>
                  <th className="text-left py-2 px-3 text-sm text-gray-600">Hora</th>
                  <th className="text-left py-2 px-3 text-sm text-gray-600">Paciente</th>
                  <th className="text-left py-2 px-3 text-sm text-gray-600">Doctor</th>
                  <th className="text-left py-2 px-3 text-sm text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No hay registros</td>
                  </tr>
                ) : (
                  items.map((it:any) => (
                    <tr key={it.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm">{it.fecha}</td>
                      <td className="py-2 px-3 text-sm">{it.hora}</td>
                      <td className="py-2 px-3 text-sm">{it.paciente}</td>
                      <td className="py-2 px-3 text-sm">{it.doctor}</td>
                      <td className="py-2 px-3 text-sm">{it.estado}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">Mostrando página {page} — {totalRegistros} registros</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}>Anterior</Button>
              <Button variant="outline" onClick={() => changePage(page + 1)}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  async function changePage(p: number) {
    setLoading(true);
    try {
      const list = await adminReportesService.getList(desde, hasta, undefined, undefined, p, 20);
      setItems(list.items);
      setTotalRegistros(list.totalRegistros);
      setPage(p);
    } catch (err:any) {
      toast.error('Error al cambiar de página');
    } finally {
      setLoading(false);
    }
  }
}
