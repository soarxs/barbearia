-- Script para verificar se as tabelas necessárias existem
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
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

-- 2. Verificar conteúdo da tabela approved_users
SELECT 
  'approved_users' as tabela,
  COUNT(*) as total_registros
FROM approved_users;

-- 3. Mostrar registros da tabela approved_users
SELECT 
  email,
  name,
  role,
  is_approved
FROM approved_users;
