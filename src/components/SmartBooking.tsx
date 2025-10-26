import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Phone } from 'lucide-react';
import { unifiedBookingService } from '@/services/unifiedBookingService';
import { toast } from 'sonner';

interface SmartBookingProps {
  onClose: () => void;
}

export const SmartBooking: React.FC<SmartBookingProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    service: '',
    barber: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
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
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const appointmentData = {
        client_name: formData.name,
        client_phone: formData.phone,
        client_email: formData.email,
        service: formData.service,
        barber: formData.barber,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        status: 'agendado'
      };

      await unifiedBookingService.createAppointment(appointmentData);
      toast.success('Agendamento realizado com sucesso!');
      onClose();
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendamento
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Passo 1: Serviço */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Escolha o Serviço</h3>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, service: service.name });
                        setStep(2);
                      }}
                      className="p-3 rounded-lg border text-left transition-colors hover:border-primary"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.duration}min</p>
                        </div>
                        <Badge variant="secondary">R$ {service.price}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Passo 2: Barbeiro */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Escolha o Barbeiro</h3>
                <div className="grid gap-3">
                  {barbers.map((barber) => (
                    <button
                      key={barber.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, barber: barber.name });
                        setStep(3);
                      }}
                      className="p-3 rounded-lg border text-left transition-colors hover:border-primary"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5" />
                        <span className="font-medium">{barber.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <Button type="button" onClick={() => setStep(1)} variant="outline">
                  Voltar
                </Button>
              </div>
            )}

            {/* Passo 3: Data e Horário */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Escolha Data e Horário</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({ ...formData, time })}
                        className={`p-2 rounded border text-sm ${
                          formData.time === time 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setStep(2)} variant="outline">
                    Voltar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(4)}
                    disabled={!formData.date || !formData.time}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 4: Dados Pessoais */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Seus Dados</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setStep(3)} variant="outline">
                    Voltar
                  </Button>
                  <Button type="submit" disabled={!formData.name || !formData.phone}>
                    Confirmar Agendamento
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};