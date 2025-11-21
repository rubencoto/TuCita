import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Eye, EyeOff, Mail, Lock, Stethoscope, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import doctorAuthService from '../../services/doctorAuthService';

interface DoctorAuthPageProps {
  onLogin: (userData: any) => void;
  onNavigate: (page: string) => void;
}

export function DoctorAuthPage({ onLogin, onNavigate }: DoctorAuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Helper para autocompletar credenciales de prueba (solo en desarrollo)
  const fillTestCredentials = () => {
    setLoginForm({
      email: 'doctor@tucitaonline.com',
      password: 'Doctor123!',
    });
    toast.info('Credenciales de prueba cargadas');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!loginForm.email || !loginForm.password) {
      toast.error('Error de validación', {
        description: 'Por favor completa todos los campos',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Intentando login con:', { email: loginForm.email });
      
      // Llamar al servicio de autenticación de doctores
      const doctorData = await doctorAuthService.login({
        email: loginForm.email,
        password: loginForm.password,
      });

      console.log('✅ Login exitoso de doctor:', doctorData);

      // Guardar en el estado de la aplicación
      // El servicio ya guardó en localStorage, solo necesitamos llamar a onLogin
      onLogin(doctorData);
      
      toast.success('¡Bienvenido!', {
        description: `Has iniciado sesión como ${doctorData.name}`,
      });

      onNavigate('doctor-dashboard');
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);
      
      toast.error('Error al iniciar sesión', {
        description: error.message || 'Credenciales inválidas o usuario no autorizado',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E8BC0]/5 via-white to-[#2E8BC0]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-t-4 border-t-[#2E8BC0] shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-[#2E8BC0] rounded-lg p-3">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">Portal Médico</CardTitle>
            <CardDescription className="text-base">
              Acceso exclusivo para profesionales de la salud
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Este portal es exclusivo para médicos registrados en TuCitaOnline
              </AlertDescription>
            </Alert>

            {/* Credenciales de prueba (solo desarrollo) */}
            {(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') && (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Credenciales de prueba:</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Email:</strong> doctor@tucitaonline.com</p>
                      <p><strong>Contraseña:</strong> Doctor123!</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={fillTestCredentials}
                      className="mt-2 w-full bg-white"
                    >
                      Usar credenciales de prueba
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="doctor-email">Correo Electrónico Profesional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="doctor-email"
                    type="email"
                    placeholder="doctor@tucitaonline.org"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="doctor-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña segura"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#2E8BC0] focus:ring-[#2E8BC0]"
                    disabled={isLoading}
                  />
                  <span className="text-gray-600">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-[#2E8BC0] hover:underline disabled:opacity-50"
                  onClick={() => onNavigate('forgot-password')}
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#2E8BC0] hover:bg-[#2E8BC0]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Acceder al Panel Médico
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <Separator />
              
              <div className="text-center space-y-3">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center w-full disabled:opacity-50"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al login de pacientes
                </button>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-2">
                    ¿Aún no estás registrado como médico?
                  </p>
                  <button
                    type="button"
                    className="text-sm text-[#2E8BC0] hover:underline font-medium disabled:opacity-50"
                    onClick={() => {
                      toast.info('Información de Registro', {
                        description: 'Contacta a administración para registrarte como médico: admin@tucitaonline.com',
                      });
                    }}
                    disabled={isLoading}
                  >
                    Solicitar credenciales de acceso
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                <strong>Aviso de Seguridad:</strong> Este portal maneja información médica confidencial. 
                Tu sesión está protegida con encriptación de extremo a extremo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
