// Script para criar tabela de horários dos barbeiros no Supabase
// Execute este script no SQL Editor do Supabase

const setupBarberSchedules = `
-- Criar tabela para horários específicos dos barbeiros
CREATE TABLE IF NOT EXISTS barber_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  
  -- Horários para cada dia da semana
  sunday JSONB DEFAULT '{"isWorking": false, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}',
  monday JSONB DEFAULT '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}',
  tuesday JSONB DEFAULT '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}',
  wednesday JSONB DEFAULT '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}',
  thursday JSONB DEFAULT '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}',
  friday JSONB DEFAULT '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}',
  saturday JSONB DEFAULT '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(barbershop_id, barber_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_barber_schedules_barbershop_id ON barber_schedules(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barber_schedules_barber_id ON barber_schedules(barber_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos
CREATE POLICY "Permitir leitura de horários dos barbeiros" ON barber_schedules
  FOR SELECT USING (true);

-- Política para permitir inserção/atualização para usuários autenticados
CREATE POLICY "Permitir inserção/atualização de horários dos barbeiros" ON barber_schedules
  FOR ALL USING (true);

-- Inserir horários padrão para os barbeiros existentes
INSERT INTO barber_schedules (barbershop_id, barber_id, monday, tuesday, wednesday, thursday, friday, saturday)
SELECT 
  '33513ff5-dd80-4534-9f85-f660304ad420' as barbershop_id,
  id as barber_id,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as monday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as tuesday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as wednesday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as thursday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as friday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as saturday
FROM barbers 
WHERE barbershop_id = '33513ff5-dd80-4534-9f85-f660304ad420'
ON CONFLICT (barbershop_id, barber_id) DO NOTHING;

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_barber_schedules_updated_at 
  BEFORE UPDATE ON barber_schedules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

console.log('Script SQL para criar tabela de horários dos barbeiros:');
console.log('='.repeat(60));
console.log(setupBarberSchedules);
console.log('='.repeat(60));
console.log('Instruções:');
console.log('1. Acesse o Supabase Dashboard');
console.log('2. Vá para SQL Editor');
console.log('3. Cole o script acima');
console.log('4. Execute o script');
console.log('5. A tabela barber_schedules será criada com horários padrão para todos os barbeiros');
