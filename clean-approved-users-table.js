-- Script para limpar a tabela approved_users e deixar apenas o admin principal
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

-- 3. Limpar logs de acesso antigos (opcional)
DELETE FROM access_logs WHERE created_at < NOW() - INTERVAL '1 day';

-- 4. Limpar notificações antigas (opcional)
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '1 day';

-- 5. Verificar resultado
SELECT 
  email,
  name,
  role,
  is_approved,
  created_at
FROM approved_users
ORDER BY created_at;

-- 6. Contar registros
SELECT 
  'approved_users' as tabela,
  COUNT(*) as total
FROM approved_users
UNION ALL
SELECT 
  'access_logs' as tabela,
  COUNT(*) as total
FROM access_logs
UNION ALL
SELECT 
  'notifications' as tabela,
  COUNT(*) as total
FROM notifications;
