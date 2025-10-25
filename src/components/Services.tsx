import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Users, Phone } from 'lucide-react';
import { getServices } from '@/lib/dataStore.js';
import { useTenant } from '@/hooks/useTenant.js';
const haircutImage = 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800';
const beardImage = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800';
const comboImage = 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800';

interface ServicesProps {
  onBookingClick: (serviceId: string) => void;
}

const Services = ({ onBookingClick }: ServicesProps) => {
  const { data: tenant } = useTenant()
  const [services, setServices] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      if (tenant?.barbershop?.id) {
        try {
          setLoading(true);
          const cfg = await getServices(tenant.barbershop.id);
          // normalize shape
          const mapped = cfg.map((s) => ({
            id: s.id,
            title: s.name,
            description: s.description || 'Serviço premium BarberTime.',
            price: Number(s.price || 0),
            image: s.image || (s.name.toLowerCase().includes('corte') ? haircutImage : s.name.toLowerCase().includes('barba') ? beardImage : comboImage),
            icon: s.icon || '💈',
          }));
          setServices(mapped);
        } catch (error) {
          setServices([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadServices();
  }, [tenant]);

  return (
    <section id="servicos" className="py-12 sm:py-16 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Nossos <span className="gradient-text">Serviços</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Qualidade e estilo em cada atendimento
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="group bg-background rounded-lg overflow-hidden animate-pulse">
                <Skeleton className="h-56 sm:h-56 md:h-64 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            services.map((service, index) => (
            <div
              key={service.id}
              className="group bg-background rounded-lg overflow-hidden hover-lift cursor-pointer animate-slide-up"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                boxShadow: 'var(--shadow-card)'
              }}
              onClick={() => onBookingClick(service.id)}
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{service.icon}</span>
                      <h3 className="text-lg sm:text-xl font-bold">{service.title}</h3>
                    </div>
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">R$ {service.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-bold">{service.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    30min
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base mb-3">{service.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>5.0 no Google</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('https://g.page/r/barbertime/review', '_blank');
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Avaliar
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick(service.id);
                    }}
                  >
                    Agendar Agora
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://wa.me/5511999999999?text=Olá! Gostaria de agendar ${service.title} no BarberTime`, '_blank');
                    }}
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;
