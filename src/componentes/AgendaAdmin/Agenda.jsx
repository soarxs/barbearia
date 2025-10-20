import React, { useMemo, useState, useEffect } from 'react';
import { useTenant } from '../../hooks/useTenant';
import { getAppointments, addAppointment, updateAppointment, removeAppointment, getServices, getBarbers, getSchedule, isTimeTaken, generateTimeSlotsForBarber, getAllBarberSchedules } from '../../lib/dataStore';
import DatePicker from 'react-datepicker';
import InputMask from 'react-input-mask';
import 'react-datepicker/dist/react-datepicker.css';

export default function Agenda() {
  const { data: tenant } = useTenant();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Estados consolidados
  const [state, setState] = useState({
    selectedDate: new Date(),
    selectedBarber: '',
    showAddModal: false,
    selectedBarberForSchedule: null,
    showScheduleModal: false,
    pickDate: new Date(),
    pickTime: '',
    pickBarber: '',
    pickService: '',
    pickClient: '',
    pickPhone: '',
    pickNotes: ''
  });

  const [barberSchedules, setBarberSchedules] = useState({});

  // Função para atualizar estado
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      if (!tenant?.barbershop?.id) return;
      
      try {
        setLoading(true);
        const [appointmentsData, servicesData, barbersData, scheduleData] = await Promise.all([
          getAppointments(tenant.barbershop.id),
          getServices(tenant.barbershop.id),
          getBarbers(tenant.barbershop.id),
          getSchedule(tenant.barbershop.id)
        ]);
        
        setAppointments(appointmentsData || []);
        setServices(servicesData || []);
        setBarbers(barbersData || []);
        setSchedule(scheduleData || {});
        
        // Definir valores padrão
        if (servicesData?.length > 0 && !state.pickService) {
          updateState({ pickService: servicesData[0].id });
        }
        if (barbersData?.length > 0 && !state.pickBarber) {
          updateState({ pickBarber: barbersData[0].id });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant?.barbershop?.id]);

  // Carregar horários dos barbeiros
  useEffect(() => {
    const loadBarberData = async () => {
      if (!tenant?.barbershop?.id || !barbers.length) return;
      
      try {
        const schedulesData = await getAllBarberSchedules(tenant.barbershop.id);
        const schedulesMap = {};
        schedulesData.forEach(schedule => {
          schedulesMap[schedule.barber_id] = schedule;
        });
        setBarberSchedules(schedulesMap);
      } catch (error) {
        console.error('Erro ao carregar horários dos barbeiros:', error);
      }
    };
    
    loadBarberData();
  }, [state.selectedDate, tenant, barbers]);

  // Filtrar agendamentos do dia
  const filteredDayList = useMemo(() => {
    if (!state.selectedDate) return [];
    
    const dateStr = state.selectedDate.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  }, [appointments, state.selectedDate]);

  // Gerar horários disponíveis
  const barberTimeSlots = useMemo(() => {
    const slots = {};
    barbers.forEach(barber => {
      generateTimeSlotsForBarber(state.selectedDate, tenant?.barbershop?.id, barber.id)
        .then(times => {
          slots[barber.id] = times;
        });
    });
    return slots;
  }, [barbers, state.selectedDate, tenant?.barbershop?.id]);

  // Funções de manipulação
  const handleAddAppointment = async () => {
    if (!state.pickDate || !state.pickTime || !state.pickBarber || !state.pickService || !state.pickClient || !state.pickPhone) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const appointmentData = {
        date: state.pickDate.toISOString().split('T')[0],
        time: state.pickTime,
        barber_id: state.pickBarber,
        service_id: state.pickService,
        client_name: state.pickClient,
        client_phone: state.pickPhone,
        notes: state.pickNotes,
        status: 'confirmado'
      };

      await addAppointment(appointmentData, tenant.barbershop.id);
      
      // Recarregar dados
      const updatedAppointments = await getAppointments(tenant.barbershop.id);
      setAppointments(updatedAppointments || []);
      
      // Limpar formulário
      updateState({
        pickDate: new Date(),
        pickTime: '',
        pickClient: '',
        pickPhone: '',
        pickNotes: ''
      });
      
      setShowAddModal(false);
      alert('Agendamento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      alert('Erro ao adicionar agendamento');
    }
  };

  const handleUpdateAppointment = async (id, updates) => {
    try {
      await updateAppointment(id, updates, tenant.barbershop.id);
      const updatedAppointments = await getAppointments(tenant.barbershop.id);
      setAppointments(updatedAppointments || []);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      alert('Erro ao atualizar agendamento');
    }
  };

  const handleRemoveAppointment = async (id) => {
    if (!confirm('Tem certeza que deseja remover este agendamento?')) return;
    
    try {
      await removeAppointment(id, tenant.barbershop.id);
      const updatedAppointments = await getAppointments(tenant.barbershop.id);
      setAppointments(updatedAppointments || []);
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      alert('Erro ao remover agendamento');
    }
  };

  const isSlotTaken = async (time, barberId) => {
    try {
      return await isTimeTaken(state.selectedDate, time, barberId, tenant.barbershop.id);
    } catch (error) {
      console.error('Erro ao verificar horário:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Agenda</h2>
            <button 
              className="btn btn-blue"
              onClick={() => updateState({ showAddModal: true })}
            >
              Novo Agendamento
            </button>
          </div>

          {/* Filtros */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">Data</label>
              <DatePicker
                selected={state.selectedDate}
                onChange={(date) => updateState({ selectedDate: date })}
                className="form-control"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Barbeiro</label>
              <select 
                className="form-select"
                value={state.selectedBarber}
                onChange={(e) => updateState({ selectedBarber: e.target.value })}
              >
                <option value="">Todos os barbeiros</option>
                {barbers.map(barber => (
                  <option key={barber.id} value={barber.id}>{barber.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de agendamentos */}
          <div className="row">
            {barbers.map(barber => (
              <div key={barber.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{barber.name}</h5>
                    <button 
                      className="btn btn-sm btn-outline-blue"
                      onClick={() => updateState({ selectedBarberForSchedule: barber, showScheduleModal: true })}
                    >
                      Horários
                    </button>
                  </div>
                  <div className="card-body">
                    {(barberTimeSlots[barber.id] || []).map(time => {
                      const appointment = filteredDayList.find(apt => 
                        apt.barber_id === barber.id && apt.time === time
                      );
                      
                      return (
                        <div key={time} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                          <span className="fw-bold">{time}</span>
                          {appointment ? (
                            <div className="text-end">
                              <div className="fw-bold">{appointment.client_name}</div>
                              <small className="text-muted">
                                {services.find(s => s.id === appointment.service_id)?.name}
                              </small>
                            </div>
                          ) : (
                            <span className="text-muted">Livre</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Novo Agendamento */}
      {state.showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Novo Agendamento</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => updateState({ showAddModal: false })}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Data</label>
                    <DatePicker
                      selected={state.pickDate}
                      onChange={(date) => updateState({ pickDate: date })}
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Horário</label>
                    <input 
                      type="time" 
                      className="form-control"
                      value={state.pickTime}
                      onChange={(e) => updateState({ pickTime: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Barbeiro</label>
                    <select 
                      className="form-select"
                      value={state.pickBarber}
                      onChange={(e) => updateState({ pickBarber: e.target.value })}
                    >
                      <option value="">Selecione um barbeiro</option>
                      {barbers.map(barber => (
                        <option key={barber.id} value={barber.id}>{barber.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Serviço</label>
                    <select 
                      className="form-select"
                      value={state.pickService}
                      onChange={(e) => updateState({ pickService: e.target.value })}
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cliente</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={state.pickClient}
                      onChange={(e) => updateState({ pickClient: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Telefone</label>
                    <InputMask
                      mask="(99) 99999-9999"
                      value={state.pickPhone}
                      onChange={(e) => updateState({ pickPhone: e.target.value })}
                    >
                      {(inputProps) => <input {...inputProps} className="form-control" />}
                    </InputMask>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Observações</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={state.pickNotes}
                      onChange={(e) => updateState({ pickNotes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => updateState({ showAddModal: false })}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-blue"
                  onClick={handleAddAppointment}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
