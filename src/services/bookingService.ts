import { supabase } from '@/lib/supabase.js';

// Configurações do negócio
const BUSINESS_CONFIG = {
  startHour: 8,
  endHour: 18,
  breakStart: 12,
  breakEnd: 14,
  bufferTime: 15, // minutos entre agendamentos
  minAdvanceTime: 60 // mínimo 1 hora de antecedência
};

// Duração dos serviços (em minutos)
const SERVICE_DURATIONS: { [key: string]: number } = {
  'Corte Masculino': 30,
  'Barba': 20,
  'Corte + Barba': 45,
  'Sobrancelha': 15,
  'Pigmentação': 60
};

export const bookingService = {
  // Verificar se um horário está disponível
  async isSlotAvailable(date: string, time: string, service: string, barber: string): Promise<boolean> {
    try {
      const serviceDuration = SERVICE_DURATIONS[service] || 30;
      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime.getTime() + serviceDuration * 60000);
      
      // Buscar conflitos
      const { data: conflicts } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .eq('barber', barber)
        .or(`and(time.lt.${time},time.gte.${time})`);
      
      return !conflicts || conflicts.length === 0;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  },

  // Gerar horários disponíveis para uma data
  async getAvailableSlots(date: string, service: string, barber: string): Promise<string[]> {
    try {
      const serviceDuration = SERVICE_DURATIONS[service] || 30;
      const slots: string[] = [];
      const now = new Date();
      const selectedDate = new Date(date);
      const isToday = selectedDate.toDateString() === now.toDateString();
      
      // Horário mínimo (hoje + 1 hora, outros dias a partir das 8h)
      const minHour = isToday ? now.getHours() + 1 : BUSINESS_CONFIG.startHour;
      
      for (let hour = BUSINESS_CONFIG.startHour; hour < BUSINESS_CONFIG.endHour; hour++) {
        // Pular horário de almoço
        if (hour >= BUSINESS_CONFIG.breakStart && hour < BUSINESS_CONFIG.breakEnd) {
          continue;
        }
        
        // Pular horários passados
        if (hour < minHour) {
          continue;
        }
        
        // Verificar se o slot está disponível
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        const isAvailable = await this.isSlotAvailable(date, timeSlot, service, barber);
        
        if (isAvailable) {
          slots.push(timeSlot);
        }
        
        // Adicionar horário de 30 minutos se couber
        if (hour < BUSINESS_CONFIG.endHour - 1) {
          const timeSlot30 = `${hour.toString().padStart(2, '0')}:30`;
          const isAvailable30 = await this.isSlotAvailable(date, timeSlot30, service, barber);
          
          if (isAvailable30) {
            slots.push(timeSlot30);
          }
        }
      }
      
      return slots;
    } catch (error) {
      console.error('Erro ao gerar horários:', error);
      return [];
    }
  },

  // Criar agendamento
  async createAppointment(appointmentData: {
    client_name: string;
    client_phone: string;
    client_email?: string;
    service: string;
    barber: string;
    date: string;
    time: string;
    notes?: string;
  }) {
    try {
      // Verificar disponibilidade antes de criar
      const isAvailable = await this.isSlotAvailable(
        appointmentData.date,
        appointmentData.time,
        appointmentData.service,
        appointmentData.barber
      );
      
      if (!isAvailable) {
        throw new Error('Horário não disponível');
      }
      
      // Criar agendamento
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointmentData,
          status: 'pending'
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  // Buscar agendamentos de um barbeiro em uma data
  async getBarberAppointments(date: string, barber: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .eq('barber', barber)
        .order('time');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
  },

  // Verificar se a data está no futuro
  isDateValid(date: string): boolean {
    const today = new Date();
    const selectedDate = new Date(date);
    return selectedDate >= today;
  },

  // Verificar se o horário está no futuro (para hoje)
  isTimeValid(date: string, time: string): boolean {
    const now = new Date();
    const selectedDate = new Date(date);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (!isToday) return true;
    
    const [hours, minutes] = time.split(':').map(Number);
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);
    
    // Adicionar margem de segurança
    const minTime = new Date(now.getTime() + BUSINESS_CONFIG.minAdvanceTime * 60000);
    
    return selectedTime >= minTime;
  }
};
