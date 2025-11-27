import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function ThemeTestComponent() {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Test du Système de Thème
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* État actuel du thème */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-3">État Actuel</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Thème sélectionné:</span>
              <div className="flex items-center gap-2 mt-1">
                {theme === 'light' && <Sun className="w-4 h-4" />}
                {theme === 'dark' && <Moon className="w-4 h-4" />}
                {theme === 'system' && <Monitor className="w-4 h-4" />}
                <Badge variant="secondary">{theme}</Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Thème effectif:</span>
              <div className="flex items-center gap-2 mt-1">
                {effectiveTheme === 'light' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <Badge variant={effectiveTheme === 'dark' ? 'default' : 'outline'}>
                  {effectiveTheme}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles de thème */}
        <div className="space-y-4">
          <h3 className="font-medium">Contrôles de Thème</h3>
          
          {/* Boutons de sélection */}
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="w-4 h-4" />
              Clair
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="w-4 h-4" />
              Sombre
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Système
            </Button>
          </div>

          {/* Toggle component */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span>Composant ThemeToggle:</span>
            <ThemeToggle variant="dropdown" />
          </div>
        </div>

        {/* Test des composants UI */}
        <div className="space-y-4">
          <h3 className="font-medium">Test des Composants UI</h3>
          
          {/* Cartes et couleurs */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-medium mb-2">Carte Normale</h4>
              <p className="text-sm text-muted-foreground">
                Texte avec couleur mutée dans une carte standard.
              </p>
            </Card>
            
            <div className="p-4 bg-accent text-accent-foreground rounded-lg">
              <h4 className="font-medium mb-2">Accent</h4>
              <p className="text-sm opacity-90">
                Zone avec couleur d'accent Qwonen.
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="default">Primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="outline">Contour</Button>
            <Button variant="ghost">Fantôme</Button>
            <Button variant="destructive">Destructeur</Button>
          </div>

          {/* Switch */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span>Switch de test:</span>
            <Switch />
          </div>
        </div>

        {/* Test Dialog avec accessibilité */}
        <div className="space-y-4">
          <h3 className="font-medium">Test Dialog Accessibilité</h3>
          
          <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Ouvrir Dialog Test</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog de Test</DialogTitle>
                <DialogDescription>
                  Ce dialog teste l'accessibilité et l'adaptation au thème sombre/clair.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ce dialog devrait s'adapter automatiquement au thème sélectionné
                  et ne plus générer d'erreurs d'accessibilité.
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge>Thème actuel: {effectiveTheme}</Badge>
                  {effectiveTheme === 'dark' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                    Fermer
                  </Button>
                  <Button onClick={() => setTestDialogOpen(false)}>
                    Confirmer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Variables CSS actuelles */}
        <div className="space-y-2">
          <h3 className="font-medium">Variables CSS (Debug)</h3>
          <div className="text-xs font-mono space-y-1 p-3 bg-muted rounded">
            <div>--background: <span className="inline-block w-4 h-4 rounded" style={{backgroundColor: 'hsl(var(--background))'}}></span></div>
            <div>--foreground: <span className="inline-block w-4 h-4 rounded border" style={{backgroundColor: 'hsl(var(--foreground))'}}></span></div>
            <div>--primary: <span className="inline-block w-4 h-4 rounded" style={{backgroundColor: 'hsl(var(--primary))'}}></span></div>
            <div>--accent: <span className="inline-block w-4 h-4 rounded" style={{backgroundColor: 'hsl(var(--accent))'}}></span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}