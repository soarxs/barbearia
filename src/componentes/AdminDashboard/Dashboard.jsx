import React, { useMemo } from 'react';
import './Dashboard.css';

const getWeekDays = () => {
  const today = new Date();
  const day = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - day);
  start.setHours(0,0,0,0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

function Dashboard({ onGo }) {
  const weekDays = useMemo(() => getWeekDays(), []);
  const servicesMap = useMemo(() => {
    const list = JSON.parse(localStorage.getItem('bt_services') || '[]');
    const map = {};
    list.forEach(s => map[s.id] = Number(s.price) || 0);
    if (!map.corte) map.corte = 40; if (!map.barba) map.barba = 30; if (!map.combo) map.combo = 65;
    return map;
  }, []);

  const totals = useMemo(() => {
    const appts = JSON.parse(localStorage.getItem('bt_appointments') || '[]');
    const perDay = weekDays.map((d) => {
      const key = d.toISOString().slice(0,10);
      const items = appts.filter(a => a.date === key);
      return { date: d, count: items.length };
    });
    const totalCuts = appts.filter(i => i.service === 'corte').length;
    const totalBeards = appts.filter(i => i.service === 'barba').length;
    const totalCombos = appts.filter(i => i.service === 'combo').length;
    const revenue = appts.reduce((acc, cur) => acc + (servicesMap[cur.service] || 0), 0);
    const dailyAvg = Math.round(revenue / 7);
    return { totalCuts, totalBeards, totalCombos, revenue, dailyAvg, perDay };
  }, [weekDays, servicesMap]);

  return (
    <div className="dashboard">
      <h2 className="mb-3">Resumo da Semana</h2>
      <div className="row g-3">
        <div className="col-12 col-md-3">
          <div className="card stat-card bg-dark text-white">
            <div className="card-body">
              <div className="small text-muted">Total faturado</div>
              <div className="fs-3 text-blue">R$ {totals.revenue.toFixed(2)}</div>
              <div className="small text-muted">Média diária: R$ {totals.dailyAvg}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card stat-card bg-dark text-white border-success">
            <div className="card-body">
              <div className="small text-muted">Cortes</div>
              <div className="fs-3">✅ {totals.totalCuts}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card stat-card bg-dark text-white border-info">
            <div className="card-body">
              <div className="small text-muted">Barba</div>
              <div className="fs-3">✂️ {totals.totalBeards}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card stat-card bg-dark text-white border-warning">
            <div className="card-body">
              <div className="small text-muted">Combo</div>
              <div className="fs-3">💈 {totals.totalCombos}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-12 col-lg-6">
          <div className="card bg-dark text-white">
            <div className="card-body">
              <div className="fw-semibold mb-2">Agendamentos por dia</div>
              <ul className="list-group list-group-flush">
                {totals.perDay.map((d) => (
                  <li key={d.date.toISOString()} className="list-group-item bg-dark text-white d-flex justify-content-between">
                    <span>{d.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</span>
                    <span className="badge bg-warning text-dark">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card bg-dark text-white">
            <div className="card-body">
              <div className="fw-semibold mb-3">Atalhos</div>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-blue" onClick={() => onGo('agenda')}>Ir para Agenda</button>
                <button className="btn btn-outline-blue" onClick={() => onGo('aprovar')}>🔔 Painel de Aprovações</button>
                <button className="btn btn-outline-blue" onClick={() => onGo('servicos')}>Editar Serviços</button>
                <button className="btn btn-outline-blue" onClick={() => alert('Relatórios em breve')}>Relatórios</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

