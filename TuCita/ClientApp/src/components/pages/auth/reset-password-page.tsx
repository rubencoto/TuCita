import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/api/auth/authService';

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void;
  token?: string;
}

export function ResetPasswordPage({ onNavigate, token: tokenProp }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidToken, setIsValidToken] = useState(true);
  const [token, setToken] = useState<string>('');
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token') || tokenProp;

    if (!tokenFromUrl) {
      setIsValidToken(false);
      setIsValidating(false);
      return;
    }

    setToken(tokenFromUrl);
    validateToken(tokenFromUrl);
  }, [tokenProp]);

  const validateToken = async (tokenToValidate: string) => {
    setIsValidating(true);
    try {
      const result = await authService.validateResetToken({ token: tokenToValidate });
      
      if (result.valid) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        toast.error('Token inválido o expirado');
      }
    } catch (error: any) {
      setIsValidToken(false);
      toast.error('Error al validar el token');
    } finally {
      setIsValidating(false);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    const lowercaseRegex = /[a-z]/;
    if (!lowercaseRegex.test(password)) {
      errors.push('Debe incluir al menos una letra minúscula');
    }
    
    const uppercaseRegex = /[A-Z]/;
    if (!uppercaseRegex.test(password)) {
      errors.push('Debe incluir al menos una letra mayúscula');
    }
    
    const numberRegex = /\d/;
    if (!numberRegex.test(password)) {
      errors.push('Debe incluir al menos un número');
    }
    
    const specialCharRegex = /[@$!%*?&]/;
    if (!specialCharRegex.test(password)) {
      errors.push('Debe incluir al menos un carácter especial (@$!%*?&)');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    
    const passwordErrors = validatePassword(password);
    
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }
    
    if (password !== confirmPassword) {
      setErrors(['Las contraseñas no coinciden']);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.resetPassword({
        token,
        nuevaPassword: password,
        confirmarPassword: confirmPassword,
      });
      
      setIsSuccess(true);
      toast.success('Contraseña actualizada exitosamente');
      
      setTimeout(() => {
        onNavigate('login');
      }, 3000);
      
    } catch (error: any) {
      toast.error('Error al actualizar la contraseña', {
        description: error.message || 'Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const lowercaseRegex = /[a-z]/;
  const uppercaseRegex = /[A-Z]/;
  const numberRegex = /\d/;
  const specialCharRegex = /[@$!%*?&]/;
  
  const hasLowercase = lowercaseRegex.test(password);
  const hasUppercase = uppercaseRegex.test(password);
  const hasNumber = numberRegex.test(password);
  const hasSpecialChar = specialCharRegex.test(password);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Validando enlace...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Enlace Inválido</CardTitle>
            <CardDescription>
              Este enlace ha expirado o no es válido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                El enlace para restablecer tu contraseña ha expirado o no es válido. 
                Por favor, solicita un nuevo enlace.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button 
                onClick={() => onNavigate('forgot-password')} 
                className="w-full"
              >
                Solicitar Nuevo Enlace
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onNavigate('login')} 
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio de Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">¡Contraseña Actualizada!</CardTitle>
            <CardDescription>
              Tu contraseña ha sido cambiada exitosamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
            
            <Button 
              onClick={() => onNavigate('login')} 
              className="w-full"
            >
              Iniciar Sesión Ahora
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Restablecer Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para continuar.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Tu contraseña debe tener:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  Al menos 8 caracteres
                </li>
                <li className={`flex items-center gap-2 ${hasLowercase ? 'text-green-600' : ''}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${hasLowercase ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  Una letra minúscula
                </li>
                <li className={`flex items-center gap-2 ${hasUppercase ? 'text-green-600' : ''}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${hasUppercase ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  Una letra mayúscula
                </li>
                <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-600' : ''}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${hasNumber ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  Un número
                </li>
                <li className={`flex items-center gap-2 ${hasSpecialChar ? 'text-green-600' : ''}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${hasSpecialChar ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  Un carácter especial (@$!%*?&)
                </li>
              </ul>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onNavigate('login')} 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio de Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
