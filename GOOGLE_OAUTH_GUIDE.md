# 🔐 Guia Completo - Google OAuth Setup

## 📋 **PASSO A PASSO COMPLETO**

### **1️⃣ CONFIGURAR NO GOOGLE CONSOLE**

#### **Passo 1: Acessar Google Console**
1. **Acesse**: https://console.developers.google.com/
2. **Faça login** com sua conta Google

#### **Passo 2: Criar/Selecionar Projeto**
1. **Clique em "Selecionar projeto"** (canto superior esquerdo)
2. **Clique em "Novo projeto"**
3. **Nome do projeto**: `BarberTime Admin` (ou qualquer nome)
4. **Clique em "Criar"**

#### **Passo 3: Habilitar APIs**
1. **Vá em "APIs & Services" > "Library"**
2. **Procure por "Google+ API"**
3. **Clique em "Google+ API"**
4. **Clique em "HABILITAR"**

#### **Passo 4: Criar Credenciais OAuth**
1. **Vá em "APIs & Services" > "Credentials"**
2. **Clique em "Create Credentials"**
3. **Selecione "OAuth 2.0 Client IDs"**
4. **Se for a primeira vez, configure a tela de consentimento:**
   - **User Type**: External
   - **App name**: `BarberTime Admin`
   - **User support email**: `guilhermesf.beasss@gmail.com`
   - **Developer contact**: `guilhermesf.beasss@gmail.com`
   - **Clique em "Save and Continue"**
   - **Scopes**: Adicione `email`, `profile`, `openid`
   - **Clique em "Save and Continue"**
   - **Test users**: Adicione `guilhermesf.beasss@gmail.com`
   - **Clique em "Save and Continue"**

#### **Passo 5: Configurar OAuth Client**
1. **Application type**: Web application
2. **Name**: `BarberTime Admin Web`
3. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://seudominio.com` (para produção)
4. **Authorized redirect URIs**:
   - `http://localhost:3000/auth/callback`
   - `https://sxusbwqncilzkkboxyxt.supabase.co/auth/v1/callback`
   - `https://seudominio.com/auth/callback` (para produção)
5. **Clique em "Create"**

#### **Passo 6: Copiar Credenciais**
1. **Copie o "Client ID"** (algo como: `123456789-abcdefg.apps.googleusercontent.com`)
2. **Copie o "Client Secret"** (algo como: `GOCSPX-abcdefghijklmnop`)
3. **Guarde essas informações!**

---

### **2️⃣ CONFIGURAR NO SUPABASE**

#### **Passo 1: Acessar Configurações de Auth**
1. **Acesse**: https://supabase.com/dashboard/project/sxusbwqncilzkkboxyxt/auth/providers
2. **Faça login** no Supabase

#### **Passo 2: Configurar Google Provider**
1. **Clique em "Google"**
2. **Habilite o toggle "Enable sign in with Google"**
3. **Cole o Client ID** (copiado do Google Console)
4. **Cole o Client Secret** (copiado do Google Console)
5. **Clique em "Save"**

#### **Passo 3: Configurar URLs de Redirecionamento**
1. **Acesse**: https://supabase.com/dashboard/project/sxusbwqncilzkkboxyxt/auth/url-configuration
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs** (adicione uma por vez):
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/admin/agenda`
   - `https://seudominio.com/auth/callback` (para produção)
   - `https://seudominio.com/admin/agenda` (para produção)

---

### **3️⃣ EXECUTAR SQL NO SUPABASE**

#### **Passo 1: Acessar SQL Editor**
1. **Acesse**: https://supabase.com/dashboard/project/sxusbwqncilzkkboxyxt/sql
2. **Clique em "New query"**

