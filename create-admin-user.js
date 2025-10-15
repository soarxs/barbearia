// Script para criar usuário admin no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxusbwqncilzkkboxyxt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dXNid3FuY2lsemtrYm94eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDg3OTcsImV4cCI6MjA3NTk4NDc5N30.mOkSYqtfFVonzKVAyFT6MkeFjOT7Zme5XaXgUxRPKMc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminUser() {
  console.log('🔐 Criando usuário admin no Supabase...')
  
  try {
    // Dados do usuário admin
    const adminEmail = 'admin@barbearia.com'
    const adminPassword = 'admin123456' // Senha temporária - deve ser alterada
    
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Senha temporária:', adminPassword)
    console.log('')
    
    // Criar usuário admin
    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          role: 'admin',
          name: 'Administrador'
        }
      }
    })
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('⚠️ Usuário admin já existe!')
        console.log('💡 Tentando fazer login para verificar...')
        
        // Tentar fazer login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        })
        
        if (loginError) {
          console.error('❌ Erro ao fazer login:', loginError.message)
          console.log('💡 O usuário existe mas a senha pode estar incorreta.')
          console.log('💡 Acesse o dashboard do Supabase para resetar a senha:')
          console.log('🔗 https://supabase.com/dashboard/project/sxusbwqncilzkkboxyxt/auth/users')
        } else {
          console.log('✅ Login realizado com sucesso!')
          console.log('👤 Usuário:', loginData.user.email)
          console.log('🆔 ID:', loginData.user.id)
        }
      } else {
        console.error('❌ Erro ao criar usuário:', error.message)
      }
    } else {
      console.log('✅ Usuário admin criado com sucesso!')
      console.log('👤 Email:', data.user?.email)
      console.log('🆔 ID:', data.user?.id)
      
      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Verificação de email necessária!')
        console.log('💡 Acesse o email para confirmar a conta.')
      }
    }
    
    console.log('')
    console.log('📋 PRÓXIMOS PASSOS:')
    console.log('1. Acesse: http://localhost:3000/admin/login')
    console.log('2. Use as credenciais:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Senha: ${adminPassword}`)
    console.log('3. Marque "Lembrar de mim" se desejar')
    console.log('4. Altere a senha após o primeiro login')
    console.log('')
    console.log('🔐 Para gerenciar usuários:')
    console.log('🔗 https://supabase.com/dashboard/project/sxusbwqncilzkkboxyxt/auth/users')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar script
createAdminUser()
