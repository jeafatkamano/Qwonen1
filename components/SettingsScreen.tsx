import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  Bell, 
  Moon, 
  Globe, 
  MapPin,
  LogOut,
  Star,
  Camera,
  ChevronRight,
  Edit3,
  Award,
  Clock,
  Volume2
} from 'lucide-react';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const userStats = {
    totalTrips: 47,
    averageRating: 4.8,
    totalDistance: '1,250 km',
    memberSince: 'Mars 2024'
  };

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Logique de déconnexion
      console.log('Déconnexion...');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Paramètres
        </h1>
        <p className="text-gray-500">Gérez votre profil et préférences</p>
      </div>

      {/* Section Profil Intégrée */}
      <Card className="border-0 rounded-3xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Mon Profil
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo et informations principales */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-black text-white text-2xl">
                  AD
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Amadou Diallo</h3>
              <p className="text-gray-500">+224 628 12 34 56</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{userStats.averageRating}</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  Vérifié
                </Badge>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{userStats.totalTrips}</div>
              <p className="text-xs text-gray-500">Trajets</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{userStats.totalDistance}</div>
              <p className="text-xs text-gray-500">Distance</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{userStats.averageRating}</div>
              <p className="text-xs text-gray-500">Note moy.</p>
            </div>
          </div>

          {/* Badges et récompenses */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Récompenses
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-xs text-gray-600">Voyageur 5⭐</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Sécurisé</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Ponctuel</p>
              </div>
            </div>
          </div>

          {/* Informations modifiables */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Nom complet</Label>
                <Input defaultValue="Amadou Diallo" className="mt-1 h-12 rounded-2xl" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input defaultValue="amadou.diallo@email.com" className="mt-1 h-12 rounded-2xl" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Téléphone</Label>
                <Input defaultValue="+224 628 12 34 56" className="mt-1 h-12 rounded-2xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-10 rounded-2xl" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button className="flex-1 h-10 rounded-2xl bg-black hover:bg-gray-800" onClick={() => setIsEditing(false)}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">amadou.diallo@email.com</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">+224 628 12 34 56</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Kaloum, Conakry</span>
              </div>
            </div>
          )}

          {/* Membre depuis */}
          <div className="text-center p-4 bg-gradient-to-r from-black to-red-600 rounded-2xl text-white">
            <p className="text-white/80 text-sm">Membre Qwonen depuis</p>
            <p className="font-semibold">{userStats.memberSince}</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Préférences */}
      <Card className="border-0 rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-500">Alertes de courses et messages</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Sons</p>
                <p className="text-sm text-gray-500">Sons de l'application</p>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Mode sombre</p>
                <p className="text-sm text-gray-500">Interface en thème sombre</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Partage de position</p>
                <p className="text-sm text-gray-500">Améliore la précision du service</p>
              </div>
            </div>
            <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
          </div>
        </CardContent>
      </Card>

      {/* Langue et région */}
      <Card className="border-0 rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Langue et région
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="font-medium text-gray-900">Langue</span>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">Français</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="font-medium text-gray-900">Devise</span>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">Franc guinéen (GNF)</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="font-medium text-gray-900">Fuseau horaire</span>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">GMT+0 (Conakry)</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Autres options */}
      <Card className="border-0 rounded-3xl shadow-sm">
        <CardContent className="p-4 space-y-2">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Sécurité et confidentialité</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>

          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Centre d'aide</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>

          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="font-medium text-gray-900">Conditions d'utilisation</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>

          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="font-medium text-gray-900">Politique de confidentialité</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </CardContent>
      </Card>

      {/* À propos */}
      <Card className="border-0 rounded-3xl shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Version de l'application</span>
            <span className="text-gray-500">1.2.3</span>
          </div>
          
          <div className="text-center text-sm text-gray-400 pt-2">
            <p>© 2025 Qwonen - Transport pour la Guinée</p>
            <p className="mt-1">Fait avec ❤️ à Conakry • Sinaiproduction</p>
          </div>
        </CardContent>
      </Card>

      {/* Déconnexion */}
      <Button 
        variant="outline" 
        className="w-full h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Se déconnecter
      </Button>
    </div>
  );
}