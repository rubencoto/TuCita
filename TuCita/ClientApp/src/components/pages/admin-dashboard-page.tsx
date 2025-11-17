import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users, Calendar, Settings, ClipboardList } from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const [loading] = useState(false);

  // Mocked stats for admin dashboard (replace with API calls as needed)
  const stats = {
    users: 1240,
    doctors: 86,
    appointmentsToday: 42,
  };

  const recentActions = [
    { id: 1, action: 'Usuario registrado', subject: 'juan.perez@example.com', date: 'Hoy 09:12' },
    { id: 2, action: 'Doctor aprobado', subject: 'Dra. Ana Martínez', date: 'Hoy 08:50' },
    { id: 3, action: 'Cita cancelada', subject: 'Cita #245', date: 'Ayer 17:05' },
  ];

  useEffect(() => {
    // In future, load admin data from API
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-muted-foreground mt-2">Resumen de actividad y accesos rápidos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onNavigate?.('home')}>Volver al sitio</Button>
            <Button onClick={() => onNavigate?.('profile')}>Mi cuenta</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Usuarios</p>
                <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Médicos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.doctors}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl">
                <Settings className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Citas hoy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.appointmentsToday}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Sujeto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActions.map(item => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm">{item.date}</TableCell>
                      <TableCell className="text-sm">{item.action}</TableCell>
                      <TableCell className="text-sm">{item.subject}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate?.('doctor-requests')}>
              <ClipboardList className="h-4 w-4 mr-2" /> Revisar solicitudes de médicos
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate?.('admin-users')}>
              <Users className="h-4 w-4 mr-2" /> Gestionar usuarios
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate?.('appointments')}>
              <Calendar className="h-4 w-4 mr-2" /> Ver citas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
