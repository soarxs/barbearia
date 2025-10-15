-- Script para configurar permissões de admin no Supabase
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela approved_users existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'approved_users') 
    THEN 'Tabela approved_users existe ✅'
    ELSE 'Tabela approved_users NÃO existe ❌'
  END as status;

-- 2. Limpar e configurar a tabela approved_users
TRUNCATE TABLE approved_users;

INSERT INTO approved_users (
  email,
  name,
  role,
  is_approved,
  created_at,
  updated_at
) VALUES (
  'guilhermesf.beasss@gmail.com',
  'Guilherme - Admin Principal',
  'admin',
  true,
  NOW(),
  NOW()
);

-- 3. Verificar o resultado
SELECT 
  'Usuários aprovados:' as info,
  email,
  name,
  role,
  is_approved
FROM approved_users;

-- 4. Configurar políticas de segurança para permitir que admins vejam todos os usuários
-- (Isso é necessário para a funcionalidade de aprovação)

-- Política para permitir que admins vejam usuários aprovados
DROP POLICY IF EXISTS "Admins can view all approved users" ON approved_users;
CREATE POLICY "Admins can view all approved users" ON approved_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approved_users au 
      WHERE au.email = auth.jwt() ->> 'email' 
      AND au.is_approved = true 
      AND au.role = 'admin'
    )
  );

-- Política para permitir que admins gerenciem usuários aprovados
DROP POLICY IF EXISTS "Admins can manage approved users" ON approved_users;
CREATE POLICY "Admins can manage approved users" ON approved_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM approved_users au 
      WHERE au.email = auth.jwt() ->> 'email' 
      AND au.is_approved = true 
      AND au.role = 'admin'
    )
  );

-- 5. Verificar as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'approved_users';

SELECT 'Permissões de admin configuradas com sucesso! 🎉' as resultado;
