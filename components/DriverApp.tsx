import { useState, useCallback, useEffect, useMemo } from 'react';
import { Toaster } from './ui/sonner';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import Header from './Header';
import TabNavigation from './TabNavigation';
import DriverHomeScreen from './DriverHomeScreen';
import DriverEarningsScreen from './DriverEarningsScreen';
import DriverTripsScreen from './DriverTripsScreen';
import SupportScreen from './SupportScreen';
import SettingsScreen from './SettingsScreen';
import DriverReliabilityDashboard from './DriverReliabilityDashboard';
import MaintenanceScheduler from './MaintenanceScheduler';

export default function DriverApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [driverOnlineStatus, setDriverOnlineStatus] = useState(false);
  const { user } = useAuth();

  // Initialiser le statut du conducteur
  useEffect(() => {
    // Récupérer le statut du localStorage s'il existe
    const savedStatus = localStorage.getItem(`driver_online_${user?.id}`);
    if (savedStatus !== null) {
      setDriverOnlineStatus(JSON.parse(savedStatus));
    }
  }, [user?.id]);

  // Sauvegarder le statut du conducteur
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`driver_online_${user.id}`, JSON.stringify(driverOnlineStatus));
    }
  }, [driverOnlineStatus, user?.id]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const toggleDriverStatus = useCallback(() => {
    setDriverOnlineStatus(prev => {
      const newStatus = !prev;
      toast.success(newStatus ? 'Vous êtes maintenant en ligne' : 'Vous êtes maintenant hors ligne');
      return newStatus;
    });
  }, []);

  // Optimisation avec useMemo pour éviter les re-renders inutiles
  const screenContent = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return <DriverHomeScreen driverOnline={driverOnlineStatus} onToggleStatus={toggleDriverStatus} />;
      case 'earnings':
        return <DriverEarningsScreen />;
      case 'trips':
        return <DriverTripsScreen />;
      case 'reliability':
        return <DriverReliabilityDashboard viewMode="driver" />;
      case 'maintenance':
        return <MaintenanceScheduler viewMode="driver" />;
      case 'support':
        return <SupportScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DriverHomeScreen driverOnline={driverOnlineStatus} onToggleStatus={toggleDriverStatus} />;
    }
  }, [activeTab, driverOnlineStatus, toggleDriverStatus]);

  const headerConfig = useMemo(() => {
    const configs = {
      home: { 
        title: undefined, // Pas de titre pour l'accueil - affiche "Qwonen"
        showSearch: false,
        showNotifications: true 
      },
      earnings: { 
        title: 'Mes Gains',
        showSearch: false,
        showNotifications: false 
      },
      trips: { 
        title: 'Mes Courses',
        showSearch: true,
        showNotifications: false 
      },
      reliability: { 
        title: 'Ma Fiabilité',
        showSearch: false,
        showNotifications: false 
      },
      maintenance: { 
        title: 'Maintenance',
        showSearch: false,
        showNotifications: true 
      },
      support: { 
        title: 'Support',
        showSearch: true,
        showNotifications: false 
      },
      settings: { 
        title: 'Paramètres',
        showSearch: false,
        showNotifications: false 
      }
    };
    
    return configs[activeTab as keyof typeof configs] || configs.home;
  }, [activeTab]);

  // Tabs spécifiques aux conducteurs
  const driverTabs = [
    { id: 'home', label: 'Accueil', icon: 'Home' },
    { id: 'earnings', label: 'Gains', icon: 'DollarSign' },
    { id: 'trips', label: 'Courses', icon: 'MapPin' },
    { id: 'reliability', label: 'Fiabilité', icon: 'Shield' },
    { id: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
    { id: 'settings', label: 'Paramètres', icon: 'Settings' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden">

      {/* Statut conducteur */}
      <div 
        className={`${driverOnlineStatus ? 'bg-green-500' : 'bg-gray-500'} text-white text-center py-1 text-xs font-medium z-50 cursor-pointer transition-colors`}
        onClick={toggleDriverStatus}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDriverStatus();
          }
        }}
      >
        {driverOnlineStatus ? '🟢 En ligne - Disponible pour les courses' : '🔴 Hors ligne - Indisponible'}
        <span className="ml-2 text-xs opacity-75">(Cliquez pour changer)</span>
      </div>

      {/* Header */}
      <Header 
        title={headerConfig.title}
        showSearch={headerConfig.showSearch}
        showNotifications={headerConfig.showNotifications}
      />
      
      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto overscroll-behavior-y-contain">
        <div className="animate-fade-in">
          {screenContent}
        </div>
      </main>
      
      {/* Navigation en bas - spécifique conducteur */}
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        tabs={driverTabs}
      />
      
      {/* Toaster pour les notifications */}
      <Toaster 
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '16px',
          },
        }}
      />
    </div>
  );
}