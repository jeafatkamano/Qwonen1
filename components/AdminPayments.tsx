import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CheckCircle, 
  Clock,
  AlertTriangle,
  Download,
  Eye,
  CreditCard
} from 'lucide-react';

interface Payment {
  id: string;
  driverName: string;
  amount: string;
  commission: string;
  method: 'orange_money' | 'mtn_money' | 'moov_money' | 'cash';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  tripId: string;
}

export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');

  const payments: Payment[] = [
    {
      id: 'P001',
      driverName: 'Alpha Condé',
      amount: '18,000 GNF',
      commission: '1,800 GNF',
      method: 'orange_money',
      status: 'completed',
      date: '2024-01-15 14:45',
      tripId: 'T001'
    },
    {
      id: 'P002',
      driverName: 'Ibrahim Sow',
      amount: '25,000 GNF',
      commission: '2,500 GNF',
      method: 'mtn_money',
      status: 'pending',
      date: '2024-01-15 15:20',
      tripId: 'T002'
    },
    {
      id: 'P003',
      driverName: 'Mamadou Bah',
      amount: '12,000 GNF',
      commission: '1,200 GNF',
      method: 'moov_money',
      status: 'failed',
      date: '2024-01-15 13:30',
      tripId: 'T003'
    }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.tripId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterMethod === 'all' || payment.method === filterMethod;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      completed: { label: 'Terminé', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'En attente', className: 'bg-orange-100 text-orange-800', icon: Clock },
      failed: { label: 'Échoué', className: 'bg-red-100 text-red-800', icon: AlertTriangle }
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

  const getMethodBadge = (method: string) => {
    const configs = {
      orange_money: { label: 'Orange Money', className: 'bg-orange-100 text-orange-800' },
      mtn_money: { label: 'MTN Money', className: 'bg-yellow-100 text-yellow-800' },
      moov_money: { label: 'Moov Money', className: 'bg-blue-100 text-blue-800' },
      cash: { label: 'Espèces', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = configs[method as keyof typeof configs];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const stats = {
    totalRevenue: '2,340,000 GNF',
    totalCommission: '234,000 GNF',
    completedPayments: payments.filter(p => p.status === 'completed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length
  };

  const methodStats = {
    orange_money: { count: 45, percentage: 60 },
    mtn_money: { count: 23, percentage: 30 },
    moov_money: { count: 8, percentage: 10 }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Statistiques de revenus */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Revenus totaux</p>
                <p className="text-3xl font-bold">{stats.totalRevenue}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+12.5% ce mois</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Commissions</p>
                <p className="text-3xl font-bold">{stats.totalCommission}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">10% du CA</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques des paiements */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.completedPayments}</p>
            <p className="text-sm text-gray-600">Terminés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{stats.pendingPayments}</p>
            <p className="text-sm text-gray-600">En attente</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold">{stats.failedPayments}</p>
            <p className="text-sm text-gray-600">Échoués</p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par méthode de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Méthodes de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">Orange Money</span>
              </div>
              <span className="text-sm font-medium">{methodStats.orange_money.count} paiements</span>
            </div>
            <Progress value={methodStats.orange_money.percentage} className="h-2" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">MTN Money</span>
              </div>
              <span className="text-sm font-medium">{methodStats.mtn_money.count} paiements</span>
            </div>
            <Progress value={methodStats.mtn_money.percentage} className="h-2" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Moov Money</span>
              </div>
              <span className="text-sm font-medium">{methodStats.moov_money.count} paiements</span>
            </div>
            <Progress value={methodStats.moov_money.percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par conducteur, ID paiement ou course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={filterMethod} 
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="all">Toutes les méthodes</option>
              <option value="orange_money">Orange Money</option>
              <option value="mtn_money">MTN Money</option>
              <option value="moov_money">Moov Money</option>
              <option value="cash">Espèces</option>
            </select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des paiements */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Paiement #{payment.id}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{payment.date}</span>
                      <span>•</span>
                      <span>Course #{payment.tripId}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(payment.status)}
                  <div className="text-right">
                    <p className="font-bold text-green-600">{payment.amount}</p>
                    <p className="text-sm text-gray-500">Commission: {payment.commission}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Conducteur</h4>
                  <p className="text-gray-900">{payment.driverName}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Méthode</h4>
                  {getMethodBadge(payment.method)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>Montant net: {parseInt(payment.amount.replace(/[^0-9]/g, '')) - parseInt(payment.commission.replace(/[^0-9]/g, ''))} GNF</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Détails
                  </Button>
                  {payment.status === 'failed' && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Réessayer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}