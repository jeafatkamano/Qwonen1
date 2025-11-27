import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Key,
  Phone,
  Mail,
  Lock,
  Timer,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AuthSecurityConfig {
  otpExpirationTime: number; // en minutes
  sessionTimeout: number; // en heures
  maxLoginAttempts: number;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  enableMFA: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  lockoutDuration: number; // en minutes
}

interface SecurityMetrics {
  totalOTPsSent: number;
  expiredOTPs: number;
  successfulLogins: number;
  failedAttempts: number;
  averageSessionDuration: string;
  securityLevel: 'low' | 'medium' | 'high';
}

export default function AuthSecurityManager() {
  const [config, setConfig] = useState<AuthSecurityConfig>({
    otpExpirationTime: 10, // 10 minutes (recommandé)
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    enableMFA: false,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    lockoutDuration: 15
  });

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalOTPsSent: 1247,
    expiredOTPs: 89,
    successfulLogins: 3421,
    failedAttempts: 156,
    averageSessionDuration: '2h 15m',
    securityLevel: 'high'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Vérifier la configuration actuelle
  useEffect(() => {
    checkCurrentConfig();
  }, []);

  const checkCurrentConfig = async () => {
    try {
      // Simulation de vérification de la configuration Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Détecter si l'OTP est configuré à plus d'une heure
      const currentOTPExpiration = 65; // 65 minutes (détecté)
      
      if (currentOTPExpiration > 60) {
        toast.error('Configuration OTP non sécurisée détectée', {
          description: `Délai d'expiration OTP: ${currentOTPExpiration} minutes (&gt; 60 min)`
        });
      }
    } catch (error) {
      console.error('Erreur vérification config:', error);
    }
  };

  const updateConfig = (key: keyof AuthSecurityConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      // Validation de sécurité
      if (config.otpExpirationTime > 60) {
        toast.error('Erreur de configuration', {
          description: 'Le délai d\'expiration OTP doit être inférieur à 60 minutes'
        });
        return;
      }

      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour les métriques de sécurité
      const newSecurityLevel = calculateSecurityLevel(config);
      setMetrics(prev => ({ ...prev, securityLevel: newSecurityLevel }));
      
      setHasUnsavedChanges(false);
      toast.success('Configuration de sécurité mise à jour', {
        description: 'Les paramètres d\'authentification ont été appliqués'
      });
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error('Erreur sauvegarde config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSecurityLevel = (config: AuthSecurityConfig): 'low' | 'medium' | 'high' => {
    let score = 0;
    
    // OTP expiration (30% du score)
    if (config.otpExpirationTime <= 10) score += 30;
    else if (config.otpExpirationTime <= 30) score += 20;
    else if (config.otpExpirationTime <= 60) score += 10;
    
    // Autres critères de sécurité
    if (config.requireEmailVerification) score += 15;
    if (config.requirePhoneVerification) score += 10;
    if (config.enableMFA) score += 20;
    if (config.passwordMinLength >= 8) score += 10;
    if (config.passwordRequireSpecialChars) score += 10;
    if (config.maxLoginAttempts <= 5) score += 5;
    
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const resetToSecureDefaults = () => {
    setConfig({
      otpExpirationTime: 10,
      sessionTimeout: 4,
      maxLoginAttempts: 3,
      requireEmailVerification: true,
      requirePhoneVerification: true,
      enableMFA: true,
      passwordMinLength: 12,
      passwordRequireSpecialChars: true,
      lockoutDuration: 30
    });
    setHasUnsavedChanges(true);
    toast.info('Configuration sécurisée appliquée', {
      description: 'Paramètres de sécurité renforcés activés'
    });
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-red-500" />
            Gestionnaire de Sécurité d'Authentification
          </h1>
          <p className="text-gray-600">
            Configuration et monitoring de la sécurité pour l'application Qwonen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getSecurityLevelColor(metrics.securityLevel)}>
            Niveau: {metrics.securityLevel.toUpperCase()}
          </Badge>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-orange-50 text-orange-600">
              Modifications non sauvegardées
            </Badge>
          )}
        </div>
      </div>

      {/* Alerte de sécurité OTP */}
      {config.otpExpirationTime > 60 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>Problème de sécurité détecté:</strong> Le délai d'expiration OTP est configuré à {config.otpExpirationTime} minutes. 
            Pour des raisons de sécurité, il doit être inférieur à 60 minutes (recommandé: 10 minutes).
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métriques de sécurité */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Métriques de Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">OTP envoyés</p>
                  <p className="font-medium">{metrics.totalOTPsSent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">OTP expirés</p>
                  <p className="font-medium text-orange-600">{metrics.expiredOTPs}</p>
                </div>
                <div>
                  <p className="text-gray-600">Connexions réussies</p>
                  <p className="font-medium text-green-600">{metrics.successfulLogins.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tentatives échouées</p>
                  <p className="font-medium text-red-600">{metrics.failedAttempts}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-gray-600 text-sm">Durée session moyenne</p>
                <p className="font-medium">{metrics.averageSessionDuration}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration de Sécurité
              </CardTitle>
              <CardDescription>
                Ajustez les paramètres d'authentification pour optimiser la sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OTP Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-red-500" />
                  <h3 className="font-medium">Configuration OTP</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="otpExpiration" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Expiration OTP (minutes)
                    </Label>
                    <Input
                      id="otpExpiration"
                      type="number"
                      min="1"
                      max="60"
                      value={config.otpExpirationTime}
                      onChange={(e) => updateConfig('otpExpirationTime', parseInt(e.target.value))}
                      className={config.otpExpirationTime > 60 ? 'border-red-500' : ''}
                    />
                    {config.otpExpirationTime > 60 && (
                      <p className="text-xs text-red-500 mt-1">
                        Doit être &le; 60 minutes pour la sécurité
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="sessionTimeout">Expiration session (heures)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="168"
                      value={config.sessionTimeout}
                      onChange={(e) => updateConfig('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sécurité des mots de passe */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-red-500" />
                  <h3 className="font-medium">Sécurité des mots de passe</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passwordLength">Longueur minimale</Label>
                    <Input
                      id="passwordLength"
                      type="number"
                      min="6"
                      max="32"
                      value={config.passwordMinLength}
                      onChange={(e) => updateConfig('passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxAttempts">Tentatives max</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={config.maxLoginAttempts}
                      onChange={(e) => updateConfig('maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="specialChars" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Caractères spéciaux requis
                  </Label>
                  <Switch
                    id="specialChars"
                    checked={config.passwordRequireSpecialChars}
                    onCheckedChange={(checked) => updateConfig('passwordRequireSpecialChars', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Vérifications */}
              <div className="space-y-4">
                <h3 className="font-medium">Vérifications d'identité</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailVerif" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Vérification email obligatoire
                    </Label>
                    <Switch
                      id="emailVerif"
                      checked={config.requireEmailVerification}
                      onCheckedChange={(checked) => updateConfig('requireEmailVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="phoneVerif" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Vérification téléphone obligatoire
                    </Label>
                    <Switch
                      id="phoneVerif"
                      checked={config.requirePhoneVerification}
                      onCheckedChange={(checked) => updateConfig('requirePhoneVerification', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="mfa" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Authentification multi-facteurs (MFA)
                    </Label>
                    <Switch
                      id="mfa"
                      checked={config.enableMFA}
                      onCheckedChange={(checked) => updateConfig('enableMFA', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={resetToSecureDefaults}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Configuration sécurisée
          </Button>
          <Button
            variant="outline"
            onClick={checkCurrentConfig}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Vérifier la config
          </Button>
        </div>

        <Button
          onClick={saveConfiguration}
          disabled={!hasUnsavedChanges || isLoading}
          className="qwonen-button-primary flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      {/* Guide de résolution */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="w-5 h-5" />
            Guide de résolution - Configuration OTP Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p><strong>Problème détecté:</strong> Délai d'expiration OTP &gt; 1 heure</p>
          <p><strong>Solution:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
            <li>Accédez à votre tableau de bord Supabase</li>
            <li>Allez dans Authentication → Settings</li>
            <li>Dans "Auth Configuration", modifiez "OTP expiry" à 600 seconds (10 minutes)</li>
            <li>Sauvegardez les modifications</li>
            <li>Testez avec un nouveau code OTP</li>
          </ol>
          <p className="text-xs mt-3">
            <strong>Recommandation Qwonen:</strong> 10 minutes pour optimiser sécurité et expérience utilisateur
          </p>
        </CardContent>
      </Card>
    </div>
  );
}