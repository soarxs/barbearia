-- Script simples para limpar apenas a tabela approved_users
-- Execute este script no Supabase SQL Editor

-- 1. Limpar todos os usuários aprovados
DELETE FROM approved_users;

-- 2. Inserir apenas o admin principal
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

-- 3. Verificar se as tabelas existem
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'approved_users' THEN '✅ Existe'
    WHEN table_name = 'access_logs' THEN '❌ Não existe'
    WHEN table_name = 'notifications' THEN '❌ Não existe'
    ELSE '❓ Desconhecido'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('approved_users', 'access_logs', 'notifications');

-- 4. Verificar resultado da tabela approved_users
SELECT 
  email,
  name,
  role,
  is_approved,
  created_at
FROM approved_users
ORDER BY created_at;

-- 5. Contar registros
SELECT 
  'approved_users' as tabela,
  COUNT(*) as total
FROM approved_users;
