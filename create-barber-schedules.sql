-- Script SQL para criar horários dos barbeiros
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'barber_schedules';

-- 2. Verificar barbeiros existentes
SELECT id, name, barbershop_id 
FROM barbers 
WHERE barbershop_id = '33513ff5-dd80-4534-9f85-f660304ad420';

-- 3. Verificar horários existentes
SELECT * 
FROM barber_schedules 
WHERE barbershop_id = '33513ff5-dd80-4534-9f85-f660304ad420';

-- 4. Criar horários para todos os barbeiros (se não existirem)
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
ON CONFLICT (barbershop_id, barber_id) DO NOTHING;

-- 5. Verificar se os horários foram criados
SELECT * 
FROM barber_schedules 
WHERE barbershop_id = '33513ff5-dd80-4534-9f85-f660304ad420';
