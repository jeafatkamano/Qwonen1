import { useState, useEffect, useCallback, FC } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Phone, UserCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useSocialAuth } from '../services/socialAuth';
import QwonenLogo from './QwonenLogo';

// Configuration des rôles
const roleConfig = {
  client: {
    title: 'Passager',
    description: 'Réservez votre taxi-moto',
  },
  driver: {
    title: 'Conducteur', 
    description: 'Rejoignez notre équipe',
  },
  admin: {
    title: 'Administrateur',
    description: 'Gestion de la plateforme',
  }
};

// Interfaces pour les props des nouveaux composants
interface SocialAuthButtonsProps {
  handleSocialAuth: (provider: 'google' | 'apple') => void;
  socialLoading: 'google' | 'apple' | null;
}

interface PhoneStepProps extends SocialAuthButtonsProps {
    formData: { phone: string };
    handleInputChange: (field: string, value: string) => void;
    handlePhoneSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    isPhoneEmailValid: () => boolean;
    selectedRole: UserRole;
    setSelectedRole: (role: UserRole) => void;
    toggleMode: () => void;
    isLogin: boolean;
}

interface DetailsStepProps {
    isLogin: boolean;
    formData: any;
    handleInputChange: (field: string, value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    selectedRole: UserRole;
    setSelectedRole: (role: UserRole) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    handleBack: () => void;
}

// Composant pour les boutons d'authentification sociale
const SocialAuthButtons: FC<SocialAuthButtonsProps> = ({ handleSocialAuth, socialLoading }) => (
    <div className="space-y-3">
        <Button
            type="button"
            onClick={() => handleSocialAuth('google')}
            disabled={socialLoading !== null}
            className="w-full h-14 rounded-xl text-base flex items-center justify-center gap-3 bg-white border border-gray-300 text-black hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {socialLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1.0 10.22 1.0 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            )}
            <span className={socialLoading === 'google' ? 'opacity-70' : ''}>
                {socialLoading === 'google' ? 'Connexion...' : 'Continuer avec Google'}
            </span>
        </Button>

        <Button
            type="button"
            onClick={() => handleSocialAuth('apple')}
            disabled={socialLoading !== null}
            className="w-full h-14 rounded-xl text-base flex items-center justify-center gap-3 bg-white border border-gray-300 text-black hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {socialLoading === 'apple' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
            )}
            <span className={socialLoading === 'apple' ? 'opacity-70' : ''}>
                {socialLoading === 'apple' ? 'Connexion...' : 'Continuer avec Apple'}
            </span>
        </Button>
    </div>
);

