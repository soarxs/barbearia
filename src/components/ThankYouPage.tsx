import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Calendar, Clock, User, Phone, MapPin, ArrowLeft } from 'lucide-react';

interface AppointmentData {
  id: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  barber_name: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

const ThankYouPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Pegar dados do agendamento da navegação
    const appointmentData = location.state?.appointment;
    if (appointmentData) {
      setAppointment(appointmentData);
    } else {
      // Se não houver dados, redirecionar para home
      navigate('/');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [countdown, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openWhatsApp = () => {
    if (appointment?.client_phone) {
      const message = `Olá! Confirmei meu agendamento para ${formatDate(appointment.date)} às ${appointment.time}. Obrigado!`;
      const phone = appointment.client_phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header com animação */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Agendamento Confirmado!
          </h1>
          <p className="text-xl text-muted-foreground">
            Seu horário foi reservado com sucesso
          </p>
        </div>

        {/* Card principal */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-foreground">
              Detalhes do Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações do agendamento */}
            <div className="grid gap-4">
              <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {formatDate(appointment.date)}
                  </p>
                  <p className="text-sm text-muted-foreground">Data do agendamento</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {appointment.time}
                  </p>
                  <p className="text-sm text-muted-foreground">Horário agendado</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {appointment.service_name}
                  </p>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {appointment.barber_name}
                  </p>
                  <p className="text-sm text-muted-foreground">Profissional</p>
                </div>
              </div>

              {appointment.client_phone && (
                <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {appointment.client_phone}
                    </p>
                    <p className="text-sm text-muted-foreground">Telefone de contato</p>
                  </div>
                </div>
              )}

              {appointment.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Observação:</strong> {appointment.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Status do agendamento */}
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">
                Status: {appointment.status === 'confirmado' ? 'Confirmado' : 'Pendente de Confirmação'}
              </p>
              {appointment.status !== 'confirmado' && (
                <p className="text-sm text-green-600 mt-1">
                  Aguardando confirmação da barbearia
                </p>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={openWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Confirmar via WhatsApp
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>

            {/* Informações importantes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Informações Importantes:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Chegue com 10 minutos de antecedência</li>
                <li>• Em caso de atraso, entre em contato conosco</li>
                <li>• Para cancelar, avise com pelo menos 2 horas de antecedência</li>
                <li>• Traga um documento com foto para identificação</li>
              </ul>
            </div>

            {/* Contador para redirecionamento */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Você será redirecionado automaticamente em {countdown} segundos</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Obrigado por escolher nossa barbearia! 💈
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
