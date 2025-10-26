import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  User,
  Zap,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Bell,
  BarChart3
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  shortcut?: string;
}

interface QuickActionsProps {
  onNewAppointment: () => void;
  onSendReminders: () => void;
  onViewReports: () => void;
  onSettings: () => void;
  services: string[];
  barbers: string[];
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onNewAppointment,
  onSendReminders,
  onViewReports,
  onSettings,
  services,
  barbers
}) => {
  const [isQuickAppointmentOpen, setIsQuickAppointmentOpen] = useState(false);
  const [quickAppointment, setQuickAppointment] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
    barber: '',
    time: '',
    date: new Date().toISOString().split('T')[0]
  });

  const quickActions: QuickAction[] = [
    {
      id: 'new-appointment',
      title: 'Novo Agendamento',
      description: 'Agendar cliente rapidamente',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => setIsQuickAppointmentOpen(true),
      shortcut: '⌘N'
    },
    {
      id: 'send-reminders',
      title: 'Enviar Lembretes',
      description: 'WhatsApp automático',
      icon: MessageSquare,
      color: 'bg-green-600 hover:bg-green-700',
      action: onSendReminders,
      shortcut: '⌘R'
    },
    {
      id: 'view-reports',
      title: 'Relatórios',
      description: 'Análises e métricas',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: onViewReports,
      shortcut: '⌘R'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Ajustes do sistema',
      icon: Settings,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: onSettings,
      shortcut: '⌘,'
    }
  ];

  const handleQuickAppointment = () => {
    if (quickAppointment.clientName && quickAppointment.clientPhone && quickAppointment.service && quickAppointment.barber && quickAppointment.time) {
      // Implementar criação rápida do agendamento
      console.log('Criando agendamento rápido:', quickAppointment);
      setIsQuickAppointmentOpen(false);
      setQuickAppointment({
        clientName: '',
        clientPhone: '',
        service: '',
        barber: '',
        time: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col space-y-3">
          {/* Botão principal flutuante */}
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            onClick={() => setIsQuickAppointmentOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>

          {/* Ações rápidas secundárias */}
          <div className="flex flex-col space-y-2">
            {quickActions.slice(1).map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  size="sm"
                  className={`${action.color} text-white w-12 h-12 rounded-full shadow-lg`}
                  onClick={action.action}
                  title={`${action.title} (${action.shortcut})`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de agendamento rápido */}
      <Dialog open={isQuickAppointmentOpen} onOpenChange={setIsQuickAppointmentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Agendamento Rápido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quickClientName">Nome</Label>
                <Input
                  id="quickClientName"
                  value={quickAppointment.clientName}
                  onChange={(e) => setQuickAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="quickClientPhone">Telefone</Label>
                <Input
                  id="quickClientPhone"
                  value={quickAppointment.clientPhone}
                  onChange={(e) => setQuickAppointment(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quickService">Serviço</Label>
                <Select value={quickAppointment.service} onValueChange={(value) => setQuickAppointment(prev => ({ ...prev, service: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quickBarber">Barbeiro</Label>
                <Select value={quickAppointment.barber} onValueChange={(value) => setQuickAppointment(prev => ({ ...prev, barber: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Barbeiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.map(barber => (
                      <SelectItem key={barber} value={barber}>{barber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quickDate">Data</Label>
                <Input
                  id="quickDate"
                  type="date"
                  value={quickAppointment.date}
                  onChange={(e) => setQuickAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="quickTime">Horário</Label>
                <Input
                  id="quickTime"
                  type="time"
                  value={quickAppointment.time}
                  onChange={(e) => setQuickAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleQuickAppointment}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agendar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsQuickAppointmentOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;
