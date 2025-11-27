import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { 
  Wrench, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  User,
  FileText,
  Plus,
  Edit,
  Trash2,
  Car,
  Settings
} from 'lucide-react';
import reliabilityManager, { Driver, MaintenanceRecord, VehicleInfo } from '../services/reliabilityManager';
import { toast } from 'sonner@2.0.3';

interface MaintenanceSchedulerProps {
  driverId?: string;
  viewMode?: 'driver' | 'admin';
}

export default function MaintenanceScheduler({ 
  driverId,
  viewMode = 'driver' 
}: MaintenanceSchedulerProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [newMaintenance, setNewMaintenance] = useState({
    type: 'routine' as MaintenanceRecord['type'],
    description: '',
    cost: '',
    mechanicName: '',
    scheduledDate: new Date().toISOString().split('T')[0]
  });

  const loadDriversData = useCallback(async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const allDrivers = reliabilityManager.getAllDrivers();
      setDrivers(allDrivers);
      
      if (driverId) {
        const driver = allDrivers.find(d => d.id === driverId);
        if (driver) {
          setSelectedDriver(driver);
        }
      } else if (allDrivers.length > 0) {
        setSelectedDriver(allDrivers[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadDriversData();
  }, [loadDriversData]);

  const getMaintenanceStatusColor = (nextMaintenanceDate: string) => {
    const date = new Date(nextMaintenanceDate);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'bg-red-100 text-red-800 border-red-300';
    if (daysUntil <= 7) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (daysUntil <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getMaintenanceStatus = (nextMaintenanceDate: string) => {
    const date = new Date(nextMaintenanceDate);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return `En retard de ${Math.abs(daysUntil)} jours`;
    if (daysUntil === 0) return 'Maintenance aujourd\'hui';
    if (daysUntil <= 7) return `Dans ${daysUntil} jours`;
    return `Dans ${daysUntil} jours`;
  };

  const handleAddMaintenance = useCallback(async () => {
    if (!selectedDriver || !newMaintenance.description.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const maintenance: MaintenanceRecord = {
        id: `maint_${Date.now()}`,
        date: newMaintenance.scheduledDate,
        type: newMaintenance.type,
        description: newMaintenance.description,
        cost: parseFloat(newMaintenance.cost) || 0,
        mechanicName: newMaintenance.mechanicName,
        parts: []
      };

      // Simuler l'ajout
      console.log('Nouvelle maintenance programmée:', maintenance);
      
      toast.success('Maintenance programmée avec succès');
      
      setShowAddMaintenance(false);
      setNewMaintenance({
        type: 'routine',
        description: '',
        cost: '',
        mechanicName: '',
        scheduledDate: new Date().toISOString().split('T')[0]
      });
      
      // Recharger les données
      setTimeout(loadDriversData, 1000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la maintenance:', error);
      toast.error('Erreur lors de l\'ajout de la maintenance');
    }
  }, [selectedDriver, newMaintenance, loadDriversData]);

  const handleScheduleEmergencyMaintenance = useCallback((driver: Driver) => {
    reliabilityManager.scheduleMaintenanceCheck(driver.vehicleInfo.id);
    toast.info(`Vérification d'urgence programmée pour ${driver.name}`);
  }, []);

  const getMaintenanceTypeIcon = (type: MaintenanceRecord['type']) => {
    switch (type) {
      case 'routine': return <Settings className="w-4 h-4" />;
      case 'repair': return <Wrench className="w-4 h-4" />;
      case 'inspection': return <CheckCircle className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  const getMaintenanceTypeColor = (type: MaintenanceRecord['type']) => {
    switch (type) {
      case 'routine': return 'bg-blue-100 text-blue-800';
      case 'repair': return 'bg-red-100 text-red-800';
      case 'inspection': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === 'admin' ? 'Planification Maintenance' : 'Ma Maintenance'}
          </h1>
          <p className="text-gray-500">
            Gestion et planification de la maintenance des véhicules
          </p>
        </div>
        <Button 
          onClick={() => setShowAddMaintenance(true)}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Programmer Maintenance
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des véhicules (Admin) ou véhicule du conducteur */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {viewMode === 'admin' ? 'Véhicules' : 'Mon Véhicule'}
          </h2>
          
          {drivers.map((driver) => (
            <Card 
              key={driver.id}
              className={`border-0 rounded-2xl shadow-sm cursor-pointer transition-all ${
                selectedDriver?.id === driver.id ? 'ring-2 ring-black bg-gray-50' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedDriver(driver)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold">{driver.name}</h3>
                  </div>
                  <Badge className={getMaintenanceStatusColor(driver.vehicleInfo.nextMaintenanceDate)}>
                    {getMaintenanceStatus(driver.vehicleInfo.nextMaintenanceDate)}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <p className="text-gray-900 font-medium">
                    {driver.vehicleInfo.make} {driver.vehicleInfo.model}
                  </p>
                  <p className="text-gray-500">{driver.vehicleInfo.licensePlate}</p>
                  <p className="text-gray-500">{driver.vehicleInfo.mileage.toLocaleString()} km</p>
                </div>
                
                {viewMode === 'admin' && (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScheduleEmergencyMaintenance(driver);
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 rounded-xl"
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Vérification d'urgence
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Détails du véhicule sélectionné */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDriver && (
            <>
              {/* Informations véhicule */}
              <Card className="border-0 rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    {selectedDriver.vehicleInfo.make} {selectedDriver.vehicleInfo.model}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-500">Dernière maintenance</p>
                      <p className="font-semibold">
                        {new Date(selectedDriver.vehicleInfo.lastMaintenanceDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <CalendarIcon className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm text-gray-500">Prochaine maintenance</p>
                      <p className="font-semibold">
                        {new Date(selectedDriver.vehicleInfo.nextMaintenanceDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <Car className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-gray-500">Kilométrage</p>
                      <p className="font-semibold">{selectedDriver.vehicleInfo.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Assurance</p>
                      <p className="font-medium">
                        Expire le {new Date(selectedDriver.vehicleInfo.insuranceExpiry).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contrôle technique</p>
                      <p className="font-medium">
                        Expire le {new Date(selectedDriver.vehicleInfo.technicalInspectionExpiry).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historique de maintenance */}
              <Card className="border-0 rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Historique de Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDriver.vehicleInfo.maintenanceHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucune maintenance enregistrée</p>
                      <p className="text-sm">L'historique apparaîtra ici</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDriver.vehicleInfo.maintenanceHistory.map((maintenance) => (
                        <div key={maintenance.id} className="flex items-center justify-between p-4 border rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getMaintenanceTypeColor(maintenance.type)}`}>
                              {getMaintenanceTypeIcon(maintenance.type)}
                            </div>
                            <div>
                              <p className="font-medium">{maintenance.description}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(maintenance.date).toLocaleDateString('fr-FR')} - 
                                {maintenance.mechanicName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{maintenance.cost.toLocaleString()} GNF</p>
                            <Badge className={getMaintenanceTypeColor(maintenance.type)}>
                              {maintenance.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Modal d'ajout de maintenance */}
      {showAddMaintenance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-0 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle>Programmer une Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type de maintenance</label>
                <select 
                  value={newMaintenance.type}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-black transition-colors"
                >
                  <option value="routine">Maintenance de routine</option>
                  <option value="repair">Réparation</option>
                  <option value="inspection">Inspection</option>
                  <option value="emergency">Maintenance d'urgence</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Input
                  placeholder="Description de la maintenance..."
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                  className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date prévue</label>
                <Input
                  type="date"
                  value={newMaintenance.scheduledDate}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Mécanicien</label>
                <Input
                  placeholder="Nom du mécanicien..."
                  value={newMaintenance.mechanicName}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, mechanicName: e.target.value }))}
                  className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Coût estimé (GNF)</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={newMaintenance.cost}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, cost: e.target.value }))}
                  className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => setShowAddMaintenance(false)}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1 h-12 rounded-xl bg-black hover:bg-gray-800"
                  onClick={handleAddMaintenance}
                >
                  Programmer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}