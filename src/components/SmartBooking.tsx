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
import { serviceService, barberService } from '@/services/supabaseService';
import { bookingService } from '@/services/bookingService';

// Componente para lista de horários
const TimeSlotsList = ({ date, service, barber, selectedTime, onTimeSelect }: {
  date: string;
  service: string;
  barber: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}) => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        setLoading(true);
        const availableSlots = await bookingService.getAvailableSlots(date, service, barber);
        setSlots(availableSlots.map(time => ({
          time,
          label: time,
          display: time
        })));
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [date, service, barber]);

  if (loading) {
    return (
      <div>
        <Label>Horários Disponíveis *</Label>
        <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm">Carregando horários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label>Horários Disponíveis *</Label>
      <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
        {slots.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 p-2">
            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => onTimeSelect(slot.time)}
                className={`p-3 rounded border text-sm transition-colors ${
                  selectedTime === slot.time
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{slot.display}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Não há horários disponíveis para esta data</p>
            <p className="text-xs mt-1">Tente escolher outra data ou barbeiro</p>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const getAvailableTimeSlots = async (selectedDate: string, service: string, barber: string) => {
    try {
      const slots = await bookingService.getAvailableSlots(selectedDate, service, barber);
      return slots.map(time => ({
        time,
        label: time,
        display: time
      }));
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      return [];
    }
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
        notes: formData.notes
      };

      await bookingService.createAppointment(appointmentData);
      
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

  // Função para gerar opções de data
  const getDateOptions = () => {
    const today = new Date();
    const options = [];
    
    // Hoje
    options.push({
      value: today.toISOString().split('T')[0],
      label: 'Hoje',
      description: today.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })
    });
    
    // Próximos 3 dias
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      options.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
        description: date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })
      });
    }
    
    return options;
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

            {/* Passo 2: Escolher Data */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-center text-white mb-6">ESCOLHA O DIA</h3>
                
                {/* Opções de Data */}
                <div className="space-y-3">
                  {getDateOptions().map((dateOption) => (
                    <div
                      key={dateOption.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.date === dateOption.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData({ ...formData, date: dateOption.value, time: '' })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{dateOption.label}</p>
                            <p className="text-sm text-gray-500">{dateOption.description}</p>
                          </div>
                        </div>
                        {formData.date === dateOption.value && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mostrar horários disponíveis se data selecionada */}
                {formData.date && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Horários Disponíveis:</h4>
                    <p className="text-sm text-blue-800">
                      {formData.date === new Date().toISOString().split('T')[0] 
                        ? 'Hoje - apenas horários futuros disponíveis'
                        : 'Todos os horários de funcionamento disponíveis'
                      }
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.date}
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 3: Dados Pessoais e Barbeiro */}
            {step === 3 && (
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
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={!formData.name || !formData.phone || !formData.barber}
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
                
                {/* Lista de Horários Disponíveis */}
                {formData.date && formData.service && formData.barber && (
                  <TimeSlotsList 
                    date={formData.date}
                    service={formData.service}
                    barber={formData.barber}
                    selectedTime={formData.time}
                    onTimeSelect={(time) => setFormData({ ...formData, time })}
                  />
                )}

                {/* Informações do Agendamento */}
                {formData.date && formData.time && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Resumo do Agendamento:</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(formData.date).toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            day: '2-digit', 
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formData.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{formData.service} com {formData.barber}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.date || !formData.time}
                    className="flex-1"
                  >
                    Confirmar Agendamento
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
