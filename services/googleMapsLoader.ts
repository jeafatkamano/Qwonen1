/**
 * Service de chargement asynchrone optimisé pour Google Maps API
 * Suit les meilleures pratiques de performance recommandées par Google
 */

import { useState } from 'react';

// Interface pour Google Maps
declare global {
  interface Window {
    google: any;
    googleMapsLoaderCallbacks: Array<() => void>;
    googleMapsLoaderReject: Array<(error: Error) => void>;
  }
}

interface GoogleMapsLoaderOptions {
  apiKey: string;
  libraries?: string[];
  version?: string;
  language?: string;
  region?: string;
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<typeof google> | null = null;
  private isLoaded = false;
  private isLoading = false;

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  /**
   * Charge l'API Google Maps de manière asynchrone avec les meilleures pratiques
   */
  async load(options: GoogleMapsLoaderOptions): Promise<typeof google> {
    // Si déjà chargé, retourner immédiatement
    if (this.isLoaded && window.google?.maps) {
      return window.google;
    }

    // Si le chargement est en cours, attendre la promesse existante
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Créer une nouvelle promesse de chargement
    this.loadPromise = this.createLoadPromise(options);
    
    try {
      const result = await this.loadPromise;
      this.isLoaded = true;
      this.isLoading = false;
      return result;
    } catch (error) {
      this.loadPromise = null;
      this.isLoading = false;
      throw error;
    }
  }

  private createLoadPromise(options: GoogleMapsLoaderOptions): Promise<typeof google> {
    return new Promise((resolve, reject) => {
      try {
        // Vérifier si l'API est déjà disponible
        if (window.google?.maps) {
          resolve(window.google);
          return;
        }

        // Vérifier si un script est déjà en cours de chargement
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          // Attendre que le script existant se charge
          this.waitForExistingScript(resolve, reject);
          return;
        }

        // Initialiser les tableaux de callbacks globaux
        if (!window.googleMapsLoaderCallbacks) {
          window.googleMapsLoaderCallbacks = [];
          window.googleMapsLoaderReject = [];
        }

        // Ajouter les callbacks à la file
        window.googleMapsLoaderCallbacks.push(() => resolve(window.google));
        window.googleMapsLoaderReject.push(reject);

        // Si le chargement est déjà en cours, ne pas créer un nouveau script
        if (this.isLoading) {
          return;
        }

        this.isLoading = true;

        // Créer l'URL avec les paramètres optimisés
        const url = this.buildOptimizedUrl(options);

        // Créer et configurer le script
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        
        // Fonction callback globale optimisée
        const callbackName = 'googleMapsLoaderCallback_' + Date.now();
        (window as any)[callbackName] = () => {
          try {
            // Exécuter tous les callbacks en attente
            window.googleMapsLoaderCallbacks.forEach(callback => {
              try {
                callback();
              } catch (callbackError) {
                console.error('Erreur dans le callback Google Maps:', callbackError);
              }
            });

            // Nettoyer
            window.googleMapsLoaderCallbacks = [];
            window.googleMapsLoaderReject = [];
            delete (window as any)[callbackName];
          } catch (error) {
            console.error('Erreur dans le callback principal Google Maps:', error);
            this.handleError(new Error('Erreur lors de l\'initialisation de Google Maps'), reject);
          }
        };

        // Ajouter le callback à l'URL
        script.src = url + `&callback=${callbackName}`;

        // Gestion des erreurs
        script.onerror = (event) => {
          this.handleError(new Error('Échec du chargement du script Google Maps'), reject);
        };

        // Timeout de sécurité (15 secondes)
        const timeoutId = setTimeout(() => {
          this.handleError(new Error('Timeout lors du chargement de Google Maps'), reject);
        }, 15000);

        // Nettoyer le timeout quand le script se charge
        script.onload = () => {
          clearTimeout(timeoutId);
        };

        // Ajouter le script au document
        document.head.appendChild(script);

      } catch (error) {
        this.handleError(error as Error, reject);
      }
    });
  }

  private buildOptimizedUrl(options: GoogleMapsLoaderOptions): string {
    const {
      apiKey,
      libraries = ['places'],
      version = 'weekly',
      language = 'fr',
      region = 'GN' // Code pays pour la Guinée
    } = options;

    const params = new URLSearchParams({
      key: apiKey,
      loading: 'async', // Méthode de chargement recommandée
      v: version,
      language,
      region
    });

    if (libraries.length > 0) {
      params.set('libraries', libraries.join(','));
    }

    return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  }

  private waitForExistingScript(resolve: (value: typeof google) => void, reject: (error: Error) => void): void {
    let attempts = 0;
    const maxAttempts = 50; // 5 secondes maximum
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.google?.maps) {
        clearInterval(checkInterval);
        resolve(window.google);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('Timeout en attendant le chargement du script Google Maps existant'));
      }
    }, 100);
  }

  private handleError(error: Error, reject: (error: Error) => void): void {
    console.error('Erreur Google Maps Loader:', error);
    
    // Exécuter tous les rejets en attente
    if (window.googleMapsLoaderReject) {
      window.googleMapsLoaderReject.forEach(rejectFn => {
        try {
          rejectFn(error);
        } catch (rejectError) {
          console.error('Erreur lors du rejet du callback:', rejectError);
        }
      });
      
      // Nettoyer
      window.googleMapsLoaderCallbacks = [];
      window.googleMapsLoaderReject = [];
    }

    this.isLoading = false;
    this.loadPromise = null;
    reject(error);
  }

  /**
   * Vérifie si Google Maps est disponible
   */
  isGoogleMapsLoaded(): boolean {
    return !!(window.google?.maps);
  }

  /**
   * Vérifie si le chargement est en cours
   */
  isGoogleMapsLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Réinitialise le loader (utile pour les tests ou le rechargement)
   */
  reset(): void {
    this.loadPromise = null;
    this.isLoaded = false;
    this.isLoading = false;
  }
}

// Service singleton
export const googleMapsLoader = GoogleMapsLoader.getInstance();

// Configuration par défaut pour l'application Qwonen
export const defaultGoogleMapsConfig: GoogleMapsLoaderOptions = {
  apiKey: '', // Sera défini dynamiquement
  libraries: ['places', 'geometry'],
  version: 'weekly',
  language: 'fr',
  region: 'GN'
};

// Fonction utilitaire pour charger Google Maps avec la configuration Qwonen
export async function loadGoogleMapsForQwonen(apiKey?: string): Promise<typeof google> {
  let effectiveApiKey: string;

  try {
    // Essayer de récupérer la clé depuis les variables d'environnement
    effectiveApiKey = apiKey || 
      import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY || 
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
      'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw'; // Clé de fallback
  } catch (error) {
    console.warn('Impossible d\'accéder aux variables d\'environnement, utilisation de la clé par défaut');
    effectiveApiKey = apiKey || 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
  }

  if (!effectiveApiKey || effectiveApiKey === 'your-google-maps-api-key') {
    throw new Error('Clé API Google Maps non configurée');
  }

  const config = {
    ...defaultGoogleMapsConfig,
    apiKey: effectiveApiKey
  };

  return googleMapsLoader.load(config);
}

// Hook React pour utiliser Google Maps
export function useGoogleMaps(apiKey?: string) {
  const [isLoaded, setIsLoaded] = useState(googleMapsLoader.isGoogleMapsLoaded());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMaps = async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await loadGoogleMapsForQwonen(apiKey);
      setIsLoaded(true);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoaded,
    isLoading,
    error,
    loadMaps,
    googleMaps: isLoaded ? window.google : null
  };
}

export default googleMapsLoader;