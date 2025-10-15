import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://sxusbwqncilzkkboxyxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dXNid3FuY2lsemtrYm94eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDg3OTcsImV4cCI6MjA3NTk4NDc5N30.mOkSYqtfFVonzKVAyFT6MkeFjOT7Zme5XaXgUxRPKMc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUserApprovalSystem() {
  try {
    console.log('🚀 Criando sistema de aprovação de usuários...');

    // 1. Criar tabela approved_users
    console.log('📋 Criando tabela approved_users...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Tabela para gerenciar usuários aprovados
        CREATE TABLE IF NOT EXISTS approved_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'admin',
          is_approved BOOLEAN DEFAULT false,
          approved_by UUID REFERENCES auth.users(id),
          approved_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (tableError) {
      console.error('❌ Erro ao criar tabela:', tableError);
      return;
    }

    // 2. Inserir usuário principal aprovado
    console.log('👤 Inserindo usuário principal aprovado...');
    const { error: insertError } = await supabase
      .from('approved_users')
      .upsert({
        email: 'guilhermesf.beasss@gmail.com',
        name: 'Guilherme - Admin Principal',
        role: 'admin',
        is_approved: true
      });

    if (insertError) {
      console.error('❌ Erro ao inserir usuário:', insertError);
      return;
    }

    // 3. Habilitar RLS
    console.log('🔒 Habilitando Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('❌ Erro ao habilitar RLS:', rlsError);
      return;
    }

    // 4. Criar políticas de segurança
    console.log('🛡️ Criando políticas de segurança...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Política para admins visualizarem todos os usuários aprovados
        CREATE POLICY "Admins can view all approved users" ON approved_users
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM approved_users au
              WHERE au.email = auth.jwt() ->> 'email'
              AND au.is_approved = true
              AND au.role = 'admin'
            )
          );

        -- Política para admins gerenciarem usuários aprovados
        CREATE POLICY "Admins can manage approved users" ON approved_users
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM approved_users au
              WHERE au.email = auth.jwt() ->> 'email'
              AND au.is_approved = true
              AND au.role = 'admin'
            )
          );
      `
    });

    if (policyError) {
      console.error('❌ Erro ao criar políticas:', policyError);
      return;
    }

    // 5. Criar função para verificar se usuário está aprovado
    console.log('⚙️ Criando função is_user_approved...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION is_user_approved(user_email TEXT)
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM approved_users
            WHERE email = user_email
            AND is_approved = true
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.error('❌ Erro ao criar função:', functionError);
      return;
    }

    console.log('✅ Sistema de aprovação de usuários criado com sucesso!');
    console.log('👤 Usuário principal aprovado: guilhermesf.beasss@gmail.com');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
createUserApprovalSystem();
