import React, { useState } from 'react';
import AdminNavModern from './AdminNavModern';
import DashboardSimple from './DashboardSimple';
import AgendaConfirmacoes from './AgendaConfirmacoes';
import ServicesManagementFixed from './ServicesManagementFixed';
import BarbersManagementFixed from './BarbersManagementFixed';
import ClientsModern from './ClientsModern';
import ReportsAdvanced from './ReportsAdvanced';
import WhatsAppTest from './WhatsAppTest';

const AdminModern = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardSimple />;
      case 'agenda':
        return <AgendaConfirmacoes />;
      case 'confirmacoes':
        return <AgendaConfirmacoes />;
      case 'servicos':
        return <ServicesManagementFixed />;
      case 'barbeiros':
        return <BarbersManagementFixed />;
      case 'clientes':
        return <ClientsModern />;
      case 'relatorios':
        return <ReportsAdvanced />;
      case 'whatsapp-test':
        return <WhatsAppTest />;
      default:
        return <DashboardSimple />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavModern currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminModern;
