/**
 * Componente para testar automação WhatsApp
 * Permite testar mensagens com o número 38984375115
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { whatsappAutomationService } from '@/services/whatsapp/WhatsAppAutomationService';
import { MessageSquare, Send, TestTube, CheckCircle, XCircle } from 'lucide-react';

const WhatsAppTest = () => {
  const [testPhone, setTestPhone] = useState('38984375115');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTest, setLastTest] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConfirmation = async () => {
    setIsLoading(true);
    setLastTest(null);
    
    try {
      const success = await whatsappAutomationService.sendTestMessage(testPhone);
      
      if (success) {
        setLastTest({
          success: true,
          message: 'Mensagem de teste enviada com sucesso!'
        });
        toast.success('✅ Teste enviado com sucesso!');
      } else {
        setLastTest({
          success: false,
          message: 'Falha ao enviar mensagem de teste'
        });
        toast.error('❌ Falha no teste');
      }
    } catch (error) {
      setLastTest({
        success: false,
        message: `Erro: ${error}`
      });
      toast.error('❌ Erro no teste');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setLastTest(null);
    
    try {
      const isConnected = await whatsappAutomationService.testConnection();
      
      if (isConnected) {
        setLastTest({
          success: true,
          message: 'Conexão com WhatsApp funcionando!'
        });
        toast.success('✅ Conexão OK!');
      } else {
        setLastTest({
          success: false,
          message: 'Falha na conexão com WhatsApp'
        });
        toast.error('❌ Falha na conexão');
      }
    } catch (error) {
      setLastTest({
        success: false,
        message: `Erro de conexão: ${error}`
      });
      toast.error('❌ Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const serviceInfo = whatsappAutomationService.getServiceInfo();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Teste de Automação WhatsApp
          </CardTitle>
          <CardDescription>
            Teste a automação do WhatsApp com o número da barbearia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status do Serviço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status do Serviço</h3>
            <div className="flex items-center gap-4">
              <Badge variant={serviceInfo.configured ? "default" : "secondary"}>
                {serviceInfo.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {serviceInfo.configured ? 'Configurado' : 'Não configurado'}
              </span>
            </div>
          </div>

          {/* Configuração de Teste */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuração de Teste</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testPhone">Número para Teste</Label>
                <Input
                  id="testPhone"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="38984375115"
                />
                <p className="text-xs text-muted-foreground">
                  Número da barbearia para testes
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Teste */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Testes Disponíveis</h3>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleTestConnection}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Testar Conexão
              </Button>
              
              <Button
                onClick={handleTestConfirmation}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Mensagem de Teste
              </Button>
            </div>
          </div>

          {/* Resultado do Último Teste */}
          {lastTest && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Resultado do Teste</h3>
              <div className={`p-4 rounded-lg border ${
                lastTest.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {lastTest.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {lastTest.success ? 'Sucesso' : 'Falha'}
                  </span>
                </div>
                <p className="text-sm mt-1">{lastTest.message}</p>
              </div>
            </div>
          )}

          {/* Informações Importantes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Informações Importantes</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>WhatsApp Web:</strong> Abre uma nova aba para envio manual</li>
              <li>• <strong>WhatsApp Cloud API:</strong> Envio automático (requer configuração)</li>
              <li>• <strong>Número de teste:</strong> 38984375115 (barbearia)</li>
              <li>• <strong>Limite gratuito:</strong> 1.000 mensagens/mês (Cloud API)</li>
            </ul>
          </div>

          {/* Configuração Cloud API */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Para Configurar Cloud API</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>1. Acesse: <a href="https://developers.facebook.com/" target="_blank" className="underline">developers.facebook.com</a></p>
              <p>2. Crie um app WhatsApp Business</p>
              <p>3. Configure as variáveis de ambiente:</p>
              <div className="bg-yellow-100 p-2 rounded text-xs font-mono">
                VITE_WHATSAPP_ACCESS_TOKEN=seu_token<br/>
                VITE_WHATSAPP_PHONE_NUMBER_ID=seu_id<br/>
                VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=seu_id
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppTest;
