import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, MessageSquare } from 'lucide-react';
import { unifiedBookingService } from '@/services/unifiedBookingService';

interface GoogleCalendarBookingProps {
  onClose: () => void;
  selectedService?: string;
}

const GoogleCalendarBooking = ({ onClose, selectedService }: GoogleCalendarBookingProps) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: selectedService || '',
    barber: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, barbersData] = await Promise.all([
          unifiedBookingService.getActiveServices(),
          unifiedBookingService.getActiveBarbers()
        ]);
        
        setServices(servicesData);
        setBarbers(barbersData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const generateGoogleCalendarLink = () => {
    const startDate = new Date(`${formData.date}T${formData.time}:00`);
    const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutes later
    
    const title = `Agendamento BarberTime - ${formData.service}`;
    const details = `
Cliente: ${formData.name}
Telefone: ${formData.phone}
Email: ${formData.email}
Serviço: ${formData.service}
Observações: ${formData.notes}

Agendado através do site BarberTime
    `.trim();

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(details)}&location=BarberTime`;

    return googleCalendarUrl;
  };

  const handleSubmit = () => {
    const googleLink = generateGoogleCalendarLink();
    window.open(googleLink, '_blank');
    
    // Enviar WhatsApp também
    const whatsappMessage = `Olá! Gostaria de agendar:
Serviço: ${formData.service}
Data: ${formData.date}
Horário: ${formData.time}
Nome: ${formData.name}
Telefone: ${formData.phone}`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendamento BarberTime
          </CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full ${
                  step >= stepNum ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Escolha o Serviço</h3>
              <div className="grid gap-3">
                {loading ? (
                  <div className="text-center py-4">Carregando serviços...</div>
                ) : (
                  services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setFormData({ ...formData, service: service.name })}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.service === service.name
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.duration}min</p>
                        </div>
                        <Badge variant="secondary">R$ {service.price}</Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.service}
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Seus Dados</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg mt-1"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border rounded-lg mt-1"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded-lg mt-1"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Barbeiro *</label>
                  <select
                    value={formData.barber}
                    onChange={(e) => setFormData({ ...formData, barber: e.target.value })}
                    className="w-full p-2 border rounded-lg mt-1"
                  >
                    <option value="">Escolha um barbeiro</option>
                    {barbers.map((barber) => (
                      <option key={barber.id} value={barber.name}>
                        {barber.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.name || !formData.phone || !formData.barber}
                  className="flex-1"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Data e Horário</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Data *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border rounded-lg mt-1"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Horário *</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setFormData({ ...formData, time })}
                        className={`p-2 text-sm rounded border transition-colors ${
                          formData.time === time
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 border rounded-lg mt-1"
                    rows={3}
                    placeholder="Alguma observação especial..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.date || !formData.time}
                  className="flex-1"
                >
                  Agendar
                </Button>
              </div>
            </div>
          )}

          {/* Resumo */}
          {formData.service && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Resumo do Agendamento</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Serviço:</strong> {formData.service}</p>
                {formData.name && <p><strong>Cliente:</strong> {formData.name}</p>}
                {formData.date && <p><strong>Data:</strong> {formData.date}</p>}
                {formData.time && <p><strong>Horário:</strong> {formData.time}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCalendarBooking;
