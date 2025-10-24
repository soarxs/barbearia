import React, { useState } from 'react';
import AdminNavModern from './AdminNavModern';
import DashboardModern from './DashboardModern';
import AgendaModern from './AgendaModern';
import ConfirmationsModern from './ConfirmationsModern';

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
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gerenciamento de clientes em desenvolvimento...</p>
          </div>
        );
      case 'relatorios':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Relatórios e análises em desenvolvimento...</p>
          </div>
        );
      case 'configuracoes':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Configurações do sistema em desenvolvimento...</p>
          </div>
        );
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
