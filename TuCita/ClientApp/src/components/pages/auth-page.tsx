import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Eye, EyeOff, Mail, Lock, User, Phone, Heart } from 'lucide-react';
import { authService, AuthResponse } from '../../services/authService';
import { toast } from 'sonner';

interface AuthPageProps {
  mode: 'login' | 'register';
  onLogin: (userData: AuthResponse) => Promise<void> | void;
  onNavigate: (page: string) => void;
  initialRole?: 'doctor' | 'admin';
  initialEmail?: string;
}

export function AuthPage({ mode, onLogin, onNavigate, initialRole, initialEmail }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: initialEmail || '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: initialRole || 'doctor'
  });

  useEffect(() => {
    // If an initialRole was passed from navigation, preselect register tab and set role/email
    if (initialRole) {
      setActiveTab('register');
      setRegisterForm(prev => ({ ...prev, role: initialRole }));
    }
    if (initialEmail) {
      setRegisterForm(prev => ({ ...prev, email: initialEmail }));
      setLoginForm(prev => ({ ...prev, email: initialEmail }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRole, initialEmail]);

  const safeRole = (u?: any) => (u?.role || u?.rol || u?.roleName || '').toString().toLowerCase();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await authService.login(loginForm);
      
      toast.success('¡Bienvenido!', {
        description: 'Has iniciado sesión correctamente'
      });

      // Ensure parent updates auth state before navigation
      await onLogin(userData);

      // If parent didn't navigate, navigate here based on role
      const role = safeRole(userData);
      if (role === 'doctor') {
        onNavigate('doctor-dashboard');
      } else if (role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        // Default patient landing
        onNavigate('appointments');
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : (error?.toString() || 'Error desconocido');
      toast.error('Error al iniciar sesión', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Error', {
        description: 'Las contraseñas no coinciden'
      });
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error('Error', {
        description: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    setIsLoading(true);

    try {
      // include role in registration payload
      const userData = await authService.register(registerForm as any);
      
      toast.success('¡Cuenta creada!', {
        description: 'Tu cuenta ha sido creada exitosamente'
      });

      await onLogin(userData);

      const role = safeRole(userData);
      if (role === 'doctor') {
        onNavigate('doctor-dashboard');
      } else if (role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('appointments');
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : (error?.toString() || 'Error desconocido');
      toast.error('Error al registrarse', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onNavigate('forgot-password');
  };

  const handleBackToHome = () => {
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-primary rounded-lg p-3">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">TuCitaOnline</CardTitle>
            <p className="text-muted-foreground">
              {activeTab === 'login' 
                ? 'Inicia sesión en tu cuenta' 
                : 'Crea tu cuenta gratuita'
              }
            </p>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(value: 'login' | 'register') => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        disabled={isLoading}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tu contraseña"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="ej. Ruben"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="pl-10"
                          disabled={isLoading}
                          required
                          autoComplete="given-name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="ej. Coto"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={isLoading}
                        required
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        disabled={isLoading}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="ej. 1234567890"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        disabled={isLoading}
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <select
                      id="role"
                      value={registerForm.role}
                      onChange={(e) => {
                        const v = e.target.value as 'doctor' | 'admin';
                        setRegisterForm(prev => ({ ...prev, role: v }));
                      }}
                      disabled={isLoading}
                      className="w-full bg-background border border-muted rounded-md p-2 text-sm"
                    >
                      <option value="doctor">Doctor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tu contraseña"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirma tu contraseña"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleBackToHome}
                className="text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                disabled={isLoading}
              >
                ← Volver al inicio
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}