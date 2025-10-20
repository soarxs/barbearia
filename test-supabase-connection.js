// Teste de conexão com Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxusbwqncilzkkboxyxt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dXNid3FuY2lsemtrYm94eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDg3OTcsImV4cCI6MjA3NTk4NDc5N30.mOkSYqtfFVonzKVAyFT6MkeFjOT7Zme5XaXgUxRPKMc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('1. Testando conexão básica...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('barbershops')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError)
      return
    }
    console.log('✅ Conexão funcionando!')
    
    // Teste 2: Verificar tabelas
    console.log('2. Testando tabela barbershops...')
    const { data: barbershops, error: barbershopsError } = await supabase
      .from('barbershops')
      .select('*')
      .limit(5)
    
    if (barbershopsError) {
      console.error('❌ Erro ao buscar barbershops:', barbershopsError)
    } else {
      console.log('✅ Barbershops encontrados:', barbershops?.length || 0)
    }
    
    // Teste 3: Verificar tabela services
    console.log('3. Testando tabela services...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(5)
    
    if (servicesError) {
      console.error('❌ Erro ao buscar services:', servicesError)
    } else {
      console.log('✅ Services encontrados:', services?.length || 0)
    }
    
    // Teste 4: Verificar tabela barbers
    console.log('4. Testando tabela barbers...')
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .limit(5)
    
    if (barbersError) {
      console.error('❌ Erro ao buscar barbers:', barbersError)
    } else {
      console.log('✅ Barbers encontrados:', barbers?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testSupabaseConnection()
