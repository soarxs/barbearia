import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Plus,
  Send,
  Edit,
  Trash2,
  Scissors,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
  avatar?: string;
  specialties?: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

const AgendaInteligente = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
    barber: '',
    time: '',
    notes: ''
  });

  // Horários de funcionamento
  const workingHours = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    fetchBarbers();
    fetchServices();
  }, []);

  useEffect(() => {
    if (barbers.length > 0 && !selectedBarber) {
      setSelectedBarber(barbers[0].name);
    }
  }, [barbers]);

  useEffect(() => {
    if (selectedBarber) {
      fetchAppointments();
    }
  }, [selectedDate, selectedBarber]);

  const fetchBarbers = async () => {
    try {
      const barbersData = await unifiedBookingService.getActiveBarbers();
      setBarbers(barbersData.map(b => b.name));
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const servicesData = await unifiedBookingService.getActiveServices();
      setServices(servicesData.map(s => s.name));
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      
      const appointmentsData = await unifiedBookingService.getAppointments({
        date: selectedDateStr,
        barber: selectedBarber
      });

      const formattedAppointments = appointmentsData.map(apt => ({
        id: apt.id,
        clientName: apt.client_name,
        clientPhone: apt.client_phone,
        service: apt.service,
        barber: apt.barber,
        date: new Date(apt.date),
        time: apt.time,
        status: apt.status,
        notes: apt.notes
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const getTimeSlots = (): TimeSlot[] => {
    return workingHours.map(time => {
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

      setNewAppointment({
        clientName: '',
        clientPhone: '',
        service: '',
        barber: '',
        time: '',
        notes: ''
      });
      setIsAddDialogOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento: ' + error.message);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await unifiedBookingService.updateAppointmentStatus(appointmentId, newStatus);
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await unifiedBookingService.deleteAppointment(appointmentId);
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
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
      default: return status;
    }
  };

  const timeSlots = getTimeSlots();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda Inteligente</h1>
          <p className="text-gray-600">Gerencie as agendas de cada barbeiro</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Seleção de Barbeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Selecionar Barbeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = barbers.findIndex(b => b.name === selectedBarber);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : barbers.length - 1;
                setSelectedBarber(barbers[prevIndex].name);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.name}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = barbers.findIndex(b => b.name === selectedBarber);
                const nextIndex = currentIndex < barbers.length - 1 ? currentIndex + 1 : 0;
                setSelectedBarber(barbers[nextIndex].name);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendário e Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
              />
            </CardContent>
          </Card>
        </div>

        {/* Agenda do Barbeiro */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Agenda - {selectedBarber}
                </div>
                <Badge variant="outline">
                  {appointments.length} agendamento(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  {selectedDate.toLocaleDateString('pt-BR')}
                </h3>
              </div>

              {/* Grade de Horários */}
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      slot.available
                        ? 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
                        : 'bg-red-50 border-red-200'
                    }`}
                    onClick={() => {
                      if (slot.available) {
                        setNewAppointment(prev => ({ ...prev, time: slot.time }));
                        setIsAddDialogOpen(true);
                      }
                    }}
                  >
                    <div className="text-sm font-medium">{slot.time}</div>
                    {slot.appointment ? (
                      <div className="text-xs text-red-600 mt-1">
                        {slot.appointment.clientName}
                      </div>
                    ) : (
                      <div className="text-xs text-green-600 mt-1">
                        Disponível
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Lista de Agendamentos */}
              {appointments.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Agendamentos Confirmados</h4>
                  <div className="space-y-2">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {appointment.time}
                          </div>
                          <div>
                            <div className="font-medium">{appointment.clientName}</div>
                            <div className="text-sm text-gray-600">
                              {appointment.service} • {appointment.clientPhone}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                            {getStatusIcon(appointment.status)}
                            <span>{getStatusText(appointment.status)}</span>
                          </Badge>
                          
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para Novo Agendamento */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={newAppointment.clientName}
                onChange={(e) => setNewAppointment({...newAppointment, clientName: e.target.value})}
                placeholder="Digite o nome do cliente"
              />
            </div>
            
            <div>
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input
                id="clientPhone"
                value={newAppointment.clientPhone}
                onChange={(e) => setNewAppointment({...newAppointment, clientPhone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="service">Serviço</Label>
              <Select value={newAppointment.service} onValueChange={(value) => setNewAppointment({...newAppointment, service: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="barber">Barbeiro</Label>
              <Select value={newAppointment.barber} onValueChange={(value) => setNewAppointment({...newAppointment, barber: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.name}>{barber.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                placeholder="HH:MM"
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                placeholder="Observações adicionais"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddAppointment} className="bg-blue-600 hover:bg-blue-700">
                Agendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaInteligente;