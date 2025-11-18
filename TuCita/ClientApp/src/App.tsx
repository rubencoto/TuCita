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
import { ReschedulePage } from './components/pages/reschedule-page';
import { authService, AuthResponse } from './services/authService';
import appointmentsService from './services/appointmentsService';
import { DoctorDashboardPage } from './components/pages/doctor-dashboard-page';
import { AdminDashboardPage } from './components/pages/admin-dashboard-page';
import { DoctorAuthPage } from './components/pages/doctor-auth-page';
import { Card, CardContent } from './components/ui/card';
import { toast } from 'sonner';
import { DoctorTurnosPage } from './components/pages/doctor-turnos-page';

// include legacy 'doctor-login' key to be resilient to older calls
type PageType = 'home' | 'login' | 'register' | 'search' | 'booking' | 'appointments' | 'profile' | 'forgot-password' | 'reset-password' | 'medical-history' | 'appointment-detail' | 'reschedule' | 'doctor-dashboard' | 'admin-dashboard' | 'doctor-auth' | 'doctor-login' | 'doctor-availability';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingProtectedNav, setPendingProtectedNav] = useState<boolean>(false);
  const [loginTimestamp, setLoginTimestamp] = useState<number | null>(null);

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

  const protectedPages: PageType[] = ['appointments', 'profile', 'medical-history', 'appointment-detail', 'reschedule', 'doctor-dashboard', 'admin-dashboard', 'doctor-availability'];

  // Pages that are only for patients
  // Removed 'profile' so doctors can access their profile page
  const patientOnlyPages: PageType[] = ['booking', 'appointments', 'medical-history', 'appointment-detail', 'reschedule'];

  const handleNavigate = (page: string, data?: any): void => {
    const p = page as PageType;
    // If navigating to a protected page and we don't have state, try to rehydrate from storage
    const protectedRolePages: PageType[] = ['doctor-dashboard', 'admin-dashboard'];
    if (protectedRolePages.includes(p) && !isLoggedIn) {
      const storedUser = authService.getCurrentUser();
      if (storedUser && authService.isAuthenticated()) {
        setUser(storedUser as any);
        setIsLoggedIn(true);
      }
    }

    // Prevent navigating the public 'home' or 'login' to a doctor/admin user immediately after login
    const role = (user as any)?.role || (authService.getCurrentUser() as any)?.role;
    if ((p === 'home' || p === 'login') && (isLoggedIn || authService.isAuthenticated()) && (role === 'doctor' || role === 'admin')) {
      const target = role === 'admin' ? 'admin-dashboard' : 'doctor-dashboard';
      setCurrentPage(target as PageType);
      setPageData(data);
      return;
    }

    // If navigating to a patient-only page but current user is doctor/admin, redirect to their dashboard
    const currentRole = (user as any)?.role || (authService.getCurrentUser() as any)?.role;
    if (patientOnlyPages.includes(p) && (currentRole === 'doctor' || currentRole === 'admin')) {
      // Notify user and redirect to their dashboard
      const target = currentRole === 'admin' ? 'admin-dashboard' : 'doctor-dashboard';
      toast.error('Acción no permitida para este rol. Redirigiendo a tu panel.');
      setCurrentPage(target as PageType);
      setPageData(undefined);
      return;
    }

    // if navigating to a protected page, mark pending so we give auth state a moment
    if (protectedPages.includes(p)) {
      setPendingProtectedNav(true);
      // clear pending after short delay
      window.setTimeout(() => setPendingProtectedNav(false), 300);
    }

    setCurrentPage(p);
    setPageData(data);
  };

  const handleLogin = async (userData: AuthResponse | any): Promise<void> => {
    // persist user and a demo token first so authService.isAuthenticated() reflects new state
    try {
      const demoToken = (userData as any)?.token || 'demo-token';
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.warn('Could not persist user to localStorage', err);
    }

    // update React state
    setUser(userData);
    setIsLoggedIn(true);
    setLoginTimestamp(Date.now());
    // clear any pending nav so protected page shows immediately
    setPendingProtectedNav(false);

    // Navegar inmediatamente al dashboard apropiado según el rol
    const role = (userData as any)?.role;
    if (role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else if (role === 'doctor') {
      setCurrentPage('doctor-dashboard');
    } else {
      if (['login', 'doctor-auth', 'doctor-login'].includes(currentPage)) {
        setCurrentPage('home');
      }
    }

    // Cargar citas en background sin bloquear la navegación
    loadUserAppointments().catch(err => console.error('Error loading appointments after login:', err));
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

  const handleUpdateUser = (userData: AuthResponse): void => {
    setUser(userData);
  };

  const LoadingProtected = () => (
    <div className="min-h-screen flex items-center justify-center">
      <Card>
        <CardContent className="p-8 text-center">Cargando...</CardContent>
      </Card>
    </div>
  );

  const renderPage = () => {
    // If user just logged in within the last 3s and has a role, prefer their dashboard
    // But only auto-redirect if current page is a public/login page to avoid overriding user navigation (e.g., profile)
    const now = Date.now();
    const publicAfterLoginPages: PageType[] = ['home', 'login', 'doctor-auth', 'doctor-login', 'register'];
    if (loginTimestamp && user && now - loginTimestamp < 3000 && publicAfterLoginPages.includes(currentPage)) {
      const r = (user as any)?.role;
      if (r === 'doctor') return <DoctorDashboardPage onNavigate={handleNavigate} />;
      if (r === 'admin') return <AdminDashboardPage onNavigate={handleNavigate} />;
    }

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
            initialRole={pageData?.role}
            initialEmail={pageData?.email}
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        );

      case 'doctor-auth':
      case 'doctor-login':
        return (
          <DoctorAuthPage onLogin={handleLogin as any} onNavigate={handleNavigate} />
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
          return pendingProtectedNav ? <LoadingProtected /> : (
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

      case 'doctor-dashboard':
        if (!isLoggedIn) {
          return pendingProtectedNav ? <LoadingProtected /> : (
            <AuthPage
              mode="login"
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorDashboardPage onNavigate={handleNavigate} />
        );

      case 'doctor-availability':
        if (!isLoggedIn) {
          return pendingProtectedNav ? <LoadingProtected /> : (
            <AuthPage
              mode="login"
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DoctorTurnosPage />
        );

      case 'admin-dashboard':
        if (!isLoggedIn) {
          return pendingProtectedNav ? <LoadingProtected /> : (
            <AuthPage
              mode="login"
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <AdminDashboardPage onNavigate={handleNavigate} />
        );
      
      case 'medical-history':
        if (!isLoggedIn) {
          return pendingProtectedNav ? <LoadingProtected /> : (
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
          return pendingProtectedNav ? <LoadingProtected /> : (
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
          return pendingProtectedNav ? <LoadingProtected /> : (
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
          return pendingProtectedNav ? <LoadingProtected /> : (
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
          user={user || authService.getCurrentUser()}
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