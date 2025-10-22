import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
          console.error('Erro ao carregar serviços:', error);
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

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
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
              <div className="relative h-56 sm:h-56 md:h-64 overflow-hidden">
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
                <h3 className="text-lg sm:text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-4">{service.description}</p>
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookingClick(service.id);
                  }}
                >
                  Agendar Agora
                </Button>
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
