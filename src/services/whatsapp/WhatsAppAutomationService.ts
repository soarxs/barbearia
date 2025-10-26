/**
 * WhatsApp Automation Service
 * Serviço principal para automação de mensagens
 * Escolhe automaticamente entre Cloud API e Web API
 */

import { whatsappCloudService } from './WhatsAppCloudService';
import { whatsappWebService } from './WhatsAppWebService';
import { toast } from 'sonner';

interface AppointmentData {
  clientName: string;
  clientPhone: string;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  barbershopName: string;
  barbershopPhone: string;
}

class WhatsAppAutomationService {
  private useCloudAPI: boolean = false;

  constructor() {
    // Verifica se Cloud API está configurada
    this.useCloudAPI = whatsappCloudService.isConfigured();
    
    if (this.useCloudAPI) {
      console.log('🚀 Usando WhatsApp Cloud API');
    } else {
      console.log('🌐 Usando WhatsApp Web API');
    }
  }

  /**
   * Envia confirmação automática de agendamento
   */
  async sendAppointmentConfirmation(appointmentData: AppointmentData): Promise<boolean> {
    try {
      console.log('📱 Enviando confirmação de agendamento...', appointmentData);
      
      let success = false;
      
      if (this.useCloudAPI) {
        success = await whatsappCloudService.sendAppointmentConfirmation(
          appointmentData.clientPhone,
          appointmentData
        );
      } else {
        success = await whatsappWebService.sendAppointmentConfirmation(
          appointmentData.clientPhone,
          appointmentData
        );
      }

      if (success) {
        toast.success(`✅ Confirmação enviada para ${appointmentData.clientName}`);
        console.log('✅ Confirmação enviada com sucesso');
      } else {
        toast.error('❌ Erro ao enviar confirmação');
        console.error('❌ Falha ao enviar confirmação');
      }

      return success;
    } catch (error) {
      console.error('❌ Erro na automação:', error);
      toast.error('❌ Erro na automação do WhatsApp');
      return false;
    }
  }

  /**
   * Envia lembrete de agendamento
   */
  async sendAppointmentReminder(appointmentData: AppointmentData): Promise<boolean> {
    try {
      console.log('⏰ Enviando lembrete de agendamento...', appointmentData);
      
      let success = false;
      
      if (this.useCloudAPI) {
        success = await whatsappCloudService.sendAppointmentReminder(
          appointmentData.clientPhone,
          appointmentData
        );
      } else {
        success = await whatsappWebService.sendAppointmentReminder(
          appointmentData.clientPhone,
          appointmentData
        );
      }

      if (success) {
        toast.success(`⏰ Lembrete enviado para ${appointmentData.clientName}`);
        console.log('✅ Lembrete enviado com sucesso');
      } else {
        toast.error('❌ Erro ao enviar lembrete');
        console.error('❌ Falha ao enviar lembrete');
      }

      return success;
    } catch (error) {
      console.error('❌ Erro no lembrete:', error);
      toast.error('❌ Erro no lembrete do WhatsApp');
      return false;
    }
  }

  /**
   * Envia cancelamento de agendamento
   */
  async sendAppointmentCancellation(appointmentData: AppointmentData): Promise<boolean> {
    try {
      console.log('❌ Enviando cancelamento...', appointmentData);
      
      let success = false;
      
      if (this.useCloudAPI) {
        success = await whatsappCloudService.sendAppointmentCancellation(
          appointmentData.clientPhone,
          appointmentData
        );
      } else {
        success = await whatsappWebService.sendAppointmentCancellation(
          appointmentData.clientPhone,
          appointmentData
        );
      }

      if (success) {
        toast.success(`❌ Cancelamento enviado para ${appointmentData.clientName}`);
        console.log('✅ Cancelamento enviado com sucesso');
      } else {
        toast.error('❌ Erro ao enviar cancelamento');
        console.error('❌ Falha ao enviar cancelamento');
      }

      return success;
    } catch (error) {
      console.error('❌ Erro no cancelamento:', error);
      toast.error('❌ Erro no cancelamento do WhatsApp');
      return false;
    }
  }

  /**
   * Testa a conexão com WhatsApp
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.useCloudAPI) {
        return await whatsappCloudService.testConnection();
      } else {
        return await whatsappWebService.testConnection();
      }
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      return false;
    }
  }

  /**
   * Verifica qual serviço está sendo usado
   */
  getServiceInfo(): { type: string; configured: boolean } {
    return {
      type: this.useCloudAPI ? 'Cloud API' : 'Web API',
      configured: this.useCloudAPI ? whatsappCloudService.isConfigured() : whatsappWebService.isConfigured()
    };
  }

  /**
   * Configura o serviço para usar Cloud API
   */
  enableCloudAPI(): void {
    this.useCloudAPI = true;
    console.log('🚀 Cloud API habilitada');
  }

  /**
   * Configura o serviço para usar Web API
   */
  enableWebAPI(): void {
    this.useCloudAPI = false;
    console.log('🌐 Web API habilitada');
  }

  /**
   * Envia mensagem de teste
   */
  async sendTestMessage(phone: string): Promise<boolean> {
    const testData: AppointmentData = {
      clientName: 'Cliente Teste',
      clientPhone: phone,
      serviceName: 'Corte + Barba',
      barberName: 'João Silva',
      date: '25/12/2024',
      time: '14:00',
      barbershopName: 'Barbearia Teste',
      barbershopPhone: '38984375115'
    };

    return await this.sendAppointmentConfirmation(testData);
  }
}

export const whatsappAutomationService = new WhatsAppAutomationService();
export default whatsappAutomationService;
