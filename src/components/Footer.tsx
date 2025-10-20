import { Scissors, Instagram, Phone, Mail } from 'lucide-react';
import { getVersionString } from '@/lib/version.js';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg logo-blue">
                <span className="text-white text-sm font-bold">💈</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold gradient-text">BarberTime</span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Estilo, confiança e autenticidade desde 2008.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Links Rápidos</h3>
            <div className="flex flex-col gap-2">
              <a href="#inicio" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                Início
              </a>
              <a href="#servicos" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                Serviços
              </a>
              <a href="#sobre" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                Sobre
              </a>
              <a href="#contato" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                Contato
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Contato</h3>
            <div className="flex flex-col gap-2 sm:gap-3">
              <a 
                href="tel:+5511999999999" 
                className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </a>
              <a 
                href="mailto:contato@barbertime.com" 
                className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                contato@barbertime.com
              </a>
              <a 
                href="https://instagram.com/barbertime" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @barbertime
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            Desenvolvido por <span className="text-primary font-semibold">Guilherme Ferreira</span> © 2025 BarberTime. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-2 opacity-60">
            {getVersionString()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
