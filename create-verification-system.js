-- Script para criar sistema de verificação por código
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela para códigos de verificação
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  code VARCHAR(6) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, used, expired
  admin_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  used_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- 2. Habilitar RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de segurança
CREATE POLICY "Allow authenticated users to view verification codes" ON verification_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert verification codes" ON verification_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update verification codes" ON verification_codes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Função para gerar código de verificação
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

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para aprovar código
CREATE OR REPLACE FUNCTION approve_verification_code(
  p_code TEXT,
  p_admin_email TEXT DEFAULT 'guilhermesf.beasss@gmail.com'
) RETURNS JSON AS $$
DECLARE
  v_verification verification_codes%ROWTYPE;
  v_result JSON;
BEGIN
  -- Buscar o código
  SELECT * INTO v_verification
  FROM verification_codes
  WHERE code = p_code
  AND status = 'pending'
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Código inválido ou expirado'
    );
  END IF;

  -- Aprovar o código
  UPDATE verification_codes
  SET status = 'approved',
      approved_at = NOW()
  WHERE code = p_code;

  -- Retornar informações do usuário
  RETURN json_build_object(
    'success', true,
    'email', v_verification.email,
    'user_name', v_verification.user_name,
    'code', v_verification.code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para verificar e usar código
CREATE OR REPLACE FUNCTION verify_and_use_code(
  p_code TEXT
) RETURNS JSON AS $$
DECLARE
  v_verification verification_codes%ROWTYPE;
  v_result JSON;
BEGIN
  -- Buscar o código aprovado
  SELECT * INTO v_verification
  FROM verification_codes
  WHERE code = p_code
  AND status = 'approved'
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Código inválido, não aprovado ou expirado'
    );
  END IF;

  -- Marcar código como usado
  UPDATE verification_codes
  SET status = 'used',
      used_at = NOW()
  WHERE code = p_code;

  -- Aprovar usuário automaticamente
  INSERT INTO approved_users (
    email,
    name,
    role,
    is_approved,
    created_at,
    updated_at
  ) VALUES (
    v_verification.email,
    v_verification.user_name,
    'admin',
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (email) DO UPDATE SET
    is_approved = true,
    updated_at = NOW();

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'email', v_verification.email,
    'user_name', v_verification.user_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para obter códigos pendentes
CREATE OR REPLACE FUNCTION get_pending_verification_codes(
  p_admin_email TEXT DEFAULT 'guilhermesf.beasss@gmail.com'
) RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  user_name VARCHAR(255),
  code VARCHAR(6),
  created_at TIMESTAMP,
  expires_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vc.id,
    vc.email,
    vc.user_name,
    vc.code,
    vc.created_at,
    vc.expires_at
  FROM verification_codes vc
  WHERE vc.status = 'pending'
  AND vc.admin_email = p_admin_email
  AND vc.expires_at > NOW()
  ORDER BY vc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Testar o sistema
SELECT generate_verification_code(
  'teste@exemplo.com',
  'Usuário Teste'
) as codigo_gerado;

-- 9. Verificar se o código foi criado
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

SELECT 'Sistema de verificação por código criado com sucesso! 🎉' as resultado;
