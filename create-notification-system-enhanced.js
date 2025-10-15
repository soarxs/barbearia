// Script para criar sistema de notificações automáticas melhorado
// Execute este script no Supabase SQL Editor

-- 1. Função melhorada para logar tentativas de acesso E criar notificações
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

-- 2. Função para aprovar usuário diretamente da notificação
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

-- 3. Função para rejeitar usuário
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

-- 4. Trigger para notificar admin em tempo real (opcional)
CREATE OR REPLACE FUNCTION notify_admin_new_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Aqui você pode adicionar lógica para notificação por email
  -- Por enquanto, apenas log
  RAISE NOTICE 'Nova solicitação de acesso: %', NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Comentários das funções
COMMENT ON FUNCTION log_access_attempt IS 'Loga tentativas de acesso e cria notificações automáticas para o admin';
COMMENT ON FUNCTION approve_user_from_notification IS 'Aprova um usuário diretamente de uma notificação';
COMMENT ON FUNCTION reject_user_from_notification IS 'Rejeita um usuário diretamente de uma notificação';

-- 6. Teste das funções
SELECT 'Sistema de notificações automáticas criado com sucesso!' as status;
