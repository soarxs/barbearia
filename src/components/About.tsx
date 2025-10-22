
const About = () => {
  return (
    <section id="sobre" className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          <div className="animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Sobre o <span className="gradient-text">BarberTime</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
              Desde 2008, o BarberTime é sinônimo de <strong className="text-foreground">estilo, confiança e autenticidade</strong>.
            </p>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
              Nossa missão é oferecer mais do que um corte — é proporcionar uma experiência completa onde cada cliente sai renovado e confiante.
            </p>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Com uma equipe de profissionais experientes e um ambiente acolhedor, criamos o espaço perfeito para você cuidar do seu visual.
            </p>
            
            <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">15+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Anos de Experiência</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">10K+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Clientes Satisfeitos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">5</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Barbeiros Expert</div>
              </div>
            </div>
          </div>

          <div className="animate-slide-up">
            <div className="relative rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <img 
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200" 
                alt="Interior da barbearia BarberTime"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
