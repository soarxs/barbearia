import React, { useState, useEffect } from 'react';
import { unifiedBookingService } from '@/services/unifiedBookingService';
import { useTenant } from '@/hooks/useTenant.js';
import { toast } from 'sonner';

function ToggleDay({ value, onChange, label }) {
  const active = value;
  return (
    <button type="button" className={`btn btn-sm ${active ? 'btn-blue' : 'btn-outline-blue'}`} onClick={onChange}>{label}</button>
  );
}

function Config() {
  const { data: tenant } = useTenant();
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [schedule, setScheduleState] = useState({
    workingDays: [1,2,3,4,5,6],
    open: '08:00',
    close: '20:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    stepMinutes: 30,
  });
  const [loading, setLoading] = useState(true);

  const [barberName, setBarberName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceImage, setServiceImage] = useState('');

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!tenant?.barbershop?.id) return;
      
      try {
        setLoading(true);
        
        // Carregar barbeiros
        const barbersData = await unifiedBookingService.getActiveBarbers();
        setBarbers(barbersData || []);
        
        // Carregar serviços
        const servicesData = await unifiedBookingService.getActiveServices();
        setServices(servicesData || []);
        
        // Carregar configuração de horários (usar padrão por enquanto)
        setScheduleState({
          workingDays: [1,2,3,4,5,6],
          open: '08:00',
          close: '20:00',
          lunchStart: '12:00',
          lunchEnd: '13:00',
          stepMinutes: 30,
        });
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant]);

  const addBarberHandler = async () => {
    // TODO: Implementar usando unifiedBookingService
    toast.info('Funcionalidade em desenvolvimento');
  };

  const addServiceHandler = async () => {
    // TODO: Implementar usando unifiedBookingService
    toast.info('Funcionalidade em desenvolvimento');
  };

  const removeServiceHandler = async (id) => {
    // TODO: Implementar usando unifiedBookingService
    toast.info('Funcionalidade em desenvolvimento');
  };

  const toggleDay = async (dayNum) => {
    // TODO: Implementar usando unifiedBookingService
    toast.info('Funcionalidade em desenvolvimento');
  };

  const onScheduleChange = async (key, value) => {
    // TODO: Implementar usando unifiedBookingService
    toast.info('Funcionalidade em desenvolvimento');
  };

  if (loading) {
    return (
      <div className="config-admin">
        <h2 className="mb-3">Configurações</h2>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-admin">
      <h2 className="mb-3">Configurações</h2>
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card bg-dark text-white h-100">
            <div className="card-body">
              <h5>Barbeiros</h5>
              <div className="input-group my-2">
                <input className="form-control bg-dark text-white border-secondary" value={barberName} onChange={(e)=>setBarberName(e.target.value)} placeholder="Nome do barbeiro" />
                <button className="btn btn-blue" onClick={addBarberHandler}>Adicionar</button>
              </div>
              <ul className="list-group list-group-flush">
                {barbers.map(b => (
                  <li key={b.id} className="list-group-item bg-dark text-white d-flex justify-content-between">
                    <span>{b.name}</span>
                    <button className="btn btn-sm btn-danger" onClick={()=>removeBarber(b.id)}>Remover</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card bg-dark text-white h-100">
            <div className="card-body">
              <h5>Serviços</h5>
              <div className="row g-2 align-items-center my-2">
                <div className="col-12 col-md-4"><input className="form-control bg-dark text-white border-secondary" value={serviceName} onChange={(e)=>setServiceName(e.target.value)} placeholder="Nome do serviço" /></div>
                <div className="col-12 col-md-2"><input type="number" step="0.01" className="form-control bg-dark text-white border-secondary" value={servicePrice} onChange={(e)=>setServicePrice(e.target.value)} placeholder="Preço" /></div>
                <div className="col-12 col-md-6"><input className="form-control bg-dark text-white border-secondary" value={serviceDesc} onChange={(e)=>setServiceDesc(e.target.value)} placeholder="Descrição (opcional)" /></div>
              </div>
              <div className="row g-2 align-items-center mb-2">
                <div className="col-12 col-md-10">
                  <input type="file" accept="image/*" className="form-control bg-dark text-white border-secondary" onChange={async (e)=>{
                    const file = e.target.files?.[0];
                    if (!file) return; const reader = new FileReader();
                    reader.onload = () => setServiceImage(String(reader.result));
                    reader.readAsDataURL(file);
                  }} />
                </div>
                <div className="col-12 col-md-2"><button className="btn btn-blue w-100" onClick={addServiceHandler}>Adicionar</button></div>
              </div>
              <ul className="list-group list-group-flush">
                {services.map(s => (
                  <li key={s.id} className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-2">
                      {s.image && <img src={s.image} alt={s.name} width={36} height={36} style={{objectFit:'cover', borderRadius:6}} />}
                      <span>{s.name}</span>
                      <span className="badge bg-warning text-dark">R$ {Number(s.price || 0).toFixed(2)}</span>
                    </span>
                    <button className="btn btn-sm btn-danger" onClick={()=>removeServiceHandler(s.id)}>Remover</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card bg-dark text-white">
            <div className="card-body">
              <h5>Horário de Funcionamento</h5>
              <div className="mb-2">Dias da semana</div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {[{n:1,l:'Seg'},{n:2,l:'Ter'},{n:3,l:'Qua'},{n:4,l:'Qui'},{n:5,l:'Sex'},{n:6,l:'Sáb'},{n:7,l:'Dom'}].map(d => (
                  <ToggleDay key={d.n} value={schedule.workingDays.includes(d.n)} onChange={()=>toggleDay(d.n)} label={d.l} />
                ))}
              </div>
              <div className="row g-2">
                <div className="col-6 col-md-3">
                  <label className="form-label">Abre</label>
                  <input type="time" className="form-control bg-dark text-white border-secondary" value={schedule.open} onChange={(e)=>onScheduleChange('open', e.target.value)} />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Fecha</label>
                  <input type="time" className="form-control bg-dark text-white border-secondary" value={schedule.close} onChange={(e)=>onScheduleChange('close', e.target.value)} />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Almoço (início)</label>
                  <input type="time" className="form-control bg-dark text-white border-secondary" value={schedule.lunchStart} onChange={(e)=>onScheduleChange('lunchStart', e.target.value)} />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Almoço (fim)</label>
                  <input type="time" className="form-control bg-dark text-white border-secondary" value={schedule.lunchEnd} onChange={(e)=>onScheduleChange('lunchEnd', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Config;

