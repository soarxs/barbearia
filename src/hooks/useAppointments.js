import { useState, useEffect, useMemo } from 'react';
import { useTenant } from './useTenant';
import { 
  getAppointments, 
  addAppointment, 
  updateAppointment, 
  removeAppointment,
  generateTimeSlotsForBarber,
  getAllBarberSchedules
} from '@/lib/dataStore';

export function useAppointments() {
  const { data: tenant } = useTenant();
  const [appointments, setAppointments] = useState([]);
  const [barberTimeSlots, setBarberTimeSlots] = useState({});
  const [barberSchedules, setBarberSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Carregar agendamentos
  const loadAppointments = async () => {
    if (!tenant?.barbershop?.id) return;
    
    try {
      setLoading(true);
      const appointmentsData = await getAppointments(tenant.barbershop.id);
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar horários dos barbeiros
  const loadBarberSchedules = async (barbers) => {
    if (!tenant?.barbershop?.id || !barbers.length) return;
    
    try {
      // Carregar horários dos barbeiros
      const schedulesData = await getAllBarberSchedules(tenant.barbershop.id);
      const schedulesMap = {};
      schedulesData.forEach(schedule => {
        schedulesMap[schedule.barber_id] = schedule;
      });
      setBarberSchedules(schedulesMap);
      
      // Gerar slots de tempo para cada barbeiro
      const slots = {};
      for (const barber of barbers) {
        try {
          const barberSlots = await generateTimeSlotsForBarber(selectedDate, tenant.barbershop.id, barber.id);
          slots[barber.id] = barberSlots;
        } catch (error) {
          console.error(`Erro ao carregar horários do barbeiro ${barber.name}:`, error);
          slots[barber.id] = [];
        }
      }
      setBarberTimeSlots(slots);
    } catch (error) {
      console.error('Erro ao carregar dados dos barbeiros:', error);
    }
  };

  // Filtrar agendamentos do dia
  const filteredDayList = useMemo(() => {
    if (!appointments.length) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  // Adicionar agendamento
  const addAppointmentHandler = async (appointmentData) => {
    if (!tenant?.barbershop?.id) return false;
    
    try {
      const result = await addAppointment(tenant.barbershop.id, appointmentData);
      setAppointments(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      throw error;
    }
  };

  // Confirmar agendamento
  const confirmAppointment = async (appointmentId) => {
    if (!tenant?.barbershop?.id) return false;
    
    try {
      await updateAppointment(tenant.barbershop.id, appointmentId, { status: 'confirmado' });
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'confirmado' } : apt
      ));
      return true;
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      throw error;
    }
  };

  // Cancelar agendamento
  const cancelAppointment = async (appointmentId) => {
    if (!tenant?.barbershop?.id) return false;
    
    try {
      await removeAppointment(tenant.barbershop.id, appointmentId);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      return true;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  };

  // Abrir WhatsApp
  const openWhatsApp = (appointment) => {
    const phone = appointment.client_phone?.replace(/\D/g, '');
    if (phone) {
      const message = `Olá ${appointment.client_name}! Seu agendamento para ${appointment.date} às ${appointment.time} está confirmado.`;
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [tenant]);

  return {
    appointments,
    barberTimeSlots,
    barberSchedules,
    filteredDayList,
    loading,
    selectedDate,
    setSelectedDate,
    addAppointment: addAppointmentHandler,
    confirmAppointment,
    cancelAppointment,
    openWhatsApp,
    loadBarberSchedules,
    refreshAppointments: loadAppointments
  };
}
