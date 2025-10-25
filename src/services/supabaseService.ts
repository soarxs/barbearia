import { supabase } from '@/lib/supabase.js';

// Tipos de dados
export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  active: boolean;
  created_at: string;
}

export interface Barber {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialties: string[];
  active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  total_appointments: number;
  last_appointment?: string;
  created_at: string;
}

// Serviços de Agendamentos
export const appointmentService = {
  // Buscar todos os agendamentos
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Buscar agendamentos por data
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', date)
      .order('time', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Buscar agendamentos de hoje
  async getToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDate(today);
  },

  // Criar novo agendamento
  async create(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Atualizar agendamento
  async update(id: string, updates: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Deletar agendamento
  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Buscar agendamentos recentes
  async getRecent(limit: number = 5) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

// Serviços de Clientes
export const clientService = {
  // Buscar todos os clientes únicos
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('client_name, client_phone, client_email, date')
      .not('client_name', 'is', null)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Processar para criar lista de clientes únicos
    const clientMap = new Map<string, Client>();
    
    data?.forEach(apt => {
      const key = apt.client_phone;
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          id: key,
          name: apt.client_name,
          phone: apt.client_phone,
          email: apt.client_email,
          total_appointments: 0,
          last_appointment: apt.date,
          created_at: apt.date
        });
      }
      
      const client = clientMap.get(key)!;
      client.total_appointments++;
      if (apt.date > client.last_appointment!) {
        client.last_appointment = apt.date;
      }
    });
    
    return Array.from(clientMap.values());
  },

  // Buscar cliente por telefone
  async getByPhone(phone: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_phone', phone)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Serviços de Serviços
export const serviceService = {
  // Buscar todos os serviços
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar serviços:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro no serviceService.getAll:', error);
      throw error;
    }
  },

  // Criar novo serviço
  async create(service: Omit<Service, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select();
      
      if (error) {
        console.error('Erro ao criar serviço:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Erro no serviceService.create:', error);
      throw error;
    }
  },

  // Atualizar serviço
  async update(id: string, updates: Partial<Service>) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erro ao atualizar serviço:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Erro no serviceService.update:', error);
      throw error;
    }
  },

  // Deletar serviço
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar serviço:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no serviceService.delete:', error);
      throw error;
    }
  }
};

// Serviços de Barbeiros
export const barberService = {
  // Buscar todos os barbeiros
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar barbeiros:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro no barberService.getAll:', error);
      throw error;
    }
  },

  // Criar novo barbeiro
  async create(barber: Omit<Barber, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .insert([barber])
        .select();
      
      if (error) {
        console.error('Erro ao criar barbeiro:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Erro no barberService.create:', error);
      throw error;
    }
  },

  // Atualizar barbeiro
  async update(id: string, updates: Partial<Barber>) {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erro ao atualizar barbeiro:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Erro no barberService.update:', error);
      throw error;
    }
  },

  // Deletar barbeiro
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao deletar barbeiro:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no barberService.delete:', error);
      throw error;
    }
  }
};

// Estatísticas
export const statsService = {
  // Buscar estatísticas gerais
  async getStats() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Agendamentos de hoje
    const { data: todayAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', today);
    
    // Todos os agendamentos
    const { data: allAppointments } = await supabase
      .from('appointments')
      .select('*');
    
    // Clientes únicos
    const { data: clients } = await supabase
      .from('appointments')
      .select('client_phone')
      .not('client_phone', 'is', null);
    
    const uniqueClients = new Set(clients?.map(c => c.client_phone) || []).size;
    
    // Receita mensal
    const monthlyAppointments = allAppointments?.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    }) || [];
    
    const servicePrices: { [key: string]: number } = {
      'Corte': 25, 'Barba': 15, 'Corte + Barba': 35, 'Sobrancelha': 10, 'Pigmentação': 50
    };
    
    const monthlyRevenue = monthlyAppointments.reduce((total, apt) => {
      const price = servicePrices[apt.service] || 25;
      return total + (apt.status === 'confirmed' ? price : 0);
    }, 0);
    
    return {
      totalClients: uniqueClients,
      todayAppointments: todayAppointments?.length || 0,
      monthlyRevenue,
      totalAppointments: allAppointments?.length || 0
    };
  }
};
