import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Rafael Santos',
      text: 'Melhor barbearia da região! Atendimento impecável e sempre saio satisfeito. O João é um mestre no que faz.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Felipe Costa',
      text: 'Ambiente top, profissionais qualificados. Já sou cliente há 3 anos e não troco por nada!',
      rating: 5,
    },
    {
      id: 3,
      name: 'Lucas Oliveira',
      text: 'Excelente experiência! Corte moderno, barba perfeita e ótimo atendimento. Super recomendo!',
      rating: 5,
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            O que dizem nossos <span className="gradient-text">clientes</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Satisfação garantida em cada atendimento
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-muted p-6 sm:p-8 rounded-lg animate-slide-up"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-foreground text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="font-semibold text-sm sm:text-base text-primary">
                {testimonial.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
