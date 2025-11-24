import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Filter, 
  BarChart3, 
  Users, 
  AlertCircle,
  TrendingUp,
  Calendar,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import adminReportesService, {
  TipoReporte,
  FormatoExportacion,
  ReporteGenerado,
  TipoReporteInfo,
  FormatoInfo
} from '@/services/api/admin/adminReportesService';
import { toast } from 'sonner';

export function AdminReportes() {
  const [loading, setLoading] = useState(false);
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [exportando, setExportando] = useState(false);
  
  // Estados de filtros
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>(TipoReporte.CitasPorPeriodo);
  const [fechaInicio, setFechaInicio] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formatoExportacion, setFormatoExportacion] = useState<FormatoExportacion>(FormatoExportacion.PDF);

  // Estados de datos
  const [tiposDisponibles, setTiposDisponibles] = useState<TipoReporteInfo[]>([]);
  const [formatosDisponibles, setFormatosDisponibles] = useState<FormatoInfo[]>([]);
  const [reporteGenerado, setReporteGenerado] = useState<ReporteGenerado | null>(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [tipos, formatos] = await Promise.all([
        adminReportesService.getTiposReportes(),
        adminReportesService.getFormatos()
      ]);
      setTiposDisponibles(tipos);
      setFormatosDisponibles(formatos);
    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      toast.error('Error al cargar configuración', {
        description: 'No se pudieron cargar los tipos de reportes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarReporte = async () => {
    try {
      setGenerandoReporte(true);
      setReporteGenerado(null);

      const filtros = {
        tipoReporte,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: new Date(fechaFin).toISOString()
      };

      const reporte = await adminReportesService.generarReporte(filtros);
      setReporteGenerado(reporte);

      toast.success('Reporte generado exitosamente', {
        description: `Se generó el reporte: ${reporte.titulo}`
      });
    } catch (error: any) {
      console.error('Error al generar reporte:', error);
      toast.error('Error al generar reporte', {
        description: error.response?.data?.message || 'Por favor intenta nuevamente'
      });
    } finally {
      setGenerandoReporte(false);
    }
  };

  const handleExportarReporte = async () => {
    try {
      setExportando(true);

      const filtros = {
        tipoReporte,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: new Date(fechaFin).toISOString(),
        formato: formatoExportacion
      };

      const archivoExportado = await adminReportesService.exportarReporte(filtros);
      adminReportesService.descargarDesdeBase64(archivoExportado);

      toast.success('Reporte exportado exitosamente', {
        description: `Archivo: ${archivoExportado.nombreArchivo}`
      });
    } catch (error: any) {
      console.error('Error al exportar reporte:', error);
      toast.error('Error al exportar reporte', {
        description: error.response?.data?.message || 'Por favor intenta nuevamente'
      });
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando módulo de reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reportes</h2>
          <p className="text-gray-600 mt-1">Genera y exporta reportes administrativos</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerarReporte}
            disabled={generandoReporte}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {generandoReporte ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generar Reporte
              </>
            )}
          </Button>
          {reporteGenerado && (
            <Button
              onClick={handleExportarReporte}
              disabled={exportando}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {exportando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
          <CardDescription>Configura los parámetros del reporte a generar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de Reporte */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Reporte</label>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(Number(e.target.value) as TipoReporte)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                {tiposDisponibles.find(t => t.id === tipoReporte)?.descripcion}
              </p>
            </div>

            {/* Fecha Inicio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Fin */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Formato de Exportación */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Formato de Exportación</label>
              <select
                value={formatoExportacion}
                onChange={(e) => setFormatoExportacion(Number(e.target.value) as FormatoExportacion)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formatosDisponibles.map((formato) => (
                  <option key={formato.id} value={formato.id}>
                    {formato.nombre} ({formato.extension})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo */}
      {reporteGenerado && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{reporteGenerado.titulo}</CardTitle>
              <CardDescription>
                Generado el {new Date(reporteGenerado.fechaGeneracion).toLocaleString('es-ES')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Citas</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reporteGenerado.resumen.totalCitas}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Tasa Asistencia</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reporteGenerado.resumen.tasaAsistencia}%</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-600 mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Tasa cancelación</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reporteGenerado.resumen.tasaCancelacion}%</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Tasa NO_SHOW</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reporteGenerado.resumen.tasaNoShow}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Citas Atendidas:</span>
                  <span className="ml-2 font-semibold text-green-600">{reporteGenerado.resumen.citasAtendidas}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Citas Canceladas:</span>
                  <span className="ml-2 font-semibold text-yellow-600">{reporteGenerado.resumen.citasCanceladas}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Total Pacientes:</span>
                  <span className="ml-2 font-semibold text-blue-600">{reporteGenerado.resumen.totalPacientes}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Total Doctores:</span>
                  <span className="ml-2 font-semibold text-purple-600">{reporteGenerado.resumen.totalDoctores}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráficas */}
          {reporteGenerado.datosGraficas && reporteGenerado.datosGraficas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Visualización de Datos</CardTitle>
                <CardDescription>Gráficas del reporte generado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reporteGenerado.datosGraficas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3B82F6" name="Total" />
                    <Bar dataKey="atendidas" fill="#10B981" name="Atendidas" />
                    <Bar dataKey="canceladas" fill="#F59E0B" name="Canceladas" />
                    <Bar dataKey="noShow" fill="#EF4444" name="NO_SHOW" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tabla de Datos */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Detallados</CardTitle>
              <CardDescription>Información completa del reporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(reporteGenerado.datos, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Estado vacóo */}
      {!reporteGenerado && !generandoReporte && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay reporte generado</h3>
            <p className="text-gray-500 text-center mb-4">
              Selecciona los filtros y haz clic en "Generar Reporte" para comenzar
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
