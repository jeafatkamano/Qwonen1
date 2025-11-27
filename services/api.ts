import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1b48186d`;

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
  [key: string]: any;
}

// Mock Database Service pour la démo
class MockDataService {
  private getStorageKey(type: string) {
    return `qwonen_mock_${type}`;
  }

  private getData(type: string) {
    const data = localStorage.getItem(this.getStorageKey(type));
    return data ? JSON.parse(data) : [];
  }

  private setData(type: string, data: any[]) {
    localStorage.setItem(this.getStorageKey(type), JSON.stringify(data));
  }

  // Initialiser les données de démonstration
  initializeMockData() {
    // Courses de démonstration
    const trips = this.getData('trips');
    if (trips.length === 0) {
      const demoTrips = [
        {
          id: '1',
          clientId: 'client-demo',
          driverId: 'driver-demo',
          status: 'completed',
          pickup: { address: 'Kaloum, Conakry', lat: 9.5370, lng: -13.6785 },
          destination: { address: 'Ratoma, Conakry', lat: 9.5664, lng: -13.6483 },
          fare: 15000,
          paymentMethod: 'orange_money',
          rating: 5,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1800000).toISOString()
        },
        {
          id: '2',
          clientId: 'client-demo',
          status: 'pending',
          pickup: { address: 'Madina, Conakry', lat: 9.5315, lng: -13.6890 },
          destination: { address: 'Kipé, Conakry', lat: 9.5874, lng: -13.6542 },
          fare: 12000,
          paymentMethod: 'mtn_money',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        }
      ];
      this.setData('trips', demoTrips);
    }

    // Paiements de démonstration
    const payments = this.getData('payments');
    if (payments.length === 0) {
      const demoPayments = [
        {
          id: '1',
          userId: 'client-demo',
          tripId: '1',
          amount: 15000,
          method: 'orange_money',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      this.setData('payments', demoPayments);
    }

    // Statistiques admin
    const stats = this.getData('admin_stats');
    if (stats.length === 0) {
      const demoStats = {
        totalTrips: 847,
        totalDrivers: 156,
        totalRevenue: 12450000,
        activeTrips: 23,
        monthlyGrowth: 15.2,
        avgRating: 4.6,
        completionRate: 94.3
      };
      this.setData('admin_stats', [demoStats]);
    }
  }

  // CRUD opérations génériques
  create(type: string, item: any) {
    const items = this.getData(type);
    const newItem = {
      ...item,
      id: item.id || Date.now().toString(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.setData(type, items);
    return newItem;
  }

  read(type: string, id?: string) {
    const items = this.getData(type);
    return id ? items.find((item: any) => item.id === id) : items;
  }

  update(type: string, id: string, updates: any) {
    const items = this.getData(type);
    const index = items.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.setData(type, items);
      return items[index];
    }
    return null;
  }

  delete(type: string, id: string) {
    const items = this.getData(type);
    const filtered = items.filter((item: any) => item.id !== id);
    this.setData(type, filtered);
    return true;
  }

  // Méthodes spécialisées pour les courses
  getPendingTrips() {
    return this.getData('trips').filter((trip: any) => trip.status === 'pending');
  }

  getUserTrips(userId: string) {
    return this.getData('trips').filter((trip: any) => 
      trip.clientId === userId || trip.driverId === userId
    );
  }

  // Méthodes spécialisées pour les paiements
  getUserPayments(userId: string) {
    return this.getData('payments').filter((payment: any) => payment.userId === userId);
  }

  // Méthodes d'administration
  getAdminStats() {
    const stats = this.getData('admin_stats');
    return stats[0] || {};
  }

  getDrivers() {
    const users = JSON.parse(localStorage.getItem('qwonen_mock_users') || '[]');
    return users.filter((user: any) => user.role === 'driver');
  }
}

const mockDataService = new MockDataService();

class ApiService {
  private getHeaders(token?: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`
    };
  }

  private async mockRequest<T>(operationName: string, operation: () => T, delay: number = 300): Promise<ApiResponse<T>> {
    try {
      // Initialiser les données mock si nécessaire
      mockDataService.initializeMockData();
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const data = operation();
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`Mock API Error [${operationName}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue'
      };
    }
  }

  // ============================================================================
  // COURSES
  // ============================================================================

  async createTrip(tripData: any, token: string) {
    return this.mockRequest('createTrip', () => {
      const trip = mockDataService.create('trips', {
        ...tripData,
        status: 'pending'
      });
      toast.success('Course créée avec succès !');
      return trip;
    });
  }

  async getPendingTrips(token: string) {
    return this.mockRequest('getPendingTrips', () => {
      return mockDataService.getPendingTrips();
    });
  }

  async acceptTrip(tripId: string, token: string) {
    return this.mockRequest('acceptTrip', () => {
      const trip = mockDataService.update('trips', tripId, {
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      });
      if (trip) {
        toast.success('Course acceptée !');
      }
      return trip;
    });
  }

  async completeTrip(tripId: string, rating: number, token: string) {
    return this.mockRequest('completeTrip', () => {
      const trip = mockDataService.update('trips', tripId, {
        status: 'completed',
        rating,
        completedAt: new Date().toISOString()
      });
      if (trip) {
        toast.success('Course terminée avec succès !');
      }
      return trip;
    });
  }

  async getUserTrips(userId: string, token: string) {
    return this.mockRequest('getUserTrips', () => {
      return mockDataService.getUserTrips(userId);
    });
  }

  // ============================================================================
  // PAIEMENTS
  // ============================================================================

  async createPayment(paymentData: any, token: string) {
    return this.mockRequest('createPayment', () => {
      const payment = mockDataService.create('payments', {
        ...paymentData,
        status: 'completed'
      });
      toast.success(`Paiement de ${payment.amount} GNF effectué !`);
      return payment;
    });
  }

  async getUserPayments(userId: string, token: string) {
    return this.mockRequest('getUserPayments', () => {
      return mockDataService.getUserPayments(userId);
    });
  }

  // ============================================================================
  // ADMINISTRATION
  // ============================================================================

  async getAdminStats(token: string) {
    return this.mockRequest('getAdminStats', () => {
      return mockDataService.getAdminStats();
    }, 500);
  }

  async getDrivers(token: string) {
    return this.mockRequest('getDrivers', () => {
      return mockDataService.getDrivers();
    });
  }

  async getAllTrips(token: string) {
    return this.mockRequest('getAllTrips', () => {
      return mockDataService.read('trips');
    });
  }

  // ============================================================================
  // UTILISATEURS
  // ============================================================================

  async getUser(userId: string, token: string) {
    return this.mockRequest('getUser', () => {
      const users = JSON.parse(localStorage.getItem('qwonen_mock_users') || '[]');
      return users.find((user: any) => user.id === userId);
    });
  }

  async updateUser(userId: string, updates: any, token: string) {
    return this.mockRequest('updateUser', () => {
      const users = JSON.parse(localStorage.getItem('qwonen_mock_users') || '[]');
      const userIndex = users.findIndex((user: any) => user.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('qwonen_mock_users', JSON.stringify(users));
        return users[userIndex];
      }
      return null;
    });
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  async getNotifications(userId: string, token: string) {
    return this.mockRequest('getNotifications', () => {
      return mockDataService.read('notifications')
        .filter((notif: any) => notif.userId === userId);
    });
  }

  async createNotification(notificationData: any, token: string) {
    return this.mockRequest('createNotification', () => {
      return mockDataService.create('notifications', notificationData);
    });
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck() {
    return this.mockRequest('healthCheck', () => {
      return { status: 'ok', version: '1.0.0', mode: 'demo' };
    }, 100);
  }
}

export const apiService = new ApiService();
export default apiService;