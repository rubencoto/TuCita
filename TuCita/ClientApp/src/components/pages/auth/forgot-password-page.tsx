import { useState } from 'react';
import { KeyRound, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { authService } from '@/services/api/auth/authService';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'El correo electrónico es requerido' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Por favor ingresa un correo electrónico válido' });
      return;
    }

    setIsLoading(true);

    try {
      await authService.requestPasswordReset({ email });
      
      setIsSuccess(true);
      toast.success('Correo de recuperación enviado', {
        description: 'Si el correo está registrado, recibirás un enlace de recuperación',
      });
    } catch (error: any) {
      toast.error('Error al enviar correo', {
        description: error.message || 'Ha ocurrido un error. Inténtalo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    onNavigate('login');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                Correo Enviado
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Hemos enviado un enlace de recuperación a tu correo electrónico
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground text-center">
                <Mail className="w-4 h-4 inline mr-2" />
                {email}
              </p>
            </div>
            
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Si no recibes el correo en unos minutos:</p>
              <ul className="list-disc list-inside text-left space-y-1">
                <li>Revisa tu carpeta de spam</li>
                <li>Verifica que el correo sea correcto</li>
                <li>Inténtalo de nuevo más tarde</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleBackToLogin}
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Login
              </Button>
              
              <Button
                onClick={() => setIsSuccess(false)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Enviar Otro Correo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl text-foreground">
              Recuperar Contraseña
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Enlace de Recuperación
                </>
              )}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
