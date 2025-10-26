/**
 * WhatsApp Business Cloud API Service
 * Serviço gratuito para automação de mensagens
 */

interface WhatsAppMessage {
  to: string;
  template: string;
  language: string;
  components?: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

class WhatsAppCloudService {
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;
  private baseUrl: string = 'https://graph.facebook.com/v18.0';

  constructor() {
    // Configurações do WhatsApp Business Cloud
    this.accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '';
    this.businessAccountId = import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '';
  }

  /**
   * Envia mensagem de confirmação de agendamento
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
    try {
      const message: WhatsAppMessage = {
        to: this.formatPhoneNumber(clientPhone),
        template: 'appointment_confirmation',
        language: 'pt_BR',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: appointmentData.clientName },
              { type: 'text', text: appointmentData.serviceName },
              { type: 'text', text: appointmentData.barberName },
              { type: 'text', text: appointmentData.date },
              { type: 'text', text: appointmentData.time },
              { type: 'text', text: appointmentData.barbershopName }
            ]
          }
        ]
      };

      const response = await this.sendMessage(message);
      console.log('✅ Mensagem de confirmação enviada:', response);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar confirmação:', error);
      return false;
    }
  }

  /**
   * Envia lembrete de agendamento (24h antes)
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
    try {
      const message: WhatsAppMessage = {
        to: this.formatPhoneNumber(clientPhone),
        template: 'appointment_reminder',
        language: 'pt_BR',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: appointmentData.clientName },
              { type: 'text', text: appointmentData.serviceName },
              { type: 'text', text: appointmentData.barberName },
              { type: 'text', text: appointmentData.date },
              { type: 'text', text: appointmentData.time },
              { type: 'text', text: appointmentData.barbershopName }
            ]
          }
        ]
      };

      const response = await this.sendMessage(message);
      console.log('✅ Lembrete enviado:', response);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar lembrete:', error);
      return false;
    }
  }

  /**
   * Envia mensagem de cancelamento
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
    try {
      const message: WhatsAppMessage = {
        to: this.formatPhoneNumber(clientPhone),
        template: 'appointment_cancellation',
        language: 'pt_BR',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: appointmentData.clientName },
              { type: 'text', text: appointmentData.serviceName },
              { type: 'text', text: appointmentData.date },
              { type: 'text', text: appointmentData.time },
              { type: 'text', text: appointmentData.barbershopName }
            ]
          }
        ]
      };

      const response = await this.sendMessage(message);
      console.log('✅ Cancelamento enviado:', response);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar cancelamento:', error);
      return false;
    }
  }

  /**
   * Método principal para enviar mensagens
   */
  private async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('Configurações do WhatsApp não encontradas');
    }

    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.to,
        type: 'template',
        template: {
          name: message.template,
          language: {
            code: message.language
          },
          components: message.components
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API Error: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    return await response.json();
  }

  /**
   * Formata número de telefone para WhatsApp
   */
  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Adiciona código do país se necessário
    if (cleanPhone.length === 11 && cleanPhone.startsWith('38')) {
      return `55${cleanPhone}`;
    }
    
    if (cleanPhone.length === 10) {
      return `5538${cleanPhone}`;
    }
    
    return cleanPhone;
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId && this.businessAccountId);
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      return false;
    }
  }
}

export const whatsappCloudService = new WhatsAppCloudService();
export default whatsappCloudService;
