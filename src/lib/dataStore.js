// Supabase-backed data store - OPTIMIZED VERSION
import { supabase } from './supabase.js';
import { mockServices, mockBarbers, mockAppointments, mockSchedule } from './mockData.js';
import { 
  getAdminServices, addAdminService, updateAdminService, deleteAdminService,
  getAdminBarbers, addAdminBarber, updateAdminBarber, deleteAdminBarber,
  getAdminSchedule, setAdminSchedule
} from './adminState.js';

// Utility functions
const formatLocalDateKey = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('formatLocalDateKey: data inválida fornecida', date);
    return null;
  }
  return date.toISOString().split('T')[0];
};

const normalizePhoneToE164BR = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('55') ? `+${cleaned}` : `+55${cleaned}`;
};

// Generic CRUD operations
const createCRUD = (table, idField = 'id') => ({
  async getAll(barbershopId) {
    console.log(`🔍 getAll ${table}:`, { barbershopId, host: window?.location?.host });
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('barbershop_id', barbershopId);
      if (error) throw error;
      console.log(`✅ ${table} encontrados:`, data?.length || 0);
      return data || [];
    } catch (error) {
      console.error(`❌ Erro ao buscar ${table}:`, error);
      return [];
    }
  },
  
  async getById(id, barbershopId) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(idField, id)
        .eq('barbershop_id', barbershopId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error(`Erro ao buscar ${table} por ID:`, error);
      return null;
    }
  },
  
  async create(item, barbershopId) {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert([{ ...item, barbershop_id: barbershopId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erro ao criar ${table}:`, error);
      throw error;
    }
  },
  
  async update(id, updates, barbershopId) {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq(idField, id)
        .eq('barbershop_id', barbershopId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erro ao atualizar ${table}:`, error);
      throw error;
    }
  },
  
  async delete(id, barbershopId) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idField, id)
        .eq('barbershop_id', barbershopId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao deletar ${table}:`, error);
      throw error;
    }
  }
});

// Initialize CRUD operations
const servicesCRUD = createCRUD('services');
const barbersCRUD = createCRUD('barbers');
const appointmentsCRUD = createCRUD('appointments');

// Main functions using CRUD
export const getServices = (barbershopId) => servicesCRUD.getAll(barbershopId);
export const getBarbers = (barbershopId) => barbersCRUD.getAll(barbershopId);
export const getAppointments = (barbershopId) => appointmentsCRUD.getAll(barbershopId);

export const addService = (service, barbershopId) => servicesCRUD.create(service, barbershopId);
export const updateService = (id, service, barbershopId) => servicesCRUD.update(id, service, barbershopId);
export const deleteService = (id, barbershopId) => servicesCRUD.delete(id, barbershopId);

export const addBarber = async (barber, barbershopId) => {
  const newBarber = await barbersCRUD.create(barber, barbershopId);
  
  // Criar horários padrão para o novo barbeiro
  if (newBarber) {
    try {
      await setBarberSchedule(barbershopId, newBarber.id, {
        monday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
        tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
        wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
        thursday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
        friday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
        saturday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
        sunday: { isWorking: false, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 }
      });
    } catch (error) {
      console.warn('Erro ao criar horários padrão para o barbeiro:', error);
    }
  }
  
  return newBarber;
};

export const updateBarber = (id, barber, barbershopId) => barbersCRUD.update(id, barber, barbershopId);

export const deleteBarber = async (id, barbershopId) => {
  // Remover horários do barbeiro antes de deletar
  try {
    await supabase
      .from('barber_schedules')
      .delete()
      .eq('barbershop_id', barbershopId)
      .eq('barber_id', id);
  } catch (error) {
    console.warn('Erro ao remover horários do barbeiro:', error);
  }
  
  return barbersCRUD.delete(id, barbershopId);
};

export const addAppointment = async (appointment, barbershopId) => {
  const appointmentData = {
    date: appointment.date,
    time: appointment.time,
    service_id: appointment.service_id,
    barber_id: appointment.barber_id,
    client_name: appointment.client_name,
    client_phone: normalizePhoneToE164BR(appointment.client_phone),
    status: appointment.status || 'pendente',
    notes: appointment.notes || ''
  };
  return appointmentsCRUD.create(appointmentData, barbershopId);
};

export const updateAppointment = (id, appointment, barbershopId) => {
  const appointmentData = {
    ...appointment,
    client_phone: normalizePhoneToE164BR(appointment.client_phone)
  };
  return appointmentsCRUD.update(id, appointmentData, barbershopId);
};

export const removeAppointment = (id, barbershopId) => appointmentsCRUD.delete(id, barbershopId);

// Time slot generation - consolidated
const generateTimeSlots = async (date, barbershopId, barberId = null) => {
  try {
    let schedule = null;
    
    // Tentar buscar horários específicos do barbeiro primeiro
    if (barberId) {
      schedule = await getBarberSchedule(barbershopId, barberId);
    }
    
    // Se não encontrou horários específicos, usar horários gerais
    if (!schedule) {
      schedule = await getSchedule(barbershopId);
    }
    
    if (!schedule) return [];
    
    const dayOfWeek = date.getDay();
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    
    if (!schedule[dayKey]?.isWorking) return [];
    
    const { startTime, endTime, lunchStart, lunchEnd, stepMinutes = 60 } = schedule[dayKey];
    const times = [];
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const [lunchStartH, lunchStartM] = lunchStart.split(':').map(Number);
    const [lunchEndH, lunchEndM] = lunchEnd.split(':').map(Number);
    
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const lunchStartMin = lunchStartH * 60 + lunchStartM;
    const lunchEndMin = lunchEndH * 60 + lunchEndM;
    
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const currentMin = isToday ? (today.getHours() * 60 + today.getMinutes()) : 0;
    
    for (let min = startMin; min < endMin; min += stepMinutes) {
      if (min >= lunchStartMin && min < lunchEndMin) continue;
      if (isToday && min <= currentMin) continue;
      
      const hours = Math.floor(min / 60);
      const minutes = min % 60;
      times.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    
    return times;
  } catch (error) {
    console.error('Erro ao gerar horários:', error);
    return [];
  }
};

export const generateTimeSlotsFor = (date, barbershopId) => generateTimeSlots(date, barbershopId);
export const generateTimeSlotsForBarber = (date, barbershopId, barberId) => generateTimeSlots(date, barbershopId, barberId);

// Schedule management
export const getSchedule = async (barbershopId) => {
  const def = {
    workingDays: [1,2,3,4,5,6],
    open: '08:00',
    close: '20:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    stepMinutes: 30,
  };
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('barbershop_id', barbershopId)
      .eq('key', 'schedule')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? { ...def, ...data.value } : def;
  } catch (error) {
    console.error('Erro ao buscar configuração de horários:', error);
    return def;
  }
};

export const setSchedule = async (barbershopId, cfg) => {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert([{
        barbershop_id: barbershopId,
        key: 'schedule',
        value: cfg
      }]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao salvar configuração de horários:', error);
    throw error;
  }
};

// Barber schedule management
export const getBarberSchedule = async (barbershopId, barberId) => {
  try {
    if (!barbershopId || !barberId) {
      console.warn('getBarberSchedule: parâmetros inválidos', { barbershopId, barberId });
      return null;
    }

    const { data, error } = await supabase
      .from('barber_schedules')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .eq('barber_id', barberId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.warn('getBarberSchedule: erro ao buscar horários do barbeiro:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('getBarberSchedule: erro ao buscar horários do barbeiro:', error);
    return null;
  }
};

export const setBarberSchedule = async (barbershopId, barberId, schedule) => {
  try {
    const { error } = await supabase
      .from('barber_schedules')
      .upsert([{
        barbershop_id: barbershopId,
        barber_id: barberId,
        ...schedule
      }]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao salvar horários do barbeiro:', error);
    throw error;
  }
};

export const getAllBarberSchedules = async (barbershopId) => {
  try {
    if (!barbershopId) {
      console.warn('getAllBarberSchedules: barbershopId não fornecido');
      return [];
    }

    const { data, error } = await supabase
      .from('barber_schedules')
      .select('*')
      .eq('barbershop_id', barbershopId);

    if (error) {
      console.error('Erro ao buscar horários dos barbeiros:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar horários dos barbeiros:', error);
    return [];
  }
};

// Função para garantir que todos os barbeiros tenham horários
export const ensureBarberSchedules = async (barbershopId) => {
  try {
    const barbers = await getBarbers(barbershopId);
    const schedules = await getAllBarberSchedules(barbershopId);
    
    const barberIds = barbers.map(b => b.id);
    const scheduleBarberIds = schedules.map(s => s.barber_id);
    
    // Encontrar barbeiros sem horários
    const barbersWithoutSchedules = barberIds.filter(id => !scheduleBarberIds.includes(id));
    
    // Criar horários padrão para barbeiros sem horários
    for (const barberId of barbersWithoutSchedules) {
      try {
        await setBarberSchedule(barbershopId, barberId, {
          monday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
          tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
          wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
          thursday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
          friday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
          saturday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
          sunday: { isWorking: false, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 }
        });
        console.log(`Horários padrão criados para barbeiro ${barberId}`);
      } catch (error) {
        console.error(`Erro ao criar horários para barbeiro ${barberId}:`, error);
      }
    }
    
    return barbersWithoutSchedules.length;
  } catch (error) {
    console.error('Erro ao garantir horários dos barbeiros:', error);
    return 0;
  }
};

// Time availability check
export const isTimeTaken = async (date, time, barberId, barbershopId) => {
  try {
    if (!barberId || !barbershopId || barberId === barbershopId) {
      console.warn('isTimeTaken: parâmetros inválidos', { barberId, barbershopId });
      return false;
    }

    const formattedDate = formatLocalDateKey(date);
    if (!formattedDate) return false;

    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('barbershop_id', barbershopId)
      .eq('date', formattedDate)
      .eq('time', time)
      .eq('barber_id', barberId)
      .eq('status', 'confirmado')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar horário ocupado:', error);
    return false;
  }
};

// Export utilities
export { formatLocalDateKey, normalizePhoneToE164BR };
