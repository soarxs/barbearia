# 📱 Guia de Configuração WhatsApp - Automação Gratuita

## 🚀 **OPÇÃO 1: WhatsApp Web (MAIS FÁCIL - SEMPRE FUNCIONA)**

### ✅ **Vantagens:**
- **100% Gratuito** e ilimitado
- **Configuração em 0 segundos**
- **Sempre funciona** (não precisa de API)
- **Ideal para testes** e aprendizado

### ⚙️ **Como Funciona:**
1. Quando um agendamento é criado
2. Sistema abre automaticamente WhatsApp Web
3. Mensagem pré-formatada aparece
4. Você clica "Enviar" manualmente

### 🎯 **Para Usar:**
- **Não precisa configurar nada!**
- Já está funcionando
- Teste na aba "WhatsApp Test" do admin

---

## 🌟 **OPÇÃO 2: WhatsApp Cloud API (AUTOMÁTICO)**

### ✅ **Vantagens:**
- **Envio 100% automático**
- **1.000 mensagens/mês GRÁTIS**
- **Templates profissionais**
- **Webhooks** para confirmações

### ⚙️ **Configuração Passo a Passo:**

#### **1️⃣ Criar App no Facebook Developers**
1. Acesse: https://developers.facebook.com/
2. Clique em "Meus Apps" → "Criar App"
3. Escolha "Negócios" → "WhatsApp"
4. Preencha os dados da sua barbearia

#### **2️⃣ Configurar WhatsApp Business**
1. No painel do app, vá em "WhatsApp" → "Configuração"
2. Adicione seu número de telefone
3. Verifique o número via SMS
4. Anote o **Phone Number ID**

#### **3️⃣ Obter Token de Acesso**
1. Vá em "WhatsApp" → "Configuração"
2. Clique em "Gerar Token"
3. Copie o **Access Token**
4. Anote o **Business Account ID**

#### **4️⃣ Configurar Variáveis de Ambiente**
1. Copie o arquivo `whatsapp-config-example.env`
2. Renomeie para `.env`
3. Preencha com seus dados:

```env
VITE_WHATSAPP_ACCESS_TOKEN=seu_token_aqui
VITE_WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_id_aqui
```

#### **5️⃣ Criar Templates de Mensagem**
1. No painel do WhatsApp, vá em "Templates"
2. Crie os templates:

**Template: `appointment_confirmation`**
```
🎉 *CONFIRMAÇÃO DE AGENDAMENTO*

Olá *{{1}}*! 

Seu agendamento foi confirmado:

📅 *Data:* {{2}}
🕐 *Horário:* {{3}}
💇 *Serviço:* {{4}}
👨‍💼 *Barbeiro:* {{5}}
🏪 *Barbearia:* {{6}}

📞 *Contato:* {{7}}

*Importante:*
• Chegue 5 minutos antes do horário
• Em caso de atraso, entre em contato
• Cancelamentos com até 2h de antecedência

Obrigado por escolher nossos serviços! 🙏
```

**Template: `appointment_reminder`**
```
⏰ *LEMBRETE DE AGENDAMENTO*

Olá *{{1}}*!

Seu agendamento é amanhã:

📅 *Data:* {{2}}
🕐 *Horário:* {{3}}
💇 *Serviço:* {{4}}
👨‍💼 *Barbeiro:* {{5}}
🏪 *Barbearia:* {{6}}

*Lembre-se:*
• Chegue 5 minutos antes
• Em caso de imprevisto, entre em contato

Até amanhã! 👋
```

**Template: `appointment_cancellation`**
```
❌ *CANCELAMENTO DE AGENDAMENTO*

Olá *{{1}}*!

Infelizmente seu agendamento foi cancelado:

📅 *Data:* {{2}}
🕐 *Horário:* {{3}}
💇 *Serviço:* {{4}}
🏪 *Barbearia:* {{5}}

*Para reagendar:*
• Entre em contato conosco
• Ou acesse nosso site

Desculpe pelo inconveniente! 😔
```

#### **6️⃣ Testar Configuração**
1. Reinicie o servidor: `npm run dev`
2. Acesse admin → "WhatsApp Test"
3. Clique em "Testar Conexão"
4. Se aparecer "✅ Conexão OK!", está funcionando!

---

## 🧪 **TESTANDO A AUTOMAÇÃO**

### **Com WhatsApp Web (Atual):**
1. Acesse admin → "WhatsApp Test"
2. Clique em "Enviar Mensagem de Teste"
3. Nova aba abre com WhatsApp Web
4. Mensagem pré-formatada aparece
5. Clique "Enviar"

### **Com Cloud API (Após configuração):**
1. Acesse admin → "WhatsApp Test"
2. Clique em "Testar Conexão"
3. Deve aparecer "✅ Conexão OK!"
4. Clique em "Enviar Mensagem de Teste"
5. Mensagem é enviada automaticamente!

---

## 📊 **LIMITES E CUSTOS**

### **WhatsApp Web:**
- ✅ **Gratuito** e ilimitado
- ⚠️ **Manual** (você precisa clicar "Enviar")
- ✅ **Sempre funciona**

### **WhatsApp Cloud API:**
- ✅ **1.000 mensagens/mês GRÁTIS**
- ✅ **Automático** (sem intervenção)
- 💰 **R$ 0,10/mensagem** após limite
- ⚠️ **Requer configuração**

---

## 🎯 **RECOMENDAÇÃO**

### **Para Testes e Aprendizado:**
- Use **WhatsApp Web** (já está funcionando)
- Simples e gratuito
- Perfeito para entender como funciona

### **Para Produção:**
- Configure **Cloud API** quando estiver pronto
- Automação completa
- Profissional e confiável

---

## 🆘 **PROBLEMAS COMUNS**

### **"Erro ao testar conexão"**
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o token não expirou
- Teste no painel do Facebook Developers

### **"Mensagem não enviada"**
- Verifique se o template foi aprovado
- Confirme se o número está no formato correto
- Teste com seu próprio número primeiro

### **"WhatsApp Web não abre"**
- Verifique se o navegador permite pop-ups
- Teste em modo incógnito
- Confirme se o número está correto

---

## 📞 **SUPORTE**

Se precisar de ajuda:
1. Teste primeiro com WhatsApp Web
2. Verifique os logs no console do navegador
3. Use a aba "WhatsApp Test" para diagnosticar
4. Configure Cloud API apenas quando necessário

**Lembre-se: O sistema já funciona com WhatsApp Web!** 🚀
