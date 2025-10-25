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
      // Primeiro verificar se o horário é válido (não passado)
      if (!this.isTimeValid(date, time)) {
        console.log(`❌ Horário ${time} inválido (passado)`);
        return false;
      }
      
      const serviceDuration = SERVICE_DURATIONS[service] || 30;
      
      // Buscar agendamentos existentes para o barbeiro na data
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', date)
        .eq('barber', barber);
      
      if (!existingAppointments || existingAppointments.length === 0) {
        console.log(`✅ Horário ${time} disponível (sem conflitos)`);
        return true;
      }
      
      // Verificar conflitos de horário
      const selectedTime = time;
      const selectedMinutes = this.timeToMinutes(selectedTime);
      const selectedEndMinutes = selectedMinutes + serviceDuration;
      
      for (const appointment of existingAppointments) {
        const aptTime = appointment.time;
        const aptMinutes = this.timeToMinutes(aptTime);
        const aptDuration = SERVICE_DURATIONS[service] || 30;
        const aptEndMinutes = aptMinutes + aptDuration;
        
        // Verificar sobreposição
        if ((selectedMinutes < aptEndMinutes && selectedEndMinutes > aptMinutes)) {
          console.log(`❌ Horário ${time} conflita com ${aptTime}`);
          return false;
        }
      }
      
      console.log(`✅ Horário ${time} disponível`);
      return true;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  },

  // Converter horário para minutos
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // Gerar horários disponíveis para uma data
  async getAvailableSlots(date: string, service: string, barber: string): Promise<string[]> {
    try {
      const serviceDuration = SERVICE_DURATIONS[service] || 30;
      const slots: string[] = [];
      const now = this.getCurrentDateTimeMontesClaros();
      const todayString = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const isToday = date === todayString;
      
      console.log('📅 Debug de Data:');
      console.log('Data selecionada:', date);
      console.log('Data de hoje (Montes Claros):', todayString);
      console.log('É hoje?', isToday);
      
      // Para hoje: horário atual + 1 hora de margem
      // Para outros dias: a partir das 8h
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const minHour = isToday ? currentHour + 1 : BUSINESS_CONFIG.startHour;
      
      // Debug: Log do horário atual
      console.log('🕐 Debug Agendamento (Montes Claros):');
      console.log('Data selecionada:', date);
      console.log('É hoje?', isToday);
      console.log('Horário atual (Montes Claros):', `${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
      console.log('Hora mínima permitida:', minHour);
      
      for (let hour = BUSINESS_CONFIG.startHour; hour < BUSINESS_CONFIG.endHour; hour++) {
        // Pular horário de almoço
        if (hour >= BUSINESS_CONFIG.breakStart && hour < BUSINESS_CONFIG.breakEnd) {
          continue;
        }
        
        // Pular horários passados
        if (hour < minHour) {
          console.log(`❌ Horário ${hour}:00 pulado (menor que ${minHour})`);
          continue;
        }
        
        // Se for hoje e for o horário mínimo, verificar minutos
        if (isToday && hour === minHour && currentMinute > 30) {
          console.log(`❌ Horário ${hour}:00 pulado (minutos: ${currentMinute})`);
          continue;
        }
        
        // Verificar se o slot está disponível
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        const isAvailable = await this.isSlotAvailable(date, timeSlot, service, barber);
        
        if (isAvailable) {
          console.log(`✅ Horário ${timeSlot} disponível`);
          slots.push(timeSlot);
        } else {
          console.log(`❌ Horário ${timeSlot} ocupado`);
        }
        
        // Adicionar horário de 30 minutos se couber
        if (hour < BUSINESS_CONFIG.endHour - 1) {
          const timeSlot30 = `${hour.toString().padStart(2, '0')}:30`;
          const isAvailable30 = await this.isSlotAvailable(date, timeSlot30, service, barber);
          
          if (isAvailable30) {
            console.log(`✅ Horário ${timeSlot30} disponível`);
            slots.push(timeSlot30);
          } else {
            console.log(`❌ Horário ${timeSlot30} ocupado`);
          }
        }
      }
      
      console.log('📋 Horários finais:', slots);
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

  // Obter data/hora atual em Montes Claros (UTC-3)
  getCurrentDateTimeMontesClaros(): Date {
    const now = new Date();
    // Montes Claros está no fuso UTC-3 (mesmo que Brasília)
    const montesClarosOffset = -3 * 60; // -3 horas em minutos
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const montesClarosTime = new Date(utc + (montesClarosOffset * 60000));
    return montesClarosTime;
  },

  // Verificar se a data está no futuro
  isDateValid(date: string): boolean {
    const today = this.getCurrentDateTimeMontesClaros();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('📅 Validação de Data:');
    console.log('Data selecionada:', date);
    console.log('Data de hoje (Montes Claros):', todayString);
    console.log('É válida?', date >= todayString);
    return date >= todayString;
  },

  // Verificar se o horário está no futuro (para hoje)
  isTimeValid(date: string, time: string): boolean {
    const now = this.getCurrentDateTimeMontesClaros();
    const todayString = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const isToday = date === todayString;
    
    if (!isToday) return true;
    
    const [hours, minutes] = time.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    console.log('🕐 Validação de Horário (Montes Claros):');
    console.log('Horário atual:', `${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    console.log('Horário selecionado:', time);
    
    // Se o horário selecionado já passou, não é válido
    if (hours < currentHour) {
      console.log('❌ Horário passado (hora menor)');
      return false;
    }
    if (hours === currentHour && minutes <= currentMinute) {
      console.log('❌ Horário passado (minutos menores ou iguais)');
      return false;
    }
    
    // Adicionar margem de segurança de 1 hora
    const minHour = currentHour + 1;
    if (hours < minHour) {
      console.log('❌ Horário muito próximo (menos de 1h)');
      return false;
    }
    
    console.log('✅ Horário válido');
    return true;
  }
};
