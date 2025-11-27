import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  Filter,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface Trip {
  id: string;
  clientName: string;
  driverName: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  fare: string;
  status: 'completed' | 'active' | 'cancelled';
  timestamp: string;
  rating?: number;
}

export default function AdminTrips() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const trips: Trip[] = [
    {
      id: 'T001',
      clientName: 'Mamadou Diallo',
      driverName: 'Alpha Condé',
      from: 'Kaloum, Centre-ville',
      to: 'Ratoma, Marché Madina',
      distance: '8.5 km',
      duration: '18 min',
      fare: '18,000 GNF',
      status: 'completed',
      timestamp: '2024-01-15 14:30',
      rating: 5
    },
    {
      id: 'T002',
      clientName: 'Aicha Barry',
      driverName: 'Ibrahim Sow',
      from: 'Dixinn, Université',
      to: 'Aéroport International',
      distance: '12.3 km',
      duration: '25 min',
      fare: '25,000 GNF',
      status: 'active',
      timestamp: '2024-01-15 15:45'
    },
    {
      id: 'T003',
      clientName: 'Fatoumata Camara',
      driverName: 'Mamadou Bah',
      from: 'Matam',
      to: 'Marché Niger',
      distance: '6.2 km',
      duration: '15 min',
      fare: '15,000 GNF',
      status: 'cancelled',
      timestamp: '2024-01-15 13:20'
    }
  ];

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || trip.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      completed: { label: 'Terminée', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      active: { label: 'En cours', className: 'bg-blue-100 text-blue-800', icon: Clock },
      cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: trips.length,
    completed: trips.filter(t => t.status === 'completed').length,
    active: trips.filter(t => t.status === 'active').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-sm text-gray-600">Terminées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-gray-600">En cours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold">{stats.cancelled}</p>
            <p className="text-sm text-gray-600">Annulées</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par client, conducteur ou ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Terminées</option>
              <option value="active">En cours</option>
              <option value="cancelled">Annulées</option>
            </select>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des courses */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <Card key={trip.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Course #{trip.id}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{trip.timestamp}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(trip.status)}
                  <div className="text-right">
                    <p className="font-bold text-green-600">{trip.fare}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Client</h4>
                  <p className="text-gray-900">{trip.clientName}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Conducteur</h4>
                  <p className="text-gray-900">{trip.driverName}</p>
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

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>{trip.distance}</span>
                  <span>{trip.duration}</span>
                  {trip.rating && (
                    <span>Note: {trip.rating}/5 ⭐</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Détails
                  </Button>
                  {trip.status === 'active' && (
                    <Button variant="outline" size="sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Intervenir
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune course trouvée</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}