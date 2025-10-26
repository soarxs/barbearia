import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

// Hook para detectar orientação
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
};

// Hook para detectar touch
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
};

// Componente de navegação mobile otimizada
export const MobileNavigation: React.FC<{
  items: Array<{ id: string; name: string; icon: React.ComponentType; badge?: string }>;
  currentPage: string;
  onPageChange: (page: string) => void;
}> = ({ items, currentPage, onPageChange }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {items.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onPageChange(item.id);
              setIsOpen(false);
            }}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentPage === item.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">{item.name}</span>
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente de card otimizado para mobile
export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const isMobile = useIsMobile();
  const isTouch = useTouch();

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-4
        ${isMobile ? 'mx-2 mb-3' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${isTouch && onClick ? 'active:scale-95 transition-transform' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Componente de lista otimizada para mobile
export const MobileList: React.FC<{
  items: Array<{ id: string; title: string; subtitle?: string; icon?: React.ComponentType; onClick?: () => void }>;
  className?: string;
}> = ({ items, className = '' }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`
            flex items-center p-3 rounded-lg border border-gray-200 bg-white
            ${item.onClick ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : ''}
            ${isMobile ? 'mx-2' : ''}
          `}
          onClick={item.onClick}
        >
          {item.icon && (
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <item.icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            {item.subtitle && (
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente de botão otimizado para mobile
export const MobileButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  className = '' 
}) => {
  const isMobile = useIsMobile();
  const isTouch = useTouch();

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const mobileClasses = isMobile ? 'min-h-[44px]' : '';
  const touchClasses = isTouch ? 'active:scale-95' : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${mobileClasses}
        ${touchClasses}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Componente de input otimizado para mobile
export const MobileInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  label?: string;
  error?: string;
  className?: string;
}> = ({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  label, 
  error, 
  className = '' 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${isMobile ? 'text-base min-h-[44px]' : 'text-sm'}
          ${error ? 'border-red-500' : ''}
        `}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Hook para scroll suave em mobile
export const useSmoothScroll = () => {
  const scrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return { scrollTo };
};

// Hook para prevenir zoom em inputs
export const usePreventZoom = () => {
  useEffect(() => {
    const preventZoom = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
        }
      }
    };

    document.addEventListener('focusin', preventZoom);
    document.addEventListener('focusout', () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    });

    return () => {
      document.removeEventListener('focusin', preventZoom);
    };
  }, []);
};
