import { toast } from 'sonner@2.0.3';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleInfo: VehicleInfo;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance';
  reliabilityScore: number;
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  rating: number;
  joinDate: string;
  lastActiveDate: string;
  documents: DriverDocument[];
}

export interface VehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  type: 'motorcycle' | 'car';
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  mileage: number;
  maintenanceHistory: MaintenanceRecord[];
  insuranceExpiry: string;
  technicalInspectionExpiry: string;
  status: 'operational' | 'maintenance' | 'repair' | 'retired';
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  mechanicName: string;
  nextServiceDate?: string;
  parts: MaintenancePart[];
}

export interface MaintenancePart {
  name: string;
  cost: number;
  warranty: string;
}

export interface DriverDocument {
  id: string;
  type: 'license' | 'id' | 'vehicle_registration' | 'insurance' | 'medical';
  name: string;
  expiryDate: string;
  verified: boolean;
  uploadDate: string;
}

export interface Trip {
  id: string;
  driverId: string;
  clientId: string;
  startLocation: { lat: number; lng: number; address: string };
  endLocation: { lat: number; lng: number; address: string };
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  requestTime: string;
  acceptTime?: string;
  startTime?: string;
  endTime?: string;
  estimatedDuration: number;
  actualDuration?: number;
  estimatedDistance: number;
  actualDistance?: number;
  fare: number;
  paymentMethod: 'orange_money' | 'mtn_money' | 'moov_money' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  rating?: number;
  feedback?: string;
  cancellationReason?: string;
  gpsTrackingData: GPSPoint[];
}

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
  heading: number;
}

export interface CancellationRecord {
  id: string;
  tripId: string;
  driverId?: string;
  clientId?: string;
  reason: string;
  category: 'driver_issue' | 'client_issue' | 'technical' | 'weather' | 'emergency' | 'other';
  timestamp: string;
  penaltyApplied: boolean;
  penaltyAmount?: number;
}

export interface ReliabilityMetrics {
  driverId: string;
  completionRate: number; // % de courses terminées
  punctualityScore: number; // Ponctualité
  cancellationRate: number; // % d'annulations
  customerRating: number; // Note moyenne clients
  vehicleMaintenanceScore: number; // Score maintenance véhicule
  documentComplianceScore: number; // Conformité documents
  overallReliabilityScore: number; // Score global
}

