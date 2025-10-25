import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  MessageSquare, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Save,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SystemSettings {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  businessWebsite: string;
  workingHours: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
  notifications: {
    emailNotifications: boolean;
    whatsappNotifications: boolean;
    smsNotifications: boolean;
    reminderHours: number;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    description: string;
    active: boolean;
  }>;
  barbers: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    specialties: string[];
    active: boolean;
  }>;
  whatsappMessages: {
    confirmation: string;
    reminder: string;
    cancellation: string;
    welcome: string;
  };
}

const SettingsModern = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    businessName: 'BarberTime',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    businessWebsite: '',
    workingHours: {
      monday: { start: '09:00', end: '18:00', enabled: true },
      tuesday: { start: '09:00', end: '18:00', enabled: true },
      wednesday: { start: '09:00', end: '18:00', enabled: true },
      thursday: { start: '09:00', end: '18:00', enabled: true },
      friday: { start: '09:00', end: '18:00', enabled: true },
      saturday: { start: '09:00', end: '17:00', enabled: true },
      sunday: { start: '09:00', end: '17:00', enabled: false }
    },
    notifications: {
      emailNotifications: true,
      whatsappNotifications: true,
      smsNotifications: false,
      reminderHours: 24
    },
    services: [
      { id: '1', name: 'Corte', price: 25, duration: 30, description: 'Corte de cabelo', active: true },
      { id: '2', name: 'Barba', price: 15, duration: 20, description: 'Aparar barba', active: true },
      { id: '3', name: 'Corte + Barba', price: 35, duration: 45, description: 'Corte completo', active: true }
    ],
    barbers: [
      { id: '1', name: 'João Silva', phone: '(11) 99999-9999', email: 'joao@barbertime.com', specialties: ['Corte', 'Barba'], active: true },
      { id: '2', name: 'Pedro Santos', phone: '(11) 88888-8888', email: 'pedro@barbertime.com', specialties: ['Corte', 'Barba'], active: true }
    ],
    whatsappMessages: {
      confirmation: 'Olá {nome}! Seu agendamento está confirmado para {data} às {hora} com {barbeiro}. Serviço: {servico}. Obrigado por escolher o BarberTime!',
      reminder: 'Olá {nome}! Lembrete: seu agendamento é amanhã às {hora} com {barbeiro}. Serviço: {servico}. Até logo!',
      cancellation: 'Olá {nome}! Seu agendamento de {data} às {hora} foi cancelado. Entre em contato para reagendar.',
      welcome: 'Olá {nome}! Bem-vindo ao BarberTime! Agende seu horário conosco.'
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('business');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Carregar configurações do Supabase (se existirem)
      // Por enquanto, usar configurações padrão
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // Salvar configurações no Supabase
      // Por enquanto, apenas simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      duration: 30,
      description: '',
      active: true
    };
    setSettings(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const updateService = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === id ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (id: string) => {
    setSettings(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== id)
    }));
  };

  const addBarber = () => {
    const newBarber = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      specialties: [],
      active: true
    };
    setSettings(prev => ({
      ...prev,
      barbers: [...prev.barbers, newBarber]
    }));
  };

  const updateBarber = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      barbers: prev.barbers.map(barber => 
        barber.id === id ? { ...barber, [field]: value } : barber
      )
    }));
  };

  const removeBarber = (id: string) => {
    setSettings(prev => ({
      ...prev,
      barbers: prev.barbers.filter(barber => barber.id !== id)
    }));
  };

  const updateWorkingHours = (day: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
          [field]: value
        }
      }
    }));
  };

  const updateWhatsAppMessage = (type: string, message: string) => {
    setSettings(prev => ({
      ...prev,
      whatsappMessages: {
        ...prev.whatsappMessages,
        [type]: message
      }
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
        
        <Button onClick={saveSettings} disabled={loading} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business">Negócio</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Informações do Negócio
              </CardTitle>
              <CardDescription>
                Configure as informações básicas da sua barbearia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Nome do Negócio</Label>
                  <Input
                    id="businessName"
                    value={settings.businessName}
                    onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="BarberTime"
                  />
                </div>
                <div>
                  <Label htmlFor="businessPhone">Telefone</Label>
                  <Input
                    id="businessPhone"
                    value={settings.businessPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, businessPhone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">E-mail</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, businessEmail: e.target.value }))}
                    placeholder="contato@barbertime.com"
                  />
                </div>
                <div>
                  <Label htmlFor="businessWebsite">Website</Label>
                  <Input
                    id="businessWebsite"
                    value={settings.businessWebsite}
                    onChange={(e) => setSettings(prev => ({ ...prev, businessWebsite: e.target.value }))}
                    placeholder="https://barbertime.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="businessAddress">Endereço</Label>
                <Textarea
                  id="businessAddress"
                  value={settings.businessAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, businessAddress: e.target.value }))}
                  placeholder="Rua das Flores, 123 - Centro"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horário de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(settings.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-24">
                      <Label className="capitalize">{day === 'monday' ? 'Segunda' : 
                        day === 'tuesday' ? 'Terça' :
                        day === 'wednesday' ? 'Quarta' :
                        day === 'thursday' ? 'Quinta' :
                        day === 'friday' ? 'Sexta' :
                        day === 'saturday' ? 'Sábado' : 'Domingo'}</Label>
                    </div>
                    <Switch
                      checked={hours.enabled}
                      onCheckedChange={(checked) => updateWorkingHours(day, 'enabled', checked)}
                    />
                    {hours.enabled && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.start}
                          onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                          className="w-32"
                        />
                        <span>até</span>
                        <Input
                          type="time"
                          value={hours.end}
                          onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Settings */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Serviços
              </CardTitle>
              <CardDescription>
                Gerencie os serviços oferecidos pela barbearia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.services.map((service) => (
                  <div key={service.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.active}
                          onCheckedChange={(checked) => updateService(service.id, 'active', checked)}
                        />
                        <Badge variant={service.active ? 'default' : 'secondary'}>
                          {service.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Nome do Serviço</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(service.id, 'name', e.target.value)}
                          placeholder="Corte de cabelo"
                        />
                      </div>
                      <div>
                        <Label>Preço (R$)</Label>
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="25.00"
                        />
                      </div>
                      <div>
                        <Label>Duração (min)</Label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(service.id, 'duration', parseInt(e.target.value) || 30)}
                          placeholder="30"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) => updateService(service.id, 'description', e.target.value)}
                        placeholder="Descrição do serviço..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                
                <Button onClick={addService} variant="outline" className="w-full">
                  Adicionar Serviço
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Barbers Settings */}
        <TabsContent value="barbers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Barbeiros
              </CardTitle>
              <CardDescription>
                Gerencie os barbeiros da barbearia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.barbers.map((barber) => (
                  <div key={barber.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={barber.active}
                          onCheckedChange={(checked) => updateBarber(barber.id, 'active', checked)}
                        />
                        <Badge variant={barber.active ? 'default' : 'secondary'}>
                          {barber.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBarber(barber.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={barber.name}
                          onChange={(e) => updateBarber(barber.id, 'name', e.target.value)}
                          placeholder="João Silva"
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={barber.phone}
                          onChange={(e) => updateBarber(barber.id, 'phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={barber.email}
                          onChange={(e) => updateBarber(barber.id, 'email', e.target.value)}
                          placeholder="joao@barbertime.com"
                        />
                      </div>
                      <div>
                        <Label>Especialidades</Label>
                        <Input
                          value={barber.specialties.join(', ')}
                          onChange={(e) => updateBarber(barber.id, 'specialties', e.target.value.split(', '))}
                          placeholder="Corte, Barba"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button onClick={addBarber} variant="outline" className="w-full">
                  Adicionar Barbeiro
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Configure como os clientes receberão notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-gray-600">Enviar confirmações por e-mail</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailNotifications: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por WhatsApp</Label>
                    <p className="text-sm text-gray-600">Enviar confirmações via WhatsApp</p>
                  </div>
                  <Switch
                    checked={settings.notifications.whatsappNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, whatsappNotifications: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-gray-600">Enviar confirmações por SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsNotifications: checked }
                    }))}
                  />
                </div>
                
                <div>
                  <Label>Horas de Antecedência para Lembrete</Label>
                  <Select
                    value={settings.notifications.reminderHours.toString()}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, reminderHours: parseInt(value) }
                    }))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora antes</SelectItem>
                      <SelectItem value="2">2 horas antes</SelectItem>
                      <SelectItem value="24">1 dia antes</SelectItem>
                      <SelectItem value="48">2 dias antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Settings */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Mensagens do WhatsApp
              </CardTitle>
              <CardDescription>
                Personalize as mensagens enviadas aos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Mensagem de Confirmação</Label>
                <Textarea
                  value={settings.whatsappMessages.confirmation}
                  onChange={(e) => updateWhatsAppMessage('confirmation', e.target.value)}
                  placeholder="Mensagem enviada quando o agendamento é confirmado"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{hora}'}, {'{barbeiro}'}, {'{servico}'}
                </p>
              </div>
              
              <div>
                <Label>Mensagem de Lembrete</Label>
                <Textarea
                  value={settings.whatsappMessages.reminder}
                  onChange={(e) => updateWhatsAppMessage('reminder', e.target.value)}
                  placeholder="Mensagem enviada como lembrete"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Mensagem de Cancelamento</Label>
                <Textarea
                  value={settings.whatsappMessages.cancellation}
                  onChange={(e) => updateWhatsAppMessage('cancellation', e.target.value)}
                  placeholder="Mensagem enviada quando o agendamento é cancelado"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Mensagem de Boas-vindas</Label>
                <Textarea
                  value={settings.whatsappMessages.welcome}
                  onChange={(e) => updateWhatsAppMessage('welcome', e.target.value)}
                  placeholder="Mensagem de boas-vindas para novos clientes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsModern;
