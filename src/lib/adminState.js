// Estado global simples para o admin funcionar sem Supabase
let adminServices = [
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

let adminBarbers = [
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

let adminSchedule = {
  workingDays: [1,2,3,4,5,6],
  open: '08:00',
  close: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  stepMinutes: 30,
};

// Funções para gerenciar o estado
export const getAdminServices = () => [...adminServices];
export const addAdminService = (service) => {
  const newService = {
    id: `service-${Date.now()}`,
    ...service,
    is_active: true
  };
  adminServices.push(newService);
  return newService;
};
export const updateAdminService = (id, updates) => {
  const index = adminServices.findIndex(s => s.id === id);
  if (index !== -1) {
    adminServices[index] = { ...adminServices[index], ...updates };
    return adminServices[index];
  }
  return null;
};
export const deleteAdminService = (id) => {
  const index = adminServices.findIndex(s => s.id === id);
  if (index !== -1) {
    adminServices.splice(index, 1);
    return true;
  }
  return false;
};

export const getAdminBarbers = () => [...adminBarbers];
export const addAdminBarber = (barber) => {
  const newBarber = {
    id: `barber-${Date.now()}`,
    ...barber,
    is_active: true
  };
  adminBarbers.push(newBarber);
  return newBarber;
};
export const updateAdminBarber = (id, updates) => {
  const index = adminBarbers.findIndex(b => b.id === id);
  if (index !== -1) {
    adminBarbers[index] = { ...adminBarbers[index], ...updates };
    return adminBarbers[index];
  }
  return null;
};
export const deleteAdminBarber = (id) => {
  const index = adminBarbers.findIndex(b => b.id === id);
  if (index !== -1) {
    adminBarbers.splice(index, 1);
    return true;
  }
  return false;
};

export const getAdminSchedule = () => ({ ...adminSchedule });
export const setAdminSchedule = (schedule) => {
  adminSchedule = { ...schedule };
  return adminSchedule;
};
