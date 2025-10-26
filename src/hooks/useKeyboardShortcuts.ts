import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignorar se estiver digitando em um input, textarea ou contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    shortcuts.forEach((shortcut) => {
      const {
        key,
        ctrlKey = false,
        metaKey = false,
        shiftKey = false,
        altKey = false,
        action
      } = shortcut;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.metaKey === metaKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey
      ) {
        event.preventDefault();
        action();
      }
    });
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      modifiers: {
        ctrl: s.ctrlKey,
        meta: s.metaKey,
        shift: s.shiftKey,
        alt: s.altKey
      },
      description: s.description
    }))
  };
};

// Hook específico para atalhos do admin
export const useAdminShortcuts = (onPageChange: (page: string) => void, onNewAppointment: () => void) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'd',
      metaKey: true,
      action: () => onPageChange('dashboard'),
      description: 'Ir para Dashboard'
    },
    {
      key: 'a',
      metaKey: true,
      action: () => onPageChange('agenda'),
      description: 'Ir para Agenda'
    },
    {
      key: 'w',
      metaKey: true,
      action: () => onPageChange('whatsapp'),
      description: 'Ir para WhatsApp'
    },
    {
      key: ',',
      metaKey: true,
      action: () => onPageChange('servicos'),
      description: 'Abrir Configurações'
    },
    {
      key: 'n',
      metaKey: true,
      action: onNewAppointment,
      description: 'Novo Agendamento'
    },
    {
      key: '/',
      action: () => {
        // Focar no campo de busca
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focar na busca'
    },
    {
      key: 'Escape',
      action: () => {
        // Fechar modais abertos
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        });
      },
      description: 'Fechar modais'
    }
  ];

  return useKeyboardShortcuts({ shortcuts });
};
