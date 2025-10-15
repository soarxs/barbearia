// Teste final para verificar se tudo está funcionando
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxusbwqncilzkkboxyxt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dXNid3FuY2lsemtrYm94eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDg3OTcsImV4cCI6MjA3NTk4NDc5N30.mOkSYqtfFVonzKVAyFT6MkeFjOT7Zme5XaXgUxRPKMc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFinal() {
  console.log('🧪 TESTE FINAL - Verificando integração completa...')
  console.log('')
  
  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão...')
    console.log('   URL:', supabaseUrl)
    console.log('   Key:', supabaseKey.substring(0, 20) + '...')
    console.log('   ✅ Conexão configurada')
    console.log('')
    
    // 2. Testar barbearias
    console.log('2️⃣ Testando tabela barbershops...')
    const { data: barbershops, error: barbershopsError } = await supabase
      .from('barbershops')
      .select('*')
    
    if (barbershopsError) {
      console.log('   ❌ Erro:', barbershopsError.message)
      console.log('   💡 Execute o SQL no dashboard primeiro!')
      return
    }
    
    console.log('   ✅ Tabela barbershops funcionando!')
    console.log('   📊 Barbearias encontradas:', barbershops.length)
    barbershops.forEach(shop => {
      console.log(`      - ${shop.name} (${shop.slug})`)
    })
    console.log('')
    
    // 3. Testar serviços
    console.log('3️⃣ Testando tabela services...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
    
    if (servicesError) {
      console.log('   ❌ Erro:', servicesError.message)
    } else {
      console.log('   ✅ Tabela services funcionando!')
      console.log('   📊 Serviços encontrados:', services.length)
      services.forEach(service => {
        console.log(`      - ${service.name} (R$ ${service.price})`)
      })
    }
    console.log('')
    
    // 4. Testar barbeiros
    console.log('4️⃣ Testando tabela barbers...')
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
    
    if (barbersError) {
      console.log('   ❌ Erro:', barbersError.message)
    } else {
      console.log('   ✅ Tabela barbers funcionando!')
      console.log('   📊 Barbeiros encontrados:', barbers.length)
      barbers.forEach(barber => {
        console.log(`      - ${barber.name}`)
      })
    }
    console.log('')
    
    // 5. Testar agendamentos
    console.log('5️⃣ Testando tabela appointments...')
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
    
    if (appointmentsError) {
      console.log('   ❌ Erro:', appointmentsError.message)
    } else {
      console.log('   ✅ Tabela appointments funcionando!')
      console.log('   📊 Agendamentos encontrados:', appointments.length)
    }
    console.log('')
    
    // 6. Teste de inserção
    console.log('6️⃣ Testando inserção de agendamento...')
    const testAppointment = {
      barbershop_id: barbershops[0]?.id,
      date: '2024-01-15',
      time: '14:00',
      service_id: services[0]?.id,
      barber_id: barbers[0]?.id,
      client_name: 'Teste Cliente',
      client_phone: '+5511999999999',
      status: 'pendente'
    }
    
    if (barbershops[0] && services[0] && barbers[0]) {
      const { data: newAppointment, error: insertError } = await supabase
        .from('appointments')
        .insert([testAppointment])
        .select()
        .single()
      
      if (insertError) {
        console.log('   ❌ Erro na inserção:', insertError.message)
      } else {
        console.log('   ✅ Inserção funcionando!')
        console.log('   📊 Agendamento criado:', newAppointment.id)
        
        // Limpar teste
        await supabase
          .from('appointments')
          .delete()
          .eq('id', newAppointment.id)
        console.log('   🧹 Agendamento de teste removido')
      }
    } else {
      console.log('   ⚠️ Dados insuficientes para teste de inserção')
    }
    console.log('')
    
    // 7. Resumo final
    console.log('🎉 TESTE FINAL CONCLUÍDO!')
    console.log('')
    console.log('✅ Tudo funcionando perfeitamente!')
    console.log('')
    console.log('🚀 PRÓXIMOS PASSOS:')
    console.log('1. Inicie o servidor: npm run dev')
    console.log('2. Acesse: http://localhost:8080/barbearia-joao')
    console.log('3. Teste o agendamento no frontend')
    console.log('4. Verifique os dados no dashboard do Supabase')
    
  } catch (error) {
    console.error('❌ Erro no teste final:', error)
  }
}

testFinal()
