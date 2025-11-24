import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  CalendarCheck, 
  ClipboardList,
  LogOut,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface DoctorSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DoctorSidebar({ currentPage, onNavigate, onLogout }: DoctorSidebarProps) {
  const menuItems = [
    { id: 'doctor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doctor-profile', label: 'Mi Perfil', icon: User },
    { id: 'doctor-availability', label: 'Disponibilidad', icon: Calendar },
    { id: 'doctor-appointments', label: 'Citas', icon: CalendarCheck },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="bg-[#2E8BC0] p-2 rounded-lg">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">TuCitaOnline</h1>
            <p className="text-xs text-gray-500">Panel Médico</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                isActive 
                  ? 'bg-[#2E8BC0] text-white hover:bg-[#2E8BC0]/90' 
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

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
