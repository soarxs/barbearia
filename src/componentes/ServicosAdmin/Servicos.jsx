import React, { useState, useEffect } from 'react';
import './Servicos.css';
import { toast } from 'sonner';
import { getServices, addService, updateService, deleteService, getBarbers, addBarber, updateBarber, deleteBarber, getSchedule, setSchedule, getBarberSchedule, setBarberSchedule, getAllBarberSchedules } from '@/lib/dataStore.js';
import { useTenant } from '@/hooks/useTenant.js';

function Servicos() {
  const { data: tenant } = useTenant();
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [schedule, setScheduleState] = useState({
    workingDays: [1,2,3,4,5,6],
    open: '08:00',
    close: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    stepMinutes: 30,
  });
  
  // Estados para formulários
  const [serviceForm, setServiceForm] = useState({ id: '', name: '', price: '', description: '' });
  const [barberForm, setBarberForm] = useState({ id: '', name: '', email: '', phone: '' });
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // services, barbers, schedule
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [barberSchedules, setBarberSchedules] = useState({});
  const [selectedBarberForSchedule, setSelectedBarberForSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!tenant?.barbershop?.id) return;
      
      try {
        setLoading(true);
        
        // Carregar serviços
        const servicesData = await getServices(tenant.barbershop.id);
        setServices(servicesData || []);
        
        // Carregar barbeiros
        const barbersData = await getBarbers(tenant.barbershop.id);
        setBarbers(barbersData || []);
        
        // Carregar configuração de horários
        const scheduleData = await getSchedule(tenant.barbershop.id);
        setScheduleState(scheduleData);
        
        // Carregar horários dos barbeiros
        const barberSchedulesData = await getAllBarberSchedules(tenant.barbershop.id);
        const schedulesMap = {};
        barberSchedulesData.forEach(schedule => {
          schedulesMap[schedule.barber_id] = schedule;
        });
        setBarberSchedules(schedulesMap);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant]);

  // Funções para serviços
  const onSubmitService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !String(serviceForm.price).trim()) return;
    if (!tenant?.barbershop?.id) return;
    
    try {
    if (editing) {
        // Atualizar serviço existente
        await updateService(editing, {
          name: serviceForm.name.trim(),
          price: Number(serviceForm.price),
          description: serviceForm.description
        });
        setServices(prev => prev.map(s => s.id === editing ? { ...s, name: serviceForm.name.trim(), price: Number(serviceForm.price), description: serviceForm.description } : s));
        setEditing(null);
        setServiceForm({ id: '', name: '', price: '', description: '' });
      toast.success('Serviço atualizado!');
      } else {
        // Adicionar novo serviço
        const newService = await addService(tenant.barbershop.id, {
          name: serviceForm.name.trim(),
          price: Number(serviceForm.price),
          description: serviceForm.description,
          duration_minutes: 30
        });
        setServices(prev => [...prev, newService]);
        setServiceForm({ id: '', name: '', price: '', description: '' });
        toast.success('Serviço adicionado!');
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast.error('Erro ao salvar serviço');
    }
  };

  const onEditService = (s) => {
    setEditing(s.id);
    setServiceForm({ id: s.id, name: s.name, price: s.price, description: s.description || '' });
  };

  const onRemoveService = async (id) => {
    try {
      await deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('Serviço removido!');
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      toast.error('Erro ao remover serviço');
    }
  };

  // Funções para barbeiros
  const onSubmitBarber = async (e) => {
    e.preventDefault();
    if (!barberForm.name.trim()) return;
    if (!tenant?.barbershop?.id) return;
    
    try {
      if (editing) {
        // Atualizar barbeiro existente
        await updateBarber(editing, {
          name: barberForm.name.trim(),
          email: barberForm.email,
          phone: barberForm.phone
        });
        setBarbers(prev => prev.map(b => b.id === editing ? { ...b, name: barberForm.name.trim(), email: barberForm.email, phone: barberForm.phone } : b));
        setEditing(null);
        setBarberForm({ id: '', name: '', email: '', phone: '' });
        toast.success('Barbeiro atualizado!');
      } else {
        // Adicionar novo barbeiro
        const newBarber = await addBarber(tenant.barbershop.id, {
          name: barberForm.name.trim(),
          email: barberForm.email,
          phone: barberForm.phone
        });
        setBarbers(prev => [...prev, newBarber]);
        setBarberForm({ id: '', name: '', email: '', phone: '' });
        toast.success('Barbeiro adicionado!');
      }
    } catch (error) {
      console.error('Erro ao salvar barbeiro:', error);
      toast.error('Erro ao salvar barbeiro');
    }
  };

  const onEditBarber = (b) => {
    setEditing(b.id);
    setBarberForm({ id: b.id, name: b.name, email: b.email || '', phone: b.phone || '' });
  };

  const onRemoveBarber = async (id) => {
    try {
      await deleteBarber(id);
      setBarbers(prev => prev.filter(b => b.id !== id));
      toast.success('Barbeiro removido!');
    } catch (error) {
      console.error('Erro ao remover barbeiro:', error);
      toast.error('Erro ao remover barbeiro');
    }
  };

  // Funções para configurações de horário
  const toggleDay = async (dayNum) => {
    if (!tenant?.barbershop?.id) return;
    
    const exists = schedule.workingDays.includes(dayNum);
    const wd = exists ? schedule.workingDays.filter(d => d !== dayNum) : [...schedule.workingDays, dayNum];
    const cfg = { ...schedule, workingDays: wd.sort((a,b)=>a-b) };
    
    try {
      await setSchedule(tenant.barbershop.id, cfg);
      setScheduleState(cfg);
      toast.success('Configuração atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  // Função para detectar mudanças nos formulários
  const handleServiceFormChange = (field, value) => {
    setServiceForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBarberFormChange = (field, value) => {
    setBarberForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleScheduleChange = (field, value) => {
    setScheduleState(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Função para salvar todas as alterações
  const saveAllChanges = async () => {
    if (!tenant?.barbershop?.id) return;
    
    try {
      setSaving(true);
      
      // Salvar configuração de horários se houve mudanças
      if (hasChanges) {
        await setSchedule(tenant.barbershop.id, schedule);
        toast.success('Alterações salvas com sucesso!');
        setHasChanges(false);
      }
      
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro ao salvar alterações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Funções para gerenciar horários dos barbeiros
  const openBarberScheduleModal = (barberId) => {
    setSelectedBarberForSchedule(barberId);
    setShowScheduleModal(true);
  };

  const saveBarberSchedule = async (barberId, scheduleData) => {
    if (!tenant?.barbershop?.id) return;
    
    try {
      setSaving(true);
      await setBarberSchedule(tenant.barbershop.id, barberId, scheduleData);
      
      // Atualizar estado local
      setBarberSchedules(prev => ({
        ...prev,
        [barberId]: { ...prev[barberId], ...scheduleData }
      }));
      
      toast.success('Horários do barbeiro salvos com sucesso!');
      setShowScheduleModal(false);
      
    } catch (error) {
      console.error('Erro ao salvar horários do barbeiro:', error);
      toast.error('Erro ao salvar horários do barbeiro');
    } finally {
      setSaving(false);
    }
  };

  const onScheduleChange = (key, value) => {
    const cfg = { ...schedule, [key]: value };
    setScheduleState(cfg);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="servicos-admin">
        <h2 className="mb-3">Serviços</h2>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="servicos-admin">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Configurações</h2>
        {hasChanges && (
          <button 
            className="btn btn-primary"
            onClick={saveAllChanges}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Salvando...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Salvar Alterações
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Navegação por abas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Serviços
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'barbers' ? 'active' : ''}`}
            onClick={() => setActiveTab('barbers')}
          >
            Profissionais
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Horários
          </button>
        </li>
      </ul>

      {/* Aba de Serviços */}
      {activeTab === 'services' && (
        <>
      <div className="row g-3">
        {services.slice().sort((a,b) => a.name.localeCompare(b.name)).map((s) => (
          <div key={s.id} className="col-12 col-md-4">
            <div className="card bg-dark text-white h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>{s.name}</strong>
                  <span className="badge bg-warning text-dark">R$ {s.price.toFixed(2)}</span>
                </div>
                    {s.description && <p className="text-muted small">{s.description}</p>}
                <div className="mt-auto d-flex gap-2">
                      <button className="btn btn-sm btn-outline-blue" onClick={() => onEditService(s)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('Remover este serviço?')) onRemoveService(s.id); }}>Remover</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-dark text-white mt-4">
        <div className="card-body">
          <h5>{editing ? 'Editar Serviço' : 'Adicionar Serviço'}</h5>
              <form className="row g-3" onSubmit={onSubmitService}>
            <div className="col-12 col-md-4">
              <label className="form-label">Nome</label>
                  <input className="form-control bg-dark text-white border-secondary" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="Corte de Cabelo" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Valor</label>
              <div className="input-group">
                <span className="input-group-text bg-dark text-white border-secondary">R$</span>
                    <input type="number" step="0.01" className="form-control bg-dark text-white border-secondary" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} placeholder="40" />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição (opcional)</label>
                  <textarea className="form-control bg-dark text-white border-secondary" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Descrição do serviço..." rows="3" />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-blue">{editing ? 'Salvar Alterações' : 'Adicionar'}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Aba de Profissionais */}
      {activeTab === 'barbers' && (
        <>
          <div className="row g-3">
            {barbers.slice().sort((a,b) => a.name.localeCompare(b.name)).map((b) => (
              <div key={b.id} className="col-12 col-md-4">
                <div className="card bg-dark text-white h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>{b.name}</strong>
                    </div>
                    {b.email && <p className="text-muted small mb-1">{b.email}</p>}
                    {b.phone && <p className="text-muted small mb-1">{b.phone}</p>}
                         <div className="mt-auto d-flex gap-2">
                           <button className="btn btn-sm btn-outline-primary" onClick={() => openBarberScheduleModal(b.id)} title="Configurar Horários">
                             <i className="fas fa-clock"></i>
                           </button>
                           <button className="btn btn-sm btn-outline-blue" onClick={() => onEditBarber(b)}>Editar</button>
                           <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('Remover este profissional?')) onRemoveBarber(b.id); }}>Remover</button>
                         </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-dark text-white mt-4">
            <div className="card-body">
              <h5>{editing ? 'Editar Profissional' : 'Adicionar Profissional'}</h5>
              <form className="row g-3" onSubmit={onSubmitBarber}>
                <div className="col-12 col-md-6">
                  <label className="form-label">Nome</label>
                  <input className="form-control bg-dark text-white border-secondary" value={barberForm.name} onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })} placeholder="João Silva" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Email (opcional)</label>
                  <input type="email" className="form-control bg-dark text-white border-secondary" value={barberForm.email} onChange={(e) => setBarberForm({ ...barberForm, email: e.target.value })} placeholder="joao@barbearia.com" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Telefone (opcional)</label>
                  <input className="form-control bg-dark text-white border-secondary" value={barberForm.phone} onChange={(e) => setBarberForm({ ...barberForm, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-blue">{editing ? 'Salvar Alterações' : 'Adicionar'}</button>
            </div>
          </form>
        </div>
      </div>
        </>
      )}

      {/* Aba de Horários */}
      {activeTab === 'schedule' && (
        <div className="card bg-dark text-white">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Configuração de Horários</h5>
              {hasChanges && (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={saveAllChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Salvar Horários
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Dias de Funcionamento</label>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    { num: 1, name: 'Segunda' },
                    { num: 2, name: 'Terça' },
                    { num: 3, name: 'Quarta' },
                    { num: 4, name: 'Quinta' },
                    { num: 5, name: 'Sexta' },
                    { num: 6, name: 'Sábado' },
                    { num: 0, name: 'Domingo' }
                  ].map(day => (
                    <button
                      key={day.num}
                      type="button"
                      className={`btn btn-sm ${schedule.workingDays.includes(day.num) ? 'btn-blue' : 'btn-outline-secondary'}`}
                      onClick={() => toggleDay(day.num)}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Horário de Abertura</label>
                <input 
                  type="time" 
                  className="form-control bg-dark text-white border-secondary" 
                  value={schedule.open} 
                  onChange={(e) => onScheduleChange('open', e.target.value)} 
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Horário de Fechamento</label>
                <input 
                  type="time" 
                  className="form-control bg-dark text-white border-secondary" 
                  value={schedule.close} 
                  onChange={(e) => onScheduleChange('close', e.target.value)} 
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Início do Almoço</label>
                <input 
                  type="time" 
                  className="form-control bg-dark text-white border-secondary" 
                  value={schedule.lunchStart} 
                  onChange={(e) => onScheduleChange('lunchStart', e.target.value)} 
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Fim do Almoço</label>
                <input 
                  type="time" 
                  className="form-control bg-dark text-white border-secondary" 
                  value={schedule.lunchEnd} 
                  onChange={(e) => onScheduleChange('lunchEnd', e.target.value)} 
                />
              </div>
              
              <div className="col-12">
                <label className="form-label">Intervalo entre Horários (minutos)</label>
                <select 
                  className="form-control bg-dark text-white border-secondary" 
                  value={schedule.stepMinutes} 
                  onChange={(e) => onScheduleChange('stepMinutes', parseInt(e.target.value))}
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                </select>
                <small className="form-text text-muted">Padrão: 1 hora</small>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <BarberScheduleForm 
                barberId={selectedBarberForSchedule}
                currentSchedule={barberSchedules[selectedBarberForSchedule]}
                onSave={saveBarberSchedule}
                onCancel={() => setShowScheduleModal(false)}
                saving={saving}
              />
            </div>
          </div>
        </div>
      </div>
      {showScheduleModal && <div className="modal-backdrop show"></div>}
    </div>
  );
}

// Componente para formulário de horários do barbeiro
function BarberScheduleForm({ barberId, currentSchedule, onSave, onCancel, saving }) {
  const [scheduleData, setScheduleData] = useState({
    monday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    thursday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    friday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    saturday: { isWorking: true, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 },
    sunday: { isWorking: false, startTime: '08:00', endTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', stepMinutes: 60 }
  });

  useEffect(() => {
    if (currentSchedule) {
      setScheduleData({
        monday: currentSchedule.monday || scheduleData.monday,
        tuesday: currentSchedule.tuesday || scheduleData.tuesday,
        wednesday: currentSchedule.wednesday || scheduleData.wednesday,
        thursday: currentSchedule.thursday || scheduleData.thursday,
        friday: currentSchedule.friday || scheduleData.friday,
        saturday: currentSchedule.saturday || scheduleData.saturday,
        sunday: currentSchedule.sunday || scheduleData.sunday
      });
    }
  }, [currentSchedule]);

  const handleDayChange = (day, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(barberId, scheduleData);
  };

  const days = [
    { key: 'monday', name: 'Segunda-feira' },
    { key: 'tuesday', name: 'Terça-feira' },
    { key: 'wednesday', name: 'Quarta-feira' },
    { key: 'thursday', name: 'Quinta-feira' },
    { key: 'friday', name: 'Sexta-feira' },
    { key: 'saturday', name: 'Sábado' },
    { key: 'sunday', name: 'Domingo' }
  ];

  return (
    <div className="row">
      {days.map(day => (
        <div key={day.key} className="col-md-6 mb-3">
          <div className="card">
            <div className="card-header">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id={`${day.key}-working`}
                  checked={scheduleData[day.key].isWorking}
                  onChange={(e) => handleDayChange(day.key, 'isWorking', e.target.checked)}
                />
                <label className="form-check-label fw-bold" htmlFor={`${day.key}-working`}>
                  {day.name}
                </label>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small">Início</label>
                  <input 
                    type="time" 
                    className="form-control form-control-sm" 
                    value={scheduleData[day.key].startTime}
                    onChange={(e) => handleDayChange(day.key, 'startTime', e.target.value)}
                    disabled={!scheduleData[day.key].isWorking}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Fim</label>
                  <input 
                    type="time" 
                    className="form-control form-control-sm" 
                    value={scheduleData[day.key].endTime}
                    onChange={(e) => handleDayChange(day.key, 'endTime', e.target.value)}
                    disabled={!scheduleData[day.key].isWorking}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Almoço Início</label>
                  <input 
                    type="time" 
                    className="form-control form-control-sm" 
                    value={scheduleData[day.key].lunchStart}
                    onChange={(e) => handleDayChange(day.key, 'lunchStart', e.target.value)}
                    disabled={!scheduleData[day.key].isWorking}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Almoço Fim</label>
                  <input 
                    type="time" 
                    className="form-control form-control-sm" 
                    value={scheduleData[day.key].lunchEnd}
                    onChange={(e) => handleDayChange(day.key, 'lunchEnd', e.target.value)}
                    disabled={!scheduleData[day.key].isWorking}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="col-12 mt-3">
        <div className="d-flex gap-2">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Salvando...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Salvar Horários
              </>
            )}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Servicos;

