-- Script para atualizar a função log_access_attempt para incluir nome do usuário
-- Execute este script no Supabase SQL Editor

-- 1. Atualizar função para incluir nome do usuário
CREATE OR REPLACE FUNCTION log_access_attempt(
  p_email TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_attempt_type TEXT DEFAULT 'unknown',
  p_status TEXT DEFAULT 'unknown',
  p_reason TEXT DEFAULT NULL,
  p_user_name TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_admin_email TEXT := 'guilhermesf.beasss@gmail.com';
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_notification_type TEXT;
  v_display_name TEXT;
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
    -- Definir nome para exibição
    v_display_name := COALESCE(p_user_name, p_email);
    
    -- Definir tipo e conteúdo da notificação
    IF p_status = 'unauthorized' THEN
      v_notification_type := 'new_user_request';
      v_notification_title := 'Nova solicitação de acesso';
      v_notification_message := 'Um usuário tentou fazer login mas não está autorizado. Nome: ' || v_display_name || ' | Email: ' || p_email;
    ELSE
      v_notification_type := 'unauthorized_access';
      v_notification_title := 'Tentativa de acesso bloqueada';
      v_notification_message := 'Tentativa de login bloqueada. Nome: ' || v_display_name || ' | Email: ' || p_email || 
        CASE WHEN p_reason IS NOT NULL THEN ' | Motivo: ' || p_reason ELSE '' END;
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
    RAISE NOTICE 'Notificação criada para admin: % - Usuário: % (%)', v_admin_email, v_display_name, p_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Testar a função atualizada
SELECT log_access_attempt(
  'guilherme.xacc@gmail.com',
  '127.0.0.1',
  'Mozilla/5.0 (Test Browser)',
  'google_oauth',
  'unauthorized',
  'Usuário não aprovado - teste com nome',
  'Guilherme Soares'
);

-- 3. Verificar se a notificação foi criada com nome
SELECT 
  'Notificação com nome criada:' as status,
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

SELECT 'Função atualizada com sucesso! Agora mostra nome e email do usuário! 🎉' as resultado;
