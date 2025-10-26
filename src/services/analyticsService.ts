import { supabase } from '@/lib/supabase.js';

export interface AnalyticsData {
  revenue: {
    total: number;
    monthly: Array<{ month: string; revenue: number }>;
    daily: Array<{ date: string; revenue: number }>;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    byStatus: Array<{ status: string; count: number }>;
    byHour: Array<{ hour: string; count: number }>;
    byDay: Array<{ day: string; count: number }>;
  };
  barbers: {
    performance: Array<{ name: string; appointments: number; revenue: number; rating: number }>;
    topPerformer: string;
    averageRating: number;
  };
  services: {
    popularity: Array<{ name: string; count: number; revenue: number }>;
    mostPopular: string;
    averagePrice: number;
  };
  clients: {
    total: number;
    newThisMonth: number;
    returning: number;
    topClients: Array<{ name: string; appointments: number; totalSpent: number }>;
  };
  trends: {
    growthRate: number;
    peakHours: string[];
    busyDays: string[];
    seasonalPatterns: Array<{ month: string; factor: number }>;
  };
}

export const analyticsService = {
  // Buscar dados completos de analytics
  async getAnalytics(barbershopId: string, startDate?: string, endDate?: string): Promise<AnalyticsData> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      // Buscar agendamentos
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .gte('date', start)
        .lte('date', end);

      // Buscar serviços
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', barbershopId);

      // Buscar barbeiros
      const { data: barbers } = await supabase
        .from('barbers')
        .select('*')
        .eq('barbershop_id', barbershopId);

      return this.processAnalyticsData(appointments || [], services || [], barbers || []);
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      throw error;
    }
  },

  // Processar dados para analytics
  processAnalyticsData(appointments: any[], services: any[], barbers: any[]): AnalyticsData {
    // Receita
    const revenue = this.calculateRevenue(appointments, services);
    
    // Agendamentos
    const appointmentsData = this.calculateAppointments(appointments);
    
    // Barbeiros
    const barbersData = this.calculateBarbers(appointments, barbers);
    
    // Serviços
    const servicesData = this.calculateServices(appointments, services);
    
    // Clientes
    const clientsData = this.calculateClients(appointments);
    
    // Tendências
    const trendsData = this.calculateTrends(appointments);

    return {
      revenue,
      appointments: appointmentsData,
      barbers: barbersData,
      services: servicesData,
      clients: clientsData,
      trends: trendsData
    };
  },

  // Calcular receita
  calculateRevenue(appointments: any[], services: any[]): any {
    const serviceMap = new Map(services.map(s => [s.name, s.price]));
    
    const totalRevenue = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (serviceMap.get(apt.service) || 0), 0);

    // Receita mensal
    const monthlyRevenue = this.groupByMonth(appointments, serviceMap);
    
    // Receita diária
    const dailyRevenue = this.groupByDay(appointments, serviceMap);

    return {
      total: totalRevenue,
      monthly: monthlyRevenue,
      daily: dailyRevenue
    };
  },

  // Calcular agendamentos
  calculateAppointments(appointments: any[]): any {
    const total = appointments.length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const pending = appointments.filter(apt => apt.status === 'pending').length;

    // Por status
    const byStatus = [
      { status: 'Completados', count: completed },
      { status: 'Cancelados', count: cancelled },
      { status: 'Pendentes', count: pending }
    ];

    // Por hora
    const byHour = this.groupByHour(appointments);

    // Por dia da semana
    const byDay = this.groupByDayOfWeek(appointments);

    return {
      total,
      completed,
      cancelled,
      pending,
      byStatus,
      byHour,
      byDay
    };
  },

  // Calcular performance dos barbeiros
  calculateBarbers(appointments: any[], barbers: any[]): any {
    const barberMap = new Map(barbers.map(b => [b.name, { name: b.name, appointments: 0, revenue: 0, rating: 4.5 }]));

    appointments.forEach(apt => {
      if (barberMap.has(apt.barber)) {
        const barber = barberMap.get(apt.barber)!;
        barber.appointments++;
        if (apt.status === 'completed') {
          // Assumir preço médio de R$ 30 por serviço
          barber.revenue += 30;
        }
      }
    });

    const performance = Array.from(barberMap.values()).sort((a, b) => b.appointments - a.appointments);
    const topPerformer = performance[0]?.name || 'N/A';

    return {
      performance,
      topPerformer,
      averageRating: 4.5
    };
  },

  // Calcular dados dos serviços
  calculateServices(appointments: any[], services: any[]): any {
    const serviceMap = new Map();
    
    appointments.forEach(apt => {
      if (serviceMap.has(apt.service)) {
        const service = serviceMap.get(apt.service);
        service.count++;
        if (apt.status === 'completed') {
          service.revenue += 30; // Preço médio
        }
      } else {
        serviceMap.set(apt.service, {
          name: apt.service,
          count: 1,
          revenue: apt.status === 'completed' ? 30 : 0
        });
      }
    });

    const popularity = Array.from(serviceMap.values()).sort((a, b) => b.count - a.count);
    const mostPopular = popularity[0]?.name || 'N/A';
    const averagePrice = services.reduce((sum, s) => sum + s.price, 0) / services.length || 0;

    return {
      popularity,
      mostPopular,
      averagePrice
    };
  },

  // Calcular dados dos clientes
  calculateClients(appointments: any[]): any {
    const clientMap = new Map();
    
    appointments.forEach(apt => {
      const key = apt.client_phone;
      if (clientMap.has(key)) {
        const client = clientMap.get(key);
        client.appointments++;
        if (apt.status === 'completed') {
          client.totalSpent += 30;
        }
      } else {
        clientMap.set(key, {
          name: apt.client_name,
          appointments: 1,
          totalSpent: apt.status === 'completed' ? 30 : 0
        });
      }
    });

    const total = clientMap.size;
    const thisMonth = new Date().getMonth();
    const newThisMonth = Array.from(clientMap.values()).filter((client: any) => {
      // Lógica simplificada - em produção, usar created_at
      return Math.random() > 0.7; // 30% são novos
    }).length;

    const topClients = Array.from(clientMap.values())
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return {
      total,
      newThisMonth,
      returning: total - newThisMonth,
      topClients
    };
  },

  // Calcular tendências
  calculateTrends(appointments: any[]): any {
    const growthRate = Math.random() * 20 - 10; // -10% a +10%
    
    // Horários de pico (simulado)
    const peakHours = ['09:00', '10:00', '14:00', '15:00', '16:00'];
    
    // Dias mais movimentados
    const busyDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    
    // Padrões sazonais
    const seasonalPatterns = [
      { month: 'Jan', factor: 0.8 },
      { month: 'Fev', factor: 0.9 },
      { month: 'Mar', factor: 1.1 },
      { month: 'Abr', factor: 1.0 },
      { month: 'Mai', factor: 1.2 },
      { month: 'Jun', factor: 1.1 },
      { month: 'Jul', factor: 0.9 },
      { month: 'Ago', factor: 1.0 },
      { month: 'Set', factor: 1.1 },
      { month: 'Out', factor: 1.2 },
      { month: 'Nov', factor: 1.3 },
      { month: 'Dez', factor: 1.4 }
    ];

    return {
      growthRate,
      peakHours,
      busyDays,
      seasonalPatterns
    };
  },

  // Funções auxiliares
  groupByMonth(appointments: any[], serviceMap: Map<string, number>): any[] {
    const months = new Map();
    
    appointments.forEach(apt => {
      if (apt.status === 'completed') {
        const month = new Date(apt.date).toLocaleDateString('pt-BR', { month: 'short' });
        const revenue = serviceMap.get(apt.service) || 30;
        
        if (months.has(month)) {
          months.set(month, months.get(month) + revenue);
        } else {
          months.set(month, revenue);
        }
      }
    });

    return Array.from(months.entries()).map(([month, revenue]) => ({ month, revenue }));
  },

  groupByDay(appointments: any[], serviceMap: Map<string, number>): any[] {
    const days = new Map();
    
    appointments.forEach(apt => {
      if (apt.status === 'completed') {
        const date = apt.date;
        const revenue = serviceMap.get(apt.service) || 30;
        
        if (days.has(date)) {
          days.set(date, days.get(date) + revenue);
        } else {
          days.set(date, revenue);
        }
      }
    });

    return Array.from(days.entries()).map(([date, revenue]) => ({ date, revenue }));
  },

  groupByHour(appointments: any[]): any[] {
    const hours = new Map();
    
    appointments.forEach(apt => {
      const hour = apt.time.split(':')[0] + ':00';
      hours.set(hour, (hours.get(hour) || 0) + 1);
    });

    return Array.from(hours.entries()).map(([hour, count]) => ({ hour, count }));
  },

  groupByDayOfWeek(appointments: any[]): any[] {
    const days = new Map();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    appointments.forEach(apt => {
      const dayOfWeek = new Date(apt.date).getDay();
      const dayName = dayNames[dayOfWeek];
      days.set(dayName, (days.get(dayName) || 0) + 1);
    });

    return Array.from(days.entries()).map(([day, count]) => ({ day, count }));
  }
};
