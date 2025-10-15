-- Script para configurar sistema completo de aprovação de acesso admin
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de solicitações de acesso
CREATE TABLE IF NOT EXISTS admin_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profile_photo_url TEXT,
  request_date TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Criar tabela de admins aprovados
CREATE TABLE IF NOT EXISTS approved_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profile_photo_url TEXT,
  approved_at TIMESTAMP DEFAULT NOW(),
  approved_by TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Inserir admin principal
INSERT INTO approved_admins (
  user_email,
  full_name,
  profile_photo_url,
  approved_by,
  active
) VALUES (
  'guilhermesf.beasss@gmail.com',
  'Guilherme - Admin Principal',
  null,
  'system',
  true
) ON CONFLICT (user_email) DO UPDATE SET 
  active = true,
  updated_at = NOW();

-- 4. Habilitar RLS
ALTER TABLE admin_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_admins ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança para admin_access_requests
DROP POLICY IF EXISTS "Admin principal acesso total" ON admin_access_requests;
CREATE POLICY "Admin principal acesso total" ON admin_access_requests
FOR ALL USING (auth.jwt() ->> 'email' = 'guilhermesf.beasss@gmail.com');

DROP POLICY IF EXISTS "Usuário pode ver apenas seu próprio status" ON admin_access_requests;
CREATE POLICY "Usuário pode ver apenas seu próprio status" ON admin_access_requests
FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- 6. Políticas de segurança para approved_admins
DROP POLICY IF EXISTS "Admin principal gerencia aprovados" ON approved_admins;
CREATE POLICY "Admin principal gerencia aprovados" ON approved_admins
FOR ALL USING (auth.jwt() ->> 'email' = 'guilhermesf.beasss@gmail.com');

DROP POLICY IF EXISTS "Usuários aprovados podem ver status" ON approved_admins;
CREATE POLICY "Usuários aprovados podem ver status" ON approved_admins
FOR SELECT USING (user_email = auth.jwt() ->> 'email' AND active = true);

-- 7. Função para verificar se usuário está aprovado
CREATE OR REPLACE FUNCTION is_user_approved(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM approved_admins 
    WHERE approved_admins.user_email = is_user_approved.user_email 
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para obter status de aprovação
CREATE OR REPLACE FUNCTION get_user_approval_status(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Verificar se está aprovado
  IF EXISTS (SELECT 1 FROM approved_admins WHERE approved_admins.user_email = get_user_approval_status.user_email AND active = true) THEN
    result := json_build_object(
      'status', 'approved',
      'isApproved', true,
      'message', 'Usuário aprovado'
    );
  ELSE
    -- Verificar se tem solicitação pendente
    SELECT json_build_object(
      'status', status,
      'isApproved', false,
      'message', CASE 
        WHEN status = 'pending' THEN 'Aguardando aprovação'
        WHEN status = 'rejected' THEN 'Acesso negado'
        ELSE 'Solicitação não encontrada'
      END,
      'requestDate', request_date,
      'fullName', full_name,
      'profilePhoto', profile_photo_url
    ) INTO result
    FROM admin_access_requests 
    WHERE admin_access_requests.user_email = get_user_approval_status.user_email;
    
    -- Se não encontrou solicitação, retornar status padrão
    IF result IS NULL THEN
      result := json_build_object(
        'status', 'not_found',
        'isApproved', false,
        'message', 'Solicitação não encontrada'
      );
    END IF;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para criar solicitação de acesso
CREATE OR REPLACE FUNCTION create_access_request(
  p_user_email TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_profile_photo_url TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  request_id UUID;
BEGIN
  -- Inserir ou atualizar solicitação
  INSERT INTO admin_access_requests (
    user_email,
    full_name,
    profile_photo_url,
    ip_address,
    status
  ) VALUES (
    p_user_email,
    p_full_name,
    p_profile_photo_url,
    p_ip_address,
    'pending'
  )
  ON CONFLICT (user_email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    profile_photo_url = EXCLUDED.profile_photo_url,
    ip_address = EXCLUDED.ip_address,
    request_date = NOW(),
    updated_at = NOW()
  RETURNING id INTO request_id;
  
  RETURN json_build_object(
    'success', true,
    'requestId', request_id,
    'message', 'Solicitação criada com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Função para aprovar usuário
CREATE OR REPLACE FUNCTION approve_user(
  p_user_email TEXT,
  p_reviewed_by TEXT
)
RETURNS JSON AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Buscar solicitação
  SELECT * INTO request_record 
  FROM admin_access_requests 
  WHERE user_email = p_user_email;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Solicitação não encontrada'
    );
  END IF;
  
  -- Atualizar status da solicitação
  UPDATE admin_access_requests 
  SET status = 'approved',
      reviewed_by = p_reviewed_by,
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE user_email = p_user_email;
  
  -- Adicionar à lista de aprovados
  INSERT INTO approved_admins (
    user_email,
    full_name,
    profile_photo_url,
    approved_by
  ) VALUES (
    p_user_email,
    request_record.full_name,
    request_record.profile_photo_url,
    p_reviewed_by
  ) ON CONFLICT (user_email) DO UPDATE SET
    active = true,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Usuário aprovado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Função para rejeitar usuário
CREATE OR REPLACE FUNCTION reject_user(
  p_user_email TEXT,
  p_reviewed_by TEXT
)
RETURNS JSON AS $$
BEGIN
  -- Atualizar status da solicitação
  UPDATE admin_access_requests 
  SET status = 'rejected',
      reviewed_by = p_reviewed_by,
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE user_email = p_user_email;
  
  -- Desativar na lista de aprovados se existir
  UPDATE approved_admins 
  SET active = false,
      updated_at = NOW()
  WHERE user_email = p_user_email;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Usuário rejeitado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('admin_access_requests', 'approved_admins');

SELECT 'Funções criadas:' as info;
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('is_user_approved', 'get_user_approval_status', 'create_access_request', 'approve_user', 'reject_user');

SELECT 'Admin principal configurado:' as info;
SELECT user_email, full_name, active FROM approved_admins 
WHERE user_email = 'guilhermesf.beasss@gmail.com';

SELECT 'Sistema de aprovação configurado com sucesso! 🎉' as resultado;
