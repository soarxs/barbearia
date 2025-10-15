-- Script para criar as tabelas que estão faltando
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela access_logs se não existir
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  attempt_type VARCHAR(50) DEFAULT 'unknown',
  status VARCHAR(50) DEFAULT 'unknown',
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Criar tabela notifications se não existir
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Habilitar RLS nas tabelas
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança para access_logs
CREATE POLICY "Allow authenticated users to view access logs" ON access_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert access logs" ON access_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Criar políticas de segurança para notifications
CREATE POLICY "Allow authenticated users to view notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Verificar se as tabelas foram criadas
SELECT 
  table_name,
  '✅ Criada com sucesso' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('approved_users', 'access_logs', 'notifications');

-- 7. Testar inserção de log de acesso
INSERT INTO access_logs (
  email,
  ip_address,
  user_agent,
  attempt_type,
  status,
  reason
) VALUES (
  'teste@exemplo.com',
  '127.0.0.1',
  'Mozilla/5.0 (Test Browser)',
  'test',
  'blocked',
  'Teste de funcionamento'
);

-- 8. Verificar se o log foi inserido
SELECT 
  'Log de teste inserido:' as info,
  email,
  status,
  reason,
  created_at
FROM access_logs 
WHERE email = 'teste@exemplo.com';

-- 9. Limpar o log de teste
DELETE FROM access_logs WHERE email = 'teste@exemplo.com';

SELECT 'Tabelas criadas e testadas com sucesso! 🎉' as resultado;