#### **Passo 2: Executar SQL de Configuração**
```sql
-- Tabela para gerenciar usuários aprovados
CREATE TABLE IF NOT EXISTS approved_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir usuário principal aprovado
INSERT INTO approved_users (email, name, role, is_approved) 
VALUES ('guilhermesf.beasss@gmail.com', 'Guilherme - Admin Principal', 'admin', true)
ON CONFLICT (email) DO UPDATE SET 
  is_approved = true,
  updated_at = NOW();

-- Tabela para logs de tentativas de acesso
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  attempt_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  is_read BOOLEAN DEFAULT false,
  action_taken BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Admins can view all approved users" ON approved_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approved_users au 
      WHERE au.email = auth.jwt() ->> 'email' 
      AND au.is_approved = true 
      AND au.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage approved users" ON approved_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM approved_users au 
      WHERE au.email = auth.jwt() ->> 'email' 
      AND au.is_approved = true 
      AND au.role = 'admin'
    )
  );

CREATE POLICY "Admins can view access logs" ON access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approved_users au 
      WHERE au.email = auth.jwt() ->> 'email' 
      AND au.is_approved = true 
      AND au.role = 'admin'
    )
  );

CREATE POLICY "Admins can view notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approved_users au 
      WHERE au.email = auth.jwt() ->> 'email' 
      AND au.is_approved = true 
      AND au.role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert access logs" ON access_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Função para verificar se usuário está aprovado
CREATE OR REPLACE FUNCTION is_user_approved(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM approved_users 
    WHERE email = user_email 
    AND is_approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para logar tentativa de acesso
CREATE OR REPLACE FUNCTION log_access_attempt(
  p_email TEXT,
  p_ip_address INET,
  p_user_agent TEXT,
  p_attempt_type TEXT,
  p_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO access_logs (email, ip_address, user_agent, attempt_type, status, reason)
  VALUES (p_email, p_ip_address, p_user_agent, p_attempt_type, p_status, p_reason)
  RETURNING id INTO log_id;
  
  -- Se for tentativa não autorizada, criar notificação
  IF p_status = 'unauthorized' THEN
    INSERT INTO notifications (type, title, message, email, ip_address)
    VALUES (
      'unauthorized_access',
      'Tentativa de acesso não autorizada',
      'Usuário ' || p_email || ' tentou acessar o sistema sem autorização.',
      p_email,
      p_ip_address
    );
  END IF;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Clique em "Run"**

---

### **4️⃣ TESTAR O SISTEMA**

#### **Passo 1: Acessar o Sistema**
1. **Acesse**: http://localhost:3000/admin/login
2. **Você deve ver**:
   - Campo de email/senha
   - Botão "Entrar com Google"

#### **Passo 2: Testar Login com Google**
1. **Clique em "Entrar com Google"**
2. **Faça login** com `guilhermesf.beasss@gmail.com`
3. **Deve redirecionar** para `/admin/agenda`

#### **Passo 3: Testar Sistema de Notificações**
1. **Acesse**: `/admin/notificacoes`
2. **Deve mostrar** notificações em tempo real

#### **Passo 4: Testar Gerenciamento de Usuários**
1. **Acesse**: `/admin/usuarios`
2. **Deve mostrar** interface para gerenciar usuários

---

### **5️⃣ CONFIGURAÇÕES ADICIONAIS**

#### **Para Produção:**
1. **Substitua** `http://localhost:3000` por seu domínio
2. **Configure** HTTPS obrigatório
3. **Adicione** domínio no Google Console
4. **Configure** variáveis de ambiente

#### **Configurações Recomendadas:**
- **JWT expiry**: 3600 (1 hora)
- **Refresh token rotation**: Habilitado
- **Email confirmations**: Desabilitado (para Google)
- **Rate limiting**: 5 tentativas por minuto

---

### **6️⃣ TROUBLESHOOTING**

#### **Erro: "redirect_uri_mismatch"**
- Verifique se as URLs de redirecionamento estão corretas
- Certifique-se de que não há espaços extras

#### **Erro: "invalid_client"**
- Verifique se o Client ID e Secret estão corretos
- Certifique-se de que o projeto está ativo

#### **Erro: "access_denied"**
- Verifique se o usuário está na lista de test users
- Certifique-se de que o OAuth consent screen está configurado

#### **Erro: "unauthorized_client"**
- Verifique se o tipo de aplicação está correto (Web application)
- Certifique-se de que as origens JavaScript estão configuradas

---

### **7️⃣ CREDENCIAIS DE TESTE**

```
Email Principal: guilhermesf.beasss@gmail.com
Senha: admin123456
```

**✅ PRONTO PARA USO!**

---

### **8️⃣ PRÓXIMOS PASSOS**

1. **Teste** o login com Google
2. **Configure** notificações por email
3. **Adicione** mais usuários aprovados
4. **Configure** para produção
5. **Monitore** logs de acesso

**🎉 Sistema completo e funcional!**
