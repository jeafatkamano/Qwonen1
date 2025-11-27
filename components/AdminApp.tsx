import React, { useState, useCallback, useMemo } from 'react';
import { Toaster } from './ui/sonner';
import Header from './Header';
import TabNavigation from './TabNavigation';
import AdminDashboard from './AdminDashboard';
import AdminDrivers from './AdminDrivers';
import AdminTrips from './AdminTrips';
import AdminPayments from './AdminPayments';
import SettingsScreen from './SettingsScreen';
import ReliabilitySystemDashboard from './ReliabilitySystemDashboard';
import AuthSecurityManager from './AuthSecurityManager';

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Optimisation avec useMemo pour éviter les re-renders inutiles
  const screenContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'drivers':
        return <AdminDrivers />;
      case 'trips':
        return <AdminTrips />;
      case 'payments':
        return <AdminPayments />;
      case 'reliability':
        return <ReliabilitySystemDashboard />;
      case 'security':
        return <AuthSecurityManager />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <AdminDashboard />;
    }
  }, [activeTab]);

  const headerConfig = useMemo(() => {
    const configs = {
      dashboard: { 
        title: 'Dashboard Admin',
        showSearch: false,
        showNotifications: true 
      },
      drivers: { 
        title: 'Conducteurs',
        showSearch: true,
        showNotifications: false 
      },
      trips: { 
        title: 'Courses',
        showSearch: true,
        showNotifications: false 
      },
      payments: { 
        title: 'Paiements',
        showSearch: false,
        showNotifications: false 
      },
      reliability: { 
        title: 'Fiabilité',
        showSearch: false,
        showNotifications: true 
      },
      security: { 
        title: 'Sécurité Auth',
        showSearch: false,
        showNotifications: true 
      },
      settings: { 
        title: 'Paramètres',
        showSearch: false,
        showNotifications: false 
      }
    };
    
    return configs[activeTab as keyof typeof configs] || configs.dashboard;
  }, [activeTab]);

  // Tabs spécifiques aux admins
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
    { id: 'drivers', label: 'Conducteurs', icon: 'Users' },
    { id: 'trips', label: 'Courses', icon: 'MapPin' },
    { id: 'reliability', label: 'Fiabilité', icon: 'Shield' },
    { id: 'security', label: 'Sécurité', icon: 'Key' },
    { id: 'settings', label: 'Paramètres', icon: 'Settings' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden">

      {/* Header admin */}
      <div className="bg-purple-600 text-white text-center py-1 text-xs font-medium z-50">
        👑 Mode Administrateur - Gestion Qwonen
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
      
      {/* Navigation en bas - spécifique admin */}
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        tabs={adminTabs}
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