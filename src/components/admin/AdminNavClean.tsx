import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  Scissors,
  FileText,
  MessageSquare,
  Plus,
  Zap,
  ChevronDown
} from 'lucide-react';
import WhatsAppNotifications from './WhatsAppNotifications';
import { supabase } from '@/lib/supabase.js';

interface AdminNavCleanProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const AdminNavClean = ({ currentPage, onPageChange }: AdminNavCleanProps) => {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    agenda: 0,
    confirmacoes: 0
  });

  // Buscar notificações reais
  const fetchNotifications = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: agendaData } = await supabase
        .from('appointments')
        .select('id')
        .eq('date', today)
        .eq('status', 'pending');

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const { data: confirmacoesData } = await supabase
        .from('appointments')
        .select('id')
        .in('status', ['pending', 'confirmed'])
        .gte('date', today)
        .lte('date', nextWeek.toISOString().split('T')[0])
        .order('date', { ascending: true });

      setNotifications({
        agenda: agendaData?.length || 0,
        confirmacoes: confirmacoesData?.length || 0
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      setNotifications({ agenda: 0, confirmacoes: 0 });
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Navegação principal simplificada
  const mainNavigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      shortcut: 'D'
    },
    {
      id: 'agenda',
      name: 'Agenda',
      icon: Calendar,
      badge: (notifications.agenda + notifications.confirmacoes) > 0 ? (notifications.agenda + notifications.confirmacoes).toString() : null,
      shortcut: 'A'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageSquare,
      badge: null,
      shortcut: 'W'
    }
  ];

  // Menu de configurações (agrupado)
  const settingsItems = [
    {
      id: 'servicos',
      name: 'Serviços',
      icon: Scissors
    },
    {
      id: 'barbeiros',
      name: 'Barbeiros',
      icon: Users
    },
    {
      id: 'clientes',
      name: 'Clientes',
      icon: User
    },
    {
      id: 'relatorios',
      name: 'Relatórios',
      icon: FileText
    }
  ];

  // Menu secundário (menos usado)
  const secondaryItems = [
    {
      id: 'whatsapp-test',
      name: 'WhatsApp Test',
      icon: MessageSquare
    }
  ];

  const handleLogout = () => {
    window.location.href = '/';
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-appointment':
        onPageChange('agenda');
        // Aqui poderia abrir modal de novo agendamento
        break;
      case 'search':
        // Implementar busca global
        break;
    }
  };

  const totalNotifications = notifications.agenda + notifications.confirmacoes;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e navegação principal */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BarberTime</span>
            </div>

            {/* Navegação principal - Desktop */}
            {!isMobile && (
              <div className="flex items-center space-x-1">
                {mainNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onPageChange(item.id)}
                      className={`relative ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                      {item.badge && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.shortcut && (
                        <span className="ml-2 text-xs opacity-60">
                          ⌘{item.shortcut}
                        </span>
                      )}
                    </Button>
                  );
                })}

                {/* Menu de Configurações */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsManagementOpen(!isManagementOpen)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                  
                  {isManagementOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50">
                      {settingsItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onPageChange(item.id);
                              setIsManagementOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ações rápidas e perfil */}
          <div className="flex items-center space-x-4">
            {/* Ações rápidas */}
            {!isMobile && (
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('new-appointment')}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Novo Agendamento
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleQuickAction('search')}
                  className="text-gray-600"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Notificações WhatsApp */}
            <WhatsAppNotifications
              onNotificationClick={(notification) => {
                // Implementar ação ao clicar na notificação
                console.log('Notificação clicada:', notification);
                onPageChange('whatsapp');
              }}
            />

            {/* Menu mobile */}
            {isMobile && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}

            {/* Perfil */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobile && isMobileMenuOpen && (
          <div className="border-t bg-white">
            <div className="py-4 space-y-2">
              {mainNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                    {item.badge && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
              
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-gray-500 px-3 mb-2">Configurações</p>
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onPageChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-gray-600"
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  );
                })}
              </div>

              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-gray-500 px-3 mb-2">Outros</p>
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onPageChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-gray-600"
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavClean;
