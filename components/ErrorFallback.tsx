import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw, AlertTriangle, Home, Settings } from 'lucide-react';
import QwonenLogo from './QwonenLogo';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  type?: 'component' | 'network' | 'auth' | 'permission';
  title?: string;
  message?: string;
  showDetails?: boolean;
}

export default function ErrorFallback({ 
  error, 
  resetError, 
  type = 'component',
  title,
  message,
  showDetails = false 
}: ErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <RefreshCw className="w-8 h-8 text-orange-500" />,
          title: title || 'Problème de connexion',
          message: message || 'Vérifiez votre connexion internet et réessayez.',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'auth':
        return {
          icon: <Home className="w-8 h-8 text-blue-500" />,
          title: title || 'Session expirée',
          message: message || 'Votre session a expiré. Veuillez vous reconnecter.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'permission':
        return {
          icon: <Settings className="w-8 h-8 text-purple-500" />,
          title: title || 'Accès refusé',
          message: message || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette section.',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          title: title || 'Une erreur est survenue',
          message: message || 'Quelque chose s\'est mal passé. Veuillez réessayer.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const config = getErrorConfig();

  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <QwonenLogo size="md" />
        </div>

        {/* Erreur principale */}
        <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {config.icon}
            </div>
            <CardTitle className="text-lg text-gray-900">
              {config.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-700 text-sm">
              {config.message}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleReload}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>

              {type !== 'auth' && (
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              )}
            </div>

            {/* Détails de l'erreur */}
            {(error || showDetails) && (
              <div className="mt-4">
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="text-xs text-gray-600 hover:text-gray-800 underline"
                >
                  {showErrorDetails ? 'Masquer' : 'Afficher'} les détails techniques
                </button>
                
                {showErrorDetails && (
                  <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-gray-700 font-mono">
                    <div className="space-y-1">
                      {error?.name && (
                        <div><strong>Type:</strong> {error.name}</div>
                      )}
                      {error?.message && (
                        <div><strong>Message:</strong> {error.message}</div>
                      )}
                      {error?.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer">Stack trace</summary>
                          <pre className="mt-1 overflow-auto text-xs whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions supplémentaires pour le débogage */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center space-y-2">
                  <p>Mode développement</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }}
                      className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Vider le cache
                    </button>
                    <button
                      onClick={() => {
                        console.log('Application State:', {
                          localStorage: { ...localStorage },
                          sessionStorage: { ...sessionStorage },
                          error: error,
                          userAgent: navigator.userAgent,
                          timestamp: new Date().toISOString()
                        });
                      }}
                      className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Log debug
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© 2024 Qwonen - Sinaiproduction</p>
          <p>Transport sûr et fiable en Guinée</p>
        </div>
      </div>
    </div>
  );
}

// Hook personnalisé pour la gestion d'erreurs
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'Unknown context'}:`, error);
    
    // Vous pouvez ici intégrer un service de reporting d'erreurs
    // comme Sentry, LogRocket, etc.
    
    return error;
  };

  const handleAsyncError = async (asyncFn: () => Promise<any>, context?: string) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      throw error;
    }
  };

  return { handleError, handleAsyncError };
}