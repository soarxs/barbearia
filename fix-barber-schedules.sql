-- Script final para corrigir horários dos barbeiros
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela se não existir
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

-- 2. Habilitar RLS
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas
DROP POLICY IF EXISTS "Permitir leitura de horários dos barbeiros" ON barber_schedules;
CREATE POLICY "Permitir leitura de horários dos barbeiros" ON barber_schedules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção/atualização de horários dos barbeiros" ON barber_schedules;
CREATE POLICY "Permitir inserção/atualização de horários dos barbeiros" ON barber_schedules
  FOR ALL USING (true);

-- 4. Criar horários para todos os barbeiros
INSERT INTO barber_schedules (barbershop_id, barber_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday)
SELECT 
  '33513ff5-dd80-4534-9f85-f660304ad420' as barbershop_id,
  id as barber_id,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as monday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as tuesday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as wednesday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as thursday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as friday,
  '{"isWorking": true, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as saturday,
  '{"isWorking": false, "startTime": "08:00", "endTime": "18:00", "lunchStart": "12:00", "lunchEnd": "13:00", "stepMinutes": 60}' as sunday
FROM barbers 
WHERE barbershop_id = '33513ff5-dd80-4534-9f85-f660304ad420'
ON CONFLICT (barbershop_id, barber_id) DO UPDATE SET
  monday = EXCLUDED.monday,
  tuesday = EXCLUDED.tuesday,
  wednesday = EXCLUDED.wednesday,
  thursday = EXCLUDED.thursday,
  friday = EXCLUDED.friday,
  saturday = EXCLUDED.saturday,
  sunday = EXCLUDED.sunday,
  updated_at = NOW();

-- 5. Verificar resultado
SELECT 
  bs.id,
  b.name as barber_name,
  bs.monday,
  bs.tuesday,
  bs.wednesday,
  bs.thursday,
  bs.friday,
  bs.saturday,
  bs.sunday
FROM barber_schedules bs
JOIN barbers b ON bs.barber_id = b.id
WHERE bs.barbershop_id = '33513ff5-dd80-4534-9f85-f660304ad420';
