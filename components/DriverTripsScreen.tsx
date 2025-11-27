import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MapPin, 
  Clock, 
  Star, 
  Navigation, 
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Calendar
} from 'lucide-react';

export default function DriverTripsScreen() {
  const [selectedTab, setSelectedTab] = useState('completed');

  const completedTrips = [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:30',
      clientName: 'Mamadou Diallo',
      clientPhone: '+224 628 123 456',
      from: 'Kaloum, Centre-ville',
      to: 'Ratoma, Marché Madina',
      duration: '18 min',
      distance: '8.5 km',
      fare: '18,000 GNF',
      rating: 5,
      tip: '2,000 GNF',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '13:45',
      clientName: 'Aicha Barry',
      clientPhone: '+224 628 456 789',
      from: 'Dixinn, Université',
      to: 'Marché Madina',
      duration: '12 min',
      distance: '5.2 km',
      fare: '12,000 GNF',
      rating: 4,
      tip: '0 GNF',
      status: 'completed'
    }
  ];

  const cancelledTrips = [
    {
      id: '3',
      date: '2024-01-15',
      time: '11:20',
      clientName: 'Ibrahim Sow',
      from: 'Kaloum',
      to: 'Ratoma',
      reason: 'Client indisponible',
      status: 'cancelled'
    }
  ];

  const stats = {
    today: { completed: 12, cancelled: 2, earnings: '215,000 GNF' },
    week: { completed: 87, cancelled: 8, earnings: '1,560,000 GNF' },
    month: { completed: 342, cancelled: 28, earnings: '6,150,000 GNF' }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xl font-bold">{stats.today.completed}</p>
            <p className="text-sm text-gray-600">Terminées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-xl font-bold">{stats.today.cancelled}</p>
            <p className="text-sm text-gray-600">Annulées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xl font-bold">{stats.today.earnings}</p>
            <p className="text-sm text-gray-600">Gains</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="completed">Terminées</TabsTrigger>
            <TabsTrigger value="cancelled">Annulées</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="completed" className="space-y-4">
          {completedTrips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{trip.clientName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{trip.date}</span>
                        <span>•</span>
                        <span>{trip.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{trip.fare}</p>
                    {trip.tip !== '0 GNF' && (
                      <p className="text-sm text-gray-600">+{trip.tip} pourboire</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-500">Départ</p>
                      <p className="font-medium">{trip.from}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-medium">{trip.to}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{trip.duration}</span>
                    </div>
                    <span>{trip.distance}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < trip.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1">{trip.rating}/5</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Rappeler
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    Refaire
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledTrips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{trip.clientName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{trip.date}</span>
                        <span>•</span>
                        <span>{trip.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge className="bg-red-100 text-red-800">
                    Annulée
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-500">Départ</p>
                      <p className="font-medium text-gray-700">{trip.from}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-medium text-gray-700">{trip.to}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Raison de l'annulation</p>
                    <p className="text-sm text-red-700">{trip.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Message si aucune course */}
      {((selectedTab === 'completed' && completedTrips.length === 0) ||
        (selectedTab === 'cancelled' && cancelledTrips.length === 0)) && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune course {selectedTab === 'completed' ? 'terminée' : 'annulée'}
            </h3>
            <p className="text-gray-500">
              {selectedTab === 'completed' 
                ? 'Vos courses terminées apparaîtront ici' 
                : 'Vos courses annulées apparaîtront ici'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}