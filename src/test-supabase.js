// Arquivo de teste para verificar conexão com Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxusbwqncilzkkboxyxt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dXNid3FuY2lsemtrYm94eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDg3OTcsImV4cCI6MjA3NTk4NDc5N30.mOkSYqtfFVonzKVAyFT6MkeFjOT7Zme5XaXgUxRPKMc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  console.log('🧪 Testando conexão com Supabase...')
  
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('🔗 URL:', supabaseUrl)
    console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...')
    
    // Teste 2: Tentar criar uma tabela simples
    console.log('🔨 Tentando criar tabela de teste...')
    
    const { data: createResult, error: createError } = await supabase
      .rpc('exec_sql', { sql: 'CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT)' })
    
    if (createError) {
      console.log('⚠️ Não foi possível criar tabela via RPC:', createError.message)
    } else {
      console.log('✅ Tabela de teste criada!')
    }
    
    // Teste 3: Tentar acessar barbershops diretamente
    console.log('🔍 Tentando acessar tabela barbershops...')
    
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao acessar barbershops:', error.message)
      console.log('💡 Isso significa que a tabela ainda não foi criada.')
      console.log('📝 Por favor, execute o SQL no dashboard do Supabase primeiro.')
    } else {
      console.log('✅ Tabela barbershops acessível!')
      console.log('📊 Dados encontrados:', data)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar teste
testSupabase()
