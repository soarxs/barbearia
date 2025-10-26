import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, TrendingUp, TrendingDown, Users, DollarSign, Clock, BarChart3, PieChart, LineChart } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { useTenant } from '@/hooks/useTenant.js';
import { 
  AdvancedLineChart, 
  AdvancedAreaChart, 
  AdvancedBarChart, 
  AdvancedPieChart,
  RevenueExpenseChart,
  BarberPerformanceChart,
  BusyHoursChart
} from '@/components/charts/AdvancedCharts';

interface ReportData {
  revenue: {
    total: number;
    monthly: Array<{ month: string; revenue: number }>;
    daily: Array<{ date: string; revenue: number }>;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    byStatus: Array<{ status: string; count: number }>;
    byHour: Array<{ hour: string; count: number }>;
    byDay: Array<{ day: string; count: number }>;
  };
  barbers: {
    performance: Array<{ name: string; appointments: number; revenue: number; rating: number }>;
    topPerformer: string;
    averageRating: number;
  };
  services: {
    popularity: Array<{ name: string; count: number; revenue: number }>;
    mostPopular: string;
    averagePrice: number;
  };
  clients: {
    total: number;
    newThisMonth: number;
    returning: number;
    topClients: Array<{ name: string; appointments: number; totalSpent: number }>;
  };
  trends: {
    growthRate: number;
    peakHours: string[];
    busyDays: string[];
    seasonalPatterns: Array<{ month: string; factor: number }>;
  };
}

const ReportsAdvanced = () => {
  const { data: tenant } = useTenant();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // days
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (tenant?.barbershop?.id) {
      fetchReportData();
    }
  }, [period, dateRange, tenant?.barbershop?.id]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      if (!tenant?.barbershop?.id) return;
      
      const startDate = dateRange.start;
      const endDate = dateRange.end;

      // Usar analyticsService para buscar dados completos
      const analyticsData = await analyticsService.getAnalytics(
        tenant.barbershop.id, 
        startDate, 
        endDate
      );
      
      setReportData(analyticsData);

    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) return;
    
    const reportText = `
RELATÓRIO BARBERTIME
Período: ${dateRange.start} a ${dateRange.end}

📊 RESUMO GERAL
- Total de Agendamentos: ${reportData.appointments.total}
- Receita Total: R$ ${reportData.revenue.total.toFixed(2)}
- Clientes Únicos: ${reportData.clients.total}
- Taxa de Crescimento: ${reportData.trends.growthRate.toFixed(1)}%

💰 RECEITA
- Receita Total: R$ ${reportData.revenue.total.toFixed(2)}
- Preço Médio por Serviço: R$ ${reportData.services.averagePrice.toFixed(2)}

👥 BARBEIROS
- Top Performer: ${reportData.barbers.topPerformer}
- Avaliação Média: ${reportData.barbers.averageRating.toFixed(1)}/5

🔧 SERVIÇOS
- Mais Popular: ${reportData.services.mostPopular}

📈 TENDÊNCIAS
- Horários de Pico: ${reportData.trends.peakHours.join(', ')}
- Dias Mais Movimentados: ${reportData.trends.busyDays.join(', ')}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-barbertime-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Nenhum dado encontrado para o período selecionado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600">Análises detalhadas e insights do seu negócio</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleDownloadReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Baixar Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.appointments.total}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.appointments.completed} completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {reportData.revenue.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              R$ {reportData.services.averagePrice.toFixed(2)} por serviço
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.clients.total}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.clients.newThisMonth} novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.trends.growthRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedPieChart 
                  data={reportData.appointments.byStatus} 
                  title=""
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horários Mais Movimentados</CardTitle>
              </CardHeader>
              <CardContent>
                <BusyHoursChart data={reportData.appointments.byHour} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agendamentos por Dia da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedBarChart 
                data={reportData.appointments.byDay} 
                title=""
                color="#8884D8"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receita */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedLineChart 
                  data={reportData.revenue.monthly} 
                  title=""
                  color="#00C49F"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Serviços Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedPieChart 
                  data={reportData.services.popularity} 
                  title=""
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Barbeiros</CardTitle>
            </CardHeader>
            <CardContent>
              <BarberPerformanceChart data={reportData.barbers.performance} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Barbeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.barbers.performance.slice(0, 3).map((barber, index) => (
                    <div key={barber.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{barber.name}</p>
                          <p className="text-sm text-gray-500">{barber.appointments} agendamentos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {barber.revenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">⭐ {barber.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.clients.topClients.slice(0, 3).map((client, index) => (
                    <div key={client.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.appointments} agendamentos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {client.totalSpent.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Padrões Sazonais</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedAreaChart 
                  data={reportData.trends.seasonalPatterns} 
                  title=""
                  color="#FF8042"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insights de Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Horários de Pico</h4>
                    <p className="text-blue-700">{reportData.trends.peakHours.join(', ')}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Dias Mais Movimentados</h4>
                    <p className="text-green-700">{reportData.trends.busyDays.join(', ')}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Taxa de Crescimento</h4>
                    <p className="text-purple-700">{reportData.trends.growthRate > 0 ? '+' : ''}{reportData.trends.growthRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAdvanced;
