export const mockBarbershop = { id: 'default-barbershop', name: 'Barbearia Admin', slug: 'admin' };

export const mockServices = [
  { id: 'corte', name: 'Corte de Cabelo', price: 40.00, duration_minutes: 30, is_active: true },
  { id: 'barba', name: 'Barba', price: 30.00, duration_minutes: 20, is_active: true },
  { id: 'combo', name: 'Corte + Barba', price: 65.00, duration_minutes: 45, is_active: true }
];

export const mockBarbers = [
  { id: 'joao', name: 'João Silva', email: 'joao@barbearia.com', phone: '(11) 99999-9999', is_active: true },
  { id: 'carlos', name: 'Carlos Santos', email: 'carlos@barbearia.com', phone: '(11) 88888-8888', is_active: true },
  { id: 'rafael', name: 'Rafael Oliveira', email: 'rafael@barbearia.com', phone: '(11) 77777-7777', is_active: true }
];

export const mockAppointments = [
  { id: 'apt-1', date: '2024-01-15', time: '09:00', service_id: 'corte', barber_id: 'joao', client_name: 'João Cliente', client_phone: '+5511999999999', status: 'pendente', notes: 'Primeira vez' },
  { id: 'apt-2', date: '2024-01-15', time: '10:30', service_id: 'barba', barber_id: 'carlos', client_name: 'Maria Cliente', client_phone: '+5511888888888', status: 'confirmado', notes: 'Cliente regular' }
];

export const mockSchedule = { workingDays: [1, 2, 3, 4, 5, 6], open: '08:00', close: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 30 };
