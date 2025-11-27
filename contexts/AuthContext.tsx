import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type UserRole = 'client' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  rating?: number;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  checkAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Données utilisateurs de démonstration
const demoUsers: User[] = [
  {
    id: '1',
    name: 'Client Test',
    email: 'client@qwonen.gn',
    phone: '+224 123 456 789',
    role: 'client',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01',
    rating: 4.5,
    isVerified: true
  },
  {
    id: '2',
    name: 'Conducteur Test',
    email: 'driver@qwonen.gn',
    phone: '+224 987 654 321',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01',
    rating: 4.8,
    isVerified: true
  },
  {
    id: '3',
    name: 'Admin Test',
    email: 'admin@qwonen.gn',
    phone: '+224 555 123 456',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01',
    rating: 5.0,
    isVerified: true
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  USER: 'qwonen_user',
  TOKEN: 'qwonen_token',
  USERS_DB: 'qwonen_users_db'
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser la base de données locale des utilisateurs
  const initializeUsersDB = useCallback(() => {
    try {
      const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (!existingUsers) {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(demoUsers));
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la DB utilisateurs:', error);
    }
  }, []);

  // Obtenir tous les utilisateurs
  const getUsers = useCallback((): User[] => {
    try {
      const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      return usersJson ? JSON.parse(usersJson) : demoUsers;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return demoUsers;
    }
  }, []);

  // Sauvegarder les utilisateurs
  const saveUsers = useCallback((users: User[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
    }
  }, []);

  // Générer un ID unique
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Générer un token simple pour la démo
  const generateToken = useCallback((userId: string) => {
    return btoa(`${userId}_${Date.now()}`);
  }, []);

  // Valider le token
  const validateToken = useCallback((token: string): string | null => {
    try {
      const decoded = atob(token);
      const [userId, timestamp] = decoded.split('_');
      
      // Vérifier que le token n'est pas trop ancien (24h)
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      
      if (now - tokenTime > maxAge) {
        return null;
      }
      
      return userId;
    } catch (error) {
      return null;
    }
  }, []);

  // Connexion
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        return false;
      }

      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));

      const users = getUsers();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        return false;
      }

      // Pour la démo, on accepte les mots de passe prédéfinis
      const validPasswords: Record<UserRole, string> = {
        client: 'client123',
        driver: 'driver123',
        admin: 'admin123'
      };

      if (password !== validPasswords[foundUser.role]) {
        return false;
      }

      const token = generateToken(foundUser.id);
      
      // Sauvegarder en localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(foundUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      setUser(foundUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  }, [getUsers, generateToken]);

  // Inscription
  const register = useCallback(async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<boolean> => {
    try {
      if (!userData.name || !userData.email || !userData.password) {
        return false;
      }

      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = getUsers();
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        return false;
      }

      // Créer un nouvel utilisateur
      const newUser: User = {
        id: generateId(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        createdAt: new Date().toISOString(),
        rating: userData.role === 'driver' ? 5.0 : 4.5,
        isVerified: false
      };

      // Ajouter à la base de données locale
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);

      const token = generateToken(newUser.id);
      
      // Sauvegarder en localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  }, [getUsers, generateId, generateToken, saveUsers]);

  // Déconnexion
  const logout = useCallback(() => {
    try {
      // Supprimer du localStorage
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }, []);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;

      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));

      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) return false;

      // Mettre à jour l'utilisateur
      const updatedUser = { ...user, ...userData };
      users[userIndex] = updatedUser;
      
      saveUsers(users);
      
      // Sauvegarder en localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  }, [user, getUsers, saveUsers]);

  // Vérifier l'état d'authentification
  const checkAuthState = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        const userId = validateToken(storedToken);
        
        if (userId && userId === userData.id) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token invalide, nettoyer le localStorage
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'état d\'auth:', error);
      // En cas d'erreur, on nettoie le localStorage
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    } finally {
      setIsInitialized(true);
    }
  }, [validateToken]);

  // Initialisation
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        // Initialiser la DB des utilisateurs
        initializeUsersDB();
        
        // Petit délai pour simuler le chargement
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isMounted) {
          checkAuthState();
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [initializeUsersDB, checkAuthState]);

  // Écouter les changements de localStorage (connexion depuis un autre onglet)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER || e.key === STORAGE_KEYS.TOKEN) {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuthState]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};