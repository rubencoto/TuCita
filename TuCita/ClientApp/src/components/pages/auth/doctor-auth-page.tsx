import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Stethoscope, AlertCircle, ArrowLeft, Settings, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import doctorAuthService from '@/services/api/auth/doctorAuthService';
import adminAuthService from '@/services/api/auth/adminAuthService';

interface DoctorAuthPageProps {
  onLogin: (userData: any) => void;
  onNavigate: (page: string) => void;
}

export function DoctorAuthPage({ onLogin, onNavigate }: DoctorAuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'admin'>('doctor');
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!loginForm.email || !loginForm.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      let userData;

      if (selectedRole === 'admin') {
        // Login como Admin
        userData = await adminAuthService.login({
          email: loginForm.email,
          password: loginForm.password,
        });

        toast.success('¡Bienvenido Administrador!', {
          description: `Has iniciado sesión como ${userData.name}`
        });

        onLogin(userData);
        onNavigate('admin-panel');
      } else {
        // Login como Doctor
        userData = await doctorAuthService.login({
          email: loginForm.email,
          password: loginForm.password,
        });

        toast.success('¡Bienvenido Doctor!', {
          description: `Has iniciado sesión como ${userData.name}`
        });

        onLogin(userData);
        onNavigate('doctor-dashboard');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      const errorMessage = error.message || 'Error al iniciar sesión';
      
      toast.error('Error al iniciar sesión', {
        description: errorMessage
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
                Este portal es exclusivo para médicos y administradores registrados en TuCitaOnline
              </AlertDescription>
            </Alert>

            <Tabs defaultValue={selectedRole} onValueChange={(value: string) => setSelectedRole(value as 'doctor' | 'admin')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="doctor" disabled={isLoading}>Doctor</TabsTrigger>
                <TabsTrigger value="admin" disabled={isLoading}>Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="doctor">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Correo Electrónico Profesional</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="doctor-email"
                        type="email"
                        placeholder="doctor@hospital.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        disabled={isLoading}
                        required
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
                        disabled={isLoading}
                        required
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

                  <div className="flex items-center justify-end text-sm">
                    <button
                      type="button"
                      className="text-[#2E8BC0] hover:underline"
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
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Correo Electrónico Profesional</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@hospital.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tu contraseña segura"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        required
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

                  <div className="flex items-center justify-end text-sm">
                    <button
                      type="button"
                      className="text-[#2E8BC0] hover:underline"
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
                        <Settings className="h-4 w-4 mr-2" />
                        Acceder al Panel de Administración
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Separator />
              
              <div className="text-center mt-4">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center w-full"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al login de pacientes
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
