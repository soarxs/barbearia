import { useState } from 'react';
import Cabecalho from '@/components/Header';
import Hero from '@/components/Hero';
import Servicos from '@/components/Services';
import Sobre from '@/components/About';
import Depoimentos from '@/components/Testimonials';
import Contato from '@/components/Contact';
import Rodape from '@/components/Footer';
import BookingModal from '@/components/BookingModal';

const Inicio = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preSelectedService, setPreSelectedService] = useState(undefined);

  const handleBookingClick = (serviceId) => {
    setPreSelectedService(serviceId);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Cabecalho onBookingClick={() => handleBookingClick(undefined)} />
      <Hero onBookingClick={() => handleBookingClick(undefined)} />
      <Servicos onBookingClick={(serviceId) => handleBookingClick(serviceId)} />
      <Sobre />
      <Depoimentos />
      <Contato />
      <Rodape />
      <BookingModal 
        open={isBookingOpen} 
        onOpenChange={setIsBookingOpen}
        preSelectedServiceId={preSelectedService}
      />
    </div>
  );
};

export default Inicio;

