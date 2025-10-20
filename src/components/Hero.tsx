import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-barber.jpg';

interface HeroProps {
  onBookingClick: () => void;
}

const Hero = ({ onBookingClick }: HeroProps) => {
  return (
    <section 
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroImage})`,
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
          
          <Button 
            onClick={onBookingClick}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 animate-scale-in"
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            Agendar Agora
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
