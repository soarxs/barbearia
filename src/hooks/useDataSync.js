import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getBarbers, getServices, getAllBarberSchedules, getAppointments, addAppointment, updateAppointment, removeAppointment, generateTimeSlotsForBarber, ensureBarberSchedules } from '@/lib/dataStore';

export function useDataSync(barbershopId) {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [barberTimeSlots, setBarberTimeSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!barbershopId) {
      setBarbers([]);
      setServices([]);
      setSchedules({});
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados em paralelo
      const [barbersData, servicesData, appointmentsData] = await Promise.all([
        getBarbers(barbershopId),
        getServices(barbershopId),
        getAppointments(barbershopId)
      ]);
      
      // Garantir que todos os barbeiros tenham horários
      await ensureBarberSchedules(barbershopId);
      
      // Carregar horários após garantir que existem
      const schedulesData = await getAllBarberSchedules(barbershopId);
      
      setBarbers(barbersData || []);
      setServices(servicesData || []);
      setAppointments(appointmentsData || []);
      
      // Converter schedules para objeto
      const schedulesMap = {};
      (schedulesData || []).forEach(schedule => {
        schedulesMap[schedule.barber_id] = schedule;
      });
      setSchedules(schedulesMap);
      
      // Inicializar slots vazios - serão gerados sob demanda
      const slots = {};
      (barbersData || []).forEach(barber => {
        slots[barber.id] = [];
      });
      setBarberTimeSlots(slots);
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [barbershopId]);

  // Filtrar agendamentos do dia
  const filteredDayList = useMemo(() => {
    if (!appointments.length) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  // Funções de manipulação de agendamentos
  const addAppointmentHandler = async (appointmentData) => {
    try {
      const result = await addAppointment(appointmentData, barbershopId);
      setAppointments(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      throw error;
    }
  };

  const updateAppointmentHandler = async (id, updates) => {
    try {
      const result = await updateAppointment(id, updates, barbershopId);
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, ...updates } : apt
      ));
      return result;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  };

  const removeAppointmentHandler = async (id) => {
    try {
      await removeAppointment(id, barbershopId);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      throw error;
    }
  };

  const openWhatsApp = (appointment) => {
    const phone = appointment.client_phone?.replace(/\D/g, '');
    if (phone) {
      const message = `Olá ${appointment.client_name}! Seu agendamento para ${appointment.date} às ${appointment.time} está confirmado.`;
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const generateBarberTimeSlots = async (barberId, date = selectedDate) => {
    try {
      const slots = await generateTimeSlotsForBarber(date, barbershopId, barberId);
      setBarberTimeSlots(prev => ({
        ...prev,
        [barberId]: slots
      }));
      return slots;
    } catch (error) {
      console.error(`Erro ao gerar horários do barbeiro ${barberId}:`, error);
      return [];
    }
  };

  return {
    barbers,
    services,
    schedules,
    appointments,
    barberTimeSlots,
    filteredDayList,
    selectedDate,
    setSelectedDate,
    loading,
    error,
    refreshData,
    addAppointment: addAppointmentHandler,
    updateAppointment: updateAppointmentHandler,
    removeAppointment: removeAppointmentHandler,
    openWhatsApp,
    generateBarberTimeSlots
  };
}

// Hook para sincronizar dados em tempo real
export function useRealtimeSync(barbershopId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) return;

    // Carregar agendamentos iniciais
    const loadAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('barbershop_id', barbershopId)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();

    // Configurar subscription para mudanças em tempo real
    const subscription = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `barbershop_id=eq.${barbershopId}`
        },
        (payload) => {
          console.log('Mudança detectada:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setAppointments(prev => [...prev, payload.new]);
              break;
            case 'UPDATE':
              setAppointments(prev => 
                prev.map(apt => apt.id === payload.new.id ? payload.new : apt)
              );
              break;
            case 'DELETE':
              setAppointments(prev => 
                prev.filter(apt => apt.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [barbershopId]);

  return {
    appointments,
    loading
  };
}
