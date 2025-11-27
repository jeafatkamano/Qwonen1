import { Bell, Search } from 'lucide-react';
import { Button } from './ui/button';
import QwonenLogo from './QwonenLogo';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
  showSearch?: boolean;
}

export default function Header({ title, showNotifications = true, showSearch = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40 glass-effect">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {title ? (
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              {title}
            </h1>
          ) : (
            <div className="flex items-center">
              <QwonenLogo size="sm" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
          )}
          
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}