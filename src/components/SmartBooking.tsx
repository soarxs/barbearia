import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { serviceService, barberService, appointmentService } from '@/services/supabaseService';

interface SmartBookingProps {
  onClose: () => void;
  selectedService?: string;
}

const SmartBooking = ({ onClose, selectedService }: SmartBookingProps) => {
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

  // Horários de funcionamento
  const businessHours = {
    start: 8, // 8:00
    end: 18,  // 18:00
    breakStart: 12, // 12:00
    breakEnd: 14    // 14:00
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, barbersData] = await Promise.all([
          serviceService.getAll(),
          barberService.getAll()
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

  // Gerar horários disponíveis baseado na data selecionada
  const getAvailableTimeSlots = (selectedDate: string) => {
    const now = new Date();
    const selected = new Date(selectedDate);
    const isToday = selected.toDateString() === now.toDateString();
    
    const slots = [];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      // Pular horário de almoço
      if (hour >= businessHours.breakStart && hour < businessHours.breakEnd) {
        continue;
      }
      
      // Se for hoje, só mostrar horários futuros
      if (isToday && hour <= currentHour) {
        continue;
      }
      
      // Se for hoje e for o horário atual, verificar minutos
      if (isToday && hour === currentHour && currentMinute >= 30) {
        continue;
      }
      
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour}:00`
      });
      
      // Adicionar horário de 30 minutos se não for o último horário
      if (hour < businessHours.end - 1) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:30`,
          label: `${hour}:30`
        });
      }
    }
    
    return slots;
  };

  // Gerar datas disponíveis (próximos 30 dias)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Pular domingos (se quiser)
      if (date.getDay() === 0) continue;
      
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: '2-digit', 
          month: '2-digit' 
        })
      });
    }
    
    return dates;
  };

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
        status: 'pending',
        notes: formData.notes
      };

      await appointmentService.create(appointmentData);
      
      // Mostrar sucesso
      alert('Agendamento realizado com sucesso!');
      onClose();
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento: ' + error);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
            Agendamento BarberTime
          </CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full ${
                  step >= stepNum ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Passo 1: Escolher Serviço */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Escolha o Serviço</h3>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
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
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.service}
                  className="w-full"
                >
                  Continuar
                </Button>
              </div>
            )}

            {/* Passo 2: Dados Pessoais */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Seus Dados</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="barber">Barbeiro *</Label>
                    <select
                      id="barber"
                      value={formData.barber}
                      onChange={(e) => setFormData({ ...formData, barber: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      required
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
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.name || !formData.phone || !formData.barber}
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 3: Escolher Data */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Escolha a Data</h3>
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={getMinDate()}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={!formData.date}
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 4: Escolher Horário */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Escolha o Horário</h3>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableTimeSlots(formData.date).map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot.time })}
                      className={`p-2 rounded border text-sm ${
                        formData.time === slot.time
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
                
                {formData.date && getAvailableTimeSlots(formData.date).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p>Não há horários disponíveis para esta data</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.time}
                    className="flex-1"
                  >
                    Agendar
                  </Button>
                </div>
              </div>
            )}

            {/* Botão Fechar */}
            <div className="flex justify-center">
              <Button type="button" variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartBooking;
