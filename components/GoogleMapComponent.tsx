import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Navigation, MapPin, Search, X, Locate } from 'lucide-react';
import MapFallback from './MapFallback';
import { loadGoogleMapsForQwonen } from '../services/googleMapsLoader';

interface GoogleMapComponentProps {
  height?: string;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  showCurrentLocation?: boolean;
  showSearchBox?: boolean;
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    type?: 'pickup' | 'destination' | 'driver' | 'current';
  }>;
}

export default function GoogleMapComponent({
  height = '400px',
  onLocationSelect,
  showCurrentLocation = true,
  showSearchBox = false,
  initialCenter = { lat: 9.515, lng: -13.712 }, // Conakry, Guinée
  zoom = 13,
  markers = []
}: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const markersRef = useRef<any[]>([]);

  // Nettoyer les marqueurs précédents
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  }, []);

  // Initialiser Google Maps
  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current) return;

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom,
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'simplified' }]
          },
          {
            featureType: 'transit',
            stylers: [{ visibility: 'simplified' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        gestureHandling: 'cooperative'
      });

      setMap(mapInstance);

      // Ajouter la recherche de lieux si demandée
      if (showSearchBox && searchBoxRef.current && window.google.maps.places) {
        try {
          const searchBox = new window.google.maps.places.SearchBox(searchBoxRef.current);
          
          mapInstance.addListener('bounds_changed', () => {
            try {
              searchBox.setBounds(mapInstance.getBounds());
            } catch (error) {
              console.warn('Erreur lors de la mise à jour des bounds:', error);
            }
          });

          searchBox.addListener('places_changed', () => {
            try {
              const places = searchBox.getPlaces();
              if (places.length === 0) return;

              const place = places[0];
              if (place.geometry && place.geometry.location) {
                const location = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  address: place.formatted_address || place.name || 'Location sélectionnée'
                };

                setSelectedLocation(location);
                mapInstance.setCenter(location);
                mapInstance.setZoom(16);

                // Ajouter un marqueur
                const marker = new window.google.maps.Marker({
                  position: location,
                  map: mapInstance,
                  title: location.address,
                  animation: window.google.maps.Animation.DROP
                });

                markersRef.current.push(marker);
                onLocationSelect?.(location);
              }
            } catch (error) {
              console.warn('Erreur lors de la recherche de lieux:', error);
            }
          });
        } catch (error) {
          console.warn('Erreur lors de l\'initialisation de la recherche:', error);
        }
      }

      // Ajouter un listener pour les clics sur la carte
      mapInstance.addListener('click', (event: any) => {
        try {
          const location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            address: 'Position sélectionnée'
          };

          // Géocoder inversé pour obtenir l'adresse
          if (window.google.maps.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: event.latLng }, (results: any[], status: string) => {
              if (status === 'OK' && results[0]) {
                location.address = results[0].formatted_address;
              }
              
              setSelectedLocation(location);
              
              // Nettoyer les marqueurs précédents de sélection
              clearMarkers();
              
              // Ajouter un marqueur
              const marker = new window.google.maps.Marker({
                position: location,
                map: mapInstance,
                title: location.address,
                animation: window.google.maps.Animation.DROP
              });

              markersRef.current.push(marker);
              onLocationSelect?.(location);
            });
          } else {
            setSelectedLocation(location);
            onLocationSelect?.(location);
          }
        } catch (error) {
          console.warn('Erreur lors du clic sur la carte:', error);
        }
      });

      setIsLoaded(true);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
      setLoadError('Erreur lors de l\'initialisation de la carte');
      setUseFallback(true);
    }
  }, [initialCenter, zoom, showSearchBox, onLocationSelect, clearMarkers]);

  // Charger l'API Google Maps avec le service optimisé
  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    let isMounted = true;

    // Timer pour fallback après 15 secondes (délai plus généreux)
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded && isMounted) {
        console.warn('Délai de chargement Google Maps dépassé, utilisation du mode fallback');
        setUseFallback(true);
      }
    }, 15000);

    // Charger Google Maps avec le service optimisé
    loadGoogleMapsForQwonen()
      .then(() => {
        if (isMounted) {
          initializeMap();
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de Google Maps:', error);
        if (isMounted) {
          setLoadError(error.message || 'Erreur lors du chargement de Google Maps');
          setUseFallback(true);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [initializeMap, isLoaded]);

  // Obtenir la position actuelle
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par ce navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setCurrentLocation(location);
        
        if (map && window.google) {
          map.setCenter(location);
          map.setZoom(16);
          
          // Nettoyer les marqueurs précédents
          clearMarkers();
          
          // Ajouter un marqueur pour la position actuelle
          const marker = new window.google.maps.Marker({
            position: location,
            map,
            title: 'Ma position actuelle',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="blue" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(30, 30),
              anchor: new window.google.maps.Point(15, 15)
            }
          });

          markersRef.current.push(marker);

          // Géocoder inversé pour obtenir l'adresse
          if (window.google.maps.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location }, (results: any[], status: string) => {
              if (status === 'OK' && results[0]) {
                const locationWithAddress = {
                  ...location,
                  address: results[0].formatted_address || 'Ma position actuelle'
                };
                onLocationSelect?.(locationWithAddress);
              }
            });
          }
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir votre position actuelle.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [map, onLocationSelect, clearMarkers]);

  // Ajouter les marqueurs personnalisés
  useEffect(() => {
    if (!map || !window.google || !isLoaded) return;

    // Nettoyer les marqueurs précédents avant d'ajouter les nouveaux
    clearMarkers();

    markers.forEach((marker, index) => {
      try {
        let icon;
        
        switch (marker.type) {
          case 'pickup':
            icon = {
              url: 'data:image/svg+xml;charset=UTF-8;base64=' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" stroke="white" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40)
            };
            break;
          case 'destination':
            icon = {
              url: 'data:image/svg+xml;charset=UTF-8;base64=' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40)
            };
            break;
          case 'driver':
            icon = {
              url: 'data:image/svg+xml;charset=UTF-8;base64=' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" stroke="white" stroke-width="2">
                  <path d="m12 8-9.04 4.52a1 1 0 0 0 0 1.86L12 19l8.04-4.52a1 1 0 0 0 0-1.86L12 8Z"/>
                  <path d="m12 2-9.04 4.52a1 1 0 0 0 0 1.86L12 13l8.04-4.52a1 1 0 0 0 0-1.86L12 2Z"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(35, 35),
              anchor: new window.google.maps.Point(17.5, 17.5)
            };
            break;
          default:
            icon = undefined;
        }

        const newMarker = new window.google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
          icon,
          animation: window.google.maps.Animation.DROP
        });

        markersRef.current.push(newMarker);
      } catch (error) {
        console.warn(`Erreur lors de la création du marqueur ${index}:`, error);
      }
    });
  }, [map, markers, isLoaded, clearMarkers]);

  // Nettoyer les marqueurs lors du démontage
  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, [clearMarkers]);

  if (!isLoaded) {
    // Utiliser le fallback si demandé
    if (useFallback) {
      return (
        <MapFallback 
          height={height}
          onLocationSelect={onLocationSelect}
          showCurrentLocation={showCurrentLocation}
          showSearchBox={showSearchBox}
          initialCenter={initialCenter}
          zoom={zoom}
          markers={markers}
        />
      );
    }

    // Afficher un message d'erreur si le chargement a échoué
    if (loadError) {
      return (
        <div 
          className="bg-red-50 rounded-2xl flex items-center justify-center border border-red-200"
          style={{ height }}
        >
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-600 mb-2">Carte indisponible</p>
            <p className="text-xs text-red-500">{loadError}</p>
          </div>
        </div>
      );
    }

    // Afficher l'indicateur de chargement
    return (
      <div 
        className="bg-gray-100 rounded-2xl flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Barre de recherche */}
      {showSearchBox && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchBoxRef}
              type="text"
              placeholder="Rechercher un lieu..."
              className="w-full pl-10 pr-12 py-3 bg-white rounded-2xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {selectedLocation && (
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  if (searchBoxRef.current) searchBoxRef.current.value = '';
                  clearMarkers();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Carte */}
      <div 
        ref={mapRef} 
        className="w-full rounded-2xl overflow-hidden"
        style={{ height }}
      />

      {/* Bouton localisation */}
      {showCurrentLocation && (
        <Button
          onClick={getCurrentLocation}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white hover:bg-gray-50 text-blue-600 border shadow-lg z-10"
          variant="outline"
        >
          <Locate className="w-5 h-5" />
        </Button>
      )}

      {/* Information de lieu sélectionné */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-20 bg-white rounded-2xl p-4 shadow-lg z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900">Lieu sélectionné</h4>
              <p className="text-sm text-gray-500 truncate">{selectedLocation.address}</p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}