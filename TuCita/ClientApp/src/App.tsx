import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/layout/navbar';
import { Footer } from './components/layout/footer';
import { HomePage } from './components/pages/patient/home-page';
import { AuthPage } from './components/pages/auth/auth-page';
import { DoctorAuthPage } from './components/pages/auth/doctor-auth-page';
import { SearchPage } from './components/pages/patient/search-page';
import { BookingPage } from './components/pages/patient/booking-page';
import { AppointmentsPage } from './components/pages/patient/appointments-page';
import { ProfilePage } from './components/pages/patient/profile-page';
import { ForgotPasswordPage } from './components/pages/auth/forgot-password-page';
import { ResetPasswordPage } from './components/pages/auth/reset-password-page';
import { MedicalHistoryPage } from './components/pages/patient/medical-history-page';
import { AppointmentDetailPage } from './components/pages/patient/appointment-detail-page';
import { ReschedulePage } from './components/pages/patient/reschedule-page';
import { DoctorDashboardPage } from './components/pages/doctor/doctor-dashboard-page';
import { DoctorAppointmentsPage } from './components/pages/doctor/doctor-appointments-page';
import { DoctorAppointmentDetailPage } from './components/pages/doctor/doctor-appointment-detail-page';
import { DoctorMedicalHistoryPage } from './components/pages/doctor/doctor-medical-history-page';
import { DoctorAvailabilityPage } from './components/pages/doctor/doctor-availability-page';
import { DoctorProfilePage } from './components/pages/doctor/doctor-profile-page';
import { AdminPanel } from './components/pages/admin/AdminPanel';
import { authService, AuthResponse } from './services/api/auth/authService';
import doctorAuthService from './services/api/auth/doctorAuthService';
import adminAuthService from './services/api/auth/adminAuthService';
import appointmentsService from './services/api/patient/appointmentsService';
import { DoctorScheduleConfigPage } from './components/pages/doctor/doctor-schedule-config-page';

