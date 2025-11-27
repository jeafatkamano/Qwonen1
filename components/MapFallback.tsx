import { useState } from 'react';
import { Button } from './ui/button';
import { MapPin, Search, Locate, Navigation } from 'lucide-react';

interface MapFallbackProps {
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

export default function MapFallback({
  height = '400px',
  onLocationSelect,
  showCurrentLocation = true,
  showSearchBox = false,
  markers = []
}: MapFallbackProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Simuler la sélection d'une position (Conakry par défaut)
  const selectDefaultLocation = () => {
    const defaultLocation = {
      lat: 9.515,
      lng: -13.712,
      address: 'Conakry, République de Guinée'
    };
    
    setSelectedLocation(defaultLocation);
    onLocationSelect?.(defaultLocation);
  };

  // Simuler la géolocalisation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par ce navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Ma position actuelle'
        };
        
        setSelectedLocation(location);
        onLocationSelect?.(location);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        // Fallback sur la position par défaut
        selectDefaultLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className="relative">
      {/* Contenu de la carte simplifiée */}
      <div 
        className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200"
        style={{ height }}
      >
        <div className="h-full flex flex-col items-center justify-center p-6">
          {/* Icône de carte */}
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
            <MapPin className="w-10 h-10 text-red-500" />
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mode Carte Simplifiée
            </h3>
            <p className="text-sm text-gray-600 max-w-xs">
              La carte interactive n'est pas disponible. Vous pouvez toujours sélectionner une position.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              onClick={selectDefaultLocation}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Conakry
            </Button>
            
            {showCurrentLocation && (
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                className="border-gray-300"
              >
                <Locate className="w-4 h-4 mr-2" />
                Ma position
              </Button>
            )}
          </div>

          {/* Marqueurs simulés */}
          {markers.length > 0 && (
            <div className="mt-6 w-full max-w-xs">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Lieux:</h4>
              <div className="space-y-2">
                {markers.slice(0, 3).map((marker, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      marker.type === 'pickup' ? 'bg-green-500' :
                      marker.type === 'destination' ? 'bg-red-500' :
                      marker.type === 'driver' ? 'bg-black' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="text-xs text-gray-600">{marker.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barre de recherche simplifiée */}
      {showSearchBox && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Recherche simplifiée..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              readOnly
            />
          </div>
        </div>
      )}

      {/* Information de lieu sélectionné */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Position sélectionnée</h4>
              <p className="text-sm text-gray-500">{selectedLocation.address}</p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
            <Button
              onClick={() => onLocationSelect?.(selectedLocation)}
              size="sm"
              className="bg-black hover:bg-gray-800 text-white"
            >
              Confirmer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}