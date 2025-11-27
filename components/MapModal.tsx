import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Star, 
  Clock, 
  Building,
  Home,
  Coffee,
  ShoppingBag,
  Plane,
  GraduationCap,
  Hospital
} from 'lucide-react';

const popularPlaces = [
  { id: 1, name: 'Aéroport International de Conakry', address: 'Gbessia, Conakry', icon: Plane, type: 'transport', coords: { lat: 9.576, lng: -13.612 } },
  { id: 2, name: 'Centre-ville de Conakry', address: 'Kaloum, Conakry', icon: Building, type: 'business', coords: { lat: 9.509, lng: -13.712 } },
  { id: 3, name: 'Marché Madina', address: 'Ratoma, Conakry', icon: ShoppingBag, type: 'shopping', coords: { lat: 9.541, lng: -13.677 } },
  { id: 4, name: 'Université Gamal Abdel Nasser', address: 'Dixinn, Conakry', icon: GraduationCap, type: 'education', coords: { lat: 9.530, lng: -13.677 } },
  { id: 5, name: 'Hôpital National Ignace Deen', address: 'Kaloum, Conakry', icon: Hospital, type: 'hospital', coords: { lat: 9.515, lng: -13.718 } },
  { id: 6, name: 'Palais du Peuple', address: 'Kaloum, Conakry', icon: Building, type: 'government', coords: { lat: 9.514, lng: -13.706 } },
  { id: 7, name: 'Stade du 28 Septembre', address: 'Kaloum, Conakry', icon: Building, type: 'sport', coords: { lat: 9.515, lng: -13.703 } },
  { id: 8, name: 'Port Autonome de Conakry', address: 'Kaloum, Conakry', icon: Building, type: 'transport', coords: { lat: 9.508, lng: -13.730 } }
];

const mapPoints = [
  { id: 'current', name: 'Ma position actuelle', coords: { lat: 9.515, lng: -13.712 }, type: 'current' },
  ...popularPlaces
];

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
  title: string;
  currentLocation?: string;
}

export default function MapModal({ isOpen, onClose, onSelectLocation, title, currentLocation }: MapModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 9.515, lng: -13.712 });

  const filteredPlaces = popularPlaces.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPlace = (place: any) => {
    setSelectedPlace(place);
    setMapCenter(place.coords);
  };

  const handleConfirmSelection = () => {
    if (selectedPlace) {
      onSelectLocation(selectedPlace.name);
      onClose();
      setSelectedPlace(null);
      setSearchQuery('');
    }
  };

  const handleCurrentLocation = () => {
    setSelectedPlace({ 
      id: 'current', 
      name: 'Ma position actuelle', 
      address: 'Kaloum, Conakry',
      coords: { lat: 9.515, lng: -13.712 }
    });
    setMapCenter({ lat: 9.515, lng: -13.712 });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      transport: 'text-blue-600 bg-blue-100',
      business: 'text-gray-600 bg-gray-100', 
      shopping: 'text-green-600 bg-green-100',
      education: 'text-purple-600 bg-purple-100',
      hospital: 'text-red-600 bg-red-100',
      government: 'text-orange-600 bg-orange-100',
      sport: 'text-yellow-600 bg-yellow-100'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlace(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md w-full h-[90vh] p-0 overflow-hidden rounded-3xl [&>button]:hidden"
        aria-describedby="map-modal-description"
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription id="map-modal-description" className="text-left">
            Parcourez la carte interactive ou recherchez parmi les lieux populaires de Conakry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Carte simulée */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
            {/* Carte de fond */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <MapPin className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                <h3 className="font-semibold mb-1">Carte de Conakry</h3>
                <p className="text-sm text-gray-500">Sélectionnez votre destination</p>
              </div>
            </div>

            {/* Points sur la carte */}
            <div className="absolute inset-0">
              {/* Position actuelle */}
              <div 
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse cursor-pointer z-10"
                style={{ 
                  left: '45%', 
                  top: '55%',
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={handleCurrentLocation}
                role="button"
                aria-label="Sélectionner ma position actuelle"
              >
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              </div>

              {/* Lieux populaires */}
              {mapPoints.slice(1, 6).map((point, index) => (
                <div
                  key={point.id}
                  className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all hover:scale-150 z-10 ${
                    selectedPlace?.id === point.id ? 'bg-black scale-150' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  style={{
                    left: `${30 + index * 15}%`,
                    top: `${25 + index * 10}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleSelectPlace(point)}
                  role="button"
                  aria-label={`Sélectionner ${point.name}`}
                >
                  {selectedPlace?.id === point.id && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                      {point.name.slice(0, 20)}...
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Lieu sélectionné */}
            {selectedPlace && (
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg animate-slide-up z-20">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedPlace.id === 'current' ? 'bg-blue-100' : getTypeColor(selectedPlace.type)
                  }`}>
                    {selectedPlace.id === 'current' ? (
                      <Navigation className="w-5 h-5 text-blue-600" />
                    ) : (
                      <selectedPlace.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{selectedPlace.name}</h4>
                    <p className="text-sm text-gray-500">{selectedPlace.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton ma position */}
            <Button
              onClick={handleCurrentLocation}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white hover:bg-gray-50 text-blue-600 border shadow-lg z-20"
              variant="outline"
              aria-label="Centrer sur ma position"
            >
              <Navigation className="w-5 h-5" />
            </Button>
          </div>

          {/* Barre de recherche et résultats */}
          <div className="p-4 bg-white border-t max-h-80 overflow-y-auto">
            {/* Recherche */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white"
                aria-label="Rechercher un lieu"
              />
            </div>

            {/* Ma position actuelle */}
            <button
              onClick={handleCurrentLocation}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-3 transition-colors ${
                selectedPlace?.id === 'current' 
                  ? 'bg-blue-50 border-2 border-blue-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              aria-label="Sélectionner ma position actuelle"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Ma position actuelle</p>
                <p className="text-sm text-gray-500">Kaloum, Conakry</p>
              </div>
              {selectedPlace?.id === 'current' && (
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              )}
            </button>

            {/* Lieux populaires / Résultats de recherche */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {searchQuery ? 'Résultats de recherche' : 'Lieux populaires'}
              </h3>
              {(searchQuery ? filteredPlaces : popularPlaces.slice(0, 6)).map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    selectedPlace?.id === place.id 
                      ? 'bg-gray-50 border-2 border-black' 
                      : 'hover:bg-gray-50'
                  }`}
                  aria-label={`Sélectionner ${place.name}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(place.type)}`}>
                    <place.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{place.name}</p>
                    <p className="text-sm text-gray-500">{place.address}</p>
                  </div>
                  {selectedPlace?.id === place.id && (
                    <div className="w-4 h-4 bg-black rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {searchQuery && filteredPlaces.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun lieu trouvé</p>
                <p className="text-sm">Essayez un autre terme de recherche</p>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-2xl"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 h-12 rounded-2xl bg-black hover:bg-gray-800"
                onClick={handleConfirmSelection}
                disabled={!selectedPlace}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}