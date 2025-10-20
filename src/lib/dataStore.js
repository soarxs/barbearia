// Supabase-backed data store for multi-tenant SaaS

import { supabase } from './supabase.js';
import { mockServices, mockBarbers, mockAppointments, mockSchedule } from './mockData.js';
import { 
  getAdminServices, addAdminService, updateAdminService, deleteAdminService,
  getAdminBarbers, addAdminBarber, updateAdminBarber, deleteAdminBarber,
  getAdminSchedule, setAdminSchedule
} from './adminState.js';

export function formatLocalDateKey(date) {
  if (!date) {
    console.warn('formatLocalDateKey: date is null or undefined');
    return null;
  }
  
  const d = new Date(date);
  
  // Verificar se a data é válida
  if (isNaN(d.getTime())) {
    console.warn('formatLocalDateKey: invalid date provided:', date);
    return null;
  }
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function normalizePhoneToE164BR(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('11')) {
    return `+55${digits}`;
  }
  if (digits.length === 10) {
    return `+5511${digits}`;
  }
  return `+55${digits}`;
}

// Funções de agendamentos com Supabase
export async function getAppointments(barbershopId) {
  try {
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services(name, price),
        barbers(name)
      `)
      .eq('barbershop_id', actualBarbershopId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }
}

export async function addAppointment(barbershopId, appointment) {
  try {
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const appointmentData = {
      barbershop_id: actualBarbershopId,
      date: appointment.date,
      time: appointment.time,
      service_id: appointment.service_id,
      barber_id: appointment.barber_id,
      client_name: appointment.client_name,
      client_phone: normalizePhoneToE164BR(appointment.client_phone),
      status: appointment.status || 'pendente',
      notes: appointment.notes
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
}

export async function removeAppointment(id) {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao remover agendamento:', error);
    throw error;
  }
}

export async function updateAppointment(id, updates) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    throw error;
  }
}

export async function isTimeTaken(date, time, barberId, barbershopId) {
  try {
    // Validar parâmetros
    if (!date || !time || !barberId || !barbershopId) {
      console.warn('isTimeTaken: missing required parameters', { date, time, barberId, barbershopId });
      return false;
    }
    
    const formattedDate = formatLocalDateKey(date);
    if (!formattedDate) {
      console.warn('isTimeTaken: invalid date format', date);
      return false;
    }
    
    // Validar se barberId não é um UUID de barbershop (erro comum)
    if (barberId === barbershopId) {
      console.warn('isTimeTaken: barberId is same as barbershopId, skipping query', { barberId, barbershopId });
      return false;
    }
    
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('barbershop_id', actualBarbershopId)
      .eq('date', formattedDate)
      .eq('time', time)
      .eq('barber_id', barberId)
      .eq('status', 'confirmado')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('isTimeTaken: Supabase error', error);
      return false;
    }
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar horário ocupado:', error);
    return false;
  }
}

// Optional remote sync hooks (Vercel KV / Supabase) can be implemented here
// export async function syncToRemote() { /* ... */ }

// Funções de serviços com Supabase
export async function getServices(barbershopId) {
  try {
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', actualBarbershopId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }
}

export async function addService(barbershopId, service) {
  try {
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const { data, error } = await supabase
      .from('services')
      .insert([{ ...service, barbershop_id: actualBarbershopId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    throw error;
  }
}

export async function updateService(id, updates) {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw error;
  }
}

export async function deleteService(id) {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao remover serviço:', error);
    throw error;
  }
}

// Funções de barbeiros com Supabase
export async function getBarbers(barbershopId) {
  try {
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('barbershop_id', actualBarbershopId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    return [];
  }
}

export async function addBarber(barbershopId, barber) {
  try {
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const { data, error } = await supabase
      .from('barbers')
      .insert([{ ...barber, barbershop_id: actualBarbershopId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar barbeiro:', error);
    throw error;
  }
}

export async function updateBarber(id, updates) {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar barbeiro:', error);
    throw error;
  }
}

export async function deleteBarber(id) {
  try {
    const { error } = await supabase
      .from('barbers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao remover barbeiro:', error);
    throw error;
  }
}

// Schedule configuration - agora usando Supabase
export async function getSchedule(barbershopId) {
  const def = {
    workingDays: [1,2,3,4,5,6], // 1=Mon..6=Sat
    open: '08:00',
    close: '20:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    stepMinutes: 30,
  };
  
  try {
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('barbershop_id', actualBarbershopId)
      .eq('key', 'schedule')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? { ...def, ...data.value } : def;
  } catch (error) {
    console.error('Erro ao buscar configuração de horários:', error);
    return def;
  }
}

export async function setSchedule(barbershopId, cfg) {
  try {
    // Usar o barbershopId diretamente (já vem correto do useTenant)
    const actualBarbershopId = barbershopId;
    
    const { error } = await supabase
      .from('settings')
      .upsert({
        barbershop_id: actualBarbershopId,
        key: 'schedule',
        value: cfg
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar configuração de horários:', error);
    throw error;
  }
}

export async function generateTimeSlotsFor(date, barbershopId, barberId = null) {
  const cfg = await getSchedule(barbershopId);
  const times = [];
  const [openH, openM] = cfg.open.split(':').map(Number);
  const [closeH, closeM] = cfg.close.split(':').map(Number);
  const [lunchStartH, lunchStartM] = cfg.lunchStart.split(':').map(Number);
  const [lunchEndH, lunchEndM] = cfg.lunchEnd.split(':').map(Number);
  
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  const lunchStartMin = lunchStartH * 60 + lunchStartM;
  const lunchEndMin = lunchEndH * 60 + lunchEndM;
  
  // Se for hoje, pegar hora atual
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const currentMin = isToday ? (today.getHours() * 60 + today.getMinutes()) : 0;
  
  const stepMinutes = cfg.stepMinutes || 60; // Usar stepMinutes do config, padrão 60 (1 hora)
  for (let min = openMin; min < closeMin; min += stepMinutes) {
    if (min >= lunchStartMin && min < lunchEndMin) continue;
    
    // Se for hoje, pular horários que já passaram
    if (isToday && min <= currentMin) continue;
    
    const h = Math.floor(min / 60);
    const m = min % 60;
    times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return times;
}

// Gerar horários específicos para um barbeiro
export async function generateTimeSlotsForBarber(date, barbershopId, barberId) {
  try {
    // Buscar horários específicos do barbeiro
    const { data: barberSchedule, error } = await supabase
      .from('barber_schedules')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .eq('barber_id', barberId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar horários do barbeiro:', error);
      // Fallback para horários gerais
      return await generateTimeSlotsFor(date, barbershopId);
    }
    
    if (!barberSchedule) {
      // Se não tem horários específicos, usar horários gerais
      return await generateTimeSlotsFor(date, barbershopId);
    }
    
    const dayOfWeek = date.getDay();
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    
    if (!barberSchedule[dayKey] || !barberSchedule[dayKey].isWorking) {
      return [];
    }
    
    const { startTime, endTime, lunchStart, lunchEnd, stepMinutes = 60 } = barberSchedule[dayKey];
    const times = [];
    
    // Converter horários para minutos
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const [lunchStartH, lunchStartM] = lunchStart.split(':').map(Number);
    const [lunchEndH, lunchEndM] = lunchEnd.split(':').map(Number);
    
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const lunchStartMin = lunchStartH * 60 + lunchStartM;
    const lunchEndMin = lunchEndH * 60 + lunchEndM;
    
    // Se for hoje, pegar hora atual
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const currentMin = isToday ? (today.getHours() * 60 + today.getMinutes()) : 0;
    
    for (let min = startMin; min < endMin; min += stepMinutes) {
      if (min >= lunchStartMin && min < lunchEndMin) continue;
      
      // Se for hoje, pular horários que já passaram
      if (isToday && min <= currentMin) continue;
      
      const h = Math.floor(min / 60);
      const m = min % 60;
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    
    return times;
  } catch (error) {
    console.error('Erro ao gerar horários do barbeiro:', error);
    // Fallback para horários gerais
    return await generateTimeSlotsFor(date, barbershopId);
  }
}

export async function isWorkingDay(date, barbershopId) {
  const cfg = await getSchedule(barbershopId);
  const day = date.getDay();
  return cfg.workingDays.includes(day);
}

// Funções CRUD para horários dos barbeiros
export async function getBarberSchedule(barbershopId, barberId) {
  try {
    const { data, error } = await supabase
      .from('barber_schedules')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .eq('barber_id', barberId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar horários do barbeiro:', error);
    return null;
  }
}

export async function setBarberSchedule(barbershopId, barberId, schedule) {
  try {
    const { data, error } = await supabase
      .from('barber_schedules')
      .upsert([{
        barbershop_id: barbershopId,
        barber_id: barberId,
        ...schedule
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao salvar horários do barbeiro:', error);
    throw error;
  }
}

export async function getAllBarberSchedules(barbershopId) {
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
}