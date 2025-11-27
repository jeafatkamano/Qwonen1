import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Phone, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  StopCircle,
  Route,
  Timer,
  Activity
} from 'lucide-react';
import reliabilityManager, { Trip, GPSPoint } from '../services/reliabilityManager';
import { toast } from 'sonner@2.0.3';

interface TripTrackingMonitorProps {
  tripId?: string;
  viewMode?: 'driver' | 'client' | 'admin';
}

export default function TripTrackingMonitor({ 
  tripId,
  viewMode = 'driver' 
}: TripTrackingMonitorProps) {
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [tripDuration, setTripDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les courses actives
  const loadActiveTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const trips = reliabilityManager.getActiveTrips();
      setActiveTrips(trips);
      
      if (tripId) {
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
          setSelectedTrip(trip);
          if (trip.status === 'in_progress') {
            setIsTracking(true);
          }
        }
      } else if (trips.length > 0) {
        setSelectedTrip(trips[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des courses:', error);
      toast.error('Erreur lors du chargement des courses');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  // Simulation de mise à jour de position GPS
  useEffect(() => {
    if (isTracking && selectedTrip) {
      const interval = setInterval(() => {
        const newLocation: GPSPoint = {
          lat: 9.515 + (Math.random() - 0.5) * 0.01,
          lng: -13.712 + (Math.random() - 0.5) * 0.01,
          timestamp: new Date().toISOString(),
          speed: Math.random() * 40 + 10,
          heading: Math.random() * 360
        };
        
        setCurrentLocation(newLocation);
        
        // Mettre à jour la course
        if (selectedTrip.status === 'in_progress') {
          setTripDuration(prev => prev + 5);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isTracking, selectedTrip]);

  useEffect(() => {
    loadActiveTrips();
  }, [loadActiveTrips]);

  const handleStartTrip = useCallback(async (trip: Trip) => {
    try {
      const updatedTrip: Trip = {
        ...trip,
        status: 'in_progress',
        startTime: new Date().toISOString(),
        gpsTrackingData: []
      };
      
      setSelectedTrip(updatedTrip);
      setIsTracking(true);
      setTripDuration(0);
      
      // Démarrer le suivi GPS
      reliabilityManager.startTripTracking(trip.id, trip.driverId);
      
      toast.success('Course démarrée - Suivi GPS activé');
    } catch (error) {
      console.error('Erreur lors du démarrage de la course:', error);
      toast.error('Erreur lors du démarrage de la course');
    }
  }, []);

  const handleCompleteTrip = useCallback(async (trip: Trip) => {
    try {
      const updatedTrip: Trip = {
        ...trip,
        status: 'completed',
        endTime: new Date().toISOString(),
        actualDuration: tripDuration
      };
      
      setSelectedTrip(updatedTrip);
      setIsTracking(false);
      
      // Arrêter le suivi GPS
      reliabilityManager.stopTripTracking(trip.id);
      
      toast.success('Course terminée avec succès');
      
      // Recharger les courses actives
      setTimeout(loadActiveTrips, 1000);
    } catch (error) {
      console.error('Erreur lors de la finalisation de la course:', error);
      toast.error('Erreur lors de la finalisation de la course');
    }
  }, [tripDuration, loadActiveTrips]);

  const handleCancelTrip = useCallback((trip: Trip, reason: string) => {
    reliabilityManager.handleCancellation(trip.id, reason, 'driver_issue', trip.driverId, 'driver');
    reliabilityManager.stopTripTracking(trip.id);
    
    setIsTracking(false);
    setSelectedTrip(null);
    
    setTimeout(loadActiveTrips, 1000);
  }, [loadActiveTrips]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: Trip['status']) => {
    const statusConfig = {
      requested: { label: 'Demandée', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800 border-green-300' },
      in_progress: { label: 'En cours', color: 'bg-orange-100 text-orange-800 border-orange-300' },
      completed: { label: 'Terminée', color: 'bg-gray-100 text-gray-800 border-gray-300' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800 border-red-300' },
      no_show: { label: 'Client absent', color: 'bg-purple-100 text-purple-800 border-purple-300' }
    };
    
    const config = statusConfig[status];
    return <Badge className={`${config.color} border`}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === 'admin' ? 'Suivi des Courses' : 
             viewMode === 'client' ? 'Ma Course' : 'Course Active'}
          </h1>
          <p className="text-gray-500">
            Suivi en temps réel avec géolocalisation GPS
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTracking && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">GPS Actif</span>
            </div>
          )}
        </div>
      </div>

      {activeTrips.length === 0 ? (
        <Card className="border-0 rounded-2xl shadow-sm">
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune course active</h3>
            <p className="text-gray-500">Les courses en cours apparaîtront ici</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des courses actives */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Courses Actives</h2>
            
            {activeTrips.map((trip) => (
              <Card 
                key={trip.id} 
                className={`border-0 rounded-2xl shadow-sm cursor-pointer transition-all ${
                  selectedTrip?.id === trip.id ? 'ring-2 ring-black bg-gray-50' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTrip(trip)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Course #{trip.id.slice(-6)}</h3>
                    {getStatusBadge(trip.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">{trip.startLocation.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="text-gray-600">{trip.endLocation.address}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-gray-500">{trip.fare.toLocaleString()} GNF</span>
                      <span className="text-gray-500">
                        {trip.estimatedDuration} min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Détails de la course sélectionnée */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTrip && (
              <>
                {/* Carte de suivi */}
                <Card className="border-0 rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="w-5 h-5" />
                      Suivi GPS - Course #{selectedTrip.id.slice(-6)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Carte simulée */}
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl h-64 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-600">
                          <MapPin className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                          <h3 className="font-semibold mb-1">Carte en temps réel</h3>
                          <p className="text-sm">Suivi GPS de la course</p>
                        </div>
                      </div>

                      {/* Position actuelle */}
                      {currentLocation && (
                        <div 
                          className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"
                          style={{ 
                            left: '50%', 
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                      )}

                      {/* Points de départ et arrivée */}
                      <div 
                        className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
                        style={{ left: '20%', top: '30%' }}
                      />
                      <div 
                        className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"
                        style={{ left: '80%', top: '70%' }}
                      />
                    </div>

                    {/* Informations de localisation */}
                    {currentLocation && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 mb-1">Position actuelle</p>
                          <p className="font-mono">{currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 mb-1">Vitesse</p>
                          <p className="font-semibold">{Math.round(currentLocation.speed)} km/h</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations client */}
                  <Card className="border-0 rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Client
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">ID Client</p>
                        <p className="font-semibold">{selectedTrip.clientId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <Button variant="outline" size="sm" className="rounded-xl">
                          Appeler le client
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chronométrage */}
                  <Card className="border-0 rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="w-5 h-5" />
                        Temps de Course
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">{formatDuration(tripDuration)}</p>
                        <p className="text-sm text-gray-500">
                          Estimé: {selectedTrip.estimatedDuration} min
                        </p>
                      </div>
                      
                      {selectedTrip.status === 'in_progress' && (
                        <div className="flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-sm text-green-600 font-medium">En cours</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Actions de contrôle */}
                <Card className="border-0 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      {selectedTrip.status === 'accepted' && (
                        <Button 
                          onClick={() => handleStartTrip(selectedTrip)}
                          className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Démarrer la Course
                        </Button>
                      )}
                      
                      {selectedTrip.status === 'in_progress' && (
                        <Button 
                          onClick={() => handleCompleteTrip(selectedTrip)}
                          className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Terminer la Course
                        </Button>
                      )}
                      
                      {['accepted', 'in_progress'].includes(selectedTrip.status) && (
                        <Button 
                          onClick={() => handleCancelTrip(selectedTrip, 'Problème technique')}
                          variant="outline"
                          className="h-12 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}