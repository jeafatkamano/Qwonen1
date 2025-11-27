import { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import GoogleMapModal from './GoogleMapModal';
import GoogleMapComponent from './GoogleMapComponent';
import GoogleMapsDemo from './GoogleMapsDemo';
import RefTestComponent from './RefTestComponent';
import FixedRefsSummary from './FixedRefsSummary';
import { MapPin, Navigation, Clock, Banknote, Star, Users, Zap, Map, CheckCircle, Route, Settings } from 'lucide-react';

const rideTypes = [
  { id: 'standard', name: 'Standard', price: '15,000 GNF', time: '5-10 min', icon: '🚗', description: 'Voiture standard' },
  { id: 'premium', name: 'Premium', price: '22,000 GNF', time: '3-7 min', icon: '✨', description: 'Voiture premium climatisée' },
  { id: 'shared', name: 'Partagé', price: '8,000 GNF', time: '10-15 min', icon: '👥', description: 'Course partagée économique' }
];

const quickDestinations = [
  { name: 'Aéroport International', icon: '✈️', time: '25 min', popular: true },
  { name: 'Centre-ville', icon: '🏢', time: '12 min', popular: true },
  { name: 'Marché Madina', icon: '🛒', time: '18 min', popular: false },
  { name: 'Université Gamal', icon: '🎓', time: '20 min', popular: false }
];

const drivers = [
  { name: 'Mamadou Diallo', car: 'Toyota Corolla', plate: 'ABC-123', rating: 4.9, distance: '2 min' },
  { name: 'Fatoumata Camara', car: 'Honda Civic', plate: 'XYZ-789', rating: 4.8, distance: '3 min' },
  { name: 'Alpha Condé', car: 'Nissan Sentra', plate: 'DEF-456', rating: 4.7, distance: '4 min' }
];

export default function HomeScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedRideType, setSelectedRideType] = useState('standard');
  const [isBooking, setIsBooking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Localisation...');
  const [nearbyDrivers, setNearbyDrivers] = useState(12);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);

  // États pour les modals de carte
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);

  // Simulation de géolocalisation
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentLocation('Kaloum, Conakry');
      if (!pickup) {
        setPickup('Ma position actuelle');
        setPickupCoords({ lat: 9.515, lng: -13.712 });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simulation de chauffeurs à proximité
  useEffect(() => {
    const interval = setInterval(() => {
      setNearbyDrivers(prev => Math.max(8, prev + Math.floor(Math.random() * 3 - 1)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleBookRide = useCallback(() => {
    if (!pickup || !destination) {
      toast.error('Veuillez sélectionner un point de départ et une destination');
      return;
    }
    
    setIsBooking(true);
    
    // Simulation du processus de réservation avec étapes
    toast.loading('Recherche de chauffeurs à proximité...', { id: 'booking' });
    
    setTimeout(() => {
      toast.loading('Chauffeur trouvé ! Confirmation en cours...', { id: 'booking' });
    }, 1000);

    setTimeout(() => {
      const selectedDriver = drivers[Math.floor(Math.random() * drivers.length)];
      
      toast.success(
        `🎉 Réservation confirmée !\n\nChauffeur: ${selectedDriver.name}\nVoiture: ${selectedDriver.car} (${selectedDriver.plate})\nNote: ${selectedDriver.rating}/5 ⭐\nArrivée: ${selectedDriver.distance}`, 
        { 
          id: 'booking',
          duration: 5000,
          action: {
            label: 'Suivre',
            onClick: () => toast.info('Fonctionnalité de suivi en cours de développement')
          }
        }
      );
      
      setIsBooking(false);
    }, 2500);
  }, [pickup, destination]);

  const handleQuickDestination = (dest: any) => {
    setDestination(dest.name);
    setDestinationCoords({ lat: 9.515 + Math.random() * 0.02 - 0.01, lng: -13.712 + Math.random() * 0.02 - 0.01 });
    if (!pickup) {
      setPickup('Ma position actuelle');
      setPickupCoords({ lat: 9.515, lng: -13.712 });
    }
    toast.success(`Destination sélectionnée: ${dest.name}`);
  };

  // Handlers pour les modals de carte
  const handlePickupSelect = (location: string) => {
    setPickup(location);
    toast.success(`Point de départ sélectionné: ${location}`);
  };

  const handleDestinationSelect = (location: string) => {
    setDestination(location);
    toast.success(`Destination sélectionnée: ${location}`);
  };

  // Handler pour sélectionner une localisation depuis la carte principale
  const handleMainMapLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    if (!pickup || pickup === 'Ma position actuelle') {
      setPickup(location.address);
      setPickupCoords({ lat: location.lat, lng: location.lng });
      toast.success(`Point de départ défini: ${location.address}`);
    } else if (!destination) {
      setDestination(location.address);
      setDestinationCoords({ lat: location.lat, lng: location.lng });
      toast.success(`Destination définie: ${location.address}`);
    } else {
      // Si les deux sont définis, remplacer la destination
      setDestination(location.address);
      setDestinationCoords({ lat: location.lat, lng: location.lng });
      toast.success(`Nouvelle destination: ${location.address}`);
    }
  };

  const selectedRide = rideTypes.find(ride => ride.id === selectedRideType);

  const estimatedDistance = pickup && destination ? '12.5 km' : '---';
  const estimatedTime = pickup && destination ? '~15 min' : '---';

  // Préparer les marqueurs pour la carte
  const mapMarkers = [];
  if (pickupCoords) {
    mapMarkers.push({
      position: pickupCoords,
      title: pickup,
      type: 'pickup' as const
    });
  }
  if (destinationCoords) {
    mapMarkers.push({
      position: destinationCoords,
      title: destination,
      type: 'destination' as const
    });
  }
  
  // Ajouter quelques chauffeurs fictifs
  if (nearbyDrivers > 0) {
    for (let i = 0; i < Math.min(nearbyDrivers, 5); i++) {
      mapMarkers.push({
        position: {
          lat: 9.515 + (Math.random() - 0.5) * 0.02,
          lng: -13.712 + (Math.random() - 0.5) * 0.02
        },
        title: `Chauffeur ${i + 1}`,
        type: 'driver' as const
      });
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Carte Google Maps améliorée */}
      <div className="flex-1 relative">
        <GoogleMapComponent
          height="100%"
          onLocationSelect={handleMainMapLocationSelect}
          showCurrentLocation={true}
          showSearchBox={false}
          initialCenter={{ lat: 9.515, lng: -13.712 }}
          zoom={13}
          markers={mapMarkers}
        />
        
        {/* Position actuelle - Fenêtre épurée et optimisée */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20 min-w-[140px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 truncate">Votre position</p>
                <p className="text-xs text-gray-600 truncate">{currentLocation}</p>
              </div>
              <Navigation className="w-3 h-3 text-blue-500 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Chauffeurs à proximité - Fenêtre épurée et optimisée */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20 min-w-[120px]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900">{nearbyDrivers} chauffeurs</p>
                <p className="text-xs text-gray-600">à proximité</p>
              </div>
            </div>
          </div>
        </div>

        {/* Affichage du trajet si les deux points sont sélectionnés */}
        {pickup && destination && (
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-700 truncate">{pickup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-700 truncate">{destination}</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-medium text-gray-900">{estimatedTime}</p>
                  <p className="text-xs text-gray-600">{estimatedDistance}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Route optimisée</span>
                </div>
                <div className="flex items-center gap-1">
                  <Route className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600">Trafic fluide</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interface de réservation améliorée */}
      <div className="p-6 bg-white">
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden animate-scale-in">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Où souhaitez-vous aller ?
              </h2>
              <p className="text-gray-500">Réservez votre course en quelques secondes</p>
            </div>
            
            <div className="space-y-4">
              {/* Point de départ - Cliquable */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                <button
                  onClick={() => setShowPickupModal(true)}
                  className="w-full text-left group hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="flex items-center pl-12 pr-4 h-14 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 transition-colors">
                    <span className={`flex-1 ${pickup ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {pickup || 'Point de départ'}
                    </span>
                    <Map className="w-4 h-4 text-gray-400 ml-2 group-hover:text-gray-600 transition-colors" />
                  </div>
                </button>
              </div>
              
              {/* Destination - Cliquable */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full border-2 border-white shadow-sm z-10"></div>
                <button
                  onClick={() => setShowDestinationModal(true)}
                  className="w-full text-left group hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="flex items-center pl-12 pr-4 h-14 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 transition-colors">
                    <span className={`flex-1 ${destination ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {destination || 'Destination'}
                    </span>
                    <Map className="w-4 h-4 text-gray-400 ml-2 group-hover:text-gray-600 transition-colors" />
                  </div>
                </button>
              </div>
            </div>

            {/* Destinations rapides */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Destinations populaires</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickDestinations.map((dest, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickDestination(dest)}
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-[1.02] text-left group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{dest.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{dest.name}</p>
                        {dest.popular && <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500">{dest.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Types de course */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Type de course</h3>
              <div className="space-y-2">
                {rideTypes.map((ride) => (
                  <button
                    key={ride.id}
                    onClick={() => {
                      setSelectedRideType(ride.id);
                      toast.success(`${ride.name} sélectionné - ${ride.price}`);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.01] ${
                      selectedRideType === ride.id
                        ? 'border-black bg-gray-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ride.icon}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{ride.name}</p>
                        <p className="text-sm text-gray-500">{ride.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{ride.price}</p>
                      <p className="text-xs text-gray-500">{ride.time}</p>
                      {selectedRideType === ride.id && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Options de course */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Maintenant</p>
                  <p className="text-xs text-gray-500">Arrivée immédiate</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <Banknote className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">{selectedRide?.price}</p>
                  <p className="text-xs text-gray-500">Prix estimé</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleBookRide}
              disabled={!pickup || !destination || isBooking}
              className="w-full h-14 rounded-2xl bg-black hover:bg-gray-800 text-white font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              {isBooking ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Recherche en cours...
                </div>
              ) : (
                'Réserver maintenant'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals de carte */}
      <GoogleMapModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        onSelectLocation={handlePickupSelect}
        title="Sélectionner le point de départ"
        currentLocation={pickup}
      />

      <GoogleMapModal
        isOpen={showDestinationModal}
        onClose={() => setShowDestinationModal(false)}
        onSelectLocation={handleDestinationSelect}
        title="Sélectionner la destination"
        currentLocation={destination}
      />

      {/* Demo Google Maps et tests - visible en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <div className="p-6 bg-gray-50">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Demo - Optimisations Google Maps</h3>
            </div>
            <GoogleMapsDemo />
          </div>
          
          {/* Tests des références */}
          <RefTestComponent />
          
          {/* Résumé des corrections */}
          <FixedRefsSummary />
        </>
      )}
    </div>
  );
}