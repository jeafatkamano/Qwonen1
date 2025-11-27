// Gestionnaire hors ligne pour Qwonen
// Synchronisation différée et fonctionnement hors connexion

import { toast } from 'sonner@2.0.3';

interface PendingAction {
  id: string;
  type: 'trip_request' | 'payment' | 'rating' | 'profile_update' | 'location_update';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineData {
  trips: any[];
  profile: any;
  favorites: any[];
  paymentMethods: any[];
  lastKnownLocation: { lat: number; lng: number; address: string } | null;
  frequentRoutes: any[];
}

class OfflineManager {
  private pendingActions: PendingAction[] = [];
  private offlineData: OfflineData;
  private syncInProgress = false;
  private dbName = 'QwonenOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.offlineData = this.getInitialOfflineData();
    this.initIndexedDB();
    this.setupEventListeners();
    this.loadPendingActions();
  }

  // INITIALISATION INDEXEDDB
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store pour les actions en attente
        if (!db.objectStoreNames.contains('pendingActions')) {
          const pendingStore = db.createObjectStore('pendingActions', { keyPath: 'id' });
          pendingStore.createIndex('type', 'type', { unique: false });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store pour les données hors ligne
        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData', { keyPath: 'key' });
        }

        // Store pour le cache des trajets
        if (!db.objectStoreNames.contains('tripsCache')) {
          const tripsStore = db.createObjectStore('tripsCache', { keyPath: 'id' });
          tripsStore.createIndex('date', 'date', { unique: false });
          tripsStore.createIndex('status', 'status', { unique: false });
        }

