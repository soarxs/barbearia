import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onBookingClick: () => void;
}

const Header = ({ onBookingClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Título */}
        <div className="flex items-center">
          <span className="text-2xl font-bold gradient-text">BarberTime</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('inicio')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            Início
          </button>
          <button 
            onClick={() => scrollToSection('servicos')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            Serviços
          </button>
          <button 
            onClick={() => scrollToSection('sobre')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            Sobre
          </button>
          <button 
            onClick={() => scrollToSection('contato')} 
            className="text-foreground hover:text-primary transition-colors"
          >
            Contato
          </button>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              onClick={onBookingClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              Agendar Agora
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <button 
              onClick={() => scrollToSection('inicio')} 
              className="text-foreground hover:text-primary transition-colors py-2 text-left"
            >
              Início
            </button>
            <button 
              onClick={() => scrollToSection('servicos')} 
              className="text-foreground hover:text-primary transition-colors py-2 text-left"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollToSection('sobre')} 
              className="text-foreground hover:text-primary transition-colors py-2 text-left"
            >
              Sobre
            </button>
            <button 
              onClick={() => scrollToSection('contato')} 
              className="text-foreground hover:text-primary transition-colors py-2 text-left"
            >
              Contato
            </button>
            <div className="flex items-center gap-2 w-full">
              <ThemeToggle />
              <Button 
                onClick={onBookingClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex-1"
              >
                Agendar Agora
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
