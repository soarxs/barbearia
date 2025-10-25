import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, TrendingUp, TrendingDown, Users, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReportData {
  totalAppointments: number;
  totalRevenue: number;
  averageAppointmentValue: number;
  totalClients: number;
  completedAppointments: number;
  cancelledAppointments: number;
  monthlyData: Array<{
    month: string;
    appointments: number;
    revenue: number;
  }>;
  topServices: Array<{
    service: string;
    count: number;
    revenue: number;
  }>;
  topBarbers: Array<{
    barber: string;
    appointments: number;
    revenue: number;
  }>;
}

const ReportsModern = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // days
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [period, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const startDate = dateRange.start;
      const endDate = dateRange.end;

      // Buscar agendamentos do período
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      // Processar dados
      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(apt => apt.status === 'confirmado').length || 0;
      const cancelledAppointments = appointments?.filter(apt => apt.status === 'cancelado').length || 0;
      
      // Calcular receita (assumindo valores médios por serviço)
      const servicePrices: { [key: string]: number } = {
        'Corte': 25,
        'Barba': 15,
        'Corte + Barba': 35,
        'Sobrancelha': 10,
        'Pigmentação': 50,
        'Cadastro de Cliente': 0
      };

      const totalRevenue = appointments?.reduce((sum, apt) => {
        const price = servicePrices[apt.service] || 25; // preço padrão
        return sum + (apt.status === 'confirmado' ? price : 0);
      }, 0) || 0;

      const averageAppointmentValue = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

      // Clientes únicos
      const uniqueClients = new Set(appointments?.map(apt => apt.client_phone) || []);
      const totalClients = uniqueClients.size;

      // Dados mensais
      const monthlyData = generateMonthlyData(appointments || []);

      // Top serviços
      const serviceCounts: { [key: string]: number } = {};
      const serviceRevenue: { [key: string]: number } = {};
      
      appointments?.forEach(apt => {
        if (apt.status === 'confirmado') {
          serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
          serviceRevenue[apt.service] = (serviceRevenue[apt.service] || 0) + (servicePrices[apt.service] || 25);
        }
      });

      const topServices = Object.entries(serviceCounts)
        .map(([service, count]) => ({
          service,
          count,
          revenue: serviceRevenue[service] || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top barbeiros
      const barberCounts: { [key: string]: number } = {};
      const barberRevenue: { [key: string]: number } = {};
      
      appointments?.forEach(apt => {
        if (apt.status === 'confirmado') {
          barberCounts[apt.barber] = (barberCounts[apt.barber] || 0) + 1;
          barberRevenue[apt.barber] = (barberRevenue[apt.barber] || 0) + (servicePrices[apt.service] || 25);
        }
      });

      const topBarbers = Object.entries(barberCounts)
        .map(([barber, appointments]) => ({
          barber,
          appointments,
          revenue: barberRevenue[barber] || 0
        }))
        .sort((a, b) => b.appointments - a.appointments)
        .slice(0, 5);

      setReportData({
        totalAppointments,
        totalRevenue,
        averageAppointmentValue,
        totalClients,
        completedAppointments,
        cancelledAppointments,
        monthlyData,
        topServices,
        topBarbers
      });

    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (appointments: any[]) => {
    const monthlyMap: { [key: string]: { appointments: number; revenue: number } } = {};
    
    appointments.forEach(apt => {
      const month = apt.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[month]) {
        monthlyMap[month] = { appointments: 0, revenue: 0 };
      }
      monthlyMap[month].appointments++;
      if (apt.status === 'confirmado') {
        const servicePrices: { [key: string]: number } = {
          'Corte': 25, 'Barba': 15, 'Corte + Barba': 35, 'Sobrancelha': 10, 'Pigmentação': 50
        };
        monthlyMap[month].revenue += servicePrices[apt.service] || 25;
      }
    });

    return Object.entries(monthlyMap)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const days = parseInt(newPeriod);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const csvContent = [
      ['Relatório BarberTime', ''],
      ['Período', `${dateRange.start} a ${dateRange.end}`],
      [''],
      ['Métricas Gerais', ''],
      ['Total de Agendamentos', reportData.totalAppointments],
      ['Agendamentos Concluídos', reportData.completedAppointments],
      ['Agendamentos Cancelados', reportData.cancelledAppointments],
      ['Total de Clientes', reportData.totalClients],
      ['Receita Total', `R$ ${reportData.totalRevenue.toFixed(2)}`],
      ['Ticket Médio', `R$ ${reportData.averageAppointmentValue.toFixed(2)}`],
      [''],
      ['Top Serviços', 'Quantidade', 'Receita'],
      ...reportData.topServices.map(s => [s.service, s.count, `R$ ${s.revenue.toFixed(2)}`]),
      [''],
      ['Top Barbeiros', 'Agendamentos', 'Receita'],
      ...reportData.topBarbers.map(b => [b.barber, b.appointments, `R$ ${b.revenue.toFixed(2)}`])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-barbertime-${dateRange.start}-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Nenhum dado encontrado para o período selecionado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de performance e métricas do negócio</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
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
          
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agendamentos</p>
                <p className="text-2xl font-bold">{reportData.totalAppointments}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">R$ {reportData.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {reportData.averageAppointmentValue.toFixed(2)}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Únicos</p>
                <p className="text-2xl font-bold">{reportData.totalClients}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {reportData.totalAppointments > 0 
                ? ((reportData.completedAppointments / reportData.totalAppointments) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-sm text-gray-600">
              {reportData.completedAppointments} de {reportData.totalAppointments} agendamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Cancelamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {reportData.totalAppointments > 0 
                ? ((reportData.cancelledAppointments / reportData.totalAppointments) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-sm text-gray-600">
              {reportData.cancelledAppointments} cancelamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agendamentos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {parseInt(period) > 0 
                ? (reportData.totalAppointments / parseInt(period)).toFixed(1)
                : 0}
            </div>
            <p className="text-sm text-gray-600">
              Média diária no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Services and Barbers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Serviços</CardTitle>
            <CardDescription>Serviços mais solicitados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topServices.map((service, index) => (
                <div key={service.service} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{service.count} agendamentos</div>
                    <div className="text-sm text-gray-600">R$ {service.revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Barbeiros</CardTitle>
            <CardDescription>Barbeiros com mais agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topBarbers.map((barber, index) => (
                <div key={barber.barber} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{barber.barber}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{barber.appointments} agendamentos</div>
                    <div className="text-sm text-gray-600">R$ {barber.revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Data */}
      {reportData.monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Mensais</CardTitle>
            <CardDescription>Evolução dos agendamentos e receita por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{month.month}</div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-blue-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {month.appointments} agendamentos
                    </div>
                    <div className="text-green-600">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      R$ {month.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsModern;