class ReliabilityManager {
  private drivers: Map<string, Driver> = new Map();
  private trips: Map<string, Trip> = new Map();
  private cancellations: Map<string, CancellationRecord> = new Map();
  private activeTracking: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeMockData();
    this.startPeriodicChecks();
  }

  private initializeMockData() {
    // Données de démonstration
    const mockDriver: Driver = {
      id: 'driver_001',
      name: 'Mamadou Diallo',
      phone: '+224 628 123 456',
      email: 'mamadou.diallo@qwonen.gn',
      licenseNumber: 'GN2024MD001',
      vehicleInfo: {
        id: 'vehicle_001',
        make: 'Honda',
        model: 'CB 125',
        year: 2022,
        licensePlate: 'GN-CKY-2024',
        color: 'Rouge',
        type: 'motorcycle',
        lastMaintenanceDate: '2024-12-01',
        nextMaintenanceDate: '2025-03-01',
        mileage: 15420,
        maintenanceHistory: [],
        insuranceExpiry: '2025-06-15',
        technicalInspectionExpiry: '2025-12-30',
        status: 'operational'
      },
      status: 'active',
      reliabilityScore: 87,
      totalTrips: 245,
      completedTrips: 235,
      cancelledTrips: 10,
      rating: 4.6,
      joinDate: '2024-01-15',
      lastActiveDate: new Date().toISOString(),
      documents: []
    };

    this.drivers.set(mockDriver.id, mockDriver);
  }

  // Suivi GPS en temps réel
  startTripTracking(tripId: string, driverId: string): void {
    console.log(`🗺️ Démarrage du suivi GPS pour la course ${tripId}`);
    
    const trackingInterval = setInterval(() => {
      const gpsPoint: GPSPoint = {
        lat: 9.515 + (Math.random() - 0.5) * 0.01,
        lng: -13.712 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date().toISOString(),
        speed: Math.random() * 40 + 10, // 10-50 km/h
        heading: Math.random() * 360
      };

      this.updateTripGPS(tripId, gpsPoint);
    }, 5000); // Mise à jour toutes les 5 secondes

    this.activeTracking.set(tripId, trackingInterval);
  }

  stopTripTracking(tripId: string): void {
    const interval = this.activeTracking.get(tripId);
    if (interval) {
      clearInterval(interval);
      this.activeTracking.delete(tripId);
      console.log(`🛑 Arrêt du suivi GPS pour la course ${tripId}`);
    }
  }

  private updateTripGPS(tripId: string, gpsPoint: GPSPoint): void {
    const trip = this.trips.get(tripId);
    if (trip) {
      trip.gpsTrackingData.push(gpsPoint);
      this.trips.set(tripId, trip);
    }
  }

  // Gestion des annulations
  handleCancellation(tripId: string, reason: string, category: CancellationRecord['category'], userId: string, userType: 'driver' | 'client'): void {
    const cancellation: CancellationRecord = {
      id: `cancel_${Date.now()}`,
      tripId,
      [userType === 'driver' ? 'driverId' : 'clientId']: userId,
      reason,
      category,
      timestamp: new Date().toISOString(),
      penaltyApplied: this.shouldApplyPenalty(category, userId, userType),
      penaltyAmount: this.calculatePenalty(category, userType)
    };

    this.cancellations.set(cancellation.id, cancellation);
    this.updateDriverStats(userType === 'driver' ? userId : '', 'cancellation');
    
    if (cancellation.penaltyApplied) {
      toast.error(`Annulation enregistrée. Pénalité appliquée: ${cancellation.penaltyAmount} GNF`);
    } else {
      toast.info('Annulation enregistrée sans pénalité');
    }

    console.log(`📋 Annulation enregistrée:`, cancellation);
  }

  private shouldApplyPenalty(category: string, userId: string, userType: string): boolean {
    // Logique de pénalité basée sur l'historique
    const recentCancellations = Array.from(this.cancellations.values())
      .filter(c => {
        const isRecentWeek = new Date(c.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const isSameUser = userType === 'driver' ? c.driverId === userId : c.clientId === userId;
        return isRecentWeek && isSameUser;
      });

    // Pénalité si plus de 3 annulations dans la semaine
    return recentCancellations.length >= 3;
  }

  private calculatePenalty(category: string, userType: string): number {
    const basePenalty = userType === 'driver' ? 5000 : 2000; // GNF
    const multipliers = {
      driver_issue: 1.5,
      client_issue: 1.0,
      technical: 0.5,
      weather: 0,
      emergency: 0,
      other: 1.0
    };

    return basePenalty * (multipliers[category as keyof typeof multipliers] || 1);
  }

  // Système de maintenance
  scheduleMaintenanceCheck(vehicleId: string): void {
    console.log(`🔧 Vérification de maintenance programmée pour le véhicule ${vehicleId}`);
    
    // Simuler une vérification de maintenance
    setTimeout(() => {
      this.performMaintenanceCheck(vehicleId);
    }, 1000);
  }

  private performMaintenanceCheck(vehicleId: string): void {
    const driver = Array.from(this.drivers.values())
      .find(d => d.vehicleInfo.id === vehicleId);

    if (!driver) return;

    const vehicle = driver.vehicleInfo;
    const nextMaintenanceDate = new Date(vehicle.nextMaintenanceDate);
    const now = new Date();
    const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilMaintenance <= 7) {
      toast.warning(`⚠️ Maintenance requise dans ${daysUntilMaintenance} jours pour ${driver.name}`);
      this.notifyMaintenanceRequired(driver.id, daysUntilMaintenance);
    }

    if (daysUntilMaintenance <= 0) {
      this.suspendDriverForMaintenance(driver.id);
    }
  }

  private notifyMaintenanceRequired(driverId: string, daysLeft: number): void {
    console.log(`🔔 Notification maintenance envoyée au conducteur ${driverId}: ${daysLeft} jours restants`);
  }

  private suspendDriverForMaintenance(driverId: string): void {
    const driver = this.drivers.get(driverId);
    if (driver) {
      driver.status = 'maintenance';
      driver.vehicleInfo.status = 'maintenance';
      this.drivers.set(driverId, driver);
      
      toast.error(`🚫 Conducteur ${driver.name} suspendu pour maintenance obligatoire`);
      console.log(`🚫 Conducteur suspendu pour maintenance: ${driverId}`);
    }
  }

  // Calcul du score de fiabilité
  calculateReliabilityScore(driverId: string): ReliabilityMetrics {
    const driver = this.drivers.get(driverId);
    if (!driver) {
      throw new Error('Conducteur non trouvé');
    }

    const completionRate = driver.totalTrips > 0 ? (driver.completedTrips / driver.totalTrips) * 100 : 0;
    const cancellationRate = driver.totalTrips > 0 ? (driver.cancelledTrips / driver.totalTrips) * 100 : 0;
    
    // Score de ponctualité (simulé)
    const punctualityScore = Math.max(0, 100 - (cancellationRate * 2));
    
    // Score de maintenance véhicule
    const vehicleMaintenanceScore = this.calculateVehicleMaintenanceScore(driver.vehicleInfo);
    
    // Score de conformité documents
    const documentComplianceScore = this.calculateDocumentComplianceScore(driver.documents);
    
    // Score global pondéré
    const overallReliabilityScore = Math.round(
      (completionRate * 0.3) +
      (punctualityScore * 0.2) +
      (driver.rating * 20 * 0.25) + // Rating sur 5, converti en %
      (vehicleMaintenanceScore * 0.15) +
      (documentComplianceScore * 0.1)
    );

    return {
      driverId,
      completionRate: Math.round(completionRate),
      punctualityScore: Math.round(punctualityScore),
      cancellationRate: Math.round(cancellationRate),
      customerRating: driver.rating,
      vehicleMaintenanceScore: Math.round(vehicleMaintenanceScore),
      documentComplianceScore: Math.round(documentComplianceScore),
      overallReliabilityScore: Math.max(0, Math.min(100, overallReliabilityScore))
    };
  }

  private calculateVehicleMaintenanceScore(vehicle: VehicleInfo): number {
    const nextMaintenanceDate = new Date(vehicle.nextMaintenanceDate);
    const now = new Date();
    const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilMaintenance < 0) return 0; // Maintenance en retard
    if (daysUntilMaintenance < 7) return 30; // Maintenance bientôt due
    if (daysUntilMaintenance < 30) return 70; // Maintenance due dans le mois
    return 100; // Maintenance à jour
  }

  private calculateDocumentComplianceScore(documents: DriverDocument[]): number {
    if (documents.length === 0) return 0;
    
    const validDocuments = documents.filter(doc => {
      const expiryDate = new Date(doc.expiryDate);
      const now = new Date();
      return doc.verified && expiryDate > now;
    });

    return (validDocuments.length / documents.length) * 100;
  }

  private updateDriverStats(driverId: string, event: 'completion' | 'cancellation'): void {
    const driver = this.drivers.get(driverId);
    if (!driver) return;

    if (event === 'completion') {
      driver.completedTrips++;
      driver.totalTrips++;
    } else if (event === 'cancellation') {
      driver.cancelledTrips++;
      driver.totalTrips++;
    }

    // Recalculer le score de fiabilité
    const metrics = this.calculateReliabilityScore(driverId);
    driver.reliabilityScore = metrics.overallReliabilityScore;

    this.drivers.set(driverId, driver);
  }

  // Vérifications périodiques
  private startPeriodicChecks(): void {
    // Vérification des maintenances toutes les heures
    setInterval(() => {
      this.checkAllVehicleMaintenance();
    }, 60 * 60 * 1000);

    // Vérification des documents toutes les 24h
    setInterval(() => {
      this.checkDocumentExpiry();
    }, 24 * 60 * 60 * 1000);
  }

  private checkAllVehicleMaintenance(): void {
    console.log('🔧 Vérification périodique de maintenance de tous les véhicules');
    
    this.drivers.forEach(driver => {
      if (driver.vehicleInfo.status === 'operational') {
        this.performMaintenanceCheck(driver.vehicleInfo.id);
      }
    });
  }

  private checkDocumentExpiry(): void {
    console.log('📄 Vérification de l\'expiration des documents');
    
    this.drivers.forEach(driver => {
      driver.documents.forEach(doc => {
        const expiryDate = new Date(doc.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          toast.warning(`📄 Document "${doc.name}" expire dans ${daysUntilExpiry} jours - ${driver.name}`);
        } else if (daysUntilExpiry <= 0) {
          toast.error(`📄 Document "${doc.name}" expiré - ${driver.name} suspendu`);
          driver.status = 'suspended';
          this.drivers.set(driver.id, driver);
        }
      });
    });
  }

  // Méthodes publiques pour l'interface
  getAllDrivers(): Driver[] {
    return Array.from(this.drivers.values());
  }

  getDriver(driverId: string): Driver | undefined {
    return this.drivers.get(driverId);
  }

  getDriverMetrics(driverId: string): ReliabilityMetrics {
    return this.calculateReliabilityScore(driverId);
  }

  getActiveTrips(): Trip[] {
    return Array.from(this.trips.values())
      .filter(trip => ['accepted', 'in_progress'].includes(trip.status));
  }

  getCancellationHistory(): CancellationRecord[] {
    return Array.from(this.cancellations.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// Instance singleton
export const reliabilityManager = new ReliabilityManager();

// Export des types et du manager
export default reliabilityManager;