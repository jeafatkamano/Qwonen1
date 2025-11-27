import { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Battery, 
  Clock, 
  HardDrive, 
  Cpu, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { usePerformanceOptimizer } from '../services/performanceOptimizer';
import { useOfflineManager } from '../services/offlineManager';
import AccessibilityTestModal from './AccessibilityTestModal';

// Composant pour afficher les métriques de performance en temps réel
const PerformanceMonitor = memo(() => {
  const {
    performanceMode,
    networkQuality,
    isLowEndDevice,
    isSlowConnection,
    isOffline,
    updateInterval
  } = usePerformanceOptimizer();

  const {
    pendingCount,
    isOnline,
    forceSyncNow
  } = useOfflineManager();

  const [metrics, setMetrics] = useState({
    memory: { used: 0, total: 0, percentage: 0 },
    battery: { level: 100, charging: false },
    networkSpeed: { download: 0, ping: 0 },
    renderTime: 0,
    jsHeapSize: 0
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAccessibilityTest, setShowAccessibilityTest] = useState(false);

  // Collecter les métriques de performance
  const collectMetrics = useCallback(() => {
    // Métriques mémoire
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memory: {
          used: Math.round(memoryInfo.usedJSHeapSize / 1048576), // MB
          total: Math.round(memoryInfo.totalJSHeapSize / 1048576), // MB
          percentage: Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100)
        },
        jsHeapSize: Math.round(memoryInfo.usedJSHeapSize / 1048576)
      }));
    }

    // Métriques batterie
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setMetrics(prev => ({
          ...prev,
          battery: {
            level: Math.round(battery.level * 100),
            charging: battery.charging
          }
        }));
      });
    }

    // Temps de rendu
    const renderStart = performance.now();
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.round(renderEnd - renderStart)
      }));
    });

    // Vitesse réseau (approximative)
    setMetrics(prev => ({
      ...prev,
      networkSpeed: {
        download: networkQuality.downlink || 0,
        ping: networkQuality.rtt || 0
      }
    }));
  }, [networkQuality]);

  // Collecter métriques au démarrage et périodiquement
  useEffect(() => {
    collectMetrics();
    const interval = setInterval(collectMetrics, updateInterval);
    return () => clearInterval(interval);
  }, [collectMetrics, updateInterval]);

  // Déterminer la couleur du badge selon les performances
  const getPerformanceBadgeColor = () => {
    switch (performanceMode) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      case 'minimal': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Déterminer l'icône réseau
  const getNetworkIcon = () => {
    if (isOffline) return <WifiOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  // Affichage compact (mode normal)
  if (!isExpanded) {
    return (
      <div className="fixed top-16 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Activity className="w-4 h-4 mr-2" />
          <Badge className={`${getPerformanceBadgeColor()} text-white text-xs px-2 py-1 rounded-full`}>
            {performanceMode.toUpperCase()}
          </Badge>
          {pendingCount > 0 && (
            <Badge className="bg-orange-500 text-white text-xs ml-2 px-2 py-1 rounded-full">
              {pendingCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  // Affichage détaillé (mode étendu)
  return (
    <div className="fixed top-16 right-4 z-50 w-80">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="p-1 h-8 w-8"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mode de performance */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Mode Performance</span>
            <Badge className={`${getPerformanceBadgeColor()} text-white px-3 py-1`}>
              {performanceMode.toUpperCase()}
            </Badge>
          </div>

          {/* État réseau */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              {getNetworkIcon()}
              Réseau
            </span>
            <div className="text-right">
              <div className="text-sm font-medium">
                {isOnline ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    En ligne
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Hors ligne
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {metrics.networkSpeed.download.toFixed(1)} Mbps • {metrics.networkSpeed.ping}ms
              </div>
            </div>
          </div>

          {/* Actions en attente */}
          {pendingCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Actions en attente
              </span>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500 text-white px-2 py-1">
                  {pendingCount}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceSyncNow}
                  disabled={!isOnline}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sync
                </Button>
              </div>
            </div>
          )}

          {/* Mémoire */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Mémoire
              </span>
              <span className="text-xs text-gray-500">
                {metrics.memory.used}MB / {metrics.memory.total}MB
              </span>
            </div>
            <Progress 
              value={metrics.memory.percentage} 
              className="h-2"
            />
            {metrics.memory.percentage > 85 && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <AlertTriangle className="w-3 h-3" />
                Mémoire élevée
              </div>
            )}
          </div>

          {/* Batterie */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Battery className="w-4 h-4" />
              Batterie
            </span>
            <div className="text-right">
              <div className="text-sm font-medium">
                {metrics.battery.level}%
                {metrics.battery.charging && (
                  <span className="text-green-600 ml-1">⚡</span>
                )}
              </div>
            </div>
          </div>

          {/* Informations appareil */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                {isLowEndDevice ? 'Appareil limité' : 'Appareil performant'}
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Rendu: {metrics.renderTime}ms
              </span>
            </div>
          </div>

          {/* Alertes de performance */}
          {(isSlowConnection || isLowEndDevice || metrics.memory.percentage > 90) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-yellow-800 mb-1">
                    Performances limitées détectées
                  </div>
                  <ul className="text-yellow-700 space-y-0.5">
                    {isSlowConnection && <li>• Connexion lente détectée</li>}
                    {isLowEndDevice && <li>• Appareil à capacités limitées</li>}
                    {metrics.memory.percentage > 90 && <li>• Mémoire presque saturée</li>}
                  </ul>
                  <div className="mt-2 text-yellow-600">
                    L&apos;application s&apos;adapte automatiquement pour optimiser l&apos;expérience.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={collectMetrics}
              className="flex-1 h-8 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Forcer garbage collection si disponible
                if ((window as any).gc) {
                  (window as any).gc();
                }
                collectMetrics();
              }}
              className="flex-1 h-8 text-xs"
            >
              <HardDrive className="w-3 h-3 mr-1" />
              Nettoyer
            </Button>
          </div>

          {/* Bouton test d'accessibilité */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAccessibilityTest(true)}
            className="w-full h-8 text-xs"
          >
            <Settings className="w-3 h-3 mr-1" />
            Test d&apos;Accessibilité
          </Button>
        </CardContent>
      </Card>

      {/* Modal de test d'accessibilité */}
      <AccessibilityTestModal 
        isOpen={showAccessibilityTest}
        onClose={() => setShowAccessibilityTest(false)}
      />
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;