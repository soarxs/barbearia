import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase.js'

export const useTenant = () => {
  const { barbeariaId } = useParams()
  const host = window.location.host
  const isAdmin = window.location.pathname.startsWith('/admin')
  
  return useQuery({
    queryKey: ['tenant', barbeariaId, host, isAdmin],
    queryFn: async () => {
      // Se estiver no admin, usar barbearia padrão
      if (isAdmin) {
        return {
          type: 'admin',
          barbershop: {
            id: '33513ff5-dd80-4534-9f85-f660304ad420',
            name: 'Barbearia do João',
            slug: 'barbearia-joao'
          }
        }
      }
      
      let barbershop = null
      
      if (host !== 'localhost:8080' && host !== 'localhost:8081' && host !== 'localhost:8082' && host !== 'localhost:8083' && host !== 'localhost:8084' && host !== 'localhost:8085' && host !== 'seusistema.com') {
        // Domínio próprio
        const { data, error } = await supabase
          .from('barbershops')
          .select('*')
          .eq('custom_domain', host)
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        barbershop = data
      } else {
        // Subrota
        const { data, error } = await supabase
          .from('barbershops')
          .select('*')
          .eq('slug', barbeariaId || 'barbearia-joao')
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        barbershop = data
      }
      
      if (!barbershop) {
        // Fallback para barbearia padrão
        return {
          type: 'default',
          barbershop: {
            id: 'default-barbershop',
            name: 'Barbearia do João',
            slug: 'barbearia-joao'
          }
        }
      }
      
      return {
        type: host !== 'localhost:8080' && host !== 'localhost:8081' && host !== 'localhost:8082' && host !== 'localhost:8083' && host !== 'localhost:8084' && host !== 'localhost:8085' && host !== 'seusistema.com' ? 'custom_domain' : 'subroute',
        barbershop
      }
    },
    enabled: true, // Sempre habilitado
    retry: 1
  })
}
