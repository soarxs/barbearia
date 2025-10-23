import React, { useState, useMemo } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppointments } from '@/hooks/api/useAppointments';
import { useBarbers } from '@/hooks/api/useBarbers';
import { useServices } from '@/hooks/api/useServices';
import { AppointmentChart } from '@/components/charts/AppointmentChart';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { BarberPerformanceChart } from '@/components/charts/BarberPerformanceChart';
import { ServicePopularityChart } from '@/components/charts/ServicePopularityChart';
import { RecentAppointments } from '@/components/dashboard/RecentAppointments';
import { QuickStats } from '@/components/dashboard/QuickStats';

interface DashboardStats {
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageTicket: number;
  topBarber: string;
  mostPopularService: string;
  conversionRate: number;
  noShowRate: number;
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedBarber, setSelectedBarber] = useState<string>('all');

  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: barbers, isLoading: barbersLoading } = useBarbers();
  const { data: services, isLoading: servicesLoading } = useServices();

  const stats = useMemo((): DashboardStats => {
    if (!appointments) {
      return {
        totalAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalRevenue: 0,
        averageTicket: 0,
        topBarber: 'N/A',
        mostPopularService: 'N/A',
        conversionRate: 0,
        noShowRate: 0
      };
    }

    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const now = new Date();
      
      // Filtro por período
      let startDate: Date;
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      // Filtro por barbeiro
      const barberFilter = selectedBarber === 'all' || appointment.barber.id === selectedBarber;

      return appointmentDate >= startDate && barberFilter;
    });

    const totalAppointments = filteredAppointments.length;
    const confirmedAppointments = filteredAppointments.filter(a => a.status === 'confirmed').length;
    const completedAppointments = filteredAppointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = filteredAppointments.filter(a => a.status === 'cancelled').length;
    
    const totalRevenue = filteredAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.totalValue, 0);
    
    const averageTicket = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

    // Barbeiro mais ativo
    const barberStats = filteredAppointments.reduce((acc, appointment) => {
      const barberId = appointment.barber.id;
      acc[barberId] = (acc[barberId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topBarberId = Object.entries(barberStats).reduce((a, b) => 
      barberStats[a[0]] > barberStats[b[0]] ? a : b, ['', 0])[0];
    
    const topBarber = barbers?.find(b => b.id === topBarberId)?.name || 'N/A';

    // Serviço mais popular
    const serviceStats = filteredAppointments.reduce((acc, appointment) => {
      appointment.services.forEach(service => {
        acc[service.id] = (acc[service.id] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const mostPopularServiceId = Object.entries(serviceStats).reduce((a, b) => 
      serviceStats[a[0]] > serviceStats[b[0]] ? a : b, ['', 0])[0];
    
    const mostPopularService = services?.find(s => s.id === mostPopularServiceId)?.name || 'N/A';

    const conversionRate = totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0;
    const noShowRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

    return {
      totalAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue,
      averageTicket,
      topBarber,
      mostPopularService,
      conversionRate,
      noShowRate
    };
  }, [appointments, barbers, services, period, selectedBarber]);

  const isLoading = appointmentsLoading || barbersLoading || servicesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da barbearia</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedBarber} onValueChange={setSelectedBarber}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por barbeiro" />
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
          
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">7 dias</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedAppointments} confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: R$ {stats.averageTicket.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedAppointments} de {stats.totalAppointments} agendamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noShowRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.cancelledAppointments} cancelamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentChart appointments={appointments || []} period={period} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart appointments={appointments || []} period={period} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentAppointments appointments={appointments || []} limit={10} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Barbeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <BarberPerformanceChart 
                appointments={appointments || []} 
                barbers={barbers || []} 
                period={period} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popularidade dos Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <ServicePopularityChart 
                appointments={appointments || []} 
                services={services || []} 
                period={period} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

