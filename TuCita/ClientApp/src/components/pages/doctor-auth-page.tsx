import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Eye, EyeOff, Mail, Lock, Stethoscope, ArrowLeft } from 'lucide-react';
import { doctorAuthService, DoctorAuthResponse } from '../../services/doctorAuthService';
import { toast } from 'sonner';

interface DoctorAuthPageProps {
  onLogin: (userData: DoctorAuthResponse) => void;
  onNavigate: (page: string) => void;
}

export function DoctorAuthPage({ onLogin, onNavigate }: DoctorAuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await doctorAuthService.login(loginForm);
      
      toast.success('¡Bienvenido Dr./Dra.!', {
        description: 'Has accedido al portal médico correctamente'
      });

      onLogin(userData);
      onNavigate('doctor-dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al iniciar sesión', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPatientLogin = () => {
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E8BC0]/10 via-muted to-[#145A8C]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-[#2E8BC0]/20">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-[#2E8BC0] rounded-lg p-3">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-[#2E8BC0]">Portal Médico</CardTitle>
            <p className="text-muted-foreground">
              Accede con tus credenciales profesionales
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="doctor-email"
                    type="email"
                    placeholder="doctor@tucita.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 border-[#2E8BC0]/20 focus:border-[#2E8BC0]"
                    disabled={isLoading}
                    required
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
                    placeholder="Tu contraseña"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 border-[#2E8BC0]/20 focus:border-[#2E8BC0]"
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

              <Button 
                type="submit" 
                className="w-full bg-[#2E8BC0] hover:bg-[#145A8C]" 
                disabled={isLoading}
              >
                {isLoading ? 'Validando credenciales...' : 'Acceder al Portal'}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToPatientLogin}
                    className="text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded inline-flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Acceso para pacientes
                  </button>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  Solo para profesionales médicos registrados
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
