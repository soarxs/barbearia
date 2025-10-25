-- =============================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE
-- =============================================
-- Execute este script no Editor SQL do Supabase

-- 1. TABELA DE SERVIÇOS
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30, -- em minutos
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE BARBEIROS
CREATE TABLE IF NOT EXISTS barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  specialties TEXT[] DEFAULT '{}', -- array de especialidades
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE AGENDAMENTOS (já existe, mas vamos garantir que está correta)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name VARCHAR(100) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  client_email VARCHAR(100),
  service VARCHAR(100) NOT NULL,
  barber VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INSERIR DADOS INICIAIS - SERVIÇOS
INSERT INTO services (name, description, price, duration, active) VALUES
('Corte Masculino', 'Corte de cabelo masculino com lavagem', 25.00, 30, true),
('Barba', 'Aparar e modelar barba', 15.00, 20, true),
('Corte + Barba', 'Corte de cabelo + barba', 35.00, 45, true),
('Sobrancelha', 'Design e limpeza de sobrancelhas', 10.00, 15, true),
('Pigmentação', 'Pigmentação de sobrancelhas', 50.00, 60, true)
ON CONFLICT DO NOTHING;

-- 5. INSERIR DADOS INICIAIS - BARBEIROS
INSERT INTO barbers (name, phone, email, specialties, active) VALUES
('João Silva', '(11) 99999-9999', 'joao@barbertime.com', ARRAY['Corte Masculino', 'Barba'], true),
('Maria Santos', '(11) 88888-8888', 'maria@barbertime.com', ARRAY['Corte Feminino', 'Sobrancelha', 'Pigmentação'], true),
('Pedro Costa', '(11) 77777-7777', 'pedro@barbertime.com', ARRAY['Corte Masculino', 'Barba', 'Sobrancelha'], true)
ON CONFLICT DO NOTHING;

-- 6. INSERIR DADOS INICIAIS - AGENDAMENTOS (exemplos)
INSERT INTO appointments (client_name, client_phone, client_email, service, barber, date, time, status, notes) VALUES
('Carlos Silva', '(11) 11111-1111', 'carlos@email.com', 'Corte Masculino', 'João Silva', CURRENT_DATE, '09:00', 'confirmed', 'Primeira vez'),
('Ana Costa', '(11) 22222-2222', 'ana@email.com', 'Corte + Barba', 'Pedro Costa', CURRENT_DATE, '10:30', 'pending', ''),
('Roberto Lima', '(11) 33333-3333', 'roberto@email.com', 'Barba', 'João Silva', CURRENT_DATE + INTERVAL '1 day', '14:00', 'confirmed', 'Cliente regular')
ON CONFLICT DO NOTHING;

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_barbers_active ON barbers(active);

-- 8. HABILITAR RLS (Row Level Security) - OPCIONAL
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS RLS (se habilitado) - OPCIONAL
-- CREATE POLICY "Enable all operations for authenticated users" ON services FOR ALL USING (true);
-- CREATE POLICY "Enable all operations for authenticated users" ON barbers FOR ALL USING (true);
-- CREATE POLICY "Enable all operations for authenticated users" ON appointments FOR ALL USING (true);

-- =============================================
-- VERIFICAÇÃO DOS DADOS
-- =============================================

-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('services', 'barbers', 'appointments');

-- Verificar dados inseridos
SELECT 'services' as tabela, count(*) as total FROM services
UNION ALL
SELECT 'barbers' as tabela, count(*) as total FROM barbers
UNION ALL
SELECT 'appointments' as tabela, count(*) as total FROM appointments;

-- =============================================
-- INSTRUÇÕES DE USO
-- =============================================
/*
1. Copie todo este script
2. Cole no Editor SQL do Supabase
3. Execute o script
4. Verifique se as tabelas foram criadas
5. Teste a aplicação

ESTRUTURA DAS TABELAS:
- services: Serviços oferecidos (corte, barba, etc.)
- barbers: Barbeiros da equipe
- appointments: Agendamentos dos clientes

DADOS INICIAIS:
- 5 serviços básicos
- 3 barbeiros de exemplo
- 3 agendamentos de exemplo

A aplicação agora está 100% integrada com o Supabase!
*/
