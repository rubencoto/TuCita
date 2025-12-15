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
import { DoctorScheduleConfigPage } from './components/pages/doctor/doctor-schedule-config-page';
import { PrivacyPolicyPage } from './components/pages/legal/privacy-policy-page';
import { TermsConditionsPage } from './components/pages/legal/terms-conditions-page';

type PageType = 'home' | 'login' | 'register' | 'doctor-login' | 'search' | 'booking' | 'appointments' | 'profile' | 'forgot-password' | 'reset-password' | 'medical-history' | 'appointment-detail' | 'reschedule' | 'doctor-dashboard' | 'doctor-appointments' | 'doctor-appointment-detail' | 'doctor-medical-history' | 'doctor-availability' | 'doctor-schedule-config' | 'doctor-profile' | 'admin-panel' | 'privacy-policy' | 'terms' | 'faq';

// Función para obtener la página desde la URL
const getPageFromUrl = (): PageType => {
  const hash = window.location.hash.slice(1); // Remover el #
  if (!hash) return 'home';
  
  // Validar que sea una página válida
  const validPages: PageType[] = [
    'home', 'login', 'register', 'doctor-login', 'search', 'booking', 
    'appointments', 'profile', 'forgot-password', 'reset-password', 
    'medical-history', 'appointment-detail', 'reschedule', 'doctor-dashboard', 
    'doctor-appointments', 'doctor-appointment-detail', 'doctor-medical-history', 
    'doctor-availability', 'doctor-schedule-config', 'doctor-profile', 'admin-panel',
    'privacy-policy', 'terms', 'faq'
  ];
  
  return validPages.includes(hash as PageType) ? (hash as PageType) : 'home';
};

// Función para actualizar la URL
const updateUrl = (page: PageType) => {
  window.location.hash = page;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(getPageFromUrl());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [isDoctor, setIsDoctor] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Escuchar cambios en el hash de la URL
  useEffect(() => {
    const handleHashChange = () => {
      const newPage = getPageFromUrl();
      setCurrentPage(newPage);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
            handleNavigate('reset-password');
          }
          return;
        }
        
        // Si es un admin
        if (userRole === 'ADMIN') {
          const currentAdmin = adminAuthService.getCurrentAdmin();
          if (currentAdmin && adminAuthService.isAuthenticated()) {
            setUser(currentAdmin);
            setIsLoggedIn(true);
            setIsAdmin(true);
            setIsDoctor(false);
            return;
          }
        }
        
        // Si es un doctor
        if (userRole === 'DOCTOR') {
          const currentDoctor = doctorAuthService.getCurrentDoctor();
          if (currentDoctor && doctorAuthService.isAuthenticated()) {
            setUser(currentDoctor);
            setIsLoggedIn(true);
            setIsDoctor(true);
            setIsAdmin(false);
            return;
          }
        }
        
        // Si es un paciente o no hay userRole definido
        if (userRole === 'PACIENTE' || !userRole) {
          const currentUser = authService.getCurrentUser();
          if (currentUser && authService.isAuthenticated()) {
            setUser(currentUser);
            setIsLoggedIn(true);
            setIsDoctor(false);
            setIsAdmin(false);
            return;
          }
        }
        
        // Si llegamos aquí, limpiar sesión inválida
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Limpiar localStorage en caso de error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    };
    
    checkAuth();
  }, []);

  const handleNavigate = (page: string, data?: any): void => {
    const pageType = page as PageType;
    setCurrentPage(pageType);
    setPageData(data);
    updateUrl(pageType); // Actualizar URL
  };

  const handleLogin = async (userData: any): Promise<void> => {
    setUser(userData);
    setIsLoggedIn(true);
    
    // Verificar si es un admin
    if (userData.role === 'admin' || userData.role === 'ADMIN') {
      setIsAdmin(true);
      setIsDoctor(false);
      handleNavigate('admin-panel');
    }
    // Verificar si es un doctor
    else if (userData.role === 'doctor' || userData.role === 'DOCTOR') {
      setIsDoctor(true);
      setIsAdmin(false);
      handleNavigate('doctor-dashboard');
    } else {
      setIsDoctor(false);
      setIsAdmin(false);
      handleNavigate('home');
    }
  };

  const handleLogout = async (): Promise<void> => {
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
    handleNavigate('home');
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
            onNavigate={handleNavigate}
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
            onNavigate={handleNavigate}
            // ❌ REMOVED: user and onUpdateUser props - handled by React Query
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
      
      // Páginas legales
      case 'privacy-policy':
        return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      
      case 'terms':
        return <TermsConditionsPage onNavigate={handleNavigate} />;
      
      case 'faq':
        // TODO: Create FAQPage component
        return <PrivacyPolicyPage onNavigate={handleNavigate} />; // Placeholder
      
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
      
      {showNavAndFooter && <Footer onNavigate={handleNavigate} />}
      
      <Toaster position="top-right" />
    </div>
  );
}