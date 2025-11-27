import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  MapPin,
  Clock,
  Star,
  Download,
  Eye
} from 'lucide-react';

export default function DriverEarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const earnings = {
    today: {
      total: '45,000 GNF',
      trips: 12,
      commission: '4,500 GNF',
      bonus: '5,000 GNF',
      net: '40,500 GNF'
    },
    week: {
      total: '315,000 GNF',
      trips: 87,
      commission: '31,500 GNF',
      bonus: '25,000 GNF',
      net: '283,500 GNF'
    },
    month: {
      total: '1,260,000 GNF',
      trips: 342,
      commission: '126,000 GNF',
      bonus: '80,000 GNF',
      net: '1,134,000 GNF'
    }
  };

  const recentTrips = [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:30',
      from: 'Kaloum',
      to: 'Ratoma',
      duration: '18 min',
      distance: '8.5 km',
      fare: '18,000 GNF',
      commission: '1,800 GNF',
      net: '16,200 GNF',
      rating: 5,
      tip: '2,000 GNF'
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '13:45',
      from: 'Dixinn',
      to: 'Marché Madina',
      duration: '12 min',
      distance: '5.2 km',
      fare: '12,000 GNF',
      commission: '1,200 GNF',
      net: '10,800 GNF',
      rating: 4,
      tip: '0 GNF'
    },
    {
      id: '3',
      date: '2024-01-15',
      time: '12:20',
      from: 'Aéroport',
      to: 'Centre-ville',
      duration: '25 min',
      distance: '15.3 km',
      fare: '25,000 GNF',
      commission: '2,500 GNF',
      net: '22,500 GNF',
      rating: 5,
      tip: '3,000 GNF'
    }
  ];

  const currentEarnings = earnings[selectedPeriod as keyof typeof earnings];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Résumé des gains */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100">Gains totaux</p>
              <p className="text-3xl font-bold">{currentEarnings.total}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{currentEarnings.trips}</p>
              <p className="text-sm text-green-100">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{currentEarnings.net}</p>
              <p className="text-sm text-green-100">Net</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{currentEarnings.bonus}</p>
              <p className="text-sm text-green-100">Bonus</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sélecteur de période */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="week">Cette semaine</TabsTrigger>
          <TabsTrigger value="month">Ce mois</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Détails des gains */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Gains bruts</p>
                    <p className="text-xl font-bold text-green-600">{currentEarnings.total}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commission</p>
                    <p className="text-xl font-bold text-red-600">-{currentEarnings.commission}</p>
                  </div>
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historique des courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Historique des courses
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{trip.time}</Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < trip.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{trip.net}</p>
                      <p className="text-xs text-gray-500">Net</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{trip.from}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{trip.to}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{trip.duration}</span>
                      </div>
                      <span>{trip.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Tarif: {trip.fare}</span>
                      {trip.tip !== '0 GNF' && (
                        <Badge className="bg-green-100 text-green-800">
                          +{trip.tip} pourboire
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>Commission: -{trip.commission}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Objectifs et bonus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Objectifs & Bonus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">20 courses aujourd'hui</span>
                  <Badge className="bg-orange-100 text-orange-800">12/20</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-600">+10,000 GNF bonus si objectif atteint</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Note moyenne &gt; 4.8</span>
                  <Badge className="bg-green-100 text-green-800">4.9/5</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <p className="text-xs text-gray-600">✅ Bonus qualité débloqué</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}