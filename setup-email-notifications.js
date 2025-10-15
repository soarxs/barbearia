-- Script para configurar notificações por email (simulado)
-- Execute este script no Supabase SQL Editor

-- 1. Função para simular envio de email (já que o plano gratuito do Supabase não tem email)
CREATE OR REPLACE FUNCTION send_verification_email(
  p_admin_email TEXT,
  p_user_email TEXT,
  p_user_name TEXT,
  p_code TEXT
) RETURNS VOID AS $$
BEGIN
  -- Em um sistema real, aqui seria a integração com serviço de email
  -- Por enquanto, vamos apenas logar a informação
  
  RAISE NOTICE 'EMAIL SIMULADO ENVIADO PARA: %', p_admin_email;
  RAISE NOTICE 'ASSUNTO: Novo código de verificação - %', p_user_name;
  RAISE NOTICE 'CONTEÚDO:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Um novo usuário solicitou acesso ao sistema:';
  RAISE NOTICE '';
  RAISE NOTICE 'Nome: %', p_user_name;
  RAISE NOTICE 'Email: %', p_user_email;
  RAISE NOTICE 'Código de Verificação: %', p_code;
  RAISE NOTICE '';
  RAISE NOTICE 'Para aprovar este usuário:';
  RAISE NOTICE '1. Acesse o painel administrativo';
  RAISE NOTICE '2. Vá para "Códigos de Verificação"';
  RAISE NOTICE '3. Clique em "Aprovar" para o código: %', p_code;
  RAISE NOTICE '';
  RAISE NOTICE 'O código expira em 30 minutos.';
  RAISE NOTICE '========================================';
  
  -- Em produção, você pode integrar com:
  -- - SendGrid
  -- - Mailgun
  -- - AWS SES
  -- - Resend
  -- - Outros serviços de email
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atualizar função de geração de código para incluir notificação por email
CREATE OR REPLACE FUNCTION generate_verification_code(
  p_email TEXT,
  p_user_name TEXT DEFAULT NULL,
  p_admin_email TEXT DEFAULT 'guilhermesf.beasss@gmail.com'
) RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_code_exists BOOLEAN;
BEGIN
  -- Gerar código de 6 dígitos
  LOOP
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Verificar se o código já existe e não está expirado
    SELECT EXISTS(
      SELECT 1 FROM verification_codes 
      WHERE code = v_code 
      AND status IN ('pending', 'approved')
      AND expires_at > NOW()
    ) INTO v_code_exists;
    
    EXIT WHEN NOT v_code_exists;
  END LOOP;

  -- Inserir código na tabela
  INSERT INTO verification_codes (
    email,
    user_name,
    code,
    status,
    admin_email,
    created_at,
    expires_at
  ) VALUES (
    p_email,
    p_user_name,
    v_code,
    'pending',
    p_admin_email,
    NOW(),
    NOW() + INTERVAL '30 minutes'
  );

  -- Enviar notificação por email (simulada)
  PERFORM send_verification_email(p_admin_email, p_email, p_user_name, v_code);

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Testar o sistema completo
SELECT generate_verification_code(
  'teste@exemplo.com',
  'Usuário Teste Completo'
) as codigo_gerado;

-- 4. Verificar se o código foi criado
SELECT 
  'Código de teste criado:' as status,
  email,
  user_name,
  code,
  status,
  created_at,
  expires_at
FROM verification_codes 
WHERE email = 'teste@exemplo.com'
ORDER BY created_at DESC
LIMIT 1;

SELECT 'Sistema de notificação por email configurado! 🎉' as resultado;
