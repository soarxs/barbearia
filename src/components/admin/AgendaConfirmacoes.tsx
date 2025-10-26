import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  AlertCircle,
  Plus,
  Filter,
  Search,
  Send,
  CheckCircle2,
  X,
  AlertTriangle
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
  requestedAt?: string;
}

const AgendaConfirmacoes = () => {
  // Estados principais
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [barbers, setBarbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Estados para adicionar agendamento
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    clientName: '',
    clientPhone: '',
    service: '',
    barber: '',
    time: '',
    notes: ''
  });

  // Estados para confirmações
  const [selectedConfirmation, setSelectedConfirmation] = useState<Appointment | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

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
        notes: apt.notes,
        requestedAt: apt.created_at
      })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .in('status', ['pending', 'confirmed', 'cancelled'])
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      const formattedAppointments = data?.map(apt => ({
        id: apt.id,
        clientName: apt.client_name,
        clientPhone: apt.client_phone,
        service: apt.service,
        barber: apt.barber,
        date: new Date(apt.date).toLocaleDateString('pt-BR'),
        time: apt.time,
        status: apt.status,
        notes: apt.notes,
        requestedAt: apt.created_at
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
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

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
    const dateStr = typeof appointment.date === 'string' 
      ? appointment.date 
      : appointment.date.toLocaleDateString('pt-BR');
    return `Olá ${appointment.clientName}! Seu agendamento está confirmado para ${dateStr} às ${appointment.time} com ${appointment.barber}. Serviço: ${appointment.service}. Obrigado por escolher o BarberTime!`;
  };

  const generateConfirmationMessage = (appointment: Appointment) => {
    const dateStr = typeof appointment.date === 'string' 
      ? appointment.date 
      : appointment.date.toLocaleDateString('pt-BR');
    return `Olá ${appointment.clientName}! Confirmação do seu agendamento para ${dateStr} às ${appointment.time} com ${appointment.barber}. Serviço: ${appointment.service}. Por favor, confirme sua presença. Obrigado!`;
  };

  const generateReminderMessage = (appointment: Appointment) => {
    const dateStr = typeof appointment.date === 'string' 
      ? appointment.date 
      : appointment.date.toLocaleDateString('pt-BR');
    return `Olá ${appointment.clientName}! Lembrete: seu agendamento é amanhã (${dateStr}) às ${appointment.time} com ${appointment.barber}. Serviço: ${appointment.service}. Aguardamos você!`;
  };

  const handleSendConfirmation = (appointment: Appointment) => {
    const message = customMessage || generateConfirmationMessage(appointment);
    sendWhatsAppMessage(appointment.clientPhone, message);
    setCustomMessage('');
    setIsConfirmationDialogOpen(false);
  };

  const handleSendReminder = (appointment: Appointment) => {
    const message = generateReminderMessage(appointment);
    sendWhatsAppMessage(appointment.clientPhone, message);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = (appointment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (appointment.clientPhone?.includes(searchTerm) || false);
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    // Para agenda, filtrar por data selecionada
    if (typeof appointment.date === 'object') {
      const matchesDate = appointment.date?.toDateString() === selectedDate.toDateString();
      return matchesSearch && matchesStatus && matchesDate;
    }
    
    // Para confirmações, não filtrar por data
    return matchesSearch && matchesStatus;
  });

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-lg">{appointment.clientName || 'Cliente'}</h3>
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
                <span>{appointment.clientPhone || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Serviço:</span> {appointment.service || 'N/A'}
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
            
            {appointment.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedConfirmation(appointment);
                    setIsConfirmationDialogOpen(true);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendWhatsAppMessage(appointment.clientPhone, generateWhatsAppMessage(appointment))}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSendReminder(appointment)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Lembrete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agenda & Confirmações</h1>
          <p className="text-gray-600">Gerencie agendamentos e confirmações de forma integrada</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agenda" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agenda" onClick={fetchAppointments}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="confirmacoes" onClick={fetchAllAppointments}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Confirmações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agenda" className="space-y-6">
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
                filteredAppointments.map(renderAppointmentCard)
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="confirmacoes" className="space-y-6">
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
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Solicitações de Confirmação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma confirmação encontrada</p>
                  </div>
                ) : (
                  filteredAppointments.map(renderAppointmentCard)
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Message Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Confirmação Personalizada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customMessage">Mensagem Personalizada</Label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => selectedConfirmation && handleSendConfirmation(selectedConfirmation)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsConfirmationDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaConfirmacoes;
