// Service d'optimisation performance pour Qwonen
// Adapté aux connexions faibles et appareils peu performants

interface NetworkQuality {
  type: 'fast' | 'slow' | 'offline';
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  downlink: number;
  rtt: number;
}

interface DeviceCapabilities {
  memory: number; // GB
  cores: number;
  isLowEnd: boolean;
  supportsPWA: boolean;
}

class PerformanceOptimizer {
  private networkQuality: NetworkQuality;
  private deviceCapabilities: DeviceCapabilities;
  private performanceMode: 'high' | 'medium' | 'low' | 'minimal';

  constructor() {
    this.networkQuality = this.detectNetworkQuality();
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.performanceMode = this.calculatePerformanceMode();
    
    this.setupNetworkListeners();
    this.setupMemoryMonitoring();
  }

  // DÉTECTION RÉSEAU AVANCÉE
  private detectNetworkQuality(): NetworkQuality {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) {
      return {
        type: 'fast',
        effectiveType: '4g',
        downlink: 10,
        rtt: 100
      };
    }

    const isSlowConnection = connection.effectiveType === '2g' || 
                            connection.effectiveType === 'slow-2g' ||
                            connection.downlink < 1.5;

    return {
      type: navigator.onLine ? (isSlowConnection ? 'slow' : 'fast') : 'offline',
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100
    };
  }

  // DÉTECTION CAPACITÉS APPAREIL
  private detectDeviceCapabilities(): DeviceCapabilities {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isLowEnd = memory <= 2 || cores <= 2;

    return {
      memory,
      cores,
      isLowEnd,
      supportsPWA: 'serviceWorker' in navigator
    };
  }

  // CALCUL MODE PERFORMANCE
  private calculatePerformanceMode(): 'high' | 'medium' | 'low' | 'minimal' {
    if (this.networkQuality.type === 'offline') return 'minimal';
    if (this.deviceCapabilities.isLowEnd && this.networkQuality.type === 'slow') return 'minimal';
    if (this.deviceCapabilities.isLowEnd || this.networkQuality.type === 'slow') return 'low';
    if (this.networkQuality.effectiveType === '3g') return 'medium';
    return 'high';
  }

  // LISTENERS RÉSEAU
  private setupNetworkListeners(): void {
    // Écouter les changements de connexion
    window.addEventListener('online', () => {
      this.networkQuality.type = 'fast';
      this.updatePerformanceMode();
      this.notifyNetworkChange('online');
    });

    window.addEventListener('offline', () => {
      this.networkQuality.type = 'offline';
      this.updatePerformanceMode();
      this.notifyNetworkChange('offline');
    });

    // Écouter les changements de qualité réseau
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.networkQuality = this.detectNetworkQuality();
        this.updatePerformanceMode();
        this.notifyNetworkChange('quality-change');
      });
    }
  }

  // MONITORING MÉMOIRE
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = (performance as any).memory;
        const usedMemory = memoryInfo.usedJSHeapSize / 1048576; // MB
        const totalMemory = memoryInfo.totalJSHeapSize / 1048576; // MB
        
        if (usedMemory / totalMemory > 0.9) {
          this.triggerMemoryCleanup();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // NETTOYAGE MÉMOIRE
  private triggerMemoryCleanup(): void {
    // Forcer garbage collection si possible
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Émettre événement pour cleanup applicatif
    window.dispatchEvent(new CustomEvent('memory-cleanup-needed'));
  }

  // MISE À JOUR MODE PERFORMANCE
  private updatePerformanceMode(): void {
    const oldMode = this.performanceMode;
    this.performanceMode = this.calculatePerformanceMode();
    
    if (oldMode !== this.performanceMode) {
      window.dispatchEvent(new CustomEvent('performance-mode-changed', {
        detail: { oldMode, newMode: this.performanceMode }
      }));
    }
  }

  // NOTIFICATION CHANGEMENT RÉSEAU
  private notifyNetworkChange(type: string): void {
    window.dispatchEvent(new CustomEvent('network-status-changed', {
      detail: { type, networkQuality: this.networkQuality }
    }));
  }

  // GETTERS PUBLICS
  public getPerformanceMode(): 'high' | 'medium' | 'low' | 'minimal' {
    return this.performanceMode;
  }

  public getNetworkQuality(): NetworkQuality {
    return this.networkQuality;
  }

  public getDeviceCapabilities(): DeviceCapabilities {
    return this.deviceCapabilities;
  }

  public isLowEndDevice(): boolean {
    return this.deviceCapabilities.isLowEnd;
  }

  public isSlowConnection(): boolean {
    return this.networkQuality.type === 'slow' || this.networkQuality.effectiveType === '2g' || this.networkQuality.effectiveType === 'slow-2g';
  }

  public isOffline(): boolean {
    return this.networkQuality.type === 'offline';
  }

  // OPTIMISATIONS CONDITIONNELLES
  public shouldUseAnimations(): boolean {
    return this.performanceMode === 'high';
  }

  public shouldPreloadImages(): boolean {
    return this.performanceMode === 'high' && !this.isSlowConnection();
  }

  public shouldUseRealTimeUpdates(): boolean {
    return this.performanceMode !== 'minimal' && !this.isOffline();
  }

  public shouldUseLazyLoading(): boolean {
    return this.performanceMode !== 'high';
  }

  public getImageQuality(): 'high' | 'medium' | 'low' {
    switch (this.performanceMode) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  public getUpdateInterval(): number {
    switch (this.performanceMode) {
      case 'high': return 1000;
      case 'medium': return 3000;
      case 'low': return 5000;
      case 'minimal': return 10000;
      default: return 5000;
    }
  }
}

// Instance singleton
export const performanceOptimizer = new PerformanceOptimizer();

// Hooks pour React
export const usePerformanceOptimizer = () => {
  const [performanceMode, setPerformanceMode] = useState(performanceOptimizer.getPerformanceMode());
  const [networkQuality, setNetworkQuality] = useState(performanceOptimizer.getNetworkQuality());

  useEffect(() => {
    const handlePerformanceModeChange = (event: CustomEvent) => {
      setPerformanceMode(event.detail.newMode);
    };

    const handleNetworkStatusChange = (event: CustomEvent) => {
      setNetworkQuality(event.detail.networkQuality);
    };

    window.addEventListener('performance-mode-changed', handlePerformanceModeChange as EventListener);
    window.addEventListener('network-status-changed', handleNetworkStatusChange as EventListener);

    return () => {
      window.removeEventListener('performance-mode-changed', handlePerformanceModeChange as EventListener);
      window.removeEventListener('network-status-changed', handleNetworkStatusChange as EventListener);
    };
  }, []);

  return {
    performanceMode,
    networkQuality,
    isLowEndDevice: performanceOptimizer.isLowEndDevice(),
    isSlowConnection: performanceOptimizer.isSlowConnection(),
    isOffline: performanceOptimizer.isOffline(),
    shouldUseAnimations: performanceOptimizer.shouldUseAnimations(),
    shouldPreloadImages: performanceOptimizer.shouldPreloadImages(),
    shouldUseRealTimeUpdates: performanceOptimizer.shouldUseRealTimeUpdates(),
    shouldUseLazyLoading: performanceOptimizer.shouldUseLazyLoading(),
    imageQuality: performanceOptimizer.getImageQuality(),
    updateInterval: performanceOptimizer.getUpdateInterval()
  };
};

export default performanceOptimizer;