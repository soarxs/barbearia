import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileCard, MobileList, MobileButton } from '@/components/mobile/MobileOptimizations';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface MobileDashboardProps {
  stats: {
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
  };
  recentAppointments: Array<{
    id: string;
    client_name: string;
    service: string;
    time: string;
    status: string;
  }>;
  onViewAppointments: () => void;
  onViewReports: () => void;
  onViewSettings: () => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({
  stats,
  recentAppointments,
  onViewAppointments,
  onViewReports,
  onViewSettings
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const quickActions = [
    {
      id: 'appointments',
      title: 'Ver Agendamentos',
      subtitle: `${stats.totalAppointments} agendamentos`,
      icon: Calendar,
      onClick: onViewAppointments
    },
    {
      id: 'reports',
      title: 'Relatórios',
      subtitle: 'Análises e métricas',
      icon: TrendingUp,
      onClick: onViewReports
    },
    {
      id: 'settings',
      title: 'Configurações',
      subtitle: 'Ajustes do sistema',
      icon: Users,
      onClick: onViewSettings
    }
  ];

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 gap-3">
        <MobileCard className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</div>
          <div className="text-xs text-gray-500">Agendamentos</div>
        </MobileCard>

        <MobileCard className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">R$ {stats.totalRevenue.toFixed(0)}</div>
          <div className="text-xs text-gray-500">Receita</div>
        </MobileCard>

        <MobileCard className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</div>
          <div className="text-xs text-gray-500">Completados</div>
        </MobileCard>

        <MobileCard className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(0)}%</div>
          <div className="text-xs text-gray-500">Conversão</div>
        </MobileCard>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ações Rápidas</h3>
        <MobileList items={quickActions} />
      </div>

      {/* Agendamentos Recentes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Agendamentos Recentes</h3>
          <MobileButton
            variant="secondary"
            size="sm"
            onClick={onViewAppointments}
          >
            Ver Todos
          </MobileButton>
        </div>
        
        <div className="space-y-2">
          {recentAppointments.slice(0, 3).map((appointment) => (
            <MobileCard key={appointment.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{appointment.client_name}</div>
                  <div className="text-sm text-gray-500">{appointment.service}</div>
                  <div className="text-xs text-gray-400">{appointment.time}</div>
                </div>
                <div className="flex items-center">
                  {appointment.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  {appointment.status === 'pending' && (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                  {appointment.status === 'cancelled' && (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Insights</h3>
        <div className="space-y-3">
          <MobileCard className="p-3">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Top Barbeiro</div>
                <div className="text-sm text-gray-500">{stats.topBarber}</div>
              </div>
            </div>
          </MobileCard>

          <MobileCard className="p-3">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Serviço Mais Popular</div>
                <div className="text-sm text-gray-500">{stats.mostPopularService}</div>
              </div>
            </div>
          </MobileCard>

          <MobileCard className="p-3">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Ticket Médio</div>
                <div className="text-sm text-gray-500">R$ {stats.averageTicket.toFixed(2)}</div>
              </div>
            </div>
          </MobileCard>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
