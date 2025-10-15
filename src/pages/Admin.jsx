import React from 'react';
import { toast } from "sonner";
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Admin.css';
import AdminNav from '@/componentes/AdminNav/AdminNav.jsx';
import { useAuth } from '@/hooks/useAuth.jsx';

const SidebarLink = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `list-group-item list-group-item-action bg-transparent border-0 ${isActive ? 'text-warning fw-semibold' : 'text-white'}`}
  >
    {children}
  </NavLink>
);

function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);
  const { signOut, user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <AdminNav />
      <main style={{ background: '#0b0b0b' }}>
        <div className="container pb-4 px-3 px-lg-4 pt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;

