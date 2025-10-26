import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Clock, 
  User, 
  Search,
  Plus,
  Settings,
  History,
  FileText,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Filter,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Video,
  PhoneCall
} from 'lucide-react';
import { whatsappAutomationService } from '@/services/whatsapp/WhatsAppAutomationService';
import { supabase } from '@/lib/supabase';

interface WhatsAppMessage {
  id: string;
  phone: string;
  clientName: string;
  message: string;
  type: 'sent' | 'received';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: 'appointment' | 'reminder' | 'promotion' | 'general';
}

const WhatsAppPanel = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'general' as const
  });

  // Templates padrão
  const defaultTemplates: WhatsAppTemplate[] = [
    {
      id: '1',
      name: 'Confirmação de Agendamento',
      content: 'Olá {clientName}! Seu agendamento para {date} às {time} com {barber} está confirmado. Serviço: {service}. Obrigado por escolher nossa barbearia!',
      category: 'appointment'
    },
    {
      id: '2',
      name: 'Lembrete de Agendamento',
      content: 'Olá {clientName}! Lembrete: seu agendamento é amanhã ({date}) às {time} com {barber}. Serviço: {service}. Aguardamos você!',
      category: 'reminder'
    },
    {
      id: '3',
      name: 'Cancelamento de Agendamento',
      content: 'Olá {clientName}! Seu agendamento para {date} às {time} foi cancelado. Entre em contato conosco para reagendar. Obrigado!',
      category: 'appointment'
    },
    {
      id: '4',
      name: 'Promoção Especial',
      content: 'Olá {clientName}! Temos uma promoção especial para você: {promotion}. Válida até {validUntil}. Agende já!',
      category: 'promotion'
    },
    {
      id: '5',
      name: 'Mensagem Geral',
      content: 'Olá {clientName}! Como podemos ajudá-lo hoje?',
      category: 'general'
    }
  ];

  useEffect(() => {
    setTemplates(defaultTemplates);
    fetchRecentMessages();
  }, []);

  const fetchRecentMessages = async () => {
    try {
      // Simular mensagens recentes (em produção, viria do banco)
      const mockMessages: WhatsAppMessage[] = [
        {
          id: '1',
          phone: '38984375115',
          clientName: 'João Silva',
          message: 'Olá, gostaria de agendar um corte para amanhã',
          type: 'received',
          timestamp: new Date().toISOString(),
          status: 'read'
        },
        {
          id: '2',
          phone: '38984375115',
          clientName: 'João Silva',
          message: 'Claro! Que horário prefere? Temos disponível às 14h, 15h ou 16h.',
          type: 'sent',
          timestamp: new Date().toISOString(),
          status: 'delivered'
        },
        {
          id: '3',
          phone: '38984375116',
          clientName: 'Maria Santos',
          message: 'Obrigada pelo atendimento hoje!',
          type: 'received',
          timestamp: new Date().toISOString(),
          status: 'read'
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return;

    setIsLoading(true);
    try {
      const success = await whatsappAutomationService.sendCustomMessage(selectedClient, newMessage);
      
      if (success) {
        const newMsg: WhatsAppMessage = {
          id: Date.now().toString(),
          phone: selectedClient,
          clientName: messages.find(m => m.phone === selectedClient)?.clientName || 'Cliente',
          message: newMessage,
          type: 'sent',
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        
        setMessages(prev => [newMsg, ...prev]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTemplate = async (template: WhatsAppTemplate) => {
    if (!selectedClient) return;

    setIsLoading(true);
    try {
      // Substituir variáveis no template
      let content = template.content;
      content = content.replace(/{clientName}/g, 'Cliente');
      content = content.replace(/{date}/g, new Date().toLocaleDateString('pt-BR'));
      content = content.replace(/{time}/g, '14:00');
      content = content.replace(/{barber}/g, 'Carlos');
      content = content.replace(/{service}/g, 'Corte Masculino');

      const success = await whatsappAutomationService.sendCustomMessage(selectedClient, content);
      
      if (success) {
        const newMsg: WhatsAppMessage = {
          id: Date.now().toString(),
          phone: selectedClient,
          clientName: 'Cliente',
          message: content,
          type: 'sent',
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        
        setMessages(prev => [newMsg, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao enviar template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplate = () => {
    if (newTemplate.name && newTemplate.content) {
      const template: WhatsAppTemplate = {
        id: Date.now().toString(),
        ...newTemplate
      };
      setTemplates(prev => [...prev, template]);
      setNewTemplate({ name: '', content: '', category: 'general' });
      setIsTemplateDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'read': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'promotion': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueClients = Array.from(new Set(messages.map(msg => msg.phone)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Business</h1>
          <p className="text-gray-600">Gerencie conversas e envie mensagens</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Online
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Conversas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Conversas
              </span>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2 mt-4">
                {uniqueClients.map(phone => {
                  const clientMessages = messages.filter(m => m.phone === phone);
                  const lastMessage = clientMessages[0];
                  const unreadCount = clientMessages.filter(m => m.type === 'received' && m.status !== 'read').length;
                  
                  return (
                    <div
                      key={phone}
                      onClick={() => setSelectedClient(phone)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedClient === phone 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{lastMessage?.clientName || 'Cliente'}</p>
                            <p className="text-xs text-gray-500">{phone}</p>
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {lastMessage?.message || 'Nenhuma mensagem'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                {selectedClient ? `Conversa com ${messages.find(m => m.phone === selectedClient)?.clientName || 'Cliente'}` : 'Selecione uma conversa'}
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Video className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="space-y-4">
                {/* Mensagens */}
                <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
                  {filteredMessages
                    .filter(msg => msg.phone === selectedClient)
                    .map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            msg.type === 'sent'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-900 border'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {msg.type === 'sent' && (
                              <div className="ml-2">
                                {getStatusIcon(msg.status)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Input de Mensagem */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecione uma conversa para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Templates de Mensagens
            </span>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Nome do Template</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Confirmação de Agendamento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateCategory">Categoria</Label>
                    <Select value={newTemplate.category} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment">Agendamento</SelectItem>
                        <SelectItem value="reminder">Lembrete</SelectItem>
                        <SelectItem value="promotion">Promoção</SelectItem>
                        <SelectItem value="general">Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="templateContent">Conteúdo</Label>
                    <textarea
                      id="templateContent"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Digite o conteúdo do template..."
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddTemplate} className="flex-1">
                      Criar Template
                    </Button>
                    <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                    {template.content}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendTemplate(template)}
                      disabled={!selectedClient}
                      className="flex-1"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Enviar
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppPanel;
