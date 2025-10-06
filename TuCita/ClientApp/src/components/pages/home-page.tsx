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
  Users,
  Star,
  CheckCircle
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

const specialties = [
  { name: 'Cardiología', icon: Heart, color: 'text-red-500' },
  { name: 'Neurología', icon: Brain, color: 'text-purple-500' },
  { name: 'Pediatría', icon: Baby, color: 'text-blue-500' },
  { name: 'Oftalmología', icon: Eye, color: 'text-green-500' },
  { name: 'Ortopedia', icon: Bone, color: 'text-orange-500' },
  { name: 'Medicina General', icon: Stethoscope, color: 'text-indigo-500' },
];

const features = [
  {
    icon: Calendar,
    title: 'Agenda Fácil',
    description: 'Programa tus citas médicas en pocos clics, 24/7'
  },
  {
    icon: Clock,
    title: 'Ahorra Tiempo',
    description: 'Sin largas esperas telefónicas ni filas'
  },
  {
    icon: Shield,
    title: 'Seguro y Confiable',
    description: 'Tus datos están protegidos con la mejor tecnología'
  },
  {
    icon: Users,
    title: 'Médicos Verificados',
    description: 'Solo profesionales certificados y de confianza'
  }
];

const stats = [
  { number: '50,000+', label: 'Pacientes Atendidos' },
  { number: '1,200+', label: 'Médicos Especialistas' },
  { number: '25', label: 'Ciudades Disponibles' },
  { number: '4.8', label: 'Calificación Promedio', icon: Star }
];

export function HomePage({ onNavigate, isLoggedIn }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-700 text-primary-foreground">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  ✨ La forma más fácil de agendar citas médicas
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Agenda tus citas médicas en línea
                  <span className="text-blue-200"> fácil y rápido</span>
                </h1>
                <p className="text-xl text-blue-100 max-w-lg">
                  Conectamos pacientes con los mejores médicos especialistas. 
                  Sin esperas, sin complicaciones.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3"
                  onClick={() => onNavigate(isLoggedIn ? 'search' : 'register')}
                >
                  {isLoggedIn ? 'Buscar Médicos' : 'Reservar Cita'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary px-8 py-3"
                  onClick={() => onNavigate('search')}
                >
                  Explorar Especialidades
                </Button>
              </div>

              {/* Características rápidas */}
              <div className="flex items-center space-x-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Sin costo adicional</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Confirmación inmediata</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Recordatorios automáticos</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1659353885824-1199aeeebfc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMGhlcm8lMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc1OTMzNjI0MXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Equipo médico profesional"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl lg:text-4xl font-bold text-primary">
                    {stat.number}
                  </span>
                  {stat.icon && <stat.icon className="h-6 w-6 text-yellow-500 ml-1" />}
                </div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Especialidades Destacadas */}
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Especialidades Médicas Disponibles
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encuentra al especialista que necesitas para tu cuidado médico
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialties.map((specialty, index) => {
              const Icon = specialty.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 group"
                  onClick={() => onNavigate('search')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className={`p-3 rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors`}>
                        <Icon className={`h-8 w-8 ${specialty.color} group-hover:text-primary-foreground`} />
                      </div>
                    </div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {specialty.name}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => onNavigate('search')}>
              Ver Todas las Especialidades
            </Button>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Por qué elegir TuCitaOnline?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simplificamos el proceso de agendar citas médicas para tu comodidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-accent py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-accent-foreground mb-4">
            ¿Listo para agendar tu próxima cita médica?
          </h2>
          <p className="text-xl text-accent-foreground/80 mb-8">
            Únete a miles de pacientes que ya confían en TuCitaOnline para su cuidado médico
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => onNavigate(isLoggedIn ? 'search' : 'register')}
              className="px-8 py-3"
            >
              {isLoggedIn ? 'Buscar Médicos Ahora' : 'Crear Cuenta Gratis'}
            </Button>
            {!isLoggedIn && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onNavigate('login')}
                className="px-8 py-3"
              >
                Ya tengo cuenta
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}