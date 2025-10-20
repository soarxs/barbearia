// Constantes e dados mockados centralizados
export const MOCK_BARBERS = [
  { id: 'joao', name: 'João Silva' },
  { id: 'carlos', name: 'Carlos Santos' },
  { id: 'rafael', name: 'Rafael Oliveira' },
];

export const MOCK_SERVICES = [
  { id: 'haircut', name: 'Corte de Cabelo', icon: '💇' },
  { id: 'beard', name: 'Barba', icon: '🧔' },
  { id: 'combo', name: 'Corte + Barba', icon: '💈' },
];

export const DEFAULT_TIMES = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const BOOKING_STEPS = {
  SERVICE: 1,
  BARBER: 2,
  DATETIME: 3,
  INFO: 4
};

export const STEP_TITLES = {
  1: 'Escolha o Serviço',
  2: 'Escolha o Barbeiro',
  3: 'Data e Horário',
  4: 'Suas Informações'
};

export const STEP_DESCRIPTIONS = {
  1: 'Selecione o serviço que deseja agendar',
  2: 'Escolha o barbeiro de sua preferência',
  3: 'Selecione a data e horário disponível',
  4: 'Preencha seus dados para finalizar o agendamento'
};
