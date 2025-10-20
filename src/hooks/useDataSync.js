import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getBarbers, getServices, getAllBarberSchedules } from '@/lib/dataStore';

export function useDataSync(barbershopId) {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState({});
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
      const [barbersData, servicesData, schedulesData] = await Promise.all([
        getBarbers(barbershopId),
        getServices(barbershopId),
        getAllBarberSchedules(barbershopId)
      ]);
      
      setBarbers(barbersData || []);
      setServices(servicesData || []);
      
      // Converter schedules para objeto
      const schedulesMap = {};
      (schedulesData || []).forEach(schedule => {
        schedulesMap[schedule.barber_id] = schedule;
      });
      setSchedules(schedulesMap);
      
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

  return {
    barbers,
    services,
    schedules,
    loading,
    error,
    refreshData
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
