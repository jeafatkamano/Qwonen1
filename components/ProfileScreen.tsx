import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  User, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Shield,
  Award,
  Clock
} from 'lucide-react';

export default function ProfileScreen() {
  const userStats = {
    totalTrips: 47,
    rating: 4.8,
    memberSince: 'Mars 2024',
    totalDistance: '1,250 km'
  };

  return (
    <div className="p-4 space-y-4">
      {/* En-tête du profil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-red-600 text-white text-xl">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2>Amadou Diallo</h2>
              <p className="text-muted-foreground">+224 628 12 34 56</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{userStats.rating}</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  Vérifié
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-red-600 mb-1">{userStats.totalTrips}</div>
            <p className="text-sm text-muted-foreground">Trajets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-red-600 mb-1">{userStats.totalDistance}</div>
            <p className="text-sm text-muted-foreground">Distance</p>
          </CardContent>
        </Card>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>amadou.diallo@email.com</span>
            </div>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>+224 628 12 34 56</span>
            </div>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>Kaloum, Conakry</span>
            </div>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges et récompenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Récompenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-xs">Voyageur 5⭐</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs">Sécurisé</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xs">Ponctuel</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membre depuis */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Membre Qwonen depuis</p>
            <p className="text-red-600">{userStats.memberSince}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}