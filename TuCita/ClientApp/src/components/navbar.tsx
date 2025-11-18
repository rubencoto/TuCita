import { useState } from 'react';
import { Button } from './ui/button';
import { Heart, Menu, X, User, Calendar, Search, Home, FileText } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  user?: any;
}

export function Navbar({ currentPage, onNavigate, isLoggedIn, onLogin, onLogout, user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const publicNavigation = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar Médicos', icon: Search },
  ];

  const patientNavigation = [
    { id: 'appointments', label: 'Mis Citas', icon: Calendar },
    { id: 'medical-history', label: 'Historial Médico', icon: FileText },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const medicalNavigation = [
    { id: 'doctor-dashboard', label: 'Panel Médico', icon: Calendar },
    { id: 'doctor-appointments', label: 'Citas Médicas', icon: Calendar },
    { id: 'doctor-availability', label: 'Disponibilidad', icon: Calendar },
  ];

  const role = (user?.role || '').toString().toLowerCase();
  const isDoctorOrAdmin = role === 'doctor' || role === 'admin';

  // Determine which navigation items to render in the main menu
  let mainNavItems = publicNavigation;
  if (isLoggedIn) {
    if (isDoctorOrAdmin) {
      // For doctors/admins show only Inicio and Panel Médico + Disponibilidad link
      mainNavItems = [publicNavigation[0], { id: 'doctor-dashboard', label: 'Panel Médico', icon: Calendar }, { id: 'doctor-availability', label: 'Disponibilidad', icon: Calendar }];
    } else {
      // For logged in patients show public + patient items
      mainNavItems = [...publicNavigation, ...patientNavigation];
    }
  }

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-primary rounded-lg p-2">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary">TuCitaOnline</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${currentPage === item.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'}`}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Show portal button only for non-authenticated users */}
            {!isLoggedIn && (
              <Button variant="ghost" onClick={() => onNavigate('doctor-auth')}>
                Portal Médico
              </Button>
            )}

            {/* When logged in as patient show only Cerrar Sesión (profile is in main nav) */}
            {isLoggedIn && !isDoctorOrAdmin && (
              <>
                <Button variant="outline" onClick={onLogout}>Cerrar Sesión</Button>
              </>
            )}

            {/* For doctors/admins show Perfil and Cerrar Sesión in desktop */}
            {isLoggedIn && isDoctorOrAdmin && (
              <>
                <Button variant="ghost" onClick={() => onNavigate('profile')}>Mi Perfil</Button>
                <Button variant="outline" onClick={onLogout}>Cerrar Sesión</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* For logged non-doctor users show extra links and logout on mobile */}
              {!isDoctorOrAdmin && isLoggedIn && (
                <>
                  <div className="pt-2 border-t"></div>
                  {patientNavigation.map(item => {
                    const Icon = item.icon;
                    return (
                      <button key={item.id} onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }} className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-colors ${currentPage === item.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'}`}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}

                  <div className="pt-2 border-t"></div>
                  <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg">Cerrar Sesión</button>
                </>
              )}

              {/* For doctors/admins show Perfil and Cerrar Sesión on mobile */}
              {isDoctorOrAdmin && isLoggedIn && (
                <>
                  <div className="pt-2 border-t"></div>
                  <button onClick={() => { onNavigate('profile'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg">
                    <User className="h-4 w-4" />
                    <span>Mi Perfil</span>
                  </button>
                  <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg">Cerrar Sesión</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}