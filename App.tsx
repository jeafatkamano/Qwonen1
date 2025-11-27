import { useEffect, useState, Component, ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import AuthScreen from './components/AuthScreen';
import ClientApp from './components/ClientApp';
import DriverApp from './components/DriverApp';
import AdminApp from './components/AdminApp';
import SplashScreen from './components/SplashScreen';
import NetworkStatus from './components/NetworkStatus';
import bugFixManager from './services/bugFixManager';
import dialogAccessibilityFixer from './services/dialogAccessibilityFixer';
import { setupDialogAccessibilityMonitor } from './utils/fixDialogAccessibility';

// Composant ErrorBoundary personnalisé
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md w-full">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold mb-2">Une erreur est survenue</h1>
              <p className="text-muted-foreground mb-4">Nous sommes désolés, quelque chose s'est mal passé.</p>
              <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-lg text-left">
                <details>
                  <summary className="cursor-pointer font-medium">Détails de l'erreur</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              </div>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Recharger l'application
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>© 2024 Qwonen - Sinaiproduction</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [appState, setAppState] = useState<'loading' | 'splash' | 'auth' | 'app'>('loading');

  // Gérer les transitions d'état de l'application
  useEffect(() => {
    if (isInitialized) {
      if (showSplash) {
        setAppState('splash');
        // Délai minimal pour le splash screen
        const timer = setTimeout(() => {
          setShowSplash(false);
          setAppState(isAuthenticated && user ? 'app' : 'auth');
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setAppState(isAuthenticated && user ? 'app' : 'auth');
      }
    }
  }, [isInitialized, isAuthenticated, user, showSplash]);

  // Fonction pour fermer le splash screen
  const handleSplashFinish = () => {
    setShowSplash(false);
    setAppState(isAuthenticated && user ? 'app' : 'auth');
  };

  // Rendu conditionnel basé sur l'état de l'application
  switch (appState) {
    case 'loading':
    case 'splash':
      return <SplashScreen onFinish={handleSplashFinish} />;
    
    case 'auth':
      return <AuthScreen />;
    
    case 'app':
      if (!user) {
        console.warn('État incohérent: app mais pas d\'utilisateur');
        return <AuthScreen />;
      }

      // Rendu de l'interface selon le rôle utilisateur
      try {
        switch (user.role) {
          case 'client':
            return <ClientApp />;
          case 'driver':
            return <DriverApp />;
          case 'admin':
            return <AdminApp />;
          default:
            console.warn('Rôle utilisateur non reconnu:', user.role);
            return <AuthScreen />;
        }
      } catch (error) {
        console.error('Erreur lors du rendu de l\'interface utilisateur:', error);
        return <AuthScreen />;
      }
    
    default:
      return <AuthScreen />;
  }
}

export default function App() {
  const [hasGlobalError, setHasGlobalError] = useState(false);

  // Gestionnaire d'erreur global plus robuste
  useEffect(() => {
    // Initialiser le moniteur d'accessibilité des dialogs
    const dialogMonitor = setupDialogAccessibilityMonitor();

    const handleError = (event: ErrorEvent) => {
      console.error('Erreur globale capturée:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      
      // Signaler l'erreur au gestionnaire de bugs
      bugFixManager.reportBug({
        title: `Erreur JavaScript: ${event.message}`,
        description: `${event.message} dans ${event.filename}:${event.lineno}:${event.colno}`,
        severity: 'high',
        category: 'ui',
        reportedBy: 'error-handler',
        affectedComponents: ['global']
      });
      
      // Déclencher une vérification d'accessibilité
      setTimeout(() => {
        dialogAccessibilityFixer.forceFixAll();
        dialogMonitor.forceCheck();
      }, 1000);
      
      // Éviter les erreurs infinies
      if (!hasGlobalError) {
        setHasGlobalError(true);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rejetée non gérée:', event.reason);
      
      // Ne pas traiter les rejections de promesse comme des erreurs fatales
      // sauf si elles sont critiques
      if (event.reason?.name === 'ChunkLoadError') {
        // Erreur de chargement de chunk - recharger l'application
        window.location.reload();
      }
    };

    const handleResourceError = (event: Event) => {
      console.warn('Erreur de ressource:', event);
      // Gérer les erreurs de chargement de ressources (images, scripts, etc.)
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleResourceError, true);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleResourceError, true);
      dialogMonitor.disconnect();
    };
  }, [hasGlobalError]);

  // Écran d'erreur de fallback
  if (hasGlobalError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md w-full">
          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold mb-2">Une erreur est survenue</h1>
            <p className="text-muted-foreground mb-4">L'application a rencontré un problème technique.</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setHasGlobalError(false);
                  window.location.reload();
                }}
                className="block w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Recharger l'application
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="block w-full bg-secondary text-secondary-foreground px-6 py-2 rounded-xl hover:bg-secondary/90 transition-colors text-sm"
              >
                Réinitialiser et recharger
              </button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>© 2024 Qwonen - Sinaiproduction</p>
            <p>Transport sûr et fiable en Guinée</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <NetworkStatus>
            <div className="min-h-screen bg-background text-foreground antialiased transition-colors">
              <AppContent />
              <Toaster 
                position="top-center"
                richColors
                closeButton
                expand
                duration={4000}
                toastOptions={{
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '14px',
                  },
                  className: 'qwonen-toast',
                }}
              />
            </div>
          </NetworkStatus>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}