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
  
  // Estados para filtros e seleções
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBarber, setSelectedBarber] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBarberForSchedule, setSelectedBarberForSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Estados para novo agendamento
  const [pickDate, setPickDate] = useState(new Date());
  const [pickTime, setPickTime] = useState('');
  const [pickBarber, setPickBarber] = useState('');
  const [pickService, setPickService] = useState('');
  const [pickClient, setPickClient] = useState('');
  const [pickPhone, setPickPhone] = useState('');
  const [pickNotes, setPickNotes] = useState('');

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
        if (servicesData?.length > 0 && !pickService) {
          setPickService(servicesData[0].id);
        }
        if (barbersData?.length > 0 && !pickBarber) {
          setPickBarber(barbersData[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant]);

  // Gerar horários disponíveis para cada barbeiro
  const [barberTimeSlots, setBarberTimeSlots] = useState({});
  const [barberSchedules, setBarberSchedules] = useState({});
  
  useEffect(() => {
    const loadBarberData = async () => {
      if (!tenant?.barbershop?.id || !barbers.length) return;
      
      try {
        // Carregar horários dos barbeiros
        const schedulesData = await getAllBarberSchedules(tenant.barbershop.id);
        const schedulesMap = {};
        schedulesData.forEach(schedule => {
          schedulesMap[schedule.barber_id] = schedule;
        });
        setBarberSchedules(schedulesMap);
        
        // Gerar slots de tempo para cada barbeiro
        const slots = {};
        for (const barber of barbers) {
          try {
            const barberSlots = await generateTimeSlotsForBarber(selectedDate, tenant.barbershop.id, barber.id);
            slots[barber.id] = barberSlots;
          } catch (error) {
            console.error(`Erro ao carregar horários do barbeiro ${barber.name}:`, error);
            slots[barber.id] = [];
          }
        }
        setBarberTimeSlots(slots);
      } catch (error) {
        console.error('Erro ao carregar dados dos barbeiros:', error);
      }
    };
    
    loadBarberData();
  }, [selectedDate, tenant, barbers]);

  // Filtrar agendamentos do dia
  const filteredDayList = useMemo(() => {
    if (!appointments.length) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  // Calcular totais do dia
  const totalsForDay = useMemo(() => {
    const total = filteredDayList.length;
    const confirmados = filteredDayList.filter(apt => apt.status === 'confirmado').length;
    const pendentes = filteredDayList.filter(apt => apt.status === 'pendente').length;
    const receita = filteredDayList.reduce((acc, apt) => {
      const service = services.find(s => s.id === apt.service_id);
      return acc + (service?.price || 0);
    }, 0);
    
    return { total, confirmados, pendentes, receita };
  }, [filteredDayList, services]);

  // Verificar se horário está ocupado
  const isSlotTaken = async (date, time, barberId) => {
    if (!tenant?.barbershop?.id) return false;
    return await isTimeTaken(tenant.barbershop.id, date, time, barberId);
  };

  // Adicionar agendamento
  const addAppointmentHandler = async (e) => {
    e.preventDefault();
    if (!tenant?.barbershop?.id || !pickTime || !pickBarber || !pickService || !pickClient) return;
    
    try {
      const newAppointment = {
        date: pickDate.toISOString().split('T')[0],
        time: pickTime,
        barber_id: pickBarber,
        service_id: pickService,
        client_name: pickClient,
        client_phone: pickPhone,
        notes: pickNotes,
        status: 'pendente'
      };
      
      const result = await addAppointment(tenant.barbershop.id, newAppointment);
      setAppointments(prev => [...prev, result]);
      setShowAddModal(false);
      
      // Limpar formulário
      setPickTime('');
      setPickClient('');
      setPickPhone('');
      setPickNotes('');
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      alert('Erro ao adicionar agendamento');
    }
  };

  // Confirmar agendamento
  const confirmAppt = async (appointmentId) => {
    if (!tenant?.barbershop?.id) return;
    
    try {
      await updateAppointment(tenant.barbershop.id, appointmentId, { status: 'confirmado' });
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'confirmado' } : apt
      ));
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
    }
  };

  // Cancelar agendamento
  const cancelAppt = async (appointmentId) => {
    if (!tenant?.barbershop?.id) return;
    
    try {
      await removeAppointment(tenant.barbershop.id, appointmentId);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  // Abrir WhatsApp
  const openWhatsApp = (appointment) => {
    const phone = appointment.client_phone?.replace(/\D/g, '');
    if (phone) {
      const message = `Olá ${appointment.client_name}! Seu agendamento para ${appointment.date} às ${appointment.time} está confirmado.`;
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  // Abrir modal de configuração de horários
  const handleOpenScheduleModal = (barberId) => {
    setSelectedBarberForSchedule(barberId);
    setShowScheduleModal(true);
  };

  if (loading) {
    return (
      <div className="agenda-admin">
        <h2 className="mb-3">Agenda</h2>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agenda-admin">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Agenda</h2>
        <div className="d-flex gap-2">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
            minDate={new Date()}
            style={{ width: '150px' }}
          />
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus me-1"></i> Novo Agendamento
          </button>
        </div>
      </div>
      
      {/* Filtro para Mobile */}
      <div className="d-md-none mb-3">
        <select 
          className="form-select" 
          value={selectedBarber} 
          onChange={(e) => setSelectedBarber(e.target.value)}
        >
          <option value="">Todos os Barbeiros</option>
          {barbers.map(barber => (
            <option key={barber.id} value={barber.id}>{barber.name}</option>
          ))}
                </select>
              </div>

      {/* Agenda Desktop - Visual Melhorado */}
      <div className="d-none d-md-block">
        <div className="row g-3">
          {barbers.map(barber => (
            <div key={barber.id} className="col-lg-4 col-md-6">
              <div className="card agenda-barber-card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="barber-avatar me-3">
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{barber.name}</h6>
                      <small className="text-muted">
                        {(barberTimeSlots[barber.id] || []).length} horários disponíveis
                      </small>
                    </div>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleOpenScheduleModal(barber.id)}
                    title="Configurar Horários"
                  >
                    <i className="fas fa-cog"></i>
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="agenda-timeline">
                    {(barberTimeSlots[barber.id] || []).map(time => {
                      const appointment = filteredDayList.find(apt => 
                        apt.barber_id === barber.id && apt.time === time
                      );
                      
                      return (
                        <div key={time} className={`timeline-item ${appointment ? 'booked' : 'available'}`}>
                          <div className="timeline-marker">
                            <div className="marker-dot"></div>
                          </div>
                          <div className="timeline-content">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="timeline-time">{time}</div>
                              <div className="timeline-status">
                                {appointment ? (
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-warning text-dark">
                                      {appointment.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                                    </span>
                                    <div className="btn-group btn-group-sm">
                                      <button 
                                        className={`btn ${appointment.status === 'confirmado' ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => confirmAppt(appointment.id)}
                                        title={appointment.status === 'confirmado' ? 'Confirmado' : 'Confirmar'}
                                      >
                                        <i className={`fas ${appointment.status === 'confirmado' ? 'fa-check' : 'fa-clock'}`}></i>
                                      </button>
                                      <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => openWhatsApp(appointment)}
                                        title="WhatsApp"
                                      >
                                        <i className="fab fa-whatsapp"></i>
                                      </button>
                                      <button 
                                        className="btn btn-outline-danger"
                                        onClick={() => cancelAppt(appointment.id)}
                                        title="Cancelar"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-success">
                                    <i className="fas fa-circle me-1"></i>
                                    Disponível
                                  </span>
                                )}
                              </div>
                            </div>
                            {appointment && (
                              <div className="timeline-details mt-2">
                                <div className="fw-bold text-dark">{appointment.client_name}</div>
                                <small className="text-muted">
                                  {services.find(s => s.id === appointment.service_id)?.name}
                                  {appointment.notes && ` • ${appointment.notes}`}
                                </small>
                              </div>
                            )}
                          </div>
              </div>
                      );
                    })}
              </div>
              </div>
              </div>
            </div>
          ))}
        </div>
            </div>

      {/* Agenda Mobile - Lista única com filtro */}
      <div className="d-md-none">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              {selectedBarber ? 
                `Agenda - ${barbers.find(b => b.id === selectedBarber)?.name}` : 
                'Agenda - Todos os Barbeiros'
              }
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="agenda-list">
              {(() => {
                // Obter horários baseado no filtro
                let timeSlots = [];
                if (selectedBarber) {
                  timeSlots = barberTimeSlots[selectedBarber] || [];
                } else {
                  // Combinar todos os horários dos barbeiros
                  const allSlots = new Set();
                  Object.values(barberTimeSlots).forEach(slots => {
                    slots.forEach(slot => allSlots.add(slot));
                  });
                  timeSlots = Array.from(allSlots).sort();
                }
                
                return timeSlots.map(time => {
                  const appointments = selectedBarber ? 
                    filteredDayList.filter(apt => apt.barber_id === selectedBarber && apt.time === time) :
                    filteredDayList.filter(apt => apt.time === time);
                  
                  if (appointments.length === 0) {
              return (
                      <div key={time} className="agenda-item available">
                        <div className="agenda-time">{time}</div>
                        <div className="agenda-content">
                          <div className="text-muted">
                            <i className="fas fa-circle text-success me-1"></i>
                            Disponível
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return appointments.map(appointment => (
                    <div key={appointment.id} className="agenda-item booked">
                      <div className="agenda-time">{time}</div>
                      <div className="agenda-content">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                            <div className="fw-bold">{appointment.client_name}</div>
                            <small className="text-muted">
                              {barbers.find(b => b.id === appointment.barber_id)?.name} - 
                              {services.find(s => s.id === appointment.service_id)?.name}
                            </small>
                          </div>
                          <div className="d-flex gap-1">
                            <button 
                              className={`btn btn-sm ${appointment.status === 'confirmado' ? 'btn-success' : 'btn-warning'}`}
                              onClick={() => confirmAppt(appointment.id)}
                              title={appointment.status === 'confirmado' ? 'Confirmado' : 'Confirmar'}
                            >
                              <i className={`fas ${appointment.status === 'confirmado' ? 'fa-check' : 'fa-clock'}`}></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openWhatsApp(appointment)}
                              title="WhatsApp"
                            >
                              <i className="fab fa-whatsapp"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => cancelAppt(appointment.id)}
                              title="Cancelar"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo do Dia */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Resumo do Dia</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <div className="border rounded p-3">
                    <div className="h4 text-primary mb-0">{totalsForDay.total}</div>
                    <small className="text-muted">Total</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border rounded p-3">
                    <div className="h4 text-success mb-0">{totalsForDay.confirmados}</div>
                    <small className="text-muted">Confirmados</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border rounded p-3">
                    <div className="h4 text-warning mb-0">{totalsForDay.pendentes}</div>
                    <small className="text-muted">Pendentes</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border rounded p-3">
                    <div className="h4 text-success mb-0">R$ {totalsForDay.receita.toFixed(2)}</div>
                    <small className="text-muted">Receita</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para adicionar agendamento */}
      <div className={`modal ${showAddModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Adicionar Agendamento</h5>
              <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={addAppointmentHandler}>
                <div className="mb-3">
                  <label className="form-label">Data</label>
                  <DatePicker
                    selected={pickDate}
                    onChange={(date) => setPickDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    minDate={new Date()}
                  />
                </div>
                <div className="mb-3">
              <label className="form-label">Horário</label>
                  <select className="form-control" value={pickTime} onChange={(e) => setPickTime(e.target.value)}>
                    <option value="">Selecione um horário</option>
                    {(barberTimeSlots[pickBarber] || []).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
              </select>
            </div>
                <div className="mb-3">
                  <label className="form-label">Barbeiro</label>
                  <select className="form-control" value={pickBarber} onChange={(e) => setPickBarber(e.target.value)}>
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
              </select>
            </div>
                <div className="mb-3">
                  <label className="form-label">Serviço</label>
                  <select className="form-control" value={pickService} onChange={(e) => setPickService(e.target.value)}>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
              </select>
            </div>
                <div className="mb-3">
                  <label className="form-label">Cliente</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={pickClient} 
                    onChange={(e) => setPickClient(e.target.value)}
                    placeholder="Nome do cliente"
                  />
            </div>
                <div className="mb-3">
              <label className="form-label">Telefone</label>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={pickPhone}
                    onChange={(e) => setPickPhone(e.target.value)}
                    className="form-control"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Observações</label>
                  <textarea 
                    className="form-control" 
                    value={pickNotes} 
                    onChange={(e) => setPickNotes(e.target.value)}
                    rows="3"
                    placeholder="Observações adicionais"
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">Adicionar</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
            </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showAddModal && <div className="modal-backdrop show"></div>}

      {/* Modal para configurar horários do barbeiro */}
      <div className={`modal ${showScheduleModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Configurar Horários - {barbers.find(b => b.id === selectedBarberForSchedule)?.name}
              </h5>
              <button type="button" className="btn-close" onClick={() => setShowScheduleModal(false)}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => (
                  <div key={day} className="col-md-6 mb-3">
                    <div className="card">
                      <div className="card-header">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`${day}-working`}
                            defaultChecked={index > 0 && index < 6}
                          />
                          <label className="form-check-label fw-bold" htmlFor={`${day}-working`}>
                            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][index]}
                          </label>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="form-label small">Início</label>
                            <input type="time" className="form-control form-control-sm" defaultValue="08:00" />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">Fim</label>
                            <input type="time" className="form-control form-control-sm" defaultValue="18:00" />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">Almoço Início</label>
                            <input type="time" className="form-control form-control-sm" defaultValue="12:00" />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">Almoço Fim</label>
                            <input type="time" className="form-control form-control-sm" defaultValue="13:00" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary">
                <i className="fas fa-save me-1"></i>
                Salvar Horários
              </button>
            </div>
          </div>
        </div>
      </div>
      {showScheduleModal && <div className="modal-backdrop show"></div>}
    </div>
  );
}