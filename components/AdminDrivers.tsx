import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Star,
  Phone,
  MessageCircle,
  Eye,
  MoreVertical
} from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: number;
  totalTrips: number;
  joinDate: string;
  vehicleInfo: {
    brand: string;
    model: string;
    plate: string;
    color: string;
  };
  documents: {
    license: 'verified' | 'pending' | 'rejected';
    insurance: 'verified' | 'pending' | 'rejected';
    vehicle: 'verified' | 'pending' | 'rejected';
  };
  earnings: string;
  isOnline: boolean;
}

export default function AdminDrivers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const drivers: Driver[] = [
    {
      id: '1',
      name: 'Alpha Condé',
      phone: '+224 628 789 012',
      email: 'alpha@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      status: 'active',
      rating: 4.9,
      totalTrips: 234,
      joinDate: '2023-08-15',
      vehicleInfo: {
        brand: 'Honda',
        model: 'CB 150R',
        plate: 'CNK-2024',
        color: 'Rouge'
      },
      documents: {
        license: 'verified',
        insurance: 'verified',
        vehicle: 'verified'
      },
      earnings: '1,250,000 GNF',
      isOnline: true
    },
    {
      id: '2',
      name: 'Ibrahim Sow',
      phone: '+224 628 456 789',
      email: 'ibrahim@example.com',
      status: 'active',
      rating: 4.7,
      totalTrips: 189,
      joinDate: '2023-09-22',
      vehicleInfo: {
        brand: 'Yamaha',
        model: 'FZ 150',
        plate: 'CNK-2025',
        color: 'Noir'
      },
      documents: {
        license: 'verified',
        insurance: 'verified',
        vehicle: 'pending'
      },
      earnings: '980,000 GNF',
      isOnline: false
    },
    {
      id: '3',
      name: 'Mamadou Bah',
      phone: '+224 628 321 654',
      email: 'mamadou@example.com',
      status: 'pending',
      rating: 0,
      totalTrips: 0,
      joinDate: '2024-01-10',
      vehicleInfo: {
        brand: 'Bajaj',
        model: 'Pulsar 150',
        plate: 'CNK-2026',
        color: 'Bleu'
      },
      documents: {
        license: 'pending',
        insurance: 'pending',
        vehicle: 'pending'
      },
      earnings: '0 GNF',
      isOnline: false
    },
    {
      id: '4',
      name: 'Fatoumata Camara',
      phone: '+224 628 987 321',
      email: 'fatoumata@example.com',
      status: 'suspended',
      rating: 4.2,
      totalTrips: 67,
      joinDate: '2023-11-08',
      vehicleInfo: {
        brand: 'Honda',
        model: 'CBR 125',
        plate: 'CNK-2027',
        color: 'Blanc'
      },
      documents: {
        license: 'verified',
        insurance: 'rejected',
        vehicle: 'verified'
      },
      earnings: '340,000 GNF',
      isOnline: false
    }
  ];

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.phone.includes(searchQuery) ||
                         driver.vehicleInfo.plate.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || driver.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: 'Actif', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactif', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'En attente', className: 'bg-orange-100 text-orange-800' },
      suspended: { label: 'Suspendu', className: 'bg-red-100 text-red-800' }
    };
    
    const config = configs[status as keyof typeof configs] || configs.inactive;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getDocumentStatus = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === 'active').length,
    pending: drivers.filter(d => d.status === 'pending').length,
    online: drivers.filter(d => d.isOnline).length
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-blue-600" />
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
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-gray-600">Actifs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-gray-600">En attente</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-2xl font-bold">{stats.online}</p>
            <p className="text-sm text-gray-600">En ligne</p>
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
                placeholder="Rechercher par nom, téléphone ou plaque..."
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
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des conducteurs */}
      <div className="space-y-4">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={driver.avatar} alt={driver.name} />
                    <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {driver.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{driver.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{driver.phone}</span>
                        <span>{driver.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(driver.status)}
                        {driver.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{driver.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Véhicule</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{driver.vehicleInfo.brand} {driver.vehicleInfo.model}</p>
                        <p>Plaque: {driver.vehicleInfo.plate}</p>
                        <p>Couleur: {driver.vehicleInfo.color}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Documents</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          {getDocumentStatus(driver.documents.license)}
                          <span>Permis de conduire</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getDocumentStatus(driver.documents.insurance)}
                          <span>Assurance</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getDocumentStatus(driver.documents.vehicle)}
                          <span>Carte grise</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>{driver.totalTrips} courses</span>
                      <span>Gains: {driver.earnings}</span>
                      <span>Inscrit: {new Date(driver.joinDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Appeler
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir profil
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun conducteur trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}