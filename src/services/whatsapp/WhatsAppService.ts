import { supabase } from '@/lib/supabase';

export interface WhatsAppMessage {
  to: string;
  template: string;
  parameters: Record<string, string>;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  parameters: string[];
  category: 'appointment' | 'reminder' | 'promotion' | 'general';
}

class WhatsAppService {
  private apiUrl: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_WHATSAPP_API_URL || '';
    this.accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '';
  }

  /**
   * Envia mensagem de confirmação de agendamento
   */
  async sendAppointmentConfirmation(appointment: any): Promise<boolean> {
    try {
      const message = {
        to: appointment.client.phone,
        template: 'appointment_confirmation',
        parameters: {
          client_name: appointment.client.name,
          appointment_date: this.formatDate(appointment.date),
          appointment_time: appointment.startTime,
          barber_name: appointment.barber.name,
          services: appointment.services.map((s: any) => s.name).join(', '),
          total_value: `R$ ${appointment.totalValue.toFixed(2)}`,
          barbershop_name: 'BarberTime'
        }
      };

      return await this.sendTemplateMessage(message);
    } catch (error) {
      console.error('Erro ao enviar confirmação de agendamento:', error);
      return false;
    }
  }

  /**
   * Envia lembrete 24h antes do agendamento
   */
  async send24HourReminder(appointment: any): Promise<boolean> {
    try {
      const message = {
        to: appointment.client.phone,
        template: 'appointment_reminder_24h',
        parameters: {
          client_name: appointment.client.name,
          appointment_date: this.formatDate(appointment.date),
          appointment_time: appointment.startTime,
          barber_name: appointment.barber.name,
          services: appointment.services.map((s: any) => s.name).join(', '),
          barbershop_name: 'BarberTime'
        }
      };

      return await this.sendTemplateMessage(message);
    } catch (error) {
      console.error('Erro ao enviar lembrete 24h:', error);
      return false;
    }
  }

  /**
   * Envia lembrete 2h antes do agendamento
   */
  async send2HourReminder(appointment: any): Promise<boolean> {
    try {
      const message = {
        to: appointment.client.phone,
        template: 'appointment_reminder_2h',
        parameters: {
          client_name: appointment.client.name,
          appointment_time: appointment.startTime,
          barber_name: appointment.barber.name,
          barbershop_name: 'BarberTime'
        }
      };

      return await this.sendTemplateMessage(message);
    } catch (error) {
      console.error('Erro ao enviar lembrete 2h:', error);
      return false;
    }
  }

  /**
   * Envia mensagem de agradecimento pós-atendimento
   */
  async sendThankYouMessage(appointment: any): Promise<boolean> {
    try {
      const message = {
        to: appointment.client.phone,
        template: 'thank_you_message',
        parameters: {
          client_name: appointment.client.name,
          barber_name: appointment.barber.name,
          services: appointment.services.map((s: any) => s.name).join(', '),
          barbershop_name: 'BarberTime'
        }
      };

      return await this.sendTemplateMessage(message);
    } catch (error) {
      console.error('Erro ao enviar mensagem de agradecimento:', error);
      return false;
    }
  }

  /**
   * Envia promoção personalizada
   */
  async sendPromotion(clientPhone: string, promotion: any): Promise<boolean> {
    try {
      const message = {
        to: clientPhone,
        template: 'promotion',
        parameters: {
          client_name: promotion.clientName,
          promotion_title: promotion.title,
          promotion_description: promotion.description,
          promotion_discount: promotion.discount,
          promotion_valid_until: this.formatDate(promotion.validUntil),
          barbershop_name: 'BarberTime'
        }
      };

      return await this.sendTemplateMessage(message);
    } catch (error) {
      console.error('Erro ao enviar promoção:', error);
      return false;
    }
  }

  /**
   * Envia mensagem personalizada
   */
  async sendCustomMessage(phone: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar mensagem personalizada:', error);
      return false;
    }
  }

  /**
   * Envia mensagem usando template
   */
  private async sendTemplateMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/messages`, {
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
            language: { code: 'pt_BR' },
            components: [{
              type: 'body',
              parameters: Object.values(message.parameters).map(value => ({
                type: 'text',
                text: value
              }))
            }]
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar template:', error);
      return false;
    }
  }

  /**
   * Busca templates disponíveis
   */
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const response = await fetch(`${this.apiUrl}/message_templates`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      });

      if (!response.ok) throw new Error('Erro ao buscar templates');

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      return [];
    }
  }

  /**
   * Cria novo template
   */
  async createTemplate(template: Omit<WhatsAppTemplate, 'id'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/message_templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          category: template.category,
          language: 'pt_BR',
          components: [{
            type: 'BODY',
            text: template.content
          }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      return false;
    }
  }

  /**
   * Formata data para exibição
   */
  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(this.apiUrl && this.accessToken && this.phoneNumberId);
  }

  /**
   * Agenda envio de lembrete
   */
  async scheduleReminder(appointment: any, hoursBefore: number): Promise<boolean> {
    try {
      const appointmentDate = new Date(appointment.date + 'T' + appointment.startTime);
      const reminderDate = new Date(appointmentDate.getTime() - (hoursBefore * 60 * 60 * 1000));
      
      // Salva no banco para processamento posterior
      const { error } = await supabase
        .from('scheduled_messages')
        .insert({
          appointment_id: appointment.id,
          client_phone: appointment.client.phone,
          message_type: hoursBefore === 24 ? 'reminder_24h' : 'reminder_2h',
          scheduled_for: reminderDate.toISOString(),
          status: 'pending'
        });

      return !error;
    } catch (error) {
      console.error('Erro ao agendar lembrete:', error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();

