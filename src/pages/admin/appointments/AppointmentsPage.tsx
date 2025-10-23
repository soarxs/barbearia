import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Phone, MapPin, Filter, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/api/useAppointments';
import { AppointmentModal } from '@/components/forms/AppointmentModal';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ListView } from '@/components/calendar/ListView';
import { WeekView } from '@/components/calendar/WeekView';

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  client: {
    name: string;
    phone: string;
    email?: string;
    photo?: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  barber: {
    id: string;
    name: string;
    photo?: string;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalValue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AppointmentsPage() {
  const [view, setView] = useState<'calendar' | 'week' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    barber: 'all',
    status: 'all',
    service: 'all',
    search: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const { data: appointments, isLoading, error } = useAppointments();
  const { data: barbers } = useBarbers();
  const { data: services } = useServices();

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    return appointments.filter(appointment => {
      // Filtro por barbeiro
      if (filters.barber !== 'all' && appointment.barber.id !== filters.barber) {
        return false;
      }

      // Filtro por status
      if (filters.status !== 'all' && appointment.status !== filters.status) {
        return false;
      }

      // Filtro por serviço
      if (filters.service !== 'all' && !appointment.services.some(s => s.id === filters.service)) {
        return false;
      }

      // Filtro por busca
      if (filters.search && !appointment.client.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !appointment.client.phone.includes(filters.search)) {
        return false;
      }

      return true;
    });
  }, [appointments, filters]);

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar agendamentos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os agendamentos da barbearia</p>
        </div>
        <Button onClick={handleCreateAppointment} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.barber} onValueChange={(value) => setFilters(prev => ({ ...prev, barber: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Barbeiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os barbeiros</SelectItem>
                {barbers?.map(barber => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.service} onValueChange={(value) => setFilters(prev => ({ ...prev, service: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                {services?.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visualizações */}
      <Tabs value={view} onValueChange={(value) => setView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Semanal
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView
            appointments={filteredAppointments}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAppointmentClick={handleEditAppointment}
          />
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <WeekView
            appointments={filteredAppointments}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAppointmentClick={handleEditAppointment}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <ListView
            appointments={filteredAppointments}
            onAppointmentClick={handleEditAppointment}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Agendamento */}
      {showModal && (
        <AppointmentModal
          appointment={editingAppointment}
          onClose={() => setShowModal(false)}
          onSave={(appointment) => {
            // Lógica de salvamento
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

