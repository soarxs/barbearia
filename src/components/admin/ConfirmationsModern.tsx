import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea'; // Componente não existe
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Phone, 
  User, 
  Calendar,
  Send,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ConfirmationRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  message?: string;
  requestedAt: string;
}

const ConfirmationsModern = () => {
  const [confirmations, setConfirmations] = useState<ConfirmationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfirmation, setSelectedConfirmation] = useState<ConfirmationRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    fetchConfirmations();
  }, []);

  const fetchConfirmations = async () => {
    try {
      setLoading(true);
      
      // Buscar agendamentos que precisam de confirmação
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .in('status', ['pending', 'confirmed', 'cancelled'])
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      const formattedConfirmations = data?.map(apt => ({
        id: apt.id,
        clientName: apt.client_name,
        clientPhone: apt.client_phone,
        service: apt.service,
        barber: apt.barber,
        date: new Date(apt.date).toLocaleDateString('pt-BR'),
        time: apt.time,
        status: apt.status,
        message: apt.notes || 'Aguardando confirmação',
        requestedAt: apt.created_at || new Date().toISOString()
      })) || [];

      setConfirmations(formattedConfirmations);
    } catch (error) {
      console.error('Erro ao buscar confirmações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const handleStatusChange = async (confirmationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', confirmationId);

      if (error) throw error;

      // Atualizar estado local
      setConfirmations(prev => prev.map(confirmation => 
        confirmation.id === confirmationId 
          ? { ...confirmation, status: newStatus as any }
          : confirmation
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const sendWhatsAppMessage = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const generateConfirmationMessage = (confirmation: ConfirmationRequest) => {
    return `Olá ${confirmation.clientName}! Confirmação do seu agendamento para ${confirmation.date} às ${confirmation.time} com ${confirmation.barber}. Serviço: ${confirmation.service}. Por favor, confirme sua presença. Obrigado!`;
  };

  const generateReminderMessage = (confirmation: ConfirmationRequest) => {
    return `Olá ${confirmation.clientName}! Lembrete: seu agendamento é amanhã (${confirmation.date}) às ${confirmation.time} com ${confirmation.barber}. Serviço: ${confirmation.service}. Aguardamos você!`;
  };

  const handleSendConfirmation = (confirmation: ConfirmationRequest) => {
    const message = customMessage || generateConfirmationMessage(confirmation);
    sendWhatsAppMessage(confirmation.clientPhone, message);
    setCustomMessage('');
    setIsDialogOpen(false);
  };

  const handleSendReminder = (confirmation: ConfirmationRequest) => {
    const message = generateReminderMessage(confirmation);
    sendWhatsAppMessage(confirmation.clientPhone, message);
  };

  const pendingCount = confirmations.filter(c => c.status === 'pending').length;
  const confirmedCount = confirmations.filter(c => c.status === 'confirmed').length;
  const cancelledCount = confirmations.filter(c => c.status === 'cancelled').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Confirmações</h1>
          <p className="text-gray-600">Gerencie confirmações e lembretes de agendamentos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
            <MessageSquare className="w-4 h-4 mr-2" />
            Enviar Lembretes
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            Nova Confirmação
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Solicitações de Confirmação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {confirmations.map((confirmation) => (
              <Card key={confirmation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{confirmation.clientName}</h3>
                        <Badge className={getStatusColor(confirmation.status)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(confirmation.status)}
                            <span>{getStatusText(confirmation.status)}</span>
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{confirmation.date} às {confirmation.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{confirmation.barber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{confirmation.clientPhone}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Serviço:</span> {confirmation.service}
                        </div>
                        {confirmation.message && (
                          <div className="col-span-2">
                            <span className="font-medium">Observação:</span> {confirmation.message}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {confirmation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedConfirmation(confirmation);
                              setIsDialogOpen(true);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleStatusChange(confirmation.id, 'cancelled')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendReminder(confirmation)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Lembrete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Confirmação Personalizada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customMessage">Mensagem Personalizada</Label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => selectedConfirmation && handleSendConfirmation(selectedConfirmation)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfirmationsModern;
