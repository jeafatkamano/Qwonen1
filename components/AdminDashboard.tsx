import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalDrivers: number;
  activeDrivers: number;
  totalClients: number;
  activeTrips: number;
  completedTrips: number;
  todayRevenue: string;
  monthlyRevenue: string;
  averageRating: number;
  pendingVerifications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDrivers: 127,
    activeDrivers: 45,
    totalClients: 2834,
    activeTrips: 12,
    completedTrips: 1567,
    todayRevenue: '2,340,000 GNF',
    monthlyRevenue: '45,670,000 GNF',
    averageRating: 4.7,
    pendingVerifications: 8
  });

  const [recentActivity] = useState([
    { id: 1, type: 'trip_completed', driver: 'Alpha Condé', client: 'Mamadou Diallo', amount: '18,000 GNF', time: '5 min' },
    { id: 2, type: 'driver_registered', driver: 'Fatoumata Camara', time: '12 min' },
    { id: 3, type: 'payment_received', driver: 'Ibrahim Sow', amount: '25,000 GNF', time: '18 min' },
    { id: 4, type: 'trip_cancelled', client: 'Aicha Barry', reason: 'Client unavailable', time: '25 min' }
  ]);

  const [topDrivers] = useState([
    { name: 'Alpha Condé', trips: 23, rating: 4.9, earnings: '415,000 GNF' },
    { name: 'Ibrahim Sow', trips: 19, rating: 4.8, earnings: '342,000 GNF' },
    { name: 'Mamadou Bah', trips: 17, rating: 4.7, earnings: '298,000 GNF' }
  ]);

  useEffect(() => {
    // Simulation de mise à jour des stats en temps réel
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeDrivers: Math.max(30, prev.activeDrivers + Math.floor(Math.random() * 3 - 1)),
        activeTrips: Math.max(5, prev.activeTrips + Math.floor(Math.random() * 3 - 1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trip_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'driver_registered':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'trip_cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    switch (activity.type) {
      case 'trip_completed':
        return `${activity.driver} a terminé une course avec ${activity.client}`;
      case 'driver_registered':
        return `${activity.driver} s'est inscrit comme conducteur`;
      case 'payment_received':
        return `Paiement reçu de ${activity.driver}`;
      case 'trip_cancelled':
        return `Course annulée par ${activity.client}`;
      default:
        return 'Activité inconnue';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Métriques principales */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conducteurs</p>
                <p className="text-2xl font-bold">{stats.totalDrivers}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stats.activeDrivers} en ligne
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-xs text-blue-600">+12% ce mois</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-2xl font-bold">{stats.completedTrips}</p>
                <p className="text-xs text-orange-600">{stats.activeTrips} en cours</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus</p>
                <p className="text-lg font-bold">{stats.todayRevenue}</p>
                <p className="text-xs text-purple-600">Aujourd'hui</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenus mensuels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Revenus du mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-green-600">{stats.monthlyRevenue}</span>
              <Badge className="bg-green-100 text-green-800">+15.3%</Badge>
            </div>
            <Progress value={65} className="h-2" />
            <p className="text-sm text-gray-600">65% de l'objectif mensuel atteint</p>
          </div>
        </CardContent>
      </Card>

      {/* Alertes importantes */}
      {stats.pendingVerifications > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">
                  {stats.pendingVerifications} conducteurs en attente de vérification
                </p>
                <p className="text-sm text-orange-700">
                  Vérifiez les documents pour valider les comptes
                </p>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Eye className="w-4 h-4 mr-2" />
                Voir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top conducteurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Top conducteurs du jour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topDrivers.map((driver, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{driver.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{driver.trips} courses</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{driver.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-semibold text-green-600">{driver.earnings}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-sm text-gray-900">{getActivityMessage(activity)}</p>
                {activity.amount && (
                  <p className="text-sm font-medium text-green-600">{activity.amount}</p>
                )}
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Résumé de performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance globale</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">{stats.averageRating}</p>
            <p className="text-sm text-gray-600">Note moyenne</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">8.5</p>
            <p className="text-sm text-gray-600">Temps moy. (min)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}