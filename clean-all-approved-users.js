-- Script para remover TODOS os usuários da tabela approved_users
-- Execute este script no Supabase SQL Editor

-- 1. Remover TODOS os registros da tabela approved_users
TRUNCATE TABLE approved_users;

-- 2. Inserir APENAS o admin principal
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

-- 3. Verificar o resultado final
SELECT 
  'RESULTADO FINAL:' as status,
  email,
  name,
  role,
  is_approved
FROM approved_users;

-- 4. Contar quantos registros restaram
SELECT 
  'TOTAL DE REGISTROS:' as info,
  COUNT(*) as quantidade
FROM approved_users;
