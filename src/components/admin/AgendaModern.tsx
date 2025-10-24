import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  barber: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

const AgendaModern = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [barbers, setBarbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('name')
        .eq('is_active', true);

      if (error) throw error;

      const serviceNames = data?.map(s => s.name) || [];
      setServices(serviceNames);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      // Fallback para serviços padrão
      setServices(['Corte Masculino', 'Corte Feminino', 'Barba', 'Corte + Barba']);
    }
  };

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('name')
        .eq('is_active', true);

      if (error) throw error;

      const barberNames = data?.map(b => b.name) || [];
      setBarbers(barberNames);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
      // Fallback para barbeiros padrão
      setBarbers(['Carlos', 'Ana', 'Roberto', 'Mariana']);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.clientPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesDate = appointment.date.toDateString() === selectedDate.toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      // Atualizar estado local
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus as any }
          : appointment
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleAddAppointment = async () => {
    if (newAppointment.clientName && newAppointment.clientPhone && newAppointment.service && newAppointment.barber && newAppointment.time) {
      try {
        const appointmentData = {
          client_name: newAppointment.clientName,
          client_phone: newAppointment.clientPhone,
          service: newAppointment.service,
          barber: newAppointment.barber,
          date: selectedDate.toISOString().split('T')[0],
          time: newAppointment.time,
          status: 'pending',
          notes: newAppointment.notes || null
        };

        const { data, error } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select();

        if (error) throw error;

        // Recarregar agendamentos
        await fetchAppointments();

        setNewAppointment({
          clientName: '',
          clientPhone: '',
          service: '',
          barber: '',
          time: '',
          notes: ''
        });
        setIsAddDialogOpen(false);
      } catch (error) {
        console.error('Erro ao adicionar agendamento:', error);
      }
    }
  };

  const sendWhatsAppMessage = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const generateWhatsAppMessage = (appointment: Appointment) => {
    const dateStr = appointment.date.toLocaleDateString('pt-BR');
    return `Olá ${appointment.clientName}! Seu agendamento está confirmado para ${dateStr} às ${appointment.time} com ${appointment.barber}. Serviço: ${appointment.service}. Obrigado por escolher o BarberTime!`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda Moderna</h1>
          <p className="text-gray-600">Gerencie seus agendamentos de forma eficiente</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  value={newAppointment.clientName}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Digite o nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input
                  id="clientPhone"
                  value={newAppointment.clientPhone}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="service">Serviço</Label>
                <Select value={newAppointment.service} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, service: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="barber">Barbeiro(a)</Label>
                <Select value={newAppointment.barber} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, barber: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o barbeiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.map(barber => (
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
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações adicionais"
                />
              </div>
              <Button onClick={handleAddAppointment} className="w-full bg-blue-600 hover:bg-blue-700">
                Adicionar Agendamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
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
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">
            Agendamentos - {selectedDate.toLocaleDateString('pt-BR')}
          </h2>
          
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum agendamento encontrado para esta data</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{appointment.clientName}</h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(appointment.status)}
                            <span>{getStatusText(appointment.status)}</span>
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{appointment.barber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.clientPhone}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Serviço:</span> {appointment.service}
                        </div>
                        {appointment.notes && (
                          <div className="col-span-2">
                            <span className="font-medium">Observações:</span> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Select 
                        value={appointment.status} 
                        onValueChange={(value) => handleStatusChange(appointment.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendWhatsAppMessage(appointment.clientPhone, generateWhatsAppMessage(appointment))}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaModern;