// Composant pour la première étape (téléphone/email)
const PhoneStep: FC<PhoneStepProps> = ({
    formData,
    handleInputChange,
    handlePhoneSubmit,
    isLoading,
    isPhoneEmailValid,
    handleSocialAuth,
    socialLoading,
    selectedRole,
    setSelectedRole,
    toggleMode,
    isLogin,
}) => (
    <div className="space-y-6">
        <h2 className="text-lg text-center text-gray-700 mb-8">
            Se connecter ou s'inscrire
        </h2>

        <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="relative">
                <Input
                    type="text"
                    placeholder="Numéro de téléphone ou email"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="qwonen-input w-full h-14 px-4 pr-12 rounded-xl text-base"
                    required
                    disabled={isLoading}
                    autoComplete="tel email"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {formData.phone.includes('@') ? (
                        <Mail className="w-4 h-4 text-gray-400" />
                    ) : (
                        <Phone className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </div>

            {formData.phone.trim() && (
                <div className="text-xs px-2">
                    {isPhoneEmailValid() ? (
                        <span className="text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {formData.phone.includes('@') ? 'Email valide' : 'Numéro valide'}
                        </span>
                    ) : (
                        <span className="text-red-500 flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            {formData.phone.includes('@') ? 'Email invalide' : 'Numéro invalide'}
                        </span>
                    )}
                </div>
            )}

            <Button
                type="submit"
                disabled={isLoading || !isPhoneEmailValid()}
                className="qwonen-button-primary w-full h-14 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Vérification...
                    </div>
                ) : (
                    'Continuez'
                )}
            </Button>
        </form>

        <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Format accepté:</p>
            <p>Email: exemple@domain.com</p>
            <p>Téléphone: +224 123 456 789</p>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-100 text-gray-500">OU</span>
            </div>
        </div>

        <SocialAuthButtons handleSocialAuth={handleSocialAuth} socialLoading={socialLoading} />

        {socialLoading && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fade-in">
                <h4 className="text-sm font-medium text-blue-900 text-center">
                    Sélectionnez votre profil
                </h4>
                <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(roleConfig) as UserRole[]).map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            disabled={socialLoading !== null}
                            className={`p-2 border rounded-lg text-left transition-all text-sm disabled:opacity-50 ${
                                selectedRole === role
                                    ? 'border-blue-500 bg-blue-100'
                                    : 'border-blue-300 hover:border-blue-400 bg-white'
                            }`}
                        >
                            <div className="font-medium text-blue-900">{roleConfig[role].title}</div>
                            <div className="text-xs text-blue-600">{roleConfig[role].description}</div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div className="text-center mt-6">
            <button
                onClick={toggleMode}
                disabled={socialLoading !== null}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
                {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
        </div>
    </div>
);

// Composant pour la deuxième étape (détails)
const DetailsStep: FC<DetailsStepProps> = ({
    isLogin,
    formData,
    handleInputChange,
    handleSubmit,
    isLoading,
    selectedRole,
    setSelectedRole,
    showPassword,
    setShowPassword,
    handleBack,
}) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
            <button
                onClick={handleBack}
                disabled={isLoading}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Retour</span>
            </button>
            <h2 className="text-lg font-medium text-gray-900">
                {isLogin ? 'Connexion' : 'Inscription'}
            </h2>
            <div className="w-16"></div> {/* Spacer */}
        </div>

        {!isLogin && (
            <div className="space-y-4">
                <h3 className="text-center text-gray-700 mb-4">Je suis un(e)</h3>
                <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(roleConfig) as UserRole[]).map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            disabled={isLoading}
                            className={`p-3 border rounded-xl text-left transition-all qwonen-focus disabled:opacity-50 ${
                                selectedRole === role
                                    ? 'border-black bg-gray-50 qwonen-shadow'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <div className="font-medium text-gray-900">{roleConfig[role].title}</div>
                            <div className="text-sm text-gray-500">{roleConfig[role].description}</div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Nom complet"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="qwonen-input pl-10 h-14 rounded-xl"
                        required={!isLogin}
                        disabled={isLoading}
                        autoComplete="name"
                    />
                </div>
            )}

            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="qwonen-input pl-10 h-14 rounded-xl"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                />
            </div>

            <div className="relative">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="qwonen-input h-14 rounded-xl pr-12"
                    required
                    disabled={isLoading}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 qwonen-focus disabled:opacity-50"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="qwonen-button-primary w-full h-14 rounded-xl disabled:opacity-50"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isLogin ? 'Connexion...' : 'Inscription...'}
                    </div>
                ) : isLogin ? 'Se connecter' : 'S\'inscrire'}
            </Button>
        </form>
    </div>
);

// Composant principal de l'écran d'authentification
export default function AuthScreen() {
  // Gère l'état entre le mode connexion et inscription
  const [isLogin, setIsLogin] = useState(true);
  // Rôle sélectionné par l'utilisateur (client, conducteur, admin)
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  // Gère la visibilité du mot de passe
  const [showPassword, setShowPassword] = useState(false);
  // Indique si une opération d'authentification est en cours
  const [isLoading, setIsLoading] = useState(false);
  // Indique si une authentification sociale (Google, Apple) est en cours
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  // Gère l'étape actuelle du formulaire (saisie du téléphone/email ou détails complets)
  const [currentStep, setCurrentStep] = useState<'phone' | 'details'>('phone');
  // Données du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  // Hooks pour les fonctions de connexion/inscription et l'authentification sociale
  const { login, register } = useAuth();
  const { initializeSocialAuth, signInWithGoogle, signInWithApple, convertToQwonenUser } = useSocialAuth();

  // Effet pour initialiser les services d'authentification sociale au chargement du composant
  useEffect(() => {
    initializeSocialAuth().catch((error) => {
      console.warn('Erreur lors de l\'initialisation de l\'auth sociale:', error);
    });
  }, [initializeSocialAuth]);

  // Valide une adresse email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valide un numéro de téléphone (format guinéen ou international simple)
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+224|224)?[6-9]\d{7,8}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone) || cleanPhone.length >= 8;
  };

  // Vérifie si l'entrée (téléphone ou email) est valide
  const isPhoneEmailValid = useCallback(() => {
    const input = formData.phone.trim();
    if (!input) return false;
    
    return input.includes('@') ? validateEmail(input) : validatePhone(input);
  }, [formData.phone]);

  // Gère la soumission de la première étape (téléphone/email)
  const handlePhoneSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (isLogin) {
      setCurrentStep('details');
      return;
    }

    const input = formData.phone.trim();
    if (!input) {
      toast.error('Veuillez entrer votre numéro de téléphone ou email');
      return;
    }

    if (input.includes('@')) {
      if (!validateEmail(input)) {
        toast.error('Veuillez entrer une adresse email valide');
        return;
      }
      setFormData(prev => ({ ...prev, email: input, phone: '' }));
    } else if (!validatePhone(input)) {
      toast.error('Veuillez entrer un numéro de téléphone valide (ex: +224 123 456 789)');
      return;
    }
    
    setCurrentStep('details');
  }, [formData.phone, isLogin, isLoading]);

  // Gère la soumission du formulaire de connexion ou d'inscription
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        // Logique de connexion
        if (!formData.email || !formData.password) {
          toast.error('Veuillez remplir tous les champs');
          return;
        }
        if (!validateEmail(formData.email)) {
          toast.error('Veuillez entrer une adresse email valide');
          return;
        }
        const success = await login(formData.email, formData.password);
        if (success) {
          toast.success('Connexion réussie ! Bienvenue sur Qwonen');
        } else {
          toast.error('Email ou mot de passe incorrect');
        }
      } else {
        // Logique d'inscription
        if (!formData.name || !formData.email || !formData.password) {
          toast.error('Veuillez remplir tous les champs');
          return;
        }
        if (!validateEmail(formData.email)) {
          toast.error('Veuillez entrer une adresse email valide');
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
        const success = await register({ ...formData, role: selectedRole });
        if (success) {
          toast.success('Inscription réussie ! Bienvenue sur Qwonen');
        } else {
          toast.error('Cet email est déjà utilisé');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [isLogin, formData, selectedRole, login, register, isLoading]);

  // Gère les changements dans les champs de saisie
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Gère l'authentification via les réseaux sociaux (Google, Apple)
  const handleSocialAuth = useCallback(async (provider: 'google' | 'apple') => {
    if (socialLoading) return;
    setSocialLoading(provider);
    try {
      const signIn = provider === 'google' ? signInWithGoogle : signInWithApple;
      const socialUser = await signIn();
      const qwonenUser = convertToQwonenUser(socialUser, selectedRole);

      const success = await register(qwonenUser);
      if (success) {
        toast.success(`Connexion ${provider} réussie ! Bienvenue sur Qwonen`);
      } else {
        const loginSuccess = await login(qwonenUser.email, qwonenUser.password);
        if (loginSuccess) {
          toast.success(`Connexion ${provider} réussie ! Bon retour sur Qwonen`);
        } else {
          toast.error(`Erreur lors de la connexion avec ${provider}`);
        }
      }
    } catch (error) {
      toast.error(`Erreur lors de l'authentification ${provider}`);
      console.error(`${provider} auth error:`, error);
    } finally {
      setSocialLoading(null);
    }
  }, [socialLoading, signInWithGoogle, signInWithApple, convertToQwonenUser, selectedRole, register, login]);

  // Gère le retour à l'étape précédente
  const handleBack = useCallback(() => {
    setCurrentStep('phone');
    setFormData(prev => ({ ...prev, email: '', password: '', name: '' }));
  }, []);

  // Remplit les champs avec des données de test pour la démo
  const fillDemoCredentials = useCallback((role: UserRole) => {
    const credentials = {
      client: { email: 'client@qwonen.gn', password: 'client123' },
      driver: { email: 'driver@qwonen.gn', password: 'driver123' },
      admin: { email: 'admin@qwonen.gn', password: 'admin123' }
    };
    
    setFormData(prev => ({
      ...prev,
      ...credentials[role],
      phone: '+224 123 456 789',
      name: `${roleConfig[role].title} Test`
    }));
    setSelectedRole(role);
    setCurrentStep('details');
    setIsLogin(true);
    toast.info(`Données de test ${roleConfig[role].title} chargées`);
  }, []);

  // Bascule entre le mode connexion et inscription
  const toggleMode = useCallback(() => {
    setIsLogin(!isLogin);
    setCurrentStep('phone');
    setFormData({ email: '', password: '', name: '', phone: '' });
    setShowPassword(false);
  }, [isLogin]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo et titre */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <QwonenLogo size="md" />
          </div>
        </div>

        {/* Contenu principal avec animation */}
        <div className="animate-slide-up">
          {currentStep === 'phone' ? (
            <PhoneStep
              formData={formData}
              handleInputChange={handleInputChange}
              handlePhoneSubmit={handlePhoneSubmit}
              isLoading={isLoading}
              isPhoneEmailValid={isPhoneEmailValid}
              handleSocialAuth={handleSocialAuth}
              socialLoading={socialLoading}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              toggleMode={toggleMode}
              isLogin={isLogin}
            />
          ) : (
            <DetailsStep
              isLogin={isLogin}
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleBack={handleBack}
            />
          )}
        </div>

        {/* Comptes de test - toujours visibles */}
        <div className="mt-8 p-4 qwonen-card rounded-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h4 className="text-sm font-medium text-gray-700">Mode Démo - Comptes de test</h4>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Cette application fonctionne avec des données simulées pour la démonstration.
          </p>
          <div className="space-y-2">
            {(Object.keys(roleConfig) as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => fillDemoCredentials(role)}
                disabled={isLoading || socialLoading !== null}
                className="qwonen-focus w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <div className="text-left">
                  <span className="text-sm text-gray-700 block">{roleConfig[role].title}</span>
                  <span className="text-xs text-gray-500">{role}@qwonen.gn</span>
                </div>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Tester</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p>© 2024 Qwonen - Sinaiproduction</p>
          <p>Transport sûr et fiable en Guinée</p>
        </div>
      </div>
    </div>
  );
}