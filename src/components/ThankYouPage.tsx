import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { CheckCircle, Calendar, Clock, User, Phone, ArrowLeft, MessageCircle } from 'lucide-react';

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
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const appointmentData = location.state?.appointment;
    if (appointmentData) {
      setAppointment(appointmentData);
    } else {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Agendamento Confirmado!
          </h1>
          <p className="text-muted-foreground text-sm">
            Seu horário foi reservado com sucesso
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-0 bg-card">
          <CardContent className="p-6 space-y-4">
            {/* Appointment Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Data</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(appointment.date)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Horário</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {appointment.time}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Serviço</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {appointment.service_name}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Barbeiro</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {appointment.barber_name}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium text-sm">
                Status: {appointment.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                onClick={openWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Confirmar via WhatsApp
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>

            {/* Important Info */}
            <div className="pt-4 border-t border-border/50">
              <h3 className="font-medium text-foreground text-sm mb-3">
                Informações Importantes
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Chegue com 10 minutos de antecedência</p>
                <p>• Em caso de atraso, entre em contato</p>
                <p>• Para cancelar, avise com 2h de antecedência</p>
              </div>
            </div>

            {/* Countdown */}
            <div className="text-center text-xs text-muted-foreground pt-2">
              Redirecionando em {countdown}s
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Obrigado por escolher nossa barbearia! 💈
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
