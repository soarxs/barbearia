-- Script completo para criar o sistema de notificações
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela access_logs
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  attempt_type VARCHAR(50) DEFAULT 'unknown',
  status VARCHAR(50) DEFAULT 'unknown',
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Criar tabela notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Habilitar RLS nas tabelas
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança para access_logs
CREATE POLICY "Allow authenticated users to view access logs" ON access_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert access logs" ON access_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Criar políticas de segurança para notifications
CREATE POLICY "Allow authenticated users to view notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Criar função para logar tentativas de acesso E criar notificações
CREATE OR REPLACE FUNCTION log_access_attempt(
  p_email TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_attempt_type TEXT DEFAULT 'unknown',
  p_status TEXT DEFAULT 'unknown',
  p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_admin_email TEXT := 'guilhermesf.beasss@gmail.com';
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_notification_type TEXT;
BEGIN
  -- Inserir log de acesso
  INSERT INTO access_logs (
    email,
    ip_address,
    user_agent,
    attempt_type,
    status,
    reason,
    created_at
  ) VALUES (
    p_email,
    p_ip_address,
    p_user_agent,
    p_attempt_type,
    p_status,
    p_reason,
    NOW()
  );

  -- Criar notificação apenas para tentativas não autorizadas
  IF p_status = 'unauthorized' OR p_status = 'blocked' THEN
    -- Definir tipo e conteúdo da notificação
    IF p_status = 'unauthorized' THEN
      v_notification_type := 'new_user_request';
      v_notification_title := 'Nova solicitação de acesso';
      v_notification_message := 'Um usuário tentou fazer login mas não está autorizado. Email: ' || p_email;
    ELSE
      v_notification_type := 'unauthorized_access';
      v_notification_title := 'Tentativa de acesso bloqueada';
      v_notification_message := 'Tentativa de login bloqueada. Email: ' || p_email || 
        CASE WHEN p_reason IS NOT NULL THEN '. Motivo: ' || p_reason ELSE '' END;
    END IF;

    -- Inserir notificação
    INSERT INTO notifications (
      admin_email,
      email,
      ip_address,
      type,
      title,
      message,
      is_read,
      created_at
    ) VALUES (
      v_admin_email,
      p_email,
      p_ip_address,
      v_notification_type,
      v_notification_title,
      v_notification_message,
      false,
      NOW()
    );

    -- Log da notificação criada
    RAISE NOTICE 'Notificação criada para admin: %', v_admin_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar função para aprovar usuário diretamente da notificação
CREATE OR REPLACE FUNCTION approve_user_from_notification(
  p_notification_id UUID,
  p_user_email TEXT,
  p_user_name TEXT DEFAULT NULL,
  p_user_role TEXT DEFAULT 'admin'
) RETURNS VOID AS $$
DECLARE
  v_admin_email TEXT := 'guilhermesf.beasss@gmail.com';
BEGIN
  -- Inserir usuário aprovado
  INSERT INTO approved_users (
    email,
    name,
    role,
    is_approved,
    approved_by,
    approved_at,
    created_at,
    updated_at
  ) VALUES (
    p_user_email,
    COALESCE(p_user_name, p_user_email),
    p_user_role,
    true,
    (SELECT id FROM auth.users WHERE email = v_admin_email LIMIT 1),
    NOW(),
    NOW(),
    NOW()
  ) ON CONFLICT (email) DO UPDATE SET
    is_approved = true,
    role = p_user_role,
    approved_by = (SELECT id FROM auth.users WHERE email = v_admin_email LIMIT 1),
    approved_at = NOW(),
    updated_at = NOW();

  -- Marcar notificação como lida
  UPDATE notifications 
  SET is_read = true, updated_at = NOW()
  WHERE id = p_notification_id;

  -- Criar notificação de confirmação
  INSERT INTO notifications (
    admin_email,
    email,
    type,
    title,
    message,
    is_read,
    created_at
  ) VALUES (
    v_admin_email,
    p_user_email,
    'user_approved',
    'Usuário aprovado com sucesso',
    'O usuário ' || p_user_email || ' foi aprovado e agora pode fazer login.',
    true,
    NOW()
  );

  RAISE NOTICE 'Usuário % aprovado com sucesso', p_user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar função para rejeitar usuário
CREATE OR REPLACE FUNCTION reject_user_from_notification(
  p_notification_id UUID,
  p_user_email TEXT,
  p_reason TEXT DEFAULT 'Acesso negado pelo administrador'
) RETURNS VOID AS $$
DECLARE
  v_admin_email TEXT := 'guilhermesf.beasss@gmail.com';
BEGIN
  -- Marcar notificação como lida
  UPDATE notifications 
  SET is_read = true, updated_at = NOW()
  WHERE id = p_notification_id;

  -- Criar notificação de rejeição
  INSERT INTO notifications (
    admin_email,
    email,
    type,
    title,
    message,
    is_read,
    created_at
  ) VALUES (
    v_admin_email,
    p_user_email,
    'user_rejected',
    'Acesso negado',
    'O acesso do usuário ' || p_user_email || ' foi negado. Motivo: ' || p_reason,
    true,
    NOW()
  );

  RAISE NOTICE 'Usuário % rejeitado', p_user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Testar o sistema criando uma notificação de teste
SELECT log_access_attempt(
  'guilherme.xacc@gmail.com',
  '127.0.0.1',
  'Mozilla/5.0 (Test Browser)',
  'google_oauth',
  'unauthorized',
  'Usuário não aprovado - teste do sistema'
);

-- 10. Verificar se a notificação foi criada
SELECT 
  'Notificação de teste criada:' as status,
  email,
  type,
  title,
  message,
  is_read,
  created_at
FROM notifications 
WHERE email = 'guilherme.xacc@gmail.com'
ORDER BY created_at DESC
LIMIT 1;

-- 11. Verificar se o log foi criado
SELECT 
  'Log de teste criado:' as status,
  email,
  attempt_type,
  status,
  reason,
  created_at
FROM access_logs 
WHERE email = 'guilherme.xacc@gmail.com'
ORDER BY created_at DESC
LIMIT 1;

SELECT 'Sistema de notificações criado e testado com sucesso! 🎉' as resultado;
