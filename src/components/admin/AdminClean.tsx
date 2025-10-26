import React, { useState } from 'react';
import AdminNavClean from './AdminNavClean';
import DashboardClean from './DashboardClean';
import AgendaClean from './AgendaClean';
import WhatsAppPanel from './WhatsAppPanel';
import ServicesManagementFixed from './ServicesManagementFixed';
import BarbersManagementFixed from './BarbersManagementFixed';
import ClientsModern from './ClientsModern';
import ReportsAdvanced from './ReportsAdvanced';
import WhatsAppTest from './WhatsAppTest';
import QuickActions from './QuickActions';
import ThemeToggle from './ThemeToggle';
import { useAdminShortcuts } from '@/hooks/useKeyboardShortcuts';

const AdminClean = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNewAppointment = () => {
    setCurrentPage('agenda');
    // Aqui poderia abrir modal de novo agendamento
  };

  const handleSendReminders = () => {
    // Implementar envio de lembretes
    console.log('Enviando lembretes...');
  };

  const handleViewReports = () => {
    setCurrentPage('relatorios');
  };

  const handleSettings = () => {
    // Implementar navegação para configurações
    console.log('Abrindo configurações...');
  };

  // Configurar atalhos de teclado
  useAdminShortcuts(setCurrentPage, handleNewAppointment);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardClean />;
      case 'agenda':
        return <AgendaClean />;
      case 'confirmacoes':
        return <AgendaClean />;
      case 'whatsapp':
        return <WhatsAppPanel />;
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
        return <DashboardClean />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminNavClean currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
      
      {/* Ações rápidas flutuantes */}
      <QuickActions
        onNewAppointment={handleNewAppointment}
        onSendReminders={handleSendReminders}
        onViewReports={handleViewReports}
        onSettings={handleSettings}
        services={['Corte Masculino', 'Corte Feminino', 'Barba', 'Corte + Barba']}
        barbers={['Carlos', 'Ana', 'Roberto', 'Mariana']}
      />
    </div>
  );
};

export default AdminClean;
