import { Phone, Instagram, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contato" className="py-12 sm:py-16 md:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-secondary-foreground">
            Fale Conosco
          </h2>
          <p className="text-secondary-foreground/80 text-base sm:text-lg">
            Entre em contato ou visite nossa barbearia
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background p-6 sm:p-8 rounded-lg text-center hover-lift cursor-pointer animate-slide-up group"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
              <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">WhatsApp</h3>
            <p className="text-sm sm:text-base text-muted-foreground">(11) 99999-9999</p>
          </a>

          <a
            href="https://instagram.com/barbertime"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background p-6 sm:p-8 rounded-lg text-center hover-lift cursor-pointer animate-slide-up group"
            style={{ 
              boxShadow: 'var(--shadow-card)',
              animationDelay: '0.1s'
            }}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
              <Instagram className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Instagram</h3>
            <p className="text-sm sm:text-base text-muted-foreground">@barbertime</p>
          </a>

          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background p-6 sm:p-8 rounded-lg text-center hover-lift cursor-pointer animate-slide-up group"
            style={{ 
              boxShadow: 'var(--shadow-card)',
              animationDelay: '0.2s'
            }}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Localização</h3>
            <p className="text-sm sm:text-base text-muted-foreground">São Paulo, SP</p>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
