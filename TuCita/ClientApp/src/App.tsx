import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';
import { HomePage } from './components/pages/home-page';
import { AuthPage } from './components/pages/auth-page';
import { SearchPage } from './components/pages/search-page';
import { BookingPage } from './components/pages/booking-page';
import { AppointmentsPage } from './components/pages/appointments-page';
import { ProfilePage } from './components/pages/profile-page';
import { ForgotPasswordPage } from './components/pages/forgot-password-page';
import { ResetPasswordPage } from './components/pages/reset-password-page';
import { MedicalHistoryPage } from './components/pages/medical-history-page';
import { AppointmentDetailPage } from './components/pages/appointment-detail-page';
import { authService, AuthResponse } from './services/authService';
import appointmentsService from './services/appointmentsService';

type PageType = 'home' | 'login' | 'register' | 'search' | 'booking' | 'appointments' | 'profile' | 'forgot-password' | 'reset-password' | 'medical-history' | 'appointment-detail';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
      setIsLoggedIn(true);
      // Cargar citas del usuario
      loadUserAppointments();
    }

    // Verificar si hay un token de reset password en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) {
      setCurrentPage('reset-password');
    }
  }, []);

  const loadUserAppointments = async (): Promise<void> => {
    setLoading(true);
    try {
      const userAppointments = await appointmentsService.getMyAppointments();
      setAppointments(userAppointments);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page: string, data?: any): void => {
    setCurrentPage(page as PageType);
    setPageData(data);
  };

  const handleLogin = async (userData: AuthResponse): Promise<void> => {
    setUser(userData);
    setIsLoggedIn(true);
    // Cargar citas del usuario recién logueado
    await loadUserAppointments();
  };

  const handleLogout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    setAppointments([]);
    setCurrentPage('home');
  };

  const handleBookAppointment = async (appointmentData: any): Promise<any> => {
    try {
      const newAppointment = await appointmentsService.createAppointment(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, status: string): Promise<void> => {
    try {
      const updatedAppointment = await appointmentsService.updateAppointment(
        Number(appointmentId),
        { estado: status.toUpperCase() }
      );
      
      if (updatedAppointment) {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === Number(appointmentId) ? updatedAppointment : apt
          )
        );
      }
    } catch (error) {
      console.error('Error al actualizar cita:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string): Promise<boolean> => {
    try {
      const success = await appointmentsService.cancelAppointment(Number(appointmentId));
      if (success) {
        await loadUserAppointments(); // Recargar lista de citas
      }
      return success;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      return false;
    }
  };

  const handleUpdateUser = (userData: AuthResponse): void => {
    setUser(userData);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <AuthPage
            mode="login"
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        );
      
      case 'register':
        return (
          <AuthPage
            mode="register"
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        );
      
      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onNavigate={handleNavigate}
          />
        );
      
      case 'reset-password':
        return (
          <ResetPasswordPage
            onNavigate={handleNavigate}
          />
        );
      
      case 'search':
        return (
          <SearchPage onNavigate={handleNavigate} />
        );
      
      case 'booking':
        return (
          <BookingPage
            doctor={pageData?.doctor}
            onNavigate={handleNavigate}
            onBookAppointment={handleBookAppointment}
          />
        );
      
      case 'appointments':
        if (!isLoggedIn) {
          return (
            <AuthPage
              mode="login"
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <AppointmentsPage
            appointments={appointments}
            onNavigate={handleNavigate}
            onUpdateAppointment={handleUpdateAppointment}
            onCancelAppointment={handleCancelAppointment}
            loading={loading}
          />
        );
      
      case 'medical-history':
        if (!isLoggedIn) {
          return (
            <AuthPage
              mode="login"
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <MedicalHistoryPage
            appointments={appointments}
            onNavigate={handleNavigate}
          />
        );
      
      case 'appointment-detail':
        if (!isLoggedIn) {
          return (
            <AuthPage
              mode="login"
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <AppointmentDetailPage
            appointment={pageData?.appointment}
            onNavigate={handleNavigate}
          />
        );
      
      case 'profile':
        if (!isLoggedIn) {
          return (
            <AuthPage
              mode="login"
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <ProfilePage
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        );
      
      case 'home':
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
          />
        );
    }
  };

  const showNavAndFooter = !(currentPage === 'login' || currentPage === 'register' || currentPage === 'forgot-password' || currentPage === 'reset-password');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showNavAndFooter && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          onLogin={() => handleNavigate('login')}
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-1">
        {renderPage()}
      </main>
      
      {showNavAndFooter && <Footer />}
      
      <Toaster position="top-right" />
    </div>
  );
}