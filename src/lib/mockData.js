// Dados mock para o admin funcionar sem Supabase
export const mockBarbershop = {
  id: 'default-barbershop',
  name: 'Barbearia Admin',
  slug: 'admin'
};

export const mockServices = [
  {
    id: 'corte',
    name: 'Corte de Cabelo',
    price: 40.00,
    description: 'Corte moderno e personalizado',
    duration_minutes: 30,
    is_active: true
  },
  {
    id: 'barba',
    name: 'Barba',
    price: 30.00,
    description: 'Modelagem e acabamento profissional',
    duration_minutes: 20,
    is_active: true
  },
  {
    id: 'combo',
    name: 'Corte + Barba',
    price: 65.00,
    description: 'Pacote completo',
    duration_minutes: 45,
    is_active: true
  }
];

export const mockBarbers = [
  {
    id: 'joao',
    name: 'João Silva',
    email: 'joao@barbearia.com',
    phone: '(11) 99999-9999',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    specialties: ['corte', 'barba'],
    is_active: true
  },
  {
    id: 'carlos',
    name: 'Carlos Santos',
    email: 'carlos@barbearia.com',
    phone: '(11) 88888-8888',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    specialties: ['corte', 'barba'],
    is_active: true
  },
  {
    id: 'rafael',
    name: 'Rafael Oliveira',
    email: 'rafael@barbearia.com',
    phone: '(11) 77777-7777',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    specialties: ['corte'],
    is_active: true
  }
];

export const mockAppointments = [
  {
    id: 'apt-1',
    date: '2024-01-15',
    time: '09:00',
    service_id: 'corte',
    barber_id: 'joao',
    client_name: 'João Cliente',
    client_phone: '+5511999999999',
    status: 'pendente',
    notes: 'Primeira vez'
  },
  {
    id: 'apt-2',
    date: '2024-01-15',
    time: '10:30',
    service_id: 'barba',
    barber_id: 'carlos',
    client_name: 'Maria Cliente',
    client_phone: '+5511888888888',
    status: 'confirmado',
    notes: 'Cliente regular'
  }
];

export const mockSchedule = {
  workingDays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  open: '08:00',
  close: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  stepMinutes: 30
};
