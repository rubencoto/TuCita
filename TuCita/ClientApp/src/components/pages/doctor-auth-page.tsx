import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Eye, EyeOff, Mail, Lock, Stethoscope, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface DoctorAuthPageProps {
  onLogin: (userData: any) => void;
  onNavigate: (page: string) => void;
}

export function DoctorAuthPage({ onLogin, onNavigate }: DoctorAuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular login exitoso de doctor
    const doctorData = {
      id: 'DOC-001',
      name: 'Dra. Ana Martínez',
      email: loginForm.email,
      phone: '+34 612 345 678',
      especialidad: 'Medicina General',
      licencia: 'MED-2019-45678',
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxmZW1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjI2MDY1ODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      role: 'doctor'
    };
    
    onLogin(doctorData);
    onNavigate('doctor-dashboard');
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#2E8BC0] focus:ring-[#2E8BC0]" />
                  <span className="text-gray-600">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-[#2E8BC0] hover:underline"
                  onClick={() => onNavigate('forgot-password')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button type="submit" className="w-full bg-[#2E8BC0] hover:bg-[#2E8BC0]/90">
                <Stethoscope className="h-4 w-4 mr-2" />
                Acceder al Panel Médico
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <Separator />
              
              <div className="text-center space-y-3">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center w-full"
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
                    className="text-sm text-[#2E8BC0] hover:underline font-medium"
                    onClick={() => {
                      // Aquí iría la lógica para solicitar registro
                      alert('Contacta a administración para registrarte como médico: admin@tucitaonline.com');
                    }}
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

        {/* Demo credentials */}
        <Card className="mt-4 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <p className="text-xs text-yellow-800 mb-2">
              <strong>?? Credenciales de prueba:</strong>
            </p>
            <p className="text-xs text-yellow-700">
              <strong>Email:</strong> doctor@tucitaonline.com<br />
              <strong>Contraseña:</strong> demo123
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
