import React from 'react';
import './AdminNav.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';

function AdminNav() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('bt_admin_auth');
    toast.success('Você saiu da área admin.');
    navigate('/admin/login');
  };
  return (
    <nav className="navbar navbar-expand-lg admin-topnav">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2" href="/">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg logo-blue">
            <span className="text-white text-sm font-bold">💈</span>
          </div>
          <strong>BarberTime Admin</strong>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav" aria-controls="adminNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="adminNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item"><NavLink to="/admin/agenda" className="nav-link">Agenda</NavLink></li>
            <li className="nav-item"><NavLink to="/admin/agendamentos" className="nav-link">Agendamentos</NavLink></li>
            <li className="nav-item"><NavLink to="/admin/dashboard" className="nav-link">Dashboard</NavLink></li>
            <li className="nav-item"><NavLink to="/admin/servicos" className="nav-link">Configurações</NavLink></li>
            <li className="nav-item d-flex align-items-center">
              <ThemeToggle />
            </li>
            <li className="nav-item ms-lg-2 mt-2 mt-lg-0"><button className="btn btn-outline-blue" onClick={logout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default AdminNav;

