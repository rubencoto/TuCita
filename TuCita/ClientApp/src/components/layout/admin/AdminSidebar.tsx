import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar,
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type AdminPage = 'dashboard' | 'usuarios' | 'especialidades' | 'citas' | 'configuracion' | 'reportes';

interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

const menuItems = [
  { id: 'dashboard' as AdminPage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'usuarios' as AdminPage, label: 'Usuarios', icon: Users },
  { id: 'especialidades' as AdminPage, label: 'Especialidades', icon: Stethoscope },
  { id: 'citas' as AdminPage, label: 'Citas', icon: Calendar },
  { id: 'configuracion' as AdminPage, label: 'Configuración', icon: Settings },
  { id: 'reportes' as AdminPage, label: 'Reportes', icon: BarChart3 },
];

export function AdminSidebar({ currentPage, onNavigate }: AdminSidebarProps) {
  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">TuCitaOnline</h2>
            <p className="text-xs text-gray-500">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                isActive 
                  ? 'bg-teal-600 text-white hover:bg-teal-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <p className="text-xs text-gray-400 text-center">
          © 2025 TuCitaOnline
        </p>
      </div>
    </div>
  );
}
