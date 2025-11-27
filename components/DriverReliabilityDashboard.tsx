import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Settings, 
  Star, 
  MapPin, 
  Clock, 
  Car,
  FileText,
  Wrench,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield
} from 'lucide-react';
import reliabilityManager, { Driver, ReliabilityMetrics, CancellationRecord } from '../services/reliabilityManager';
import { toast } from 'sonner@2.0.3';

interface DriverReliabilityDashboardProps {
  driverId?: string;
  viewMode?: 'driver' | 'admin';
}

export default function DriverReliabilityDashboard({ 
  driverId = 'driver_001', 
  viewMode = 'driver' 
}: DriverReliabilityDashboardProps) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [metrics, setMetrics] = useState<ReliabilityMetrics | null>(null);
  const [cancellations, setCancellations] = useState<CancellationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'documents' | 'performance'>('overview');

  const loadDriverData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const driverData = reliabilityManager.getDriver(driverId);
      if (!driverData) {
        toast.error('Conducteur non trouvé');
        return;
      }

      const metricsData = reliabilityManager.getDriverMetrics(driverId);
      const cancellationData = reliabilityManager.getCancellationHistory()
        .filter(c => c.driverId === driverId)
        .slice(0, 10); // 10 dernières annulations

      setDriver(driverData);
      setMetrics(metricsData);
      setCancellations(cancellationData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadDriverData();
  }, [loadDriverData]);

  const handleMaintenanceSchedule = useCallback(() => {
    if (driver?.vehicleInfo.id) {
      reliabilityManager.scheduleMaintenanceCheck(driver.vehicleInfo.id);
      toast.success('Vérification de maintenance programmée');
    }
  }, [driver]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-800 border-green-300' },
      inactive: { label: 'Inactif', color: 'bg-gray-100 text-gray-800 border-gray-300' },
      suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-800 border-red-300' },
      maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800 border-orange-300' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge className={`${config.color} border`}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!driver || !metrics) {
    return (
      <div className="p-6 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Données non disponibles</h2>
        <p className="text-gray-500">Impossible de charger les informations du conducteur</p>
        <Button onClick={loadDriverData} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === 'admin' ? 'Fiabilité Conducteur' : 'Mon Tableau de Bord'}
          </h1>
          <p className="text-gray-500">
            {viewMode === 'admin' ? `Suivi de ${driver.name}` : 'Votre performance et fiabilité'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(driver.status)}
          <Shield className={`w-6 h-6 ${metrics.overallReliabilityScore >= 80 ? 'text-green-600' : 'text-orange-600'}`} />
        </div>
      </div>

      {/* Score global de fiabilité */}
      <Card className="border-0 rounded-3xl shadow-lg bg-gradient-to-br from-black to-gray-800 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white/80 mb-2">Score de Fiabilité Global</h2>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold">{metrics.overallReliabilityScore}</span>
                <div className="text-white/60">
                  <p className="text-sm">/ 100</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metrics.overallReliabilityScore >= 80 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">Excellent</span>
                      </>
                    ) : metrics.overallReliabilityScore >= 60 ? (
                      <>
                        <Activity className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400">Bien</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-400">À améliorer</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <Star className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm text-white/60">Conducteur {driver.rating >= 4.5 ? 'Étoile' : 'Confirmé'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation par onglets */}
      <div className="flex space-x-1 bg-white rounded-2xl p-1 shadow-sm">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
          { id: 'maintenance', label: 'Maintenance', icon: Wrench },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'performance', label: 'Performance', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-black text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Métriques principales */}
          {[
            {
              title: 'Taux de Complétion',
              value: `${metrics.completionRate}%`,
              icon: CheckCircle,
              color: getScoreColor(metrics.completionRate),
              detail: `${driver.completedTrips}/${driver.totalTrips} courses`
            },
            {
              title: 'Ponctualité',
              value: `${metrics.punctualityScore}%`,
              icon: Clock,
              color: getScoreColor(metrics.punctualityScore),
              detail: 'Temps d\'attente moyen'
            },
            {
              title: 'Note Clients',
              value: `${driver.rating}/5`,
              icon: Star,
              color: getScoreColor(driver.rating * 20),
              detail: `${driver.totalTrips} évaluations`
            },
            {
              title: 'Annulations',
              value: `${metrics.cancellationRate}%`,
              icon: XCircle,
              color: getScoreColor(100 - metrics.cancellationRate),
              detail: `${driver.cancelledTrips} annulations`
            }
          ].map((metric, index) => (
            <Card key={index} className="border-0 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.color}`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <p className="text-sm font-medium text-gray-700 mb-1">{metric.title}</p>
                  <p className="text-xs text-gray-500">{metric.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Informations véhicule */}
          <Card className="border-0 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Informations Véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Véhicule</p>
                  <p className="font-semibold">{driver.vehicleInfo.make} {driver.vehicleInfo.model} ({driver.vehicleInfo.year})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plaque d'immatriculation</p>
                  <p className="font-semibold">{driver.vehicleInfo.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kilométrage</p>
                  <p className="font-semibold">{driver.vehicleInfo.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  {getStatusBadge(driver.vehicleInfo.status)}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Prochaine Maintenance</h4>
                  <Button 
                    onClick={handleMaintenanceSchedule}
                    size="sm" 
                    variant="outline"
                    className="rounded-xl"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Programmer
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Prévue le: <span className="font-semibold">{new Date(driver.vehicleInfo.nextMaintenanceDate).toLocaleDateString('fr-FR')}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={metrics.vehicleMaintenanceScore} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm font-medium">{metrics.vehicleMaintenanceScore}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          <Card className="border-0 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents et Conformité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">Score de Conformité</p>
                    <p className="text-sm text-gray-500">Tous documents requis</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.documentComplianceScore} className="w-20 h-2" />
                    <span className="font-bold">{metrics.documentComplianceScore}%</span>
                  </div>
                </div>
                
                {driver.documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucun document enregistré</p>
                    <p className="text-sm">Téléchargez vos documents requis</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {driver.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-xl">
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">Expire le: {new Date(doc.expiryDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <Badge className={doc.verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                          {doc.verified ? 'Vérifié' : 'En attente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Historique des annulations */}
          <Card className="border-0 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Historique des Annulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cancellations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Aucune annulation récente</p>
                  <p className="text-sm">Excellent travail !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cancellations.map(cancellation => (
                    <div key={cancellation.id} className="flex items-center justify-between p-3 border rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium">{cancellation.reason}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(cancellation.timestamp).toLocaleDateString('fr-FR')} - 
                          Catégorie: {cancellation.category}
                        </p>
                      </div>
                      <div className="text-right">
                        {cancellation.penaltyApplied && (
                          <Badge className="bg-red-100 text-red-800 mb-1">
                            Pénalité: {cancellation.penaltyAmount} GNF
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}