import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Plus,
  Send,
  Edit,
  Trash2,
  Scissors
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  barber: string;
  date: Date | string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

const AgendaClean = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [barbers, setBarbers] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
    barber: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchBarbers();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', selectedDateStr)
        .order('time', { ascending: true });

      if (error) throw error;

      const formattedAppointments = data?.map(apt => ({
        id: apt.id,
        clientName: apt.client_name,
        clientPhone: apt.client_phone,
        service: apt.service,
        barber: apt.barber,
        date: new Date(apt.date),
        time: apt.time,
        status: apt.status,
        notes: apt.notes
      })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('name')
        .eq('active', true);

      if (error) throw error;
      setServices(data?.map(s => s.name) || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('name')
        .eq('active', true);

      if (error) throw error;
      setBarbers(data?.map(b => b.name) || []);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
    }
  };

  const handleAddAppointment = async () => {
    try {
      const appointmentData = {
        client_name: newAppointment.clientName,
        client_phone: newAppointment.clientPhone,
        service: newAppointment.service,
        barber: newAppointment.barber,
        date: selectedDate.toISOString().split('T')[0],
        time: newAppointment.time,
        status: 'confirmed',
        notes: newAppointment.notes
      };

      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) throw error;

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
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-gray-600">Gerencie os agendamentos do dia</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Calendário e Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border-0"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Lista de Agendamentos */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('pt-BR')}
                </h2>
                <Badge variant="outline">
                  {appointments.length} agendamento(s)
                </Badge>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum agendamento
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Não há agendamentos para {selectedDate.toLocaleDateString('pt-BR')}
                  </p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Cliente
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {appointment.clientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{appointment.clientName}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {appointment.time}
                                </span>
                                <span className="flex items-center">
                                  <Scissors className="w-4 h-4 mr-1" />
                                  {appointment.service}
                                </span>
                                <span className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  {appointment.barber}
                                </span>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm text-gray-500 mt-1 italic">
                                  "{appointment.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                              {getStatusIcon(appointment.status)}
                              <span>{getStatusText(appointment.status)}</span>
                            </Badge>

                            <div className="flex space-x-1">
                              {appointment.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Confirmar"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Deletar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                    <SelectItem key={barber} value={barber}>{barber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
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

export default AgendaClean;