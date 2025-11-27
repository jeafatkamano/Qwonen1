import { useState, useCallback, useEffect, useMemo } from 'react';
import { Toaster } from './ui/sonner';
import Header from './Header';
import TabNavigation from './TabNavigation';
import HomeScreen from './HomeScreen';
import TripsScreen from './TripsScreen';
import PaymentScreen from './PaymentScreen';
import SupportScreen from './SupportScreen';
import SettingsScreen from './SettingsScreen';

export default function ClientApp() {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Optimisation avec useMemo pour éviter les re-renders inutiles
  const screenContent = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'trips':
        return <TripsScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'support':
        return <SupportScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  }, [activeTab]);

  const headerConfig = useMemo(() => {
    const configs = {
      home: { 
        title: undefined, // Pas de titre pour l'accueil - affiche "Qwonen"
        showSearch: false,
        showNotifications: true 
      },
      trips: { 
        title: 'Mes Trajets',
        showSearch: true,
        showNotifications: false 
      },
      payment: { 
        title: 'Paiements',
        showSearch: false,
        showNotifications: false 
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

  // Tabs spécifiques aux clients
  const clientTabs = [
    { id: 'home', label: 'Accueil', icon: 'Home' },
    { id: 'trips', label: 'Trajets', icon: 'MapPin' },
    { id: 'payment', label: 'Paiements', icon: 'CreditCard' },
    { id: 'support', label: 'Support', icon: 'MessageCircle' },
    { id: 'settings', label: 'Paramètres', icon: 'Settings' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden">

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
      
      {/* Navigation en bas */}
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        tabs={clientTabs}
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