// Script para configurar Supabase automaticamente
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxusbwqncilzkkboxyxt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dXNid3FuY2lsemtrYm94eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDg3OTcsImV4cCI6MjA3NTk4NDc5N30.mOkSYqtfFVonzKVAyFT6MkeFjOT7Zme5XaXgUxRPKMc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupSupabase() {
  console.log('🚀 Configurando Supabase automaticamente...')
  
  try {
    // 1. Criar tabelas
    console.log('📋 Criando tabelas...')
    
    const createTablesSQL = `
      -- 1. Tabela de barbearias
      CREATE TABLE IF NOT EXISTS barbershops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(50) UNIQUE NOT NULL,
        custom_domain VARCHAR(100) UNIQUE,
        name VARCHAR(100) NOT NULL,
        owner_id UUID REFERENCES auth.users(id),
        subscription_plan VARCHAR(20) DEFAULT 'basic',
        settings JSONB DEFAULT '{}',
        theme JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- 2. Tabela de serviços
      CREATE TABLE IF NOT EXISTS services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- 3. Tabela de barbeiros
      CREATE TABLE IF NOT EXISTS barbers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        specialties TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- 4. Tabela de agendamentos
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time TIME NOT NULL,
        service_id UUID REFERENCES services(id),
        barber_id UUID REFERENCES barbers(id),
        client_name VARCHAR(100) NOT NULL,
        client_phone VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pendente',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- 5. Tabela de configurações
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
        key VARCHAR(50) NOT NULL,
        value JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(barbershop_id, key)
      );
    `
    
    // Executar SQL via RPC (se disponível)
    console.log('⚠️ Executando SQL...')
    console.log('📝 IMPORTANTE: Execute este SQL no dashboard do Supabase:')
    console.log('🔗 https://supabase.com/dashboard/project/sxusbwqncilzkkboxyxt/sql')
    console.log('')
    console.log('SQL para executar:')
    console.log(createTablesSQL)
    console.log('')
    
    // 2. Inserir dados de exemplo
    console.log('📊 Inserindo dados de exemplo...')
    
    const insertDataSQL = `
      -- Inserir barbearias de exemplo
      INSERT INTO barbershops (slug, name, settings, theme) VALUES 
      ('barbearia-joao', 'Barbearia do João', 
       '{"workingHours": {"start": "08:00", "end": "18:00"}, "workingDays": [1,2,3,4,5,6]}',
       '{"primary": "#F1C40F", "secondary": "#D35400"}')
      ON CONFLICT (slug) DO NOTHING;
      
      INSERT INTO barbershops (slug, name, settings, theme) VALUES 
      ('barbearia-carlos', 'Barbearia do Carlos',
       '{"workingHours": {"start": "09:00", "end": "19:00"}, "workingDays": [1,2,3,4,5,6]}',
       '{"primary": "#E74C3C", "secondary": "#2C3E50"}')
      ON CONFLICT (slug) DO NOTHING;

      -- Inserir serviços para a barbearia do João
      INSERT INTO services (barbershop_id, name, price, duration_minutes) 
      SELECT id, 'Corte de Cabelo', 40.00, 30 FROM barbershops WHERE slug = 'barbearia-joao'
      ON CONFLICT DO NOTHING;
      
      INSERT INTO services (barbershop_id, name, price, duration_minutes) 
      SELECT id, 'Barba', 30.00, 20 FROM barbershops WHERE slug = 'barbearia-joao'
      ON CONFLICT DO NOTHING;
      
      INSERT INTO services (barbershop_id, name, price, duration_minutes) 
      SELECT id, 'Corte + Barba', 65.00, 45 FROM barbershops WHERE slug = 'barbearia-joao'
      ON CONFLICT DO NOTHING;

      -- Inserir barbeiros para a barbearia do João
      INSERT INTO barbers (barbershop_id, name, specialties) 
      SELECT id, 'João Silva', ARRAY['corte', 'barba'] FROM barbershops WHERE slug = 'barbearia-joao'
      ON CONFLICT DO NOTHING;
      
      INSERT INTO barbers (barbershop_id, name, specialties) 
      SELECT id, 'Carlos Santos', ARRAY['corte', 'barba'] FROM barbershops WHERE slug = 'barbearia-joao'
      ON CONFLICT DO NOTHING;
    `
    
    console.log('SQL para inserir dados:')
    console.log(insertDataSQL)
    console.log('')
    
    // 3. Configurar RLS
    console.log('🔐 Configurando Row Level Security...')
    
    const rlsSQL = `
      -- Habilitar RLS em todas as tabelas
      ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
      ALTER TABLE services ENABLE ROW LEVEL SECURITY;
      ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

      -- Políticas para barbearias (público pode ler, dono pode editar)
      DROP POLICY IF EXISTS "Anyone can view barbershops" ON barbershops;
      CREATE POLICY "Anyone can view barbershops" ON barbershops
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Owners can update their barbershop" ON barbershops;
      CREATE POLICY "Owners can update their barbershop" ON barbershops
        FOR UPDATE USING (auth.uid() = owner_id);

      -- Políticas para serviços (público pode ler, dono pode editar)
      DROP POLICY IF EXISTS "Anyone can view services" ON services;
      CREATE POLICY "Anyone can view services" ON services
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Barbershop owners can manage services" ON services;
      CREATE POLICY "Barbershop owners can manage services" ON services
        FOR ALL USING (
          barbershop_id IN (
            SELECT id FROM barbershops WHERE owner_id = auth.uid()
          )
        );

      -- Políticas para barbeiros (público pode ler, dono pode editar)
      DROP POLICY IF EXISTS "Anyone can view barbers" ON barbers;
      CREATE POLICY "Anyone can view barbers" ON barbers
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Barbershop owners can manage barbers" ON barbers;
      CREATE POLICY "Barbershop owners can manage barbers" ON barbers
        FOR ALL USING (
          barbershop_id IN (
            SELECT id FROM barbershops WHERE owner_id = auth.uid()
          )
        );

      -- Políticas para agendamentos (público pode criar, dono pode gerenciar)
      DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
      CREATE POLICY "Anyone can create appointments" ON appointments
        FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Anyone can view appointments" ON appointments;
      CREATE POLICY "Anyone can view appointments" ON appointments
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Barbershop owners can manage appointments" ON appointments;
      CREATE POLICY "Barbershop owners can manage appointments" ON appointments
        FOR ALL USING (
          barbershop_id IN (
            SELECT id FROM barbershops WHERE owner_id = auth.uid()
          )
        );

      -- Políticas para configurações (apenas dono)
      DROP POLICY IF EXISTS "Barbershop owners can manage settings" ON settings;
      CREATE POLICY "Barbershop owners can manage settings" ON settings
        FOR ALL USING (
          barbershop_id IN (
            SELECT id FROM barbershops WHERE owner_id = auth.uid()
          )
        );
    `
    
    console.log('SQL para RLS:')
    console.log(rlsSQL)
    console.log('')
    
    console.log('✅ Script de setup concluído!')
    console.log('')
    console.log('📋 PRÓXIMOS PASSOS:')
    console.log('1. Acesse: https://supabase.com/dashboard/project/sxusbwqncilzkkboxyxt/sql')
    console.log('2. Execute os 3 blocos de SQL acima (um por vez)')
    console.log('3. Execute: node test-final.js')
    console.log('4. Teste no navegador: http://localhost:8080/barbearia-joao')
    
  } catch (error) {
    console.error('❌ Erro no setup:', error)
  }
}

setupSupabase()
