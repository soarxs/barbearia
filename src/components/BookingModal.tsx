import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addAppointment, formatLocalDateKey, normalizePhoneToE164BR, getBarbers, getServices, generateTimeSlotsFor, generateTimeSlotsForBarber, isTimeTaken, getAllBarberSchedules } from '@/lib/dataStore.js';
import { useTenant } from '@/hooks/useTenant.js';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ValidatedInput } from '@/components/ui/validated-input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import InputMask from 'react-input-mask';
import haircutImage from '@/assets/service-haircut.jpg';
import beardImage from '@/assets/service-beard.jpg';
import comboImage from '@/assets/service-combo.jpg';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedServiceId?: string;
}

const BookingModal = ({ open, onOpenChange, preSelectedServiceId }: BookingModalProps) => {
  const { data: tenant } = useTenant()
  const navigate = useNavigate()
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [times, setTimes] = useState([
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]);
  const [takenTimes, setTakenTimes] = useState<Set<string>>(new Set());
  const [barberSchedules, setBarberSchedules] = useState<Record<string, any>>({});

  // Form validation
  const {
    errors,
    touched,
    handleBlur,
    handleChange,
    setFieldTouched,
    isFieldValid,
    isFieldInvalid,
    isFormValid,
  } = useFormValidation({
    name: validationRules.name,
    phone: validationRules.phone,
  });

  // Se um serviço foi pré-selecionado a partir de um card, pule para a etapa 2; se veio do botão "Agendar Agora", NÃO pular
  useEffect(() => {
    if (open && preSelectedServiceId) {
      setSelectedService(preSelectedServiceId);
      setStep(2);
    } else if (open && !preSelectedServiceId) {
      setStep(1);
      setSelectedService('');
    }
  }, [preSelectedServiceId, open]);

  const [services, setServices] = useState([
    { id: 'haircut', name: 'Corte de Cabelo', image: haircutImage, icon: '💇' },
    { id: 'beard', name: 'Barba', image: beardImage, icon: '🧔' },
    { id: 'combo', name: 'Corte + Barba', image: comboImage, icon: '💈' },
  ]);

  const [barbers, setBarbers] = useState([
    { id: 'joao', name: 'João Silva' },
    { id: 'carlos', name: 'Carlos Santos' },
    { id: 'rafael', name: 'Rafael Oliveira' },
  ]);

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      if (tenant?.barbershop?.id) {
        try {
          // Carregar barbeiros
          const barbersData = await getBarbers(tenant.barbershop.id);
          if (barbersData && barbersData.length > 0) {
            setBarbers(barbersData.map(b => ({ id: b.id, name: b.name })));
          }
          
          // Carregar serviços
          const servicesData = await getServices(tenant.barbershop.id);
          if (servicesData && servicesData.length > 0) {
            const mappedServices = servicesData.map(s => ({
              id: s.id,
              name: s.name,
              image: s.image || (s.name.toLowerCase().includes('corte') ? haircutImage : s.name.toLowerCase().includes('barba') ? beardImage : comboImage),
              icon: s.icon || '💈'
            }));
            setServices(mappedServices);
          }
          
          // Carregar horários dos barbeiros
          const schedulesData = await getAllBarberSchedules(tenant.barbershop.id);
          const schedulesMap: Record<string, any> = {};
          schedulesData.forEach(schedule => {
            schedulesMap[schedule.barber_id] = schedule;
          });
          setBarberSchedules(schedulesMap);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      }
    };

    loadData();
  }, [tenant]);

  // Carregar horários disponíveis quando a data e barbeiro forem selecionados
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (selectedDate && tenant?.barbershop?.id) {
        try {
          let slots;
          if (selectedBarber) {
            // Usar horários específicos do barbeiro
            slots = await generateTimeSlotsForBarber(selectedDate, tenant.barbershop.id, selectedBarber);
          } else {
            // Usar horários gerais
            slots = await generateTimeSlotsFor(selectedDate, tenant.barbershop.id);
          }
          setTimes(slots);
        } catch (error) {
          console.error('Erro ao carregar horários:', error);
        }
      }
    };
    
    loadTimeSlots();
  }, [selectedDate, selectedBarber, tenant]);

  // Verificar horários ocupados quando barbeiro e data forem selecionados
  useEffect(() => {
    const checkTakenTimes = async () => {
      if (selectedDate && selectedBarber && tenant?.barbershop?.id) {
        const taken = new Set<string>();
        for (const time of times) {
          try {
            const isTaken = await isTimeTaken(tenant.barbershop.id, selectedDate, time, selectedBarber);
            if (isTaken) {
              taken.add(time);
            }
          } catch (error) {
            console.error('Erro ao verificar horário:', error);
          }
        }
        setTakenTimes(taken);
      } else {
        setTakenTimes(new Set());
      }
    };
    
    checkTakenTimes();
  }, [selectedDate, selectedBarber, times, tenant]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setTimeout(() => setStep(2), 300);
  };

  const handleBarberSelect = (barberId: string) => {
    if (!selectedService) {
      toast.error('Escolha primeiro um serviço.');
      setStep(1);
      return;
    }
    setSelectedBarber(barberId);
    setTimeout(() => setStep(3), 300);
  };

  const handleConfirm = async () => {
    // Mark fields as touched to show validation errors
    setFieldTouched('name');
    setFieldTouched('phone');
    
    // Validate form
    if (!isFormValid({ name, phone })) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Selecione data e horário');
      return;
    }

    if (!tenant?.barbershop?.id) {
      toast.error('Erro: Barbearia não encontrada');
      return;
    }

    try {
      const booking = {
        date: formatLocalDateKey(selectedDate),
        time: selectedTime,
        service_id: selectedService,
        barber_id: selectedBarber,
        client_name: name,
        client_phone: normalizePhoneToE164BR(phone),
        status: 'pendente'
      };

      const appointment = await addAppointment(tenant.barbershop.id, booking);
      
      // Buscar informações do serviço e barbeiro para a página de agradecimento
      const service = services.find(s => s.id === selectedService);
      const barber = barbers.find(b => b.id === selectedBarber);
      
      const appointmentData = {
        id: appointment.id,
        client_name: name,
        client_phone: phone,
        service_name: service?.name || 'Serviço',
        barber_name: barber?.name || 'Barbeiro',
        date: formatLocalDateKey(selectedDate),
        time: selectedTime,
        status: 'pendente'
      };
      
      toast.success('✅ Agendamento confirmado!', {
        description: 'Redirecionando para página de confirmação...',
      });

      // Fechar modal e redirecionar
      onOpenChange(false);
      
      // Reset form
      setStep(1);
      setSelectedService('');
      setSelectedBarber('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setName('');
      setPhone('');
      
      // Redirecionar para página de agradecimento
      navigate('/obrigado', { state: { appointment: appointmentData } });
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao confirmar agendamento. Tente novamente.');
    }
  };

  const progress = (step / 4) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {step === 1 && 'Escolha o Serviço'}
            {step === 2 && 'Escolha o Barbeiro'}
            {step === 3 && 'Data e Horário'}
            {step === 4 && 'Suas Informações'}
          </DialogTitle>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full mt-4">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="group relative overflow-hidden rounded-lg hover-lift"
                >
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90" />
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{service.icon}</div>
                    <h3 className="text-base sm:text-lg font-bold">{service.name}</h3>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Barber Selection */}
          {step === 2 && (
            <div className="space-y-4">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => handleBarberSelect(barber.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all hover-lift text-left ${
                    selectedBarber === barber.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-xl sm:text-2xl">
                      👨‍🦰
                    </div>
                    <div className="font-semibold text-base sm:text-lg">{barber.name}</div>
                  </div>
                </button>
              ))}
              
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Escolha a Data</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border mx-auto"
                />
              </div>

              <div>
                <Label className="mb-2 block">Escolha o Horário</Label>
                <div className="grid grid-cols-4 gap-2">
                  {times.map((time) => {
                    const isTaken = takenTimes.has(time);
                    const isSelected = selectedTime === time;
                    
                    return (
                      <Button
                        key={time}
                        type="button"
                        variant={isSelected ? "default" : isTaken ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => !isTaken && setSelectedTime(time)}
                        disabled={isTaken}
                        className={`h-12 text-sm ${
                          isTaken 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isSelected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-primary/10'
                        }`}
                      >
                 <div className="flex flex-col items-center">
                   <span className="font-medium">{time}</span>
                   {isTaken && (
                     <span className="text-xs opacity-75">Indisponível</span>
                   )}
                 </div>
                      </Button>
                    );
                  })}
                </div>
                {takenTimes.size > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Horários em vermelho estão indisponíveis para este barbeiro
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 w-full"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!selectedService || !selectedBarber || !selectedDate || !selectedTime}
                  className="flex-1 w-full"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Personal Info */}
          {step === 4 && (
            <div className="space-y-6">
              <ValidatedInput
                label="Nome Completo"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  handleChange('name', e.target.value);
                }}
                onBlur={(e) => handleBlur('name', e.target.value)}
                placeholder="Seu nome"
                error={errors.name}
                isValid={isFieldValid('name')}
                isInvalid={isFieldInvalid('name')}
                touched={touched.name}
                required
              />

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    handleChange('phone', e.target.value);
                  }}
                >
                  {/* @ts-ignore */}
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      id="phone"
                      placeholder="(11) 99999-9999"
                      className={`mt-2 transition-all duration-200 ${
                        touched.phone && isFieldInvalid('phone') 
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
                          : touched.phone && isFieldValid('phone')
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                          : ''
                      }`}
                      onBlur={(e) => handleBlur('phone', e.target.value)}
                    />
                  )}
                </InputMask>
                {touched.phone && errors.phone && (
                  <p className="text-sm text-destructive mt-1 animate-slide-up">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Resumo do Agendamento:</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Serviço:</strong> {services.find(s => s.id === selectedService)?.name}</p>
                  <p><strong>Barbeiro:</strong> {barbers.find(b => b.id === selectedBarber)?.name}</p>
                  <p><strong>Data:</strong> {selectedDate?.toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1 w-full"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!name || !phone}
                  className="flex-1 w-full bg-primary"
                >
                  Confirmar Agendamento
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
