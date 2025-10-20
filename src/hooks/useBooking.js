import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addAppointment, formatLocalDateKey, normalizePhoneToE164BR } from '@/lib/dataStore.js';
import { useTenant } from '@/hooks/useTenant.js';
import { useDataSync } from '@/hooks/useDataSync.js';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { toast } from 'sonner';
const MOCK_BARBERS = [
  { id: '1', name: 'João Silva', email: 'joao@barbertime.com', phone: '(11) 99999-9999' },
  { id: '2', name: 'Pedro Santos', email: 'pedro@barbertime.com', phone: '(11) 99999-9998' },
  { id: '3', name: 'Carlos Lima', email: 'carlos@barbertime.com', phone: '(11) 99999-9997' }
];

const MOCK_SERVICES = [
  { id: '1', title: 'Corte Masculino', price: 25, description: 'Corte moderno e estiloso' },
  { id: '2', title: 'Barba', price: 15, description: 'Aparar e modelar a barba' },
  { id: '3', title: 'Corte + Barba', price: 35, description: 'Pacote completo' }
];

const DEFAULT_TIMES = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export const useBooking = (preSelectedServiceId, enabled = true) => {
  const { data: tenant } = useTenant();
  const { barbers: syncBarbers, services: syncServices, schedules } = useDataSync(enabled ? tenant?.barbershop?.id : null);
  const navigate = useNavigate();

  // Estados do booking
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [times, setTimes] = useState(DEFAULT_TIMES);
  const [takenTimes, setTakenTimes] = useState(new Set());

  // Dados com fallback
  const barbers = syncBarbers.length > 0 ? syncBarbers : MOCK_BARBERS;
  const services = syncServices.length > 0 ? syncServices : MOCK_SERVICES;

  // Validação de formulário
  const { errors, touched, handleBlur, handleChange, setFieldTouched, isFieldValid, isFieldInvalid, isFormValid } = useFormValidation({
    name: validationRules.name,
    phone: validationRules.phone,
  });

  // Handlers
  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
    setTimeout(() => setStep(2), 300);
  };

  const handleBarberSelect = (barberId) => {
    if (!selectedService) {
      toast.error('Escolha primeiro um serviço.');
      setStep(1);
      return;
    }
    setSelectedBarber(barberId);
    setTimeout(() => setStep(3), 300);
  };

  const handleConfirm = async () => {
    setFieldTouched('name');
    setFieldTouched('phone');
    
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

      const appointment = await addAppointment(booking, tenant.barbershop.id);
      
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

      // Reset e redirecionar
      resetForm();
      navigate('/obrigado', { state: { appointment: appointmentData } });
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao confirmar agendamento. Tente novamente.');
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService('');
    setSelectedBarber('');
    setSelectedDate();
    setSelectedTime('');
    setName('');
    setPhone('');
  };

  return {
    // Estados
    step, setStep,
    selectedService, setSelectedService, selectedBarber, selectedDate, setSelectedDate, selectedTime, setSelectedTime,
    name, setName, phone, setPhone,
    times, setTimes, takenTimes, setTakenTimes,
    barbers, services,
    errors, touched, isFieldValid, isFieldInvalid,
    
    // Handlers
    handleServiceSelect, handleBarberSelect, handleConfirm,
    handleBlur, handleChange,
    
    // Utils
    resetForm
  };
};
