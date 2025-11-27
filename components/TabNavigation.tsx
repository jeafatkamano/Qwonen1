import { memo } from 'react';
import { 
  Home, 
  Car, 
  CreditCard, 
  User, 
  HelpCircle, 
  Settings,
  MapPin,
  MessageCircle,
  DollarSign,
  Users,
  BarChart3,
  Shield,
  Wrench
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs?: Tab[];
}

const defaultTabs = [
  { id: 'home', label: 'Accueil', icon: 'Home' },
  { id: 'trips', label: 'Trajets', icon: 'Car' },
  { id: 'payment', label: 'Paiement', icon: 'CreditCard' },
  { id: 'support', label: 'Support', icon: 'HelpCircle' },
  { id: 'settings', label: 'Paramètres', icon: 'Settings' },
];

const iconMap: Record<string, any> = {
  Home,
  Car,
  CreditCard,
  User,
  HelpCircle,
  Settings,
  MapPin,
  MessageCircle,
  DollarSign,
  Users,
  BarChart3,
  Shield,
  Wrench
};

const TabNavigation = memo(({ activeTab, onTabChange, tabs = defaultTabs }: TabNavigationProps) => {
  return (
    <nav className="bg-white border-t border-gray-100 px-4 py-2 glass-effect">
      <div className={`grid gap-1 ${tabs.length === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon] || Home;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-black bg-gray-100 scale-105' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={tab.label}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

TabNavigation.displayName = 'TabNavigation';

export default TabNavigation;