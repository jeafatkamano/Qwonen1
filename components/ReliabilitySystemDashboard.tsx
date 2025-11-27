import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import DriverReliabilityDashboard from './DriverReliabilityDashboard';
import TripTrackingMonitor from './TripTrackingMonitor';
import MaintenanceScheduler from './MaintenanceScheduler';
import PerformanceMonitor from './PerformanceMonitor';
import { 
  Shield, 
  Activity, 
  MapPin, 
  Wrench, 
  Users, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Clock,
  Car
} from 'lucide-react';
import reliabilityManager, { Driver, ReliabilityMetrics } from '../services/reliabilityManager';

interface SystemOverviewStats {
  totalDrivers: number;
  activeDrivers: number;
  averageReliabilityScore: number;
  activeTrips: number;
  pendingMaintenances: number;
  recentCancellations: number;
}

export default function ReliabilitySystemDashboard() {
  const [stats, setStats] = useState<SystemOverviewStats | null>(null);
  const [topDrivers, setTopDrivers] = useState<{ driver: Driver; metrics: ReliabilityMetrics }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadSystemStats = useCallback(async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const allDrivers = reliabilityManager.getAllDrivers();
      const activeTrips = reliabilityManager.getActiveTrips();
      const cancellations = reliabilityManager.getCancellationHistory();
      
      // Calculer les statistiques
      const activeDrivers = allDrivers.filter(d => d.status === 'active').length;
      const reliabilityScores = allDrivers.map(d => reliabilityManager.getDriverMetrics(d.id).overallReliabilityScore);
      const averageScore = reliabilityScores.length > 0 
        ? Math.round(reliabilityScores.reduce((a, b) => a + b, 0) / reliabilityScores.length)
        : 0;
      
      const pendingMaintenances = allDrivers.filter(d => {
        const nextMaintenance = new Date(d.vehicleInfo.nextMaintenanceDate);
        const now = new Date();
        const daysUntil = Math.ceil((nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7;
      }).length;
      
      const recentCancellations = cancellations.filter(c => {
        const cancelDate = new Date(c.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return cancelDate > weekAgo;
      }).length;

      setStats({
        totalDrivers: allDrivers.length,
        activeDrivers,
        averageReliabilityScore: averageScore,
        activeTrips: activeTrips.length,
        pendingMaintenances,
        recentCancellations
      });

      // Top conducteurs
      const driversWithMetrics = allDrivers.map(driver => ({
        driver,
        metrics: reliabilityManager.getDriverMetrics(driver.id)
      })).sort((a, b) => b.metrics.overallReliabilityScore - a.metrics.overallReliabilityScore);
      
      setTopDrivers(driversWithMetrics.slice(0, 5));
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSystemStats();
    // Recharger les stats toutes les 30 secondes
    const interval = setInterval(loadSystemStats, 30000);
    return () => clearInterval(interval);
  }, [loadSystemStats]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Système de Fiabilité Qwonen</h1>
          <p className="text-gray-500">
            Surveillance complète de la fiabilité des conducteurs et véhicules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Système Actif</span>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble des statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: 'Conducteurs Actifs',
              value: `${stats.activeDrivers}/${stats.totalDrivers}`,
              icon: Users,
              color: 'bg-blue-100 text-blue-600',
              change: '+2 cette semaine'
            },
            {
              title: 'Score Moyen',
              value: `${stats.averageReliabilityScore}%`,
              icon: Shield,
              color: getScoreBgColor(stats.averageReliabilityScore) + ' ' + getScoreColor(stats.averageReliabilityScore),
              change: stats.averageReliabilityScore >= 80 ? 'Excellent' : 'Bon'
            },
            {
              title: 'Courses Actives',
              value: stats.activeTrips.toString(),
              icon: MapPin,
              color: 'bg-green-100 text-green-600',
              change: 'En temps réel'
            },
            {
              title: 'Maintenances Dues',
              value: stats.pendingMaintenances.toString(),
              icon: Wrench,
              color: stats.pendingMaintenances > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600',
              change: 'Dans 7 jours'
            }
          ].map((stat, index) => (
            <Card key={index} className="border-0 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white rounded-2xl p-1 shadow-sm">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-xl"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger 
            value="drivers" 
            className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-xl"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Conducteurs</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tracking" 
            className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-xl"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Suivi GPS</span>
          </TabsTrigger>
          <TabsTrigger 
            value="maintenance" 
            className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-xl"
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-xl"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Alertes système */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Alertes Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats && stats.pendingMaintenances > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <Wrench className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-900">
                        {stats.pendingMaintenances} maintenance(s) due(s)
                      </p>
                      <p className="text-sm text-orange-700">Action requise dans les 7 jours</p>
                    </div>
                  </div>
                )}
                
                {stats && stats.recentCancellations > 5 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">
                        {stats.recentCancellations} annulations cette semaine
                      </p>
                      <p className="text-sm text-red-700">Taux d'annulation élevé</p>
                    </div>
                  </div>
                )}
                
                {(!stats || (stats.pendingMaintenances === 0 && stats.recentCancellations <= 5)) && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Système opérationnel</p>
                      <p className="text-sm text-green-700">Aucune alerte critique</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top conducteurs */}
            <Card className="border-0 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Conducteurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topDrivers.map((item, index) => (
                  <div key={item.driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.driver.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.driver.totalTrips} courses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getScoreColor(item.metrics.overallReliabilityScore)}`}>
                        {item.metrics.overallReliabilityScore}%
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              i < Math.floor(item.driver.rating) ? 'bg-yellow-400' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drivers">
          <DriverReliabilityDashboard viewMode="admin" />
        </TabsContent>

        <TabsContent value="tracking">
          <TripTrackingMonitor viewMode="admin" />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceScheduler viewMode="admin" />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}