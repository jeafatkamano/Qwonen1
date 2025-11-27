import { memo, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Clock, Star, RotateCcw, Filter } from 'lucide-react';

const trips = [
  {
    id: 1,
    from: 'Kaloum',
    to: 'Ratoma',
    date: '22 Juil 2025',
    time: '14:30',
    price: '18,000 GNF',
    status: 'completed',
    rating: 4.8,
    driver: 'Mamadou Diallo',
    distance: '12.5 km'
  },
  {
    id: 2,
    from: 'Matoto',
    to: 'Dixinn',
    date: '21 Juil 2025',
    time: '09:15',
    price: '12,000 GNF',
    status: 'completed',
    rating: 5.0,
    driver: 'Ibrahima Bah',
    distance: '8.2 km'
  },
  {
    id: 3,
    from: 'Centre-ville',
    to: 'Aéroport',
    date: '20 Juil 2025',
    time: '16:45',
    price: '25,000 GNF',
    status: 'completed',
    rating: 4.5,
    driver: 'Alfa Condé',
    distance: '18.7 km'
  }
];

const TripCard = memo(({ trip }: { trip: typeof trips[0] }) => (
  <Card className="shadow-sm border-0 rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-200 animate-fade-in">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-gray-900">{trip.from}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <span className="font-medium text-gray-900">{trip.to}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900 mb-1">{trip.price}</p>
          <Badge className="bg-green-100 text-green-800 border-0">
            Terminé
          </Badge>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{trip.date} • {trip.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{trip.rating}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-900">{trip.driver}</p>
          <p className="text-xs text-gray-500">{trip.distance}</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full border-gray-200 hover:bg-gray-50">
          <RotateCcw className="w-3 h-3 mr-1" />
          Refaire
        </Button>
      </div>
    </CardContent>
  </Card>
));

TripCard.displayName = 'TripCard';

export default function TripsScreen() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Mes trajets
          </h1>
          <p className="text-gray-500">Historique de vos courses</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full">
          <Filter className="w-4 h-4 mr-1" />
          Filtrer
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 rounded-2xl bg-white shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{trips.length}</div>
            <p className="text-sm text-gray-500">Trajets</p>
          </CardContent>
        </Card>
        <Card className="border-0 rounded-2xl bg-white shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">39.4</div>
            <p className="text-sm text-gray-500">km total</p>
          </CardContent>
        </Card>
        <Card className="border-0 rounded-2xl bg-white shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">4.8</div>
            <p className="text-sm text-gray-500">Note moy.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>

      {trips.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun trajet</h3>
          <p className="text-gray-500">Vos trajets apparaîtront ici</p>
        </div>
      )}
    </div>
  );
}