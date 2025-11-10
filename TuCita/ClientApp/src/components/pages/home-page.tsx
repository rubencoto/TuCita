import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Heart, 
  Calendar, 
  Clock, 
  Shield, 
  Stethoscope,
  Brain,
  Baby,
  Eye,
  Bone,
  Activity,
  CheckCircle,
  ArrowRight,
  Zap,
  Users,
  MapPin,
  Smartphone,
  HeartPulse,
  FileText,
  Bell,
  Lock,
  Globe,
  Headphones,
  BarChart,
  Layers,
  Check,
  X,
  RefreshCw,
  Building2,
  UserCheck,
  ClipboardList
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

const specialties = [
  { name: 'Cardiología', icon: Heart, gradient: 'from-red-500 to-pink-500' },
  { name: 'Neurología', icon: Brain, gradient: 'from-purple-500 to-indigo-500' },
  { name: 'Pediatría', icon: Baby, gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Oftalmología', icon: Eye, gradient: 'from-green-500 to-emerald-500' },
  { name: 'Ortopedia', icon: Bone, gradient: 'from-orange-500 to-amber-500' },
  { name: 'Medicina General', icon: Stethoscope, gradient: 'from-indigo-500 to-blue-500' },
  { name: 'Dermatología', icon: Activity, gradient: 'from-pink-500 to-rose-500' },
  { name: 'Ginecología', icon: HeartPulse, gradient: 'from-violet-500 to-purple-500' },
];

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Disponibilidad en tiempo real de todos los especialistas en tu ciudad',
    items: ['Horarios actualizados', 'Sin llamadas telefónicas', 'Confirmación instantánea']
  },
  {
    icon: Bell,
    title: 'Notificaciones Automáticas',
    description: 'Nunca olvides una consulta con nuestro sistema de recordatorios',
    items: ['Email y SMS', '24h antes', '2 horas antes']
  },
  {
    icon: RefreshCw,
    title: 'Gestión Flexible',
    description: 'Modifica o cancela tus consultas cuando lo necesites',
    items: ['Reagendar fácil', 'Cancelar sin costo', 'Historial completo']
  },
  {
    icon: Lock,
    title: 'Seguridad Total',
    description: 'Tus datos médicos protegidos con encriptación de nivel bancario',
    items: ['Datos encriptados', 'HIPAA compliant', 'Privacidad garantizada']
  },
];

const whyChooseUs = [
  {
    icon: Zap,
    title: 'Rapidez',
    description: 'Agenda en menos de 2 minutos'
  },
  {
    icon: Shield,
    title: 'Confianza',
    description: 'Médicos verificados y certificados'
  },
  {
    icon: Globe,
    title: 'Cobertura',
    description: '25+ ciudades disponibles'
  },
  {
    icon: Headphones,
    title: 'Soporte',
    description: 'Atención al cliente 24/7'
  },
  {
    icon: Smartphone,
    title: 'Accesibilidad',
    description: 'Desde cualquier dispositivo'
  },
  {
    icon: BarChart,
    title: 'Transparencia',
    description: 'Sin costos ocultos'
  },
];

const comparisonItems = [
  { feature: 'Disponibilidad 24/7', traditional: false, tucita: true },
  { feature: 'Confirmación instantánea', traditional: false, tucita: true },
  { feature: 'Recordatorios automáticos', traditional: false, tucita: true },
  { feature: 'Sin llamadas telefónicas', traditional: false, tucita: true },
  { feature: 'Reagendar en línea', traditional: false, tucita: true },
  { feature: 'Historial de consultas', traditional: false, tucita: true },
  { feature: 'Ver especialidades', traditional: true, tucita: true },
  { feature: 'Múltiples formas de pago', traditional: true, tucita: true },
];

const stats = [
  { number: '50,000+', label: 'Pacientes Registrados', icon: Users },
  { number: '1,200+', label: 'Profesionales Médicos', icon: UserCheck },
  { number: '25', label: 'Ciudades en México', icon: Building2 },
  { number: '150K+', label: 'Consultas Agendadas', icon: ClipboardList },
];

