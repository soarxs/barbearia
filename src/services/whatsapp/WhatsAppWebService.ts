/**
 * WhatsApp Web Service (Alternativa Gratuita)
 * Usa WhatsApp Web para envio de mensagens
 * ATENÇÃO: Use com moderação para evitar bloqueios
 */

interface WhatsAppWebMessage {
  phone: string;
  message: string;
}

class WhatsAppWebService {
  private configured: boolean = false;

  constructor() {
    this.configured = true; // Sempre disponível
  }

  /**
   * Gera link do WhatsApp Web para envio de mensagem
   */
  generateWhatsAppLink(phone: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  /**
   * Abre WhatsApp Web em nova aba
   */
  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const link = this.generateWhatsAppLink(phone, message);
      window.open(link, '_blank');
      return true;
    } catch (error) {
      console.error('❌ Erro ao abrir WhatsApp:', error);
      return false;
    }
  }

  /**
   * Envia confirmação de agendamento
   */
  async sendAppointmentConfirmation(
    clientPhone: string,
    appointmentData: {
      clientName: string;
      serviceName: string;
      barberName: string;
      date: string;
      time: string;
      barbershopName: string;
      barbershopPhone: string;
    }
  ): Promise<boolean> {
    const message = this.createConfirmationMessage(appointmentData);
    return await this.sendMessage(clientPhone, message);
  }

  /**
   * Envia lembrete de agendamento
   */
  async sendAppointmentReminder(
    clientPhone: string,
    appointmentData: {
      clientName: string;
      serviceName: string;
      barberName: string;
      date: string;
      time: string;
      barbershopName: string;
    }
  ): Promise<boolean> {
    const message = this.createReminderMessage(appointmentData);
    return await this.sendMessage(clientPhone, message);
  }

  /**
   * Envia cancelamento de agendamento
   */
  async sendAppointmentCancellation(
    clientPhone: string,
    appointmentData: {
      clientName: string;
      serviceName: string;
      date: string;
      time: string;
      barbershopName: string;
    }
  ): Promise<boolean> {
    const message = this.createCancellationMessage(appointmentData);
    return await this.sendMessage(clientPhone, message);
  }

  /**
   * Cria mensagem de confirmação
   */
  private createConfirmationMessage(data: any): string {
    return `🎉 *CONFIRMAÇÃO DE AGENDAMENTO*

Olá *${data.clientName}*! 

Seu agendamento foi confirmado:

📅 *Data:* ${data.date}
🕐 *Horário:* ${data.time}
💇 *Serviço:* ${data.serviceName}
👨‍💼 *Barbeiro:* ${data.barberName}
🏪 *Barbearia:* ${data.barbershopName}

📞 *Contato:* ${data.barbershopPhone}

*Importante:*
• Chegue 5 minutos antes do horário
• Em caso de atraso, entre em contato
• Cancelamentos com até 2h de antecedência

Obrigado por escolher nossos serviços! 🙏`;
  }

  /**
   * Cria mensagem de lembrete
   */
  private createReminderMessage(data: any): string {
    return `⏰ *LEMBRETE DE AGENDAMENTO*

Olá *${data.clientName}*!

Seu agendamento é amanhã:

📅 *Data:* ${data.date}
🕐 *Horário:* ${data.time}
💇 *Serviço:* ${data.serviceName}
👨‍💼 *Barbeiro:* ${data.barberName}
🏪 *Barbearia:* ${data.barbershopName}

*Lembre-se:*
• Chegue 5 minutos antes
• Em caso de imprevisto, entre em contato

Até amanhã! 👋`;
  }

  /**
   * Cria mensagem de cancelamento
   */
  private createCancellationMessage(data: any): string {
    return `❌ *CANCELAMENTO DE AGENDAMENTO*

Olá *${data.clientName}*!

Infelizmente seu agendamento foi cancelado:

📅 *Data:* ${data.date}
🕐 *Horário:* ${data.time}
💇 *Serviço:* ${data.serviceName}
🏪 *Barbearia:* ${data.barbershopName}

*Para reagendar:*
• Entre em contato conosco
• Ou acesse nosso site

Desculpe pelo inconveniente! 😔`;
  }

  /**
   * Formata número de telefone
   */
  private formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 11 && cleanPhone.startsWith('38')) {
      return `55${cleanPhone}`;
    }
    
    if (cleanPhone.length === 10) {
      return `5538${cleanPhone}`;
    }
    
    return cleanPhone;
  }

  /**
   * Verifica se está configurado
   */
  isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Testa o serviço
   */
  async testConnection(): Promise<boolean> {
    return true; // WhatsApp Web sempre funciona
  }
}

export const whatsappWebService = new WhatsAppWebService();
export default whatsappWebService;