type PageType = 'home' | 'login' | 'register' | 'doctor-login' | 'search' | 'booking' | 'appointments' | 'profile' | 'forgot-password' | 'reset-password' | 'medical-history' | 'appointment-detail' | 'reschedule' | 'doctor-dashboard' | 'doctor-appointments' | 'doctor-appointment-detail' | 'doctor-medical-history' | 'doctor-availability' | 'doctor-schedule-config' | 'doctor-profile' | 'admin-panel';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDoctor, setIsDoctor] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Verificar userRole en localStorage para determinar tipo de usuario
        const userRole = localStorage.getItem('userRole');
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        // Si no hay token, no hay sesión activa
        if (!token || !userStr) {
          // Verificar si hay un token de reset password en la URL
          const urlParams = new URLSearchParams(window.location.search);
          const resetToken = urlParams.get('token');
          if (resetToken) {
            setCurrentPage('reset-password');
          }
          return;
        }
        
        // Si es un admin -> mantener en Home al iniciar la app (no navegar automáticamente)
        if (userRole === 'ADMIN') {
          const currentAdmin = adminAuthService.getCurrentAdmin();
          if (currentAdmin && adminAuthService.isAuthenticated()) {
            console.log('✅ Sesión de admin detectada:', currentAdmin);
            setUser(currentAdmin);
            setIsLoggedIn(true);
            setIsAdmin(true);
            setIsDoctor(false);
            // No cambiar la página automáticamente para iniciar en Home
            return;
          }
        }
        
        // Si es un doctor -> mantener en Home al iniciar la app (no navegar automáticamente)
        if (userRole === 'DOCTOR') {
          const currentDoctor = doctorAuthService.getCurrentDoctor();
          if (currentDoctor && doctorAuthService.isAuthenticated()) {
            console.log('✅ Sesión de doctor detectada:', currentDoctor);
            setUser(currentDoctor);
            setIsLoggedIn(true);
            setIsDoctor(true);
            setIsAdmin(false);
            // No cambiar la página automáticamente para iniciar en Home
            return;
          }
        }
        
        // Si es un paciente o no hay userRole definido
        if (userRole === 'PACIENTE' || !userRole) {
          const currentUser = authService.getCurrentUser();
          if (currentUser && authService.isAuthenticated()) {
            console.log('✅ Sesión de paciente detectada:', currentUser);
            setUser(currentUser);
            setIsLoggedIn(true);
            setIsDoctor(false);
            setIsAdmin(false);
            // Cargar citas del usuario
            loadUserAppointments();
            return;
          }
        }
        
        // Si llegamos aquí, limpiar sesión inválida
        console.warn('⚠️ Sesión inválida detectada, limpiando localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        
      } catch (error) {
        console.error('❌ Error al verificar autenticación:', error);
        // Limpiar localStorage en caso de error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    };
    
    checkAuth();
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
    console.log('🔄 Navegando a:', page, data);
    setCurrentPage(page as PageType);
    setPageData(data);
  };

  const handleLogin = async (userData: any): Promise<void> => {
    console.log('✅ Usuario autenticado:', userData);
    setUser(userData);
    setIsLoggedIn(true);
    
    // Verificar si es un admin
    if (userData.role === 'admin' || userData.role === 'ADMIN') {
      console.log('👨‍💼 Usuario es administrador');
      setIsAdmin(true);
      setIsDoctor(false);
    }
    // Verificar si es un doctor
    else if (userData.role === 'doctor' || userData.role === 'DOCTOR') {
      console.log('👨‍⚕️ Usuario es doctor');
      setIsDoctor(true);
      setIsAdmin(false);
    } else {
      console.log('👤 Usuario es paciente');
      setIsDoctor(false);
      setIsAdmin(false);
      // Cargar citas del usuario recién logueado
      await loadUserAppointments();
    }
  };

  const handleLogout = async (): Promise<void> => {
    console.log('👋 Cerrando sesión...');
    
    if (isAdmin) {
      await adminAuthService.logout();
    } else if (isDoctor) {
      await doctorAuthService.logout();
    } else {
      await authService.logout();
    }
    
    setUser(null);
    setIsLoggedIn(false);
    setIsDoctor(false);
    setIsAdmin(false);
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

  const handleRescheduleAppointment = async (appointmentId: string, newTurnoId: number): Promise<boolean> => {
    try {
      const rescheduledAppointment = await appointmentsService.rescheduleAppointmentToNewSlot(
        Number(appointmentId), 
        newTurnoId
      );
      
      if (rescheduledAppointment) {
        await loadUserAppointments(); // Recargar lista de citas
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al reagendar cita:', error);
      return false;
    }
  };

  const handleUpdateUser = (userData: any): void => {
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
      
      case 'doctor-login':
        return (
          <DoctorAuthPage
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
      
      case 'reschedule':
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
          <ReschedulePage
            appointment={pageData?.appointment}
            onNavigate={handleNavigate}
            onRescheduleAppointment={handleRescheduleAppointment}
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
      
      // Rutas del Doctor
      case 'doctor-dashboard':
        if (!isLoggedIn || !isDoctor) {
          return (
            <DoctorAuthPage
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorDashboardPage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      
      case 'doctor-appointments':
        if (!isLoggedIn || !isDoctor) {
          return (
            <DoctorAuthPage
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorAppointmentsPage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      
      case 'doctor-appointment-detail':
        if (!isLoggedIn || !isDoctor) {
          return (
            <DoctorAuthPage
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorAppointmentDetailPage
            appointmentId={pageData?.appointmentId}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      
      case 'doctor-medical-history':
        if (!isLoggedIn || !isDoctor) {
          return (
            <DoctorAuthPage
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorMedicalHistoryPage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      
      case 'doctor-availability':
        if (!isLoggedIn || !isDoctor) {
          return (
            <DoctorAuthPage
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorAvailabilityPage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      
      case 'doctor-schedule-config':
        if (!isLoggedIn || !isDoctor) {
          return (
            <DoctorAuthPage
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorScheduleConfigPage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      
      case 'doctor-profile':
        if (!isLoggedIn || !isDoctor) {
          return (
            <DoctorAuthPage
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorProfilePage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      
      // Ruta del Admin
      case 'admin-panel':
        if (!isLoggedIn || !isAdmin) {
          return (
            <DoctorAuthPage
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <AdminPanel
            onNavigate={handleNavigate}
            onLogout={handleLogout}
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

  const showNavAndFooter = !(
    currentPage === 'login' || 
    currentPage === 'register' || 
    currentPage === 'doctor-login' || 
    currentPage === 'forgot-password' || 
    currentPage === 'reset-password' ||
    currentPage.startsWith('doctor-') ||
    currentPage === 'admin-panel'
  );

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