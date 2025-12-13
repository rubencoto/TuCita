import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Shield, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Scale,
  Lock,
  RefreshCw,
  Home,
  ArrowLeft,
  UserCheck,
  Heart,
  Ban,
  Copyright,
  Power
} from 'lucide-react';

interface TermsConditionsPageProps {
  onNavigate?: (page: string) => void;
}

export function TermsConditionsPage({ onNavigate }: TermsConditionsPageProps) {
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
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            T&eacute;rminos y Condiciones de Uso
          </h1>
          <p className="text-lg text-muted-foreground">
            TuCitaOnline - Sistema de Gesti&oacute;n de Citas M&eacute;dicas
          </p>
          <Badge className="mt-4" variant="outline">
            &Uacute;ltima actualizaci&oacute;n: 6 de enero de 2025
          </Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-foreground leading-relaxed mb-4">
              El presente documento establece los <strong>T&eacute;rminos y Condiciones de Uso</strong> de la 
              plataforma digital <strong>TuCitaOnline</strong>, destinada a la gesti&oacute;n de citas m&eacute;dicas 
              y acceso a informaci&oacute;n relacionada con la atenci&oacute;n en cl&iacute;nicas y consultorios.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-foreground font-medium">
                Al acceder y utilizar esta plataforma, el usuario acepta expresamente los t&eacute;rminos 
                aqu&iacute; descritos. Si no est&aacute; de acuerdo, debe abstenerse de utilizar el sistema.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              1. Descripci&oacute;n del servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-foreground">
              <strong>TuCitaOnline</strong> es una plataforma digital que permite:
            </p>
            <ul className="space-y-2">
              {[
                'Registro y autenticaci\u00F3n de usuarios',
                'Gesti\u00F3n de citas m\u00E9dicas (reservar, cancelar y reprogramar)',
                'Publicaci\u00F3n y administraci\u00F3n de horarios m\u00E9dicos',
                'Registro de atenci\u00F3n y estados de citas',
                'Acceso controlado a informaci\u00F3n cl\u00EDnica b\u00E1sica'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              El sistema est&aacute; orientado a pacientes, profesionales de la salud y personal administrativo.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              2. Roles de usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">
              La plataforma maneja distintos roles, cada uno con permisos espec&iacute;ficos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-foreground">PACIENTE</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Puede registrarse, gestionar sus citas y consultar su informaci&oacute;n.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-foreground">DOCTOR</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Puede administrar su agenda, atender citas y registrar informaci&oacute;n cl&iacute;nica.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-foreground">ADMIN</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Administra usuarios, configuraciones y reportes del sistema.
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground font-medium mt-4 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              Cada usuario es responsable del uso adecuado de su cuenta seg&uacute;n su rol.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              3. Registro y veracidad de la informaci&oacute;n
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              El usuario se compromete a:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                'Proporcionar informaci\u00F3n veraz, completa y actualizada',
                'Mantener la confidencialidad de sus credenciales de acceso',
                'Notificar cualquier uso no autorizado de su cuenta'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-medium">
                <strong>TuCitaOnline</strong> no se responsabiliza por consecuencias derivadas de 
                informaci&oacute;n falsa o inexacta proporcionada por el usuario.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              4. Uso adecuado de la plataforma
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-foreground mb-3">
              El usuario se compromete a utilizar <strong>TuCitaOnline</strong> de forma responsable y l&iacute;cita.
            </p>
            <p className="text-foreground font-semibold mb-3">
              Queda estrictamente prohibido:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                'Usar la plataforma con fines fraudulentos o il\u00EDcitos',
                'Acceder o intentar acceder a informaci\u00F3n de otros usuarios sin autorizaci\u00F3n',
                'Alterar, da\u00F1ar o interferir con el funcionamiento del sistema',
                'Realizar ataques, pruebas de penetraci\u00F3n o explotaci\u00F3n de vulnerabilidades'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium flex items-start gap-2">
                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                El incumplimiento podr&aacute; resultar en la suspensi&oacute;n o eliminaci&oacute;n de la cuenta.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              5. Gesti&oacute;n de citas m&eacute;dicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                {
                  text: 'Las citas est\u00E1n sujetas a la disponibilidad publicada por los profesionales de salud.',
                  icon: CheckCircle,
                  color: 'text-blue-600'
                },
                {
                  text: 'El usuario puede cancelar o reprogramar una cita seg\u00FAn las reglas establecidas por la cl\u00EDnica.',
                  icon: CheckCircle,
                  color: 'text-blue-600'
                },
                {
                  text: 'La no asistencia a una cita (NO SHOW) podr\u00E1 ser registrada en el sistema.',
                  icon: AlertTriangle,
                  color: 'text-amber-600'
                },
                {
                  text: 'TuCitaOnline no garantiza disponibilidad inmediata ni atenci\u00F3n m\u00E9dica de emergencia.',
                  icon: AlertTriangle,
                  color: 'text-red-600'
                }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <item.icon className={`h-4 w-4 ${item.color} mt-1 flex-shrink-0`} />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-600" />
              6. Informaci&oacute;n m&eacute;dica y responsabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-semibold flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <strong>TuCitaOnline no sustituye la consulta m&eacute;dica presencial.</strong>
              </p>
            </div>
            <p className="text-muted-foreground">
              La informaci&oacute;n registrada en el sistema es de car&aacute;cter informativo y administrativo.
            </p>
            <p className="text-muted-foreground">
              El profesional de salud es responsable del contenido cl&iacute;nico que registre, y el 
              paciente es responsable de brindar informaci&oacute;n veraz sobre su estado de salud.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-primary" />
              7. Disponibilidad del servicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              <strong>TuCitaOnline</strong> se esfuerza por mantener el sistema disponible; sin embargo:
            </p>
            <ul className="space-y-2">
              {[
                'Pueden ocurrir interrupciones por mantenimiento, fallos t\u00E9cnicos o fuerza mayor',
                'No se garantiza disponibilidad continua o libre de errores',
                'La plataforma no ser\u00E1 responsable por da\u00F1os derivados de interrupciones temporales del servicio'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copyright className="h-5 w-5 text-primary" />
              8. Propiedad intelectual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              Todo el contenido, c&oacute;digo fuente, dise&ntilde;o, logotipos y documentaci&oacute;n de 
              <strong> TuCitaOnline</strong> son propiedad de sus desarrolladores, salvo que se indique lo contrario.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium flex items-start gap-2">
                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Queda prohibida la reproducci&oacute;n, modificaci&oacute;n o distribuci&oacute;n sin autorizaci&oacute;n expresa.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-amber-200">
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-amber-600" />
              9. Suspensi&oacute;n y cancelaci&oacute;n de cuentas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-foreground mb-3">
              <strong>TuCitaOnline</strong> podr&aacute; suspender o cancelar cuentas que:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                'Incumplan estos T\u00E9rminos y Condiciones',
                'Hagan uso indebido del sistema',
                'Comprometan la seguridad o integridad de la plataforma'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
              El usuario puede solicitar la cancelaci&oacute;n de su cuenta conforme a la Pol&iacute;tica de Privacidad.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              10. Limitaci&oacute;n de responsabilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              <strong>TuCitaOnline</strong> no ser&aacute; responsable por:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                'Decisiones m\u00E9dicas tomadas a partir de la informaci\u00F3n registrada',
                'P\u00E9rdida de datos causada por factores externos o fuerza mayor',
                'Uso indebido del sistema por parte del usuario'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-medium">
                El uso de la plataforma es bajo responsabilidad del usuario.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              11. Modificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-3">
              <strong>TuCitaOnline</strong> se reserva el derecho de modificar estos T&eacute;rminos y 
              Condiciones en cualquier momento.
            </p>
            <p className="text-muted-foreground">
              Las modificaciones se publicar&aacute;n en esta secci&oacute;n y entrar&aacute;n en vigor desde su publicaci&oacute;n.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              12. Legislaci&oacute;n aplicable
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-foreground mb-3">
              Estos T&eacute;rminos y Condiciones se rigen por las leyes de la <strong>Rep&uacute;blica de Costa Rica</strong>.
            </p>
            <p className="text-muted-foreground">
              Cualquier controversia ser&aacute; resuelta conforme a la normativa vigente del pa&iacute;s.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              13. Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">
              Para consultas relacionadas con estos t&eacute;rminos, el usuario puede comunicarse a:
            </p>
            <a 
              href="mailto:info@tucitaonline.org" 
              className="text-primary hover:underline flex items-center gap-2 font-medium text-lg"
            >
              <Mail className="h-5 w-5" />
              info@tucitaonline.org
            </a>
          </CardContent>
        </Card>

        <div className="text-center mt-12 pt-8 border-t">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-foreground font-semibold text-lg mb-2 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Aceptaci&oacute;n de los T&eacute;rminos
            </p>
            <p className="text-muted-foreground">
              El uso de la plataforma implica la aceptaci&oacute;n expresa de estos T&eacute;rminos y Condiciones.
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Si tiene alguna pregunta sobre estos T&eacute;rminos y Condiciones, cont&aacute;ctenos en{' '}
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
