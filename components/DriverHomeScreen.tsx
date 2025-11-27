import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { 
  Power, 
  MapPin, 
  Clock, 
  Banknote, 
  Star, 
  Navigation, 
  Phone, 
  MessageCircle,
  Route,
  User,
  CheckCircle,
  X,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface RideRequest {
  id: string;
  clientId: string;
  clientName?: string;
  clientPhone?: string;
  clientRating?: number;
  pickup: string;
  destination: string;
  distance: string;
  duration: string;
  fare: string;
  timestamp: string;
  status: string;
}

interface DriverHomeScreenProps {
  driverOnline: boolean;
  onToggleStatus: () => void;
}

export default function DriverHomeScreen({ driverOnline, onToggleStatus }: DriverHomeScreenProps) {
  const { user } = useAuth();
  const [currentTrip, setCurrentTrip] = useState<RideRequest | null>(null);
  const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [earnings, setEarnings] = useState({
    today: '0 GNF',
    week: '0 GNF',
    month: '0 GNF'
  });
  const [stats, setStats] = useState({
    tripsToday: 0,
    rating: 4.8,
    acceptance: 95
  });

  // Simuler des données de démonstration
  useEffect(() => {
    if (user?.id) {
      // Charger les données simulées basées sur l'ID utilisateur
      const savedEarnings = localStorage.getItem(`driver_earnings_${user.id}`);
      if (savedEarnings) {
        setEarnings(JSON.parse(savedEarnings));
      } else {
        // Simuler des gains aléatoires
        const todayEarnings = Math.floor(Math.random() * 50000) + 10000;
        const newEarnings = {
          today: `${todayEarnings.toLocaleString()} GNF`,
          week: `${(todayEarnings * 6).toLocaleString()} GNF`,
          month: `${(todayEarnings * 25).toLocaleString()} GNF`
        };
        setEarnings(newEarnings);
        localStorage.setItem(`driver_earnings_${user.id}`, JSON.stringify(newEarnings));
      }

      // Charger les stats simulées
      const savedStats = localStorage.getItem(`driver_stats_${user.id}`);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      } else {
        const newStats = {
          tripsToday: Math.floor(Math.random() * 8),
          rating: 4.5 + Math.random() * 0.5,
          acceptance: 85 + Math.floor(Math.random() * 15)
        };
        setStats(newStats);
        localStorage.setItem(`driver_stats_${user.id}`, JSON.stringify(newStats));
      }
    }
  }, [user?.id]);

  // Simuler des demandes de course quand le conducteur est en ligne
  useEffect(() => {
    if (driverOnline && !currentTrip) {
      // Simuler une nouvelle demande toutes les 30-60 secondes
      const interval = setInterval(() => {
        if (Math.random() < 0.3 && pendingRequests.length < 3) { // 30% de chance
          const newRequest: RideRequest = {
            id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clientId: `client_${Math.random().toString(36).substr(2, 9)}`,
            clientName: ['Amadou Diallo', 'Fatoumata Camara', 'Mamadou Barry', 'Aissatou Sow', 'Ibrahim Kone'][Math.floor(Math.random() * 5)],
            clientPhone: `+224 6${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
            clientRating: 3.5 + Math.random() * 1.5,
            pickup: ['Kaloum Centre', 'Marché Madina', 'Université de Conakry', 'Aéroport', 'Camayenne'][Math.floor(Math.random() * 5)],
            destination: ['Ratoma', 'Dixinn', 'Matam', 'Cosa', 'Bambeto'][Math.floor(Math.random() * 5)],
            distance: `${Math.floor(Math.random() * 15) + 2} km`,
            duration: `${Math.floor(Math.random() * 30) + 10} min`,
            fare: `${(Math.floor(Math.random() * 20) + 10) * 1000} GNF`,
            timestamp: new Date().toISOString(),
            status: 'pending'
          };

          setPendingRequests(prev => [...prev, newRequest]);
          toast.info('Nouvelle demande de course reçue !');
        }
      }, Math.random() * 30000 + 30000); // Entre 30 et 60 secondes

      return () => clearInterval(interval);
    }
  }, [driverOnline, currentTrip, pendingRequests.length]);

  // Accepter une course
  const acceptRide = useCallback(async (request: RideRequest) => {
    setIsLoading(true);
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      setCurrentTrip(request);
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
      toast.success(`Course acceptée ! Direction: ${request.pickup}`);
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation de la course');
      console.error('Erreur acceptation course:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refuser une course
  const declineRide = useCallback((request: RideRequest) => {
    setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    
    // Mettre à jour le taux d'acceptation
    setStats(prev => ({
      ...prev,
      acceptance: Math.max(prev.acceptance - 1, 0)
    }));
    
    toast.info('Course refusée');
  }, []);

  // Terminer une course
  const completeTrip = useCallback(async () => {
    if (!currentTrip) return;

    setIsLoading(true);
    
    // Simuler le traitement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      toast.success(`Course terminée ! Vous avez gagné ${currentTrip.fare}`);
      
      // Mettre à jour les stats
      setStats(prev => {
        const newStats = { 
          ...prev, 
          tripsToday: prev.tripsToday + 1,
          acceptance: Math.min(prev.acceptance + 1, 100)
        };
        localStorage.setItem(`driver_stats_${user?.id}`, JSON.stringify(newStats));
        return newStats;
      });
      
      // Mettre à jour les gains
      const fareAmount = parseInt(currentTrip.fare.replace(/[^\d]/g, ''));
      setEarnings(prev => {
        const todayAmount = parseInt(prev.today.replace(/[^\d]/g, '')) + fareAmount;
        const newEarnings = {
          today: `${todayAmount.toLocaleString()} GNF`,
          week: `${(todayAmount * 6).toLocaleString()} GNF`,
          month: `${(todayAmount * 25).toLocaleString()} GNF`
        };
        localStorage.setItem(`driver_earnings_${user?.id}`, JSON.stringify(newEarnings));
        return newEarnings;
      });
      
      setCurrentTrip(null);
    } catch (error) {
      toast.error('Erreur lors de la finalisation de la course');
      console.error('Erreur finalisation course:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTrip, user?.id]);

  // Actualiser les demandes
  const refreshRequests = useCallback(() => {
    if (!driverOnline) return;
    
    setIsLoading(true);
    // Simuler un délai de chargement
    setTimeout(() => {
      setIsLoading(false);
      toast.info('Demandes actualisées');
    }, 1000);
  }, [driverOnline]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Statut et contrôles */}
      <div className="p-6 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bonjour {user?.name?.split(' ')[0]} !
            </h2>
            <p className="text-gray-600">Prêt pour une nouvelle journée ?</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{earnings.today}</p>
            <p className="text-sm text-gray-500">aujourd'hui</p>
          </div>
        </div>

        {/* Toggle de disponibilité */}
        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  driverOnline ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Power className={`w-6 h-6 ${driverOnline ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {driverOnline ? 'En ligne' : 'Hors ligne'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {driverOnline ? 'Vous recevez des demandes' : 'Aucune demande reçue'}
                  </p>
                </div>
              </div>
              <Switch
                checked={driverOnline}
                onCheckedChange={onToggleStatus}
                disabled={isLoading}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Course en cours */}
        {currentTrip && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Route className="w-5 h-5" />
                Course en cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{currentTrip.clientName}</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{currentTrip.clientRating?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full w-10 h-10 p-0">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full w-10 h-10 p-0">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-500">Départ</p>
                    <p className="font-medium">{currentTrip.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="font-medium">{currentTrip.destination}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-semibold text-gray-900">{currentTrip.distance}</p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentTrip.duration}</p>
                  <p className="text-xs text-gray-500">Durée</p>
                </div>
                <div>
                  <p className="font-semibold text-green-600">{currentTrip.fare}</p>
                  <p className="text-xs text-gray-500">Tarif</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigation GPS
                </Button>
                <Button 
                  onClick={completeTrip}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Terminer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demandes de course */}
        {!currentTrip && pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Nouvelles demandes ({pendingRequests.length})
            </h3>
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-2 border-orange-200 bg-orange-50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.clientName}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{request.clientRating?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {request.fare}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{request.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{request.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{request.distance}</span>
                    <span>{request.duration}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => declineRide(request)}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Refuser
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => acceptRide(request)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accepter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistiques et états */}
        {!currentTrip && pendingRequests.length === 0 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900">Statistiques du jour</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Route className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.tripsToday}</p>
                  <p className="text-xs text-gray-500">Courses</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Note</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.acceptance}%</p>
                  <p className="text-xs text-gray-500">Taux</p>
                </CardContent>
              </Card>
            </div>

            {/* Résumé des gains */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-green-600" />
                  Résumé des gains
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Aujourd'hui</span>
                  <span className="font-semibold text-green-600">{earnings.today}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cette semaine</span>
                  <span className="font-semibold">{earnings.week}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ce mois</span>
                  <span className="font-semibold">{earnings.month}</span>
                </div>
              </CardContent>
            </Card>

            {driverOnline && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600 animate-pulse" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">En attente de courses</h3>
                <p className="text-gray-600 text-sm">Vous recevrez une notification dès qu'une demande arrive</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshRequests}
                  disabled={isLoading}
                  className="mt-4"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            )}

            {!driverOnline && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Power className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Vous êtes hors ligne</h3>
                <p className="text-gray-600 text-sm">Activez votre disponibilité pour recevoir des demandes de course</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}