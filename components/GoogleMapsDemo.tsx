import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2, MapPin, Wifi } from 'lucide-react';
import { useGoogleMaps } from '../services/googleMapsLoader';

export default function GoogleMapsDemo() {
  const { isLoaded, isLoading, error, loadMaps, googleMaps } = useGoogleMaps();
  const [demoInfo, setDemoInfo] = useState<{
    loading: boolean;
    performance: string;
    features: string[];
  }>({
    loading: false,
    performance: '',
    features: []
  });

  useEffect(() => {
    if (isLoaded && googleMaps) {
      setDemoInfo({
        loading: false,
        performance: 'Optimisé avec loading=async',
        features: [
          'Chargement asynchrone optimisé',
          'Gestion d\'erreurs robuste',
          'Fallback automatique',
          'Support hors ligne',
          'Performance améliorée'
        ]
      });
    }
  }, [isLoaded, googleMaps]);

  const handleTestLoad = () => {
    setDemoInfo(prev => ({ ...prev, loading: true }));
    loadMaps();
  };

  const getStatusIcon = () => {
    if (isLoading || demoInfo.loading) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    if (error) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (isLoaded) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <MapPin className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isLoading || demoInfo.loading) {
      return 'Chargement en cours...';
    }
    if (error) {
      return 'Erreur de chargement';
    }
    if (isLoaded) {
      return 'Google Maps chargé avec succès';
    }
    return 'Google Maps non chargé';
  };

  const getStatusBadge = () => {
    if (isLoading || demoInfo.loading) {
      return <Badge variant="secondary">Chargement...</Badge>;
    }
    if (error) {
      return <Badge variant="destructive">Erreur</Badge>;
    }
    if (isLoaded) {
      return <Badge className="bg-green-100 text-green-800">Chargé</Badge>;
    }
    return <Badge variant="outline">Non chargé</Badge>;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Google Maps - Statut
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Informations de performance */}
        {demoInfo.performance && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✅ {demoInfo.performance}
            </p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-700 font-medium">Erreur:</p>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        {/* Fonctionnalités */}
        {demoInfo.features.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Optimisations actives:</h4>
            <ul className="space-y-1">
              {demoInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bouton de test */}
        {!isLoaded && !isLoading && (
          <Button
            onClick={handleTestLoad}
            disabled={isLoading || demoInfo.loading}
            className="w-full"
          >
            {isLoading || demoInfo.loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Tester le chargement
              </>
            )}
          </Button>
        )}

        {/* Informations techniques */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p><strong>Méthode:</strong> Chargement asynchrone avec loading=async</p>
          <p><strong>Librairies:</strong> places, geometry</p>
          <p><strong>Région:</strong> Guinée (GN)</p>
          <p><strong>Langue:</strong> Français</p>
        </div>
      </CardContent>
    </Card>
  );
}