-- Script para configurar sistema simples de aprovação
-- Execute este script no Supabase SQL Editor

-- 1. Limpar tabelas antigas (se existirem)
DROP TABLE IF EXISTS verification_codes CASCADE;
DROP TABLE IF EXISTS access_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- 2. Manter apenas a tabela approved_users (já existe)
-- Verificar se a tabela approved_users existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'approved_users') 
    THEN 'Tabela approved_users existe ✅'
    ELSE 'Tabela approved_users NÃO existe ❌'
  END as status;

-- 3. Limpar a tabela approved_users e inserir apenas o admin principal
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

-- 4. Verificar o resultado
SELECT 
  'Usuários aprovados:' as info,
  email,
  name,
  role,
  is_approved
FROM approved_users;

-- 5. Contar total de registros
SELECT 
  'Total de usuários aprovados:' as info,
  COUNT(*) as quantidade
FROM approved_users;

SELECT 'Sistema simples de aprovação configurado! 🎉' as resultado;