        // Store pour le cache des lieux
        if (!db.objectStoreNames.contains('placesCache')) {
          const placesStore = db.createObjectStore('placesCache', { keyPath: 'id' });
          placesStore.createIndex('name', 'name', { unique: false });
          placesStore.createIndex('frequency', 'frequency', { unique: false });
        }
      };
    });
  }

  // DONNÉES INITIALES HORS LIGNE
  private getInitialOfflineData(): OfflineData {
    const stored = localStorage.getItem('qwonen_offline_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Erreur parsing données hors ligne:', error);
      }
    }

    return {
      trips: [],
      profile: null,
      favorites: [],
      paymentMethods: [],
      lastKnownLocation: null,
      frequentRoutes: []
    };
  }

  // LISTENERS D'ÉVÉNEMENTS
  private setupEventListeners(): void {
    // Détecter retour en ligne
    window.addEventListener('online', () => {
      toast.success('Connexion rétablie ! Synchronisation en cours...');
      this.syncPendingActions();
    });

    // Détecter passage hors ligne
    window.addEventListener('offline', () => {
      toast.info('Mode hors ligne activé. Vos actions seront synchronisées plus tard.');
    });

    // Synchronisation périodique quand en ligne
    setInterval(() => {
      if (navigator.onLine && this.pendingActions.length > 0) {
        this.syncPendingActions();
      }
    }, 30000); // Toutes les 30 secondes
  }

  // CHARGER ACTIONS EN ATTENTE
  private async loadPendingActions(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['pendingActions'], 'readonly');
    const store = transaction.objectStore('pendingActions');
    const request = store.getAll();

    request.onsuccess = () => {
      this.pendingActions = request.result || [];
      console.log(`${this.pendingActions.length} actions en attente de synchronisation`);
    };
  }

  // AJOUTER ACTION EN ATTENTE
  public async addPendingAction(
    type: PendingAction['type'],
    data: any,
    maxRetries: number = 3
  ): Promise<string> {
    const action: PendingAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.pendingActions.push(action);

    // Sauvegarder en IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      store.add(action);
    }

    // Tentative de synchronisation immédiate si en ligne
    if (navigator.onLine) {
      setTimeout(() => this.syncPendingActions(), 1000);
    }

    return action.id;
  }

  // SYNCHRONISER ACTIONS EN ATTENTE
  private async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine || this.pendingActions.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const actionsToSync = [...this.pendingActions];
    let syncedCount = 0;
    let failedCount = 0;

    try {
      for (const action of actionsToSync) {
        try {
          const success = await this.executeAction(action);
          
          if (success) {
            await this.removePendingAction(action.id);
            syncedCount++;
          } else {
            action.retryCount++;
            if (action.retryCount >= action.maxRetries) {
              await this.removePendingAction(action.id);
              failedCount++;
              console.error(`Action ${action.id} abandonnée après ${action.maxRetries} tentatives`);
            } else {
              await this.updatePendingAction(action);
            }
          }
        } catch (error) {
          console.error(`Erreur synchronisation action ${action.id}:`, error);
          action.retryCount++;
          if (action.retryCount >= action.maxRetries) {
            await this.removePendingAction(action.id);
            failedCount++;
          } else {
            await this.updatePendingAction(action);
          }
        }

        // Délai entre les actions pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Notification résultat
      if (syncedCount > 0) {
        toast.success(`${syncedCount} action(s) synchronisée(s)`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} action(s) ont échoué`);
      }

    } finally {
      this.syncInProgress = false;
    }
  }

  // EXÉCUTER UNE ACTION
  private async executeAction(action: PendingAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'trip_request':
          return await this.syncTripRequest(action.data);
        
        case 'payment':
          return await this.syncPayment(action.data);
        
        case 'rating':
          return await this.syncRating(action.data);
        
        case 'profile_update':
          return await this.syncProfileUpdate(action.data);
        
        case 'location_update':
          return await this.syncLocationUpdate(action.data);
        
        default:
          console.warn(`Type d'action non géré: ${action.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Erreur exécution action ${action.type}:`, error);
      return false;
    }
  }

  // SYNCHRONISATION SPÉCIFIQUE PAR TYPE
  private async syncTripRequest(data: any): Promise<boolean> {
    // Simuler appel API pour demande de trajet
    const response = await fetch('/api/trips/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  }

  private async syncPayment(data: any): Promise<boolean> {
    // Simuler appel API pour paiement
    const response = await fetch('/api/payments/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  }

  private async syncRating(data: any): Promise<boolean> {
    // Simuler appel API pour notation
    const response = await fetch('/api/ratings/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  }

  private async syncProfileUpdate(data: any): Promise<boolean> {
    // Simuler appel API pour mise à jour profil
    const response = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  }

  private async syncLocationUpdate(data: any): Promise<boolean> {
    // Simuler appel API pour mise à jour position
    const response = await fetch('/api/location/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  }

  // GESTION ACTIONS EN ATTENTE
  private async removePendingAction(actionId: string): Promise<void> {
    this.pendingActions = this.pendingActions.filter(action => action.id !== actionId);

    if (this.db) {
      const transaction = this.db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      store.delete(actionId);
    }
  }

  private async updatePendingAction(action: PendingAction): Promise<void> {
    const index = this.pendingActions.findIndex(a => a.id === action.id);
    if (index !== -1) {
      this.pendingActions[index] = action;
    }

    if (this.db) {
      const transaction = this.db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      store.put(action);
    }
  }

  // GESTION DONNÉES HORS LIGNE
  public async saveOfflineData(key: keyof OfflineData, data: any): Promise<void> {
    this.offlineData[key] = data;
    localStorage.setItem('qwonen_offline_data', JSON.stringify(this.offlineData));

    if (this.db) {
      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      store.put({ key, data });
    }
  }

  public getOfflineData(key: keyof OfflineData): any {
    return this.offlineData[key];
  }

  // CACHE DES TRAJETS
  public async cacheTripData(trip: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['tripsCache'], 'readwrite');
    const store = transaction.objectStore('tripsCache');
    store.put({
      ...trip,
      cachedAt: Date.now()
    });
  }

  public async getCachedTrips(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['tripsCache'], 'readonly');
      const store = transaction.objectStore('tripsCache');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }

  // CACHE DES LIEUX
  public async cachePlaceData(place: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['placesCache'], 'readwrite');
    const store = transaction.objectStore('placesCache');
    
    // Incrémenter la fréquence si le lieu existe déjà
    const existingRequest = store.get(place.id);
    existingRequest.onsuccess = () => {
      const existing = existingRequest.result;
      const frequency = existing ? existing.frequency + 1 : 1;
      
      store.put({
        ...place,
        frequency,
        lastUsed: Date.now()
      });
    };
  }

  public async getFrequentPlaces(limit: number = 10): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['placesCache'], 'readonly');
      const store = transaction.objectStore('placesCache');
      const index = store.index('frequency');
      const request = index.openCursor(null, 'prev'); // Ordre décroissant
      
      const results: any[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => resolve([]);
    });
  }

  // ÉTAT GLOBAL
  public getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  public getLastSyncTime(): number {
    return parseInt(localStorage.getItem('qwonen_last_sync') || '0');
  }

  public async forceSyncNow(): Promise<void> {
    if (navigator.onLine) {
      await this.syncPendingActions();
      localStorage.setItem('qwonen_last_sync', Date.now().toString());
    } else {
      toast.error('Impossible de synchroniser : pas de connexion Internet');
    }
  }

  // NETTOYAGE
  public async clearOldCache(daysOld: number = 7): Promise<void> {
    if (!this.db) return;

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    // Nettoyer cache des trajets
    const tripsTransaction = this.db.transaction(['tripsCache'], 'readwrite');
    const tripsStore = tripsTransaction.objectStore('tripsCache');
    const tripsIndex = tripsStore.index('date');
    const tripsRequest = tripsIndex.openCursor(IDBKeyRange.upperBound(cutoffTime));

    tripsRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Nettoyer lieux peu utilisés
    const placesTransaction = this.db.transaction(['placesCache'], 'readwrite');
    const placesStore = placesTransaction.objectStore('placesCache');
    const placesRequest = placesStore.openCursor();

    placesRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const place = cursor.value;
        if (place.frequency < 2 && place.lastUsed < cutoffTime) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}

// Instance singleton
export const offlineManager = new OfflineManager();

// Hook React pour utilisation dans les composants
export const useOfflineManager = () => {
  const [pendingCount, setPendingCount] = useState(offlineManager.getPendingActionsCount());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updatePendingCount = () => {
      setPendingCount(offlineManager.getPendingActionsCount());
    };

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Mettre à jour le compteur périodiquement
    const interval = setInterval(updatePendingCount, 5000);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return {
    pendingCount,
    isOnline,
    addPendingAction: offlineManager.addPendingAction.bind(offlineManager),
    forceSyncNow: offlineManager.forceSyncNow.bind(offlineManager),
    saveOfflineData: offlineManager.saveOfflineData.bind(offlineManager),
    getOfflineData: offlineManager.getOfflineData.bind(offlineManager),
    cacheTripData: offlineManager.cacheTripData.bind(offlineManager),
    getCachedTrips: offlineManager.getCachedTrips.bind(offlineManager),
    getFrequentPlaces: offlineManager.getFrequentPlaces.bind(offlineManager)
  };
};

export default offlineManager;