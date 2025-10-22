import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from './useAuth.jsx'

export const useTenant = () => {
  const { barbeariaId } = useParams()
  const host = window.location.host
  const isAdmin = window.location.pathname.startsWith('/admin')
  const { user } = useAuth()
  
  
  return useQuery({
    queryKey: ['tenant', barbeariaId, host, isAdmin],
    queryFn: async () => {
      
      // Se estiver no admin, buscar o primeiro barbershop do Supabase
      if (isAdmin) {
        const { data: barbershopData, error: barbershopError } = await supabase
          .from('barbershops')
          .select('*')
          .limit(1)
          .single()
        
        if (barbershopError && barbershopError.code !== 'PGRST116') {
          console.error('❌ Error fetching barbershop for admin:', barbershopError)
          return { type: 'admin', barbershop: null }
        }
        
        if (barbershopData) {
          console.log('✅ Barbershop found for admin:', barbershopData.name, 'ID:', barbershopData.id)
          return {
            type: 'admin',
            barbershop: {
              id: barbershopData.id,
              name: barbershopData.name,
              slug: barbershopData.slug
            }
          }
        } else {
          console.warn('No barbershop found for admin. Please ensure at least one barbershop exists in Supabase.')
          return { type: 'admin', barbershop: null }
        }
      }
      
      let barbershop = null
      
      // Para localhost e Vercel, buscar o primeiro barbershop do Supabase
      if (host.includes('localhost') || host.includes('vercel.app')) {
        console.log('🔍 Localhost/Vercel detected, fetching first barbershop from Supabase')
        const { data: defaultBarbershop, error: defaultError } = await supabase
          .from('barbershops')
          .select('*')
          .limit(1)
          .single()
        
        if (defaultError && defaultError.code !== 'PGRST116') {
          console.error('❌ Error fetching default barbershop for localhost/Vercel:', defaultError)
          barbershop = null
        } else {
          barbershop = defaultBarbershop
          console.log('✅ Default barbershop found:', barbershop?.name, 'ID:', barbershop?.id)
        }
      } else if (host !== 'barbearia-guilhermes-projects-02fc08b4.vercel.app' && host !== 'seusistema.com') {
        // Domínio próprio
        console.log('🔍 Custom domain detected, fetching by domain:', host)
        const { data, error } = await supabase
          .from('barbershops')
          .select('*')
          .eq('custom_domain', host)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error fetching barbershop by domain:', error)
          barbershop = null
        } else {
          barbershop = data
          console.log('✅ Barbershop found by domain:', barbershop?.name)
        }
      } else {
        // Subrota para produção
        console.log('🔍 Production subroute detected, fetching by slug:', barbeariaId || 'barbearia-joao')
        const { data, error } = await supabase
          .from('barbershops')
          .select('*')
          .eq('slug', barbeariaId || 'barbearia-joao')
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error fetching barbershop by slug:', error)
          barbershop = null
        } else {
          barbershop = data
          console.log('✅ Barbershop found by slug:', barbershop?.name)
        }
      }
      
      if (!barbershop) {
        // Fallback: tentar buscar qualquer barbershop disponível
        console.log('🔍 No barbershop found, trying fallback from Supabase')
        const { data: fallbackBarbershop, error: fallbackError } = await supabase
          .from('barbershops')
          .select('*')
          .limit(1)
          .single()
        
        if (fallbackError || !fallbackBarbershop) {
          console.error('❌ No barbershop found in Supabase. Please create at least one barbershop.')
          return {
            type: 'default',
            barbershop: null
          }
        }
        
        console.log('✅ Fallback barbershop found:', fallbackBarbershop.name)
        barbershop = fallbackBarbershop
      }
      
      return {
        type: host.includes('localhost') || host.includes('vercel.app') ? 'development' : 
              host !== 'barbearia-guilhermes-projects-02fc08b4.vercel.app' && host !== 'seusistema.com' ? 'custom_domain' : 'production',
        barbershop
      }
    },
    enabled: true, // Sempre habilitado
    retry: 1
  })
}
