import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  MessageSquare,
  Phone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DashboardSimple = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    totalAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar agendamentos de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', today);

      // Buscar todos os agendamentos
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });

      // Clientes únicos
      const uniqueClients = new Set(allAppointments?.map(apt => apt.client_phone) || []).size;
      const todayCount = todayAppointments?.length || 0;
      
      // Receita mensal
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyAppointments = allAppointments?.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
      }) || [];

      const servicePrices: { [key: string]: number } = {
        'Corte': 25, 'Barba': 15, 'Corte + Barba': 35, 'Sobrancelha': 10, 'Pigmentação': 50
      };

      const monthlyRevenue = monthlyAppointments.reduce((total, apt) => {
        const price = servicePrices[apt.service] || 25;
        return total + (apt.status === 'confirmado' ? price : 0);
      }, 0);

      setStats({
        totalClients: uniqueClients,
        todayAppointments: todayCount,
        monthlyRevenue,
        totalAppointments: allAppointments?.length || 0
      });

      // Agendamentos recentes
      const recent = allAppointments?.slice(0, 5).map(apt => ({
        id: apt.id,
        clientName: apt.client_name,
        service: apt.service,
        barber: apt.barber,
        date: new Date(apt.date),
        time: apt.time,
        status: apt.status
      })) || [];

      setRecentAppointments(recent);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppMessage = (phone: string, clientName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Olá ${clientName}! Como está? Gostaria de agendar um horário no BarberTime?`;
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalClients}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayAppointments}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold text-purple-600">R$ {stats.monthlyRevenue.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agendamentos</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalAppointments}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{appointment.clientName || 'Cliente'}</h3>
                      <Badge variant={
                        appointment.status === 'confirmado' ? 'default' :
                        appointment.status === 'pendente' ? 'secondary' :
                        appointment.status === 'cancelado' ? 'destructive' : 'outline'
                      }>
                        {appointment.status === 'confirmado' ? 'Confirmado' :
                         appointment.status === 'pendente' ? 'Pendente' :
                         appointment.status === 'cancelado' ? 'Cancelado' : appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{appointment.service || 'N/A'} • {appointment.barber || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.date?.toLocaleDateString('pt-BR')} às {appointment.time}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendWhatsAppMessage(appointment.clientPhone || '', appointment.clientName || '')}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSimple;
