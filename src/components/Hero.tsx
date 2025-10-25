import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Clock, MapPin, Star } from 'lucide-react';
import SmartBooking from './SmartBooking';
import { useState } from 'react';

interface HeroProps {
  onBookingClick: () => void;
}

const Hero = ({ onBookingClick }: HeroProps) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <section 
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{ background: 'var(--gradient-overlay)' }}
      />
      
      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in pt-16 sm:pt-0">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
            Estilo não se corta,{' '}
            <span className="gradient-text">se cria.</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground dark:text-muted-foreground light:text-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-4" style={{ color: 'var(--muted-foreground)' }}>
            Agende seu horário com os melhores barbeiros da cidade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setIsBookingOpen(true)}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 animate-scale-in"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              Agendar Agora
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6"
              onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de agendar um horário no BarberTime', '_blank')}
            >
              <Phone className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            <CardContent className="p-3 sm:p-4 text-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-xs sm:text-sm">Horário</h3>
              <p className="text-xs text-gray-600">Seg-Sex: 9h-18h<br/>Sáb: 9h-17h</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            <CardContent className="p-3 sm:p-4 text-center">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-xs sm:text-sm">Localização</h3>
              <p className="text-xs text-gray-600">Centro da cidade<br/>Fácil acesso</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border-white/20">
            <CardContent className="p-3 sm:p-4 text-center">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-xs sm:text-sm">Avaliação</h3>
              <p className="text-xs text-gray-600">5.0 no Google<br/>
                <button 
                  onClick={() => window.open('https://g.page/r/barbertime/review', '_blank')}
                  className="text-primary hover:underline"
                >
                  Avalie-nos
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Google Calendar Booking Modal */}
    {isBookingOpen && (
        <SmartBooking
            onClose={() => setIsBookingOpen(false)}
        />
    )}
    </section>
  );
};

export default Hero;
