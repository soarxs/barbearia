-- =============================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE - CORRIGIDO
-- =============================================
-- Execute este script no Editor SQL do Supabase

-- 1. VERIFICAR E CRIAR TABELA DE SERVIÇOS
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

-- 2. VERIFICAR E CRIAR TABELA DE BARBEIROS
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

-- 3. VERIFICAR E CRIAR TABELA DE AGENDAMENTOS
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

-- 4. ADICIONAR COLUNA DURATION SE NÃO EXISTIR
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'duration') THEN
        ALTER TABLE services ADD COLUMN duration INTEGER DEFAULT 30;
    END IF;
END $$;

-- 5. ADICIONAR COLUNA SPECIALTIES SE NÃO EXISTIR
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'barbers' AND column_name = 'specialties') THEN
        ALTER TABLE barbers ADD COLUMN specialties TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 6. LIMPAR DADOS EXISTENTES (OPCIONAL - REMOVA SE QUISER MANTER DADOS)
-- DELETE FROM appointments;
-- DELETE FROM services;
-- DELETE FROM barbers;

-- 7. INSERIR DADOS INICIAIS - SERVIÇOS
INSERT INTO services (name, description, price, duration, active) VALUES
('Corte Masculino', 'Corte de cabelo masculino com lavagem', 25.00, 30, true),
('Barba', 'Aparar e modelar barba', 15.00, 20, true),
('Corte + Barba', 'Corte de cabelo + barba', 35.00, 45, true),
('Sobrancelha', 'Design e limpeza de sobrancelhas', 10.00, 15, true),
('Pigmentação', 'Pigmentação de sobrancelhas', 50.00, 60, true)
ON CONFLICT (id) DO NOTHING;

-- 8. INSERIR DADOS INICIAIS - BARBEIROS
INSERT INTO barbers (name, phone, email, specialties, active) VALUES
('João Silva', '(11) 99999-9999', 'joao@barbertime.com', ARRAY['Corte Masculino', 'Barba'], true),
('Maria Santos', '(11) 88888-8888', 'maria@barbertime.com', ARRAY['Corte Feminino', 'Sobrancelha', 'Pigmentação'], true),
('Pedro Costa', '(11) 77777-7777', 'pedro@barbertime.com', ARRAY['Corte Masculino', 'Barba', 'Sobrancelha'], true)
ON CONFLICT (id) DO NOTHING;

-- 9. INSERIR DADOS INICIAIS - AGENDAMENTOS (exemplos)
INSERT INTO appointments (client_name, client_phone, client_email, service, barber, date, time, status, notes) VALUES
('Carlos Silva', '(11) 11111-1111', 'carlos@email.com', 'Corte Masculino', 'João Silva', CURRENT_DATE, '09:00', 'confirmed', 'Primeira vez'),
('Ana Costa', '(11) 22222-2222', 'ana@email.com', 'Corte + Barba', 'Pedro Costa', CURRENT_DATE, '10:30', 'pending', ''),
('Roberto Lima', '(11) 33333-3333', 'roberto@email.com', 'Barba', 'João Silva', CURRENT_DATE + INTERVAL '1 day', '14:00', 'confirmed', 'Cliente regular')
ON CONFLICT (id) DO NOTHING;

-- 10. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_barbers_active ON barbers(active);

-- 11. VERIFICAÇÃO DOS DADOS
SELECT 'services' as tabela, count(*) as total FROM services
UNION ALL
SELECT 'barbers' as tabela, count(*) as total FROM barbers
UNION ALL
SELECT 'appointments' as tabela, count(*) as total FROM appointments;

-- 12. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('services', 'barbers', 'appointments')
ORDER BY table_name, ordinal_position;

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
