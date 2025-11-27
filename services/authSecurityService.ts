/**
 * Service de gestion de la sécurité d'authentification pour Qwonen
 * Gère la configuration OTP, surveillance sécurité et conformité
 */

export interface OTPConfig {
  expiryTime: number; // en secondes
  maxAttempts: number;
  resendDelay: number; // délai avant pouvoir renvoyer
  type: 'email' | 'sms' | 'phone';
}

export interface SecurityMetrics {
  totalOTPGenerated: number;
  totalOTPExpired: number;
  totalOTPSuccess: number;
  totalOTPFailed: number;
  averageUsageTime: number; // en secondes
  expirationRate: number; // pourcentage
  securityScore: number; // 0-100
}

export interface SecurityEvent {
  id: string;
  type: 'otp_expired' | 'otp_reused' | 'multiple_attempts' | 'suspicious_activity';
  userId?: string;
  timestamp: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuthSecurityService {
  private readonly RECOMMENDED_OTP_EXPIRY = 600; // 10 minutes
  private readonly MAX_OTP_EXPIRY = 3600; // 1 heure
  private readonly MIN_OTP_EXPIRY = 300; // 5 minutes

  private metrics: SecurityMetrics = {
    totalOTPGenerated: 0,
    totalOTPExpired: 0,
    totalOTPSuccess: 0,
    totalOTPFailed: 0,
    averageUsageTime: 0,
    expirationRate: 0,
    securityScore: 85
  };

  private securityEvents: SecurityEvent[] = [];

  /**
   * Valide la configuration OTP selon les standards de sécurité
   */
  validateOTPConfig(config: OTPConfig): { isValid: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Vérification du délai d'expiration
    if (config.expiryTime > this.MAX_OTP_EXPIRY) {
      errors.push(`Délai d'expiration OTP trop long: ${config.expiryTime}s (max: ${this.MAX_OTP_EXPIRY}s)`);
    } else if (config.expiryTime > this.RECOMMENDED_OTP_EXPIRY) {
      warnings.push(`Délai d'expiration OTP supérieur à la recommandation: ${config.expiryTime}s (recommandé: ${this.RECOMMENDED_OTP_EXPIRY}s)`);
    }

    if (config.expiryTime < this.MIN_OTP_EXPIRY) {
      warnings.push(`Délai d'expiration OTP très court: ${config.expiryTime}s (minimum recommandé: ${this.MIN_OTP_EXPIRY}s)`);
    }

    // Vérification des tentatives maximum
    if (config.maxAttempts > 5) {
      warnings.push(`Nombre de tentatives élevé: ${config.maxAttempts} (recommandé: ≤5)`);
    }

    if (config.maxAttempts < 3) {
      warnings.push(`Nombre de tentatives très restrictif: ${config.maxAttempts} (minimum recommandé: 3)`);
    }

    // Vérification du délai de renvoi
    if (config.resendDelay < 60) {
      warnings.push(`Délai de renvoi très court: ${config.resendDelay}s (recommandé: ≥60s)`);
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Génère une configuration OTP sécurisée pour la Guinée
   */
  generateSecureOTPConfig(type: 'standard' | 'mobile_money' | 'high_security'): OTPConfig {
    const configs = {
      standard: {
        expiryTime: 600, // 10 minutes
        maxAttempts: 5,
        resendDelay: 60,
        type: 'email' as const
      },
      mobile_money: {
        expiryTime: 300, // 5 minutes (paiements critiques)
        maxAttempts: 3,
        resendDelay: 90,
        type: 'sms' as const
      },
      high_security: {
        expiryTime: 300, // 5 minutes
        maxAttempts: 3,
        resendDelay: 120,
        type: 'phone' as const
      }
    };

    return configs[type];
  }

  /**
   * Enregistre un événement de sécurité
   */
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `SEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.securityEvents.push(securityEvent);

    // Garder seulement les 1000 derniers événements
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Alerte pour événements critiques
    if (event.severity === 'critical') {
      this.triggerSecurityAlert(securityEvent);
    }

    console.log(`[SECURITY] ${event.type}:`, securityEvent);
  }

  /**
   * Met à jour les métriques de sécurité
   */
  updateMetrics(update: Partial<SecurityMetrics>): void {
    this.metrics = { ...this.metrics, ...update };

    // Recalculer le taux d'expiration
    if (this.metrics.totalOTPGenerated > 0) {
      this.metrics.expirationRate = (this.metrics.totalOTPExpired / this.metrics.totalOTPGenerated) * 100;
    }

    // Recalculer le score de sécurité
    this.metrics.securityScore = this.calculateSecurityScore();
  }

  /**
   * Calcule le score de sécurité global
   */
  private calculateSecurityScore(): number {
    let score = 100;

    // Pénalité pour taux d'expiration élevé
    if (this.metrics.expirationRate > 20) {
      score -= 20;
    } else if (this.metrics.expirationRate > 15) {
      score -= 10;
    }

    // Pénalité pour échecs fréquents
    const failureRate = this.metrics.totalOTPGenerated > 0 
      ? (this.metrics.totalOTPFailed / this.metrics.totalOTPGenerated) * 100 
      : 0;

    if (failureRate > 10) {
      score -= 15;
    } else if (failureRate > 5) {
      score -= 5;
    }

    // Bonus pour utilisation rapide des OTP
    if (this.metrics.averageUsageTime < 120) { // moins de 2 minutes
      score += 5;
    }

    // Pénalité pour événements de sécurité récents
    const recentEvents = this.getRecentSecurityEvents(24); // dernières 24h
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    const highEvents = recentEvents.filter(e => e.severity === 'high').length;

    score -= (criticalEvents * 10) + (highEvents * 5);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Obtient les événements de sécurité récents
   */
  getRecentSecurityEvents(hoursBack: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));
    
    return this.securityEvents.filter(event => 
      new Date(event.timestamp) > cutoff
    );
  }

  /**
   * Génère un rapport de sécurité
   */
  generateSecurityReport(): {
    summary: SecurityMetrics;
    recentEvents: SecurityEvent[];
    recommendations: string[];
    configStatus: 'secure' | 'warning' | 'critical';
  } {
    const recentEvents = this.getRecentSecurityEvents(24);
    const recommendations: string[] = [];
    let configStatus: 'secure' | 'warning' | 'critical' = 'secure';

    // Analyse et recommandations
    if (this.metrics.expirationRate > 20) {
      recommendations.push('Taux d\'expiration OTP élevé - vérifier la durée de validité');
      configStatus = 'warning';
    }

    if (this.metrics.securityScore < 70) {
      recommendations.push('Score de sécurité faible - réviser la configuration d\'authentification');
      configStatus = 'critical';
    }

    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    if (criticalEvents > 0) {
      recommendations.push(`${criticalEvents} événement(s) critique(s) détecté(s) - investigation requise`);
      configStatus = 'critical';
    }

    if (this.metrics.averageUsageTime > 480) { // plus de 8 minutes
      recommendations.push('Temps d\'utilisation OTP long - considérer réduire la durée d\'expiration');
    }

    if (recommendations.length === 0) {
      recommendations.push('Configuration de sécurité optimale');
    }

    return {
      summary: this.metrics,
      recentEvents,
      recommendations,
      configStatus
    };
  }

  /**
   * Déclenche une alerte de sécurité
   */
  private triggerSecurityAlert(event: SecurityEvent): void {
    // En production, ceci enverrait des notifications aux administrateurs
    console.warn(`���� ALERTE SÉCURITÉ CRITIQUE:`, {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      details: event.details,
      timestamp: event.timestamp
    });

    // Simulation d'envoi d'alerte (à remplacer par vraie intégration)
    if (typeof window !== 'undefined') {
      // Notification dans le navigateur pour la démo
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Qwonen - Alerte Sécurité', {
            body: `Événement critique détecté: ${event.type}`,
            icon: '/icon-192.png'
          });
        }
      }, 1000);
    }
  }

  /**
   * Valide la configuration Supabase actuelle
   */
  async validateSupabaseConfig(): Promise<{
    isCompliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Simulation de vérification de la configuration Supabase
      // En production, ceci ferait des appels API réels

      // Vérification OTP expiration
      const currentOTPExpiry = 3900; // Valeur détectée (65 minutes)
      
      if (currentOTPExpiry > this.MAX_OTP_EXPIRY) {
        issues.push(`Configuration OTP non sécurisée: ${currentOTPExpiry}s (max recommandé: ${this.MAX_OTP_EXPIRY}s)`);
        recommendations.push(`Modifier la configuration Supabase Auth pour réduire l'expiration OTP à ${this.RECOMMENDED_OTP_EXPIRY}s`);
      }

      // Vérification session timeout
      const sessionTimeout = 86400; // 24 heures
      if (sessionTimeout > 43200) { // plus de 12 heures
        recommendations.push('Session timeout long - considérer réduire pour améliorer la sécurité');
      }

      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: issues.length > 0 ? 'high' : 'low',
        details: {
          issues: issues.length,
          otpExpiry: currentOTPExpiry,
          sessionTimeout
        }
      });

