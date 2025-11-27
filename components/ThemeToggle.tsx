import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './ui/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({ 
  className, 
  variant = 'dropdown',
  size = 'md' 
}: ThemeToggleProps) {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();

  const buttonSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          buttonSizes[size],
          'qwonen-focus hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
          className
        )}
        aria-label={`Basculer vers le mode ${effectiveTheme === 'light' ? 'sombre' : 'clair'}`}
      >
        {effectiveTheme === 'light' ? (
          <Moon className={cn(iconSizes[size], 'text-gray-700 dark:text-gray-300')} />
        ) : (
          <Sun className={cn(iconSizes[size], 'text-gray-700 dark:text-gray-300')} />
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            buttonSizes[size],
            'qwonen-focus hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            className
          )}
          aria-label="Sélectionner le thème"
        >
          {effectiveTheme === 'light' ? (
            <Sun className={cn(iconSizes[size], 'text-gray-700 dark:text-gray-300')} />
          ) : (
            <Moon className={cn(iconSizes[size], 'text-gray-700 dark:text-gray-300')} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg min-w-[140px]"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
            theme === 'light' && 'bg-gray-100 dark:bg-gray-700'
          )}
        >
          <Sun className="w-4 h-4" />
          <span>Clair</span>
          {theme === 'light' && (
            <div className="ml-auto w-2 h-2 bg-black dark:bg-white rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
            theme === 'dark' && 'bg-gray-100 dark:bg-gray-700'
          )}
        >
          <Moon className="w-4 h-4" />
          <span>Sombre</span>
          {theme === 'dark' && (
            <div className="ml-auto w-2 h-2 bg-black dark:bg-white rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
            theme === 'system' && 'bg-gray-100 dark:bg-gray-700'
          )}
        >
          <Monitor className="w-4 h-4" />
          <span>Système</span>
          {theme === 'system' && (
            <div className="ml-auto w-2 h-2 bg-black dark:bg-white rounded-full" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Composant simple pour basculer rapidement (pour les paramètres)
export function SimpleThemeToggle({ className }: { className?: string }) {
  const { effectiveTheme, toggleTheme } = useTheme();

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-gray-100">Mode sombre</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Ajuste l'apparence de l'application
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="qwonen-focus"
        aria-label={`Activer le mode ${effectiveTheme === 'light' ? 'sombre' : 'clair'}`}
      >
        {effectiveTheme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}

// Hook pour composants qui ont besoin de savoir le thème actuel
export function useThemeClasses() {
  const { effectiveTheme } = useTheme();
  
  return {
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
    themeClass: effectiveTheme,
    // Classes utilitaires communes
    cardClass: effectiveTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    textClass: effectiveTheme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    mutedTextClass: effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    borderClass: effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    hoverClass: effectiveTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
  };
}