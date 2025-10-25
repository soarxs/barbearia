import React, { useState } from 'react';
import AdminNavModern from './AdminNavModern';
import DashboardModern from './DashboardModern';
import AgendaModern from './AgendaModern';
import ConfirmationsModern from './ConfirmationsModern';
import ClientsModern from './ClientsModern';
import ReportsModern from './ReportsModern';
import SettingsModern from './SettingsModern';

const AdminModern = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardModern />;
      case 'agenda':
        return <AgendaModern />;
      case 'confirmacoes':
        return <ConfirmationsModern />;
      case 'clientes':
        return <ClientsModern />;
      case 'relatorios':
        return <ReportsModern />;
      case 'configuracoes':
        return <SettingsModern />;
      default:
        return <DashboardModern />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavModern currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminModern;