      return {
        isCompliant: issues.length === 0,
        issues,
        recommendations
      };

    } catch (error) {
      console.error('Erreur validation config Supabase:', error);
      
      return {
        isCompliant: false,
        issues: ['Impossible de vérifier la configuration Supabase'],
        recommendations: ['Vérifier la connectivité et les permissions API']
      };
    }
  }

  /**
   * Obtient les métriques actuelles
   */
  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  /**
   * Réinitialise les métriques
   */
  resetMetrics(): void {
    this.metrics = {
      totalOTPGenerated: 0,
      totalOTPExpired: 0,
      totalOTPSuccess: 0,
      totalOTPFailed: 0,
      averageUsageTime: 0,
      expirationRate: 0,
      securityScore: 85
    };

    this.securityEvents = [];
  }

  /**
   * Simule des métriques pour la démo
   */
  simulateMetrics(): void {
    this.updateMetrics({
      totalOTPGenerated: 1247,
      totalOTPExpired: 89,
      totalOTPSuccess: 1098,
      totalOTPFailed: 60,
      averageUsageTime: 245 // ~4 minutes
    });

    // Simuler quelques événements de sécurité
    this.logSecurityEvent({
      type: 'otp_expired',
      severity: 'low',
      details: { reason: 'timeout', duration: 605 }
    });

    this.logSecurityEvent({
      type: 'multiple_attempts',
      severity: 'medium',
      userId: 'user_123',
      details: { attempts: 4, timespan: 300 }
    });
  }
}

// Instance singleton
export const authSecurityService = new AuthSecurityService();

// Initialiser avec des données de démo
authSecurityService.simulateMetrics();

export default authSecurityService;