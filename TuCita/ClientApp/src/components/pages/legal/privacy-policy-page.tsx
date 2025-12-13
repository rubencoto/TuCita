import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Users, 
  Database, 
  Share2, 
  Clock, 
  Mail,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Cookie,
  RefreshCw,
  Building,
  ArrowLeft,
  Home
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate?: (page: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {onNavigate && (
          <Button
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Pol&iacute;tica de Privacidad
          </h1>
          <p className="text-lg text-muted-foreground">
            TuCitaOnline - Sistema de Gesti&oacute;n de Citas M&eacute;dicas
          </p>
          <Badge className="mt-4" variant="outline">
            &Uacute;ltima actualizaci&oacute;n: 6 de noviembre de 2025
          </Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-foreground leading-relaxed">
              En <strong>TuCitaOnline</strong>, respetamos y protegemos la privacidad de nuestros usuarios. 
              La presente Pol&iacute;tica de Privacidad describe c&oacute;mo recopilamos, usamos, almacenamos y protegemos 
              la informaci&oacute;n personal de las personas que utilizan nuestra plataforma digital para la gesti&oacute;n 
              de citas m&eacute;dicas.
            </p>
            <p className="text-foreground leading-relaxed mt-4">
              Al utilizar nuestro sitio web o aplicaciones asociadas, el usuario acepta las pr&aacute;cticas 
              descritas en esta pol&iacute;tica.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              1. Responsable del tratamiento de datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Nombre del sistema</p>
                  <p className="text-muted-foreground">TuCitaOnline</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Tipo de plataforma</p>
                  <p className="text-muted-foreground">Sistema de gesti&oacute;n de citas m&eacute;dicas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Pa&iacute;s</p>
                  <p className="text-muted-foreground">Costa Rica</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Contacto</p>
                  <a href="mailto:info@tucitaonline.org" className="text-primary hover:underline">
                    info@tucitaonline.org
                  </a>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              TuCitaOnline es responsable del tratamiento de los datos personales conforme a la 
              legislaci&oacute;n costarricense vigente.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              2. Datos personales que recopilamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              Podemos recopilar los siguientes datos, seg&uacute;n el rol del usuario (paciente, doctor o personal administrativo):
            </p>

            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                2.1 Datos de identificaci&oacute;n
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-6 text-muted-foreground">
                <li>Nombre completo</li>
                <li>N&uacute;mero de identificaci&oacute;n (c&eacute;dula/pasaporte, si aplica)</li>
                <li>Correo electr&oacute;nico</li>
                <li>N&uacute;mero de tel&eacute;fono</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                2.2 Datos de uso del sistema
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-6 text-muted-foreground">
                <li>Historial de citas m&eacute;dicas</li>
                <li>Fechas y horarios reservados</li>
                <li>Estado de las citas (reservada, confirmada, cancelada, atendida, no show)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                2.3 Datos cl&iacute;nicos (cuando aplique)
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-6 text-muted-foreground mb-3">
                <li>Observaciones m&eacute;dicas</li>
                <li>Diagn&oacute;sticos registrados por el profesional de salud</li>
                <li>Historial cl&iacute;nico b&aacute;sico</li>
              </ul>
              <p className="text-sm text-amber-700 font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Los datos cl&iacute;nicos son considerados datos sensibles y reciben un nivel de protecci&oacute;n reforzado.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              3. Finalidad del uso de los datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              Los datos personales recopilados se utilizan exclusivamente para:
            </p>
            <ul className="space-y-2">
              {[
                'Gestionar el registro y autenticaci\u00F3n de usuarios',
                'Permitir la reserva, cancelaci\u00F3n y reprogramaci\u00F3n de citas m\u00E9dicas',
                'Facilitar la atenci\u00F3n m\u00E9dica y el seguimiento cl\u00EDnico',
                'Enviar notificaciones relacionadas con citas (correo electr\u00F3nico)',
                'Mejorar la funcionalidad, seguridad y experiencia del sistema',
                'Cumplir obligaciones acad\u00E9micas, t\u00E9cnicas o legales del proyecto'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              4. Base legal para el tratamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              El tratamiento de los datos personales se fundamenta en:
            </p>
            <ul className="space-y-2">
              {[
                'El consentimiento expreso del usuario',
                'La necesidad de ejecutar los servicios solicitados',
                'El cumplimiento de obligaciones legales aplicables'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              5. Almacenamiento y seguridad de la informaci&oacute;n
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">
              TuCitaOnline implementa medidas t&eacute;cnicas y organizativas para proteger los datos personales, tales como:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {[
                'Autenticaci\u00F3n segura de usuarios',
                'Cifrado de contrase\u00F1as',
                'Control de acceso por roles',
                'Uso de bases de datos seguras',
                'Registro de acciones del sistema'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
              El acceso a los datos est&aacute; limitado &uacute;nicamente a personal autorizado.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              6. Compartici&oacute;n de datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              TuCitaOnline <strong>no vende ni comparte</strong> datos personales con terceros, salvo en los siguientes casos:
            </p>
            <ul className="space-y-2">
              {[
                'Cuando sea estrictamente necesario para la prestaci\u00F3n del servicio',
                'Por requerimiento legal de una autoridad competente'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              7. Derechos del usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-foreground mb-4">
              De acuerdo con la <strong>Ley 8968</strong>, el usuario tiene derecho a:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                'Acceder a sus datos personales',
                'Solicitar la rectificaci\u00F3n de informaci\u00F3n incorrecta',
                'Solicitar la eliminaci\u00F3n de sus datos',
                'Oponerse o limitar el tratamiento'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-foreground font-medium mb-2">
                Para ejercer estos derechos, el usuario puede contactar a:
              </p>
              <a 
                href="mailto:info@tucitaonline.org" 
                className="text-primary hover:underline flex items-center gap-2 font-medium"
              >
                <Mail className="h-4 w-4" />
                info@tucitaonline.org
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              8. Conservaci&oacute;n de los datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              Los datos personales se conservar&aacute;n &uacute;nicamente durante el tiempo necesario para cumplir 
              las finalidades del sistema o mientras exista una relaci&oacute;n activa con el usuario, salvo 
              que la ley exija un per&iacute;odo mayor.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              9. Uso de cookies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              TuCitaOnline puede utilizar cookies t&eacute;cnicas necesarias para:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                'Mantener sesiones activas',
                'Mejorar la experiencia del usuario',
                'Garantizar el correcto funcionamiento del sistema'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground bg-green-50 border border-green-200 rounded-lg p-3">
              &check; No se utilizan cookies con fines publicitarios.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              10. Cambios a esta pol&iacute;tica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              TuCitaOnline se reserva el derecho de modificar esta Pol&iacute;tica de Privacidad en cualquier momento. 
              Las modificaciones ser&aacute;n publicadas en esta misma secci&oacute;n y entrar&aacute;n en vigor desde su publicaci&oacute;n.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              11. Aceptaci&oacute;n
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground font-medium">
              El uso de la plataforma implica la aceptaci&oacute;n expresa de esta Pol&iacute;tica de Privacidad.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Si tiene alguna pregunta sobre esta Pol&iacute;tica de Privacidad, cont&aacute;ctenos en{' '}
            <a href="mailto:info@tucitaonline.org" className="text-primary hover:underline font-medium">
              info@tucitaonline.org
            </a>
          </p>
          
          {onNavigate && (
            <Button
              onClick={() => onNavigate('home')}
              className="mt-4"
            >
              <Home className="h-4 w-4 mr-2" />
              Volver a la p&aacute;gina principal
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
