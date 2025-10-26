import { supabase } from '@/lib/supabase.js';

// Serviço unificado para conectar admin e usuário
export const unifiedBookingService = {
  // Buscar barbeiros ativos (para admin e usuário)
  async getActiveBarbers() {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
      return [];
    }
  },

  // Buscar serviços ativos (para admin e usuário)
  async getActiveServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  },

  // Buscar agendamentos (unificado para admin e usuário)
  async getAppointments(filters = {}) {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      // Aplicar filtros
      if (filters.date) {
        query = query.eq('date', filters.date);
      }
      if (filters.barber) {
        query = query.eq('barber', filters.barber);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.barbershop_id) {
        query = query.eq('barbershop_id', filters.barbershop_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Converter status antigos para novos
      const convertedData = data?.map(apt => ({
        ...apt,
        status: this.convertStatus(apt.status)
      })) || [];

      return convertedData;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
  },

  // Converter status antigos para novos (sistema simplificado)
  convertStatus(oldStatus) {
    switch (oldStatus) {
      case 'pending':
      case 'confirmed':
        return 'agendado';
      case 'completed':
        return 'concluido';
      case 'cancelled':
        return 'agendado'; // Cancelados voltam para agendado
      default:
        return 'agendado';
    }
  },

  // Criar agendamento (unificado)
  async createAppointment(appointmentData) {
    try {
      // Verificar se o horário está disponível
      const isAvailable = await this.isSlotAvailable(
        appointmentData.date,
        appointmentData.time,
        appointmentData.barber
      );

      if (!isAvailable) {
        throw new Error('Horário não disponível');
      }

      // Criar agendamento
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          client_name: appointmentData.client_name,
          client_phone: appointmentData.client_phone,
          client_email: appointmentData.client_email || null,
          service: appointmentData.service,
          barber: appointmentData.barber,
          date: appointmentData.date,
          time: appointmentData.time,
          status: 'agendado', // Sempre começa como agendado
          notes: appointmentData.notes || null,
          barbershop_id: appointmentData.barbershop_id || null
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  // Verificar disponibilidade de horário
  async isSlotAvailable(date, time, barber) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('date', date)
        .eq('time', time)
        .eq('barber', barber)
        .eq('status', 'agendado'); // Apenas agendados ocupam horário

      if (error) throw error;
      return !data || data.length === 0;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  },

  // Atualizar status do agendamento
  async updateAppointmentStatus(appointmentId, newStatus) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  // Deletar agendamento
  async deleteAppointment(appointmentId) {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      throw error;
    }
  },

  // Buscar horários disponíveis para um barbeiro em uma data
  async getAvailableTimeSlots(date, barber) {
    try {
      const workingHours = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
      ];

      // Verificar se é hoje para aplicar margem de 5 minutos
      const today = new Date().toISOString().split('T')[0];
      const isToday = date === today;
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Buscar agendamentos existentes
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', date)
        .eq('barber', barber)
        .eq('status', 'agendado');

      const takenTimes = new Set(existingAppointments?.map(apt => apt.time) || []);
      
      // Filtrar horários disponíveis
      let availableSlots = workingHours.filter(time => !takenTimes.has(time));
      
      // Se for hoje, filtrar horários passados (com margem de 5 minutos)
      if (isToday) {
        availableSlots = availableSlots.filter(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const slotTime = hours * 60 + minutes;
          const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
          const currentSlotTime = currentHours * 60 + currentMinutes;
          
          // Margem de 5 minutos
          return slotTime > (currentSlotTime + 5);
        });
      }
      
      return availableSlots;
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      return [];
    }
  },

  // Sincronizar dados entre admin e usuário
  async syncData() {
    try {
      const [barbers, services, appointments] = await Promise.all([
        this.getActiveBarbers(),
        this.getActiveServices(),
        this.getAppointments()
      ]);

      return {
        barbers,
        services,
        appointments,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      return {
        barbers: [],
        services: [],
        appointments: [],
        lastSync: null
      };
    }
  }
};

export default unifiedBookingService;
