import { Heart, Phone, Mail, MapPin, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-foreground rounded-lg p-2">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-semibold">TuCitaOnline</span>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              La plataforma más confiable para agendar tus citas médicas en línea. 
              Conectamos pacientes con los mejores profesionales de la salud.
            </p>
            <div className="flex items-center space-x-2 text-primary-foreground/80">
              <Clock className="h-4 w-4" />
              <span>Disponible 24/7</span>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>info@tucitaonline.com</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span>Ciudad de México, México</span>
              </div>
            </div>
          </div>

          {/* Enlaces útiles */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces Útiles</h3>
            <div className="space-y-2">
              <a href="#" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Preguntas Frecuentes
              </a>
              <a href="#" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Soporte Técnico
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60">
            © 2024 TuCitaOnline. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}