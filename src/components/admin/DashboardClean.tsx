import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Plus,
  MessageSquare,
  Phone,
  AlertTriangle,
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';
import { unifiedBookingService } from '@/services/unifiedBookingService';

interface DashboardStats {
  todayAppointments: number;
  pendingConfirmations: number;
  totalClients: number;
  monthlyRevenue: number;
  averageRating: number;
  upcomingAppointments: any[];
  recentActivity: any[];
}

const DashboardClean = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingConfirmations: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    upcomingAppointments: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const stats = await unifiedBookingService.getDashboardStats();
      
      setStats({
        todayAppointments: stats.todayAppointments,
        pendingConfirmations: 0, // Não usado mais com sistema simplificado
        totalClients: stats.totalClients,
        monthlyRevenue: 0, // TODO: Implementar cálculo de receita
        averageRating: 4.8, // TODO: Implementar sistema de avaliações
        upcomingAppointments: stats.upcomingAppointments,
        recentActivity: stats.recentActivity
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppMessage = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const generateConfirmationMessage = (appointment: any) => {
    const dateStr = new Date(appointment.date).toLocaleDateString('pt-BR');
    return `Olá ${appointment.client_name}! Confirmação do seu agendamento para ${dateStr} às ${appointment.time} com ${appointment.barber}. Serviço: ${appointment.service}. Por favor, confirme sua presença. Obrigado!`;
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

  const quickActions = [
    {
      id: 'new-appointment',
      title: 'Novo Agendamento',
      description: 'Agendar cliente',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        // Implementar abertura de modal de agendamento
        console.log('Novo agendamento');
      }
    },
    {
      id: 'send-reminders',
      title: 'Enviar Lembretes',
      description: 'WhatsApp automático',
      icon: MessageSquare,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        // Implementar envio de lembretes
        console.log('Enviar lembretes');
      }
    },
    {
      id: 'view-reports',
      title: 'Relatórios',
      description: 'Análises e métricas',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => {
        // Implementar navegação para relatórios
        console.log('Ver relatórios');
      }
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Ajustes do sistema',
      icon: Settings,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        // Implementar navegação para configurações
        console.log('Configurações');
      }
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Sistema Online
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</p>
                <p className="text-xs text-gray-500">agendamentos</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingConfirmations}</p>
                <p className="text-xs text-gray-500">confirmações</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalClients}</p>
                <p className="text-xs text-gray-500">cadastrados</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliação</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageRating}</p>
                <p className="text-xs text-gray-500">média</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  onClick={action.action}
                  className={`${action.color} text-white h-auto p-4 flex flex-col items-center space-y-2`}
                >
                  <Icon className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Próximos Agendamentos
              </span>
              <Button size="sm" variant="outline">
                Ver Todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum agendamento próximo</p>
                </div>
              ) : (
                stats.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{appointment.client_name}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                      </p>
                      <p className="text-xs text-gray-500">{appointment.service}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusIcon(appointment.status)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendWhatsAppMessage(appointment.client_phone, generateConfirmationMessage(appointment))}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Atividade Recente
              </span>
              <Button size="sm" variant="outline">
                Ver Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma atividade recente</p>
                </div>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.client_name}</p>
                      <p className="text-xs text-gray-600">
                        Agendamento {activity.status === 'pending' ? 'pendente' : 'confirmado'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {getStatusIcon(activity.status)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardClean;
