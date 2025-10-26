import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  Plus,
  Trash2,
  Scissors
} from 'lucide-react';
import { unifiedBookingService } from '@/services/unifiedBookingService';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  barber: string;
  date: Date | string;
  time: string;
  status: 'agendado' | 'concluido';
  notes?: string;
}

interface Barber {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

export const AgendaClean = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
    time: '',
    notes: ''
  });

  const workingHours = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBarber) {
      loadAppointments();
    }
  }, [selectedDate, selectedBarber]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [barbersData, servicesData] = await Promise.all([
        unifiedBookingService.getActiveBarbers(),
        unifiedBookingService.getActiveServices()
      ]);
      setBarbers(barbersData);
      setServices(servicesData);
      if (barbersData.length > 0) {
        setSelectedBarber(barbersData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const appointmentsData = await unifiedBookingService.getAppointments({
        barber: selectedBarber,
        date: selectedDate.toISOString().split('T')[0]
      });
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const getTimeSlots = (): TimeSlot[] => {
    const today = new Date().toISOString().split('T')[0];
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const isToday = selectedDateStr === today;
    const isPast = selectedDateStr < today;
    
    if (isPast) {
      return workingHours.map(time => {
        const appointment = appointments.find(apt => apt.time === time);
        return {
          time,
          available: false,
          appointment
        };
      });
    }
    
    let filteredHours = workingHours;
    
    if (isToday) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      filteredHours = workingHours.filter(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = hours * 60 + minutes;
        const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
        const currentSlotTime = currentHours * 60 + currentMinutes;
        
        return slotTime > (currentSlotTime + 5);
      });
    }
    
    return filteredHours.map(time => {
      const appointment = appointments.find(apt => apt.time === time);
      return {
        time,
        available: !appointment,
        appointment
      };
    });
  };

  const handleAddAppointment = async () => {
    try {
      const appointmentData = {
        client_name: newAppointment.clientName,
        client_phone: newAppointment.clientPhone,
        service: newAppointment.service,
        barber: selectedBarber,
        date: selectedDate.toISOString().split('T')[0],
        time: newAppointment.time,
        status: 'agendado',
        notes: newAppointment.notes
      };
      await unifiedBookingService.createAppointment(appointmentData);
      setShowAddDialog(false);
      setNewAppointment({
        clientName: '',
        clientPhone: '',
        service: '',
        time: '',
        notes: ''
      });
      loadAppointments();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento: ' + error.message);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'agendado' | 'concluido') => {
    try {
      await unifiedBookingService.updateAppointmentStatus(appointmentId, newStatus);
      loadAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        await unifiedBookingService.deleteAppointment(appointmentId);
        loadAppointments();
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concluido': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado': return <Clock className="w-4 h-4" />;
      case 'concluido': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'concluido': return 'Concluído';
      default: return 'Agendado';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const timeSlots = getTimeSlots();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Agenda Simplificada</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Barbeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Barbeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um barbeiro" />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`p-2 rounded text-sm text-center ${
                    slot.available
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {slot.time}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum agendamento para esta data</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{appointment.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{appointment.clientPhone}</span>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{getStatusText(appointment.status)}</span>
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    {appointment.status === 'agendado' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(appointment.id, 'concluido')}
                        className="text-green-600 hover:text-green-700"
                        title="Marcar como Concluído"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Novo Agendamento */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={newAppointment.clientName}
                onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input
                id="clientPhone"
                value={newAppointment.clientPhone}
                onChange={(e) => setNewAppointment({ ...newAppointment, clientPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Serviço</Label>
              <Select value={newAppointment.service} onValueChange={(value) => setNewAppointment({ ...newAppointment, service: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name} - R$ {service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Select value={newAppointment.time} onValueChange={(value) => setNewAppointment({ ...newAppointment, time: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.filter(slot => slot.available).map((slot) => (
                    <SelectItem key={slot.time} value={slot.time}>
                      {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddAppointment}>
                Criar Agendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};