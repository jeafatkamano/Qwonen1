import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface NetworkStatusProps {
  children: React.ReactNode;
  showIndicator?: boolean;
}

export default function NetworkStatus({ children, showIndicator = true }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success('Connexion rétablie', {
          description: 'Vous êtes de nouveau en ligne',
          duration: 3000,
        });
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.error('Connexion perdue', {
        description: 'Vérifiez votre connexion internet',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Indicateur de statut réseau */}
      {showIndicator && !isOnline && (
        <div className="bg-red-500 text-white text-center py-2 text-sm font-medium animate-slide-up z-50 sticky top-0">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Mode hors ligne - Fonctionnalités limitées</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRetry}
              className="text-white hover:bg-red-600 h-6 px-2 ml-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Actualiser
            </Button>
          </div>
        </div>
      )}

      {/* Indicateur de connexion rétablie */}
      {showIndicator && isOnline && wasOffline && (
        <div className="bg-green-500 text-white text-center py-2 text-sm font-medium animate-slide-up z-50 sticky top-0">
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>Connexion rétablie</span>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {children}

      {/* Overlay en mode hors ligne (optionnel) */}
      {!isOnline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none">
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Connexion perdue</h3>
                <p className="text-sm text-gray-600">
                  Certaines fonctionnalités peuvent être limitées
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleRetry}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook personnalisé pour surveiller l'état du réseau
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
    isOffline: !isOnline
  };
}