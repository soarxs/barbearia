import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Moon, 
  Monitor,
  Palette,
  Settings
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, setTheme, isDark } = useTheme();

  const themes = [
    {
      id: 'light' as const,
      name: 'Claro',
      icon: Sun,
      description: 'Tema claro'
    },
    {
      id: 'dark' as const,
      name: 'Escuro',
      icon: Moon,
      description: 'Tema escuro'
    },
    {
      id: 'system' as const,
      name: 'Sistema',
      icon: Monitor,
      description: 'Segue o sistema'
    }
  ];

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <div className="flex items-center space-x-2">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.id;
        
        return (
          <Button
            key={themeOption.id}
            size="sm"
            variant={isActive ? "default" : "ghost"}
            onClick={() => setTheme(themeOption.id)}
            className={`${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'} w-10 h-10 p-0`}
            title={themeOption.description}
          >
            <Icon className="w-4 h-4" />
          </Button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