export function HomePage({ onNavigate, isLoggedIn }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Clean & Modern */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <Badge className="bg-primary text-white mb-6 text-sm px-4 py-1">
                Tu Plataforma de Salud Digital
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Gestiona tu salud de forma
                <span className="text-primary"> inteligente</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Conecta con especialistas médicos certificados en segundos. 
                Sin esperas telefónicas, sin complicaciones. Todo desde un solo lugar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button 
                  size="lg" 
                  className="px-8 py-6 h-auto text-lg"
                  onClick={() => onNavigate(isLoggedIn ? 'search' : 'register')}
                >
                  {isLoggedIn ? 'Buscar Especialista' : 'Comenzar Ahora'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 h-auto text-lg border-2 bg-[#2E8BC0] text-white hover:bg-[#2E8BC0]/90 border-[#2E8BC0]"
                  onClick={() => onNavigate('doctor-login')}
                >
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Portal Médico
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 h-auto text-lg border-2"
                  onClick={() => onNavigate('search')}
                >
                  Explorar Especialidades
                </Button>
              </div>

              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">100% Gratis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Sin Suscripciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Datos Seguros</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Soporte 24/7</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1706777373948-4a6cdce75975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwdGVjaG5vbG9neSUyMGRpZ2l0YWx8ZW58MXx8fHwxNzYyMDgyOTA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Plataforma de salud digital"
                  className="w-full h-[500px] object-cover"
                />
                
                {/* Floating elements */}
                <div className="absolute top-6 right-6">
                  <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">En línea ahora</p>
                        <p className="font-bold text-foreground">1,200+ médicos</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="absolute bottom-6 left-6">
                  <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tiempo promedio</p>
                        <p className="font-bold text-foreground">{'<'} 2 minutos</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-green-400/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-10 w-10 text-blue-200 mx-auto mb-3" />
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <p className="text-blue-100 text-sm lg:text-base">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-blue-50 text-primary border-blue-200 mb-4">
              Especialidades Médicas
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Encuentra al especialista que necesitas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Accede a una amplia red de profesionales en todas las áreas de la medicina
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-12">
            {specialties.map((specialty, index) => {
              const Icon = specialty.icon;
              return (
                <Card 
                  key={index}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2 hover:border-primary"
                  onClick={() => onNavigate('search')}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`bg-gradient-to-br ${specialty.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {specialty.name}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" onClick={() => onNavigate('search')}>
              Ver Todas las Especialidades
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features with Icons */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-primary text-white mb-4">
              Características
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Herramientas diseñadas para simplificar la gestión de tu salud
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-4 rounded-2xl flex-shrink-0">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {feature.description}
                        </p>
                        <ul className="space-y-2">
                          {feature.items.map((item, idx) => (
                            <li key={idx} className="flex items-center text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us - 6 Items */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-green-50 text-green-700 border-green-200 mb-4">
              Ventajas
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              ¿Por qué elegir TuCitaOnline?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La solución más completa para la gestión de consultas médicas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-br from-primary to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-muted py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-primary text-white mb-4">
              Comparación
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Método tradicional vs TuCitaOnline
            </h2>
            <p className="text-xl text-muted-foreground">
              Descubre cómo transformamos la experiencia de agendar consultas
            </p>
          </div>

          <Card className="overflow-hidden shadow-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="text-left p-6 font-semibold">Característica</th>
                      <th className="text-center p-6 font-semibold">Método Tradicional</th>
                      <th className="text-center p-6 font-semibold bg-blue-700">TuCitaOnline</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {comparisonItems.map((item, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="p-6 font-medium text-foreground">{item.feature}</td>
                        <td className="p-6 text-center">
                          {item.traditional ? (
                            <div className="flex justify-center">
                              <div className="bg-green-100 p-2 rounded-full">
                                <Check className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="bg-red-100 p-2 rounded-full">
                                <X className="h-5 w-5 text-red-600" />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-6 text-center bg-blue-50">
                          {item.tucita ? (
                            <div className="flex justify-center">
                              <div className="bg-green-100 p-2 rounded-full">
                                <Check className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="bg-red-100 p-2 rounded-full">
                                <X className="h-5 w-5 text-red-600" />
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 mb-4">
              Proceso
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Comienza en 3 simples pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Busca tu especialista
              </h3>
              <p className="text-muted-foreground">
                Filtra por especialidad, ubicación y disponibilidad
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-700 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Selecciona fecha y hora
              </h3>
              <p className="text-muted-foreground">
                Elige el horario que mejor se ajuste a tu agenda
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Recibe confirmación
              </h3>
              <p className="text-muted-foreground">
                Obtén tu confirmación al instante y recordatorios automáticos
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="px-10"
              onClick={() => onNavigate(isLoggedIn ? 'search' : 'register')}
            >
              {isLoggedIn ? 'Explorar Ahora' : 'Crear Cuenta Gratis'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-blue-800 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Empieza a cuidar tu salud hoy
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Únete a miles de personas que ya están gestionando su salud de forma más inteligente
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 text-lg px-10 py-6 h-auto shadow-xl"
              onClick={() => onNavigate(isLoggedIn ? 'search' : 'register')}
            >
              {isLoggedIn ? 'Buscar Especialista' : 'Crear Cuenta Gratis'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            {!isLoggedIn && (
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-6 h-auto"
                onClick={() => onNavigate('login')}
              >
                Iniciar Sesión
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 mb-2" />
              <span className="text-sm">Seguro</span>
            </div>
            <div className="flex flex-col items-center">
              <FileText className="h-8 w-8 mb-2" />
              <span className="text-sm">Sin Costo</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 mb-2" />
              <span className="text-sm">24/7</span>
            </div>
            <div className="flex flex-col items-center">
              <Headphones className="h-8 w-8 mb-2" />
              <span className="text-sm">Soporte</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}