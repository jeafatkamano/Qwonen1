import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, AlertTriangle, Wrench } from 'lucide-react';
import dialogAccessibilityFixer from '../services/dialogAccessibilityFixer';
import { toast } from 'sonner@2.0.3';

interface AccessibilityTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityTestModal({ isOpen, onClose }: AccessibilityTestModalProps) {
  const [auditResults, setAuditResults] = useState<{ score: number; issues: string[]; recommendations: string[] } | null>(null);

  const runAudit = () => {
    const results = dialogAccessibilityFixer.runAccessibilityAudit();
    setAuditResults(results);
    
    if (results.score === 100) {
      toast.success('✅ Audit d\'accessibilité réussi !');
    } else if (results.score >= 80) {
      toast.warning('⚠️ Quelques améliorations d\'accessibilité nécessaires');
    } else {
      toast.error('❌ Problèmes d\'accessibilité détectés');
    }
  };

  const forceFixAll = () => {
    dialogAccessibilityFixer.forceFixAll();
    // Re-exécuter l'audit après correction
    setTimeout(() => {
      runAudit();
    }, 500);
  };

  const issues = dialogAccessibilityFixer.getIssues();
  const fixedIssues = dialogAccessibilityFixer.getFixedIssues();
  const openIssues = dialogAccessibilityFixer.getOpenIssues();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl [&>button]:hidden"
        aria-describedby="accessibility-test-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Test d'Accessibilité des Dialogs
          </DialogTitle>
          <DialogDescription id="accessibility-test-description">
            Vérification et correction automatique des problèmes d'accessibilité dans les composants Dialog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{issues.length}</div>
              <p className="text-sm text-gray-500">Total Issues</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{fixedIssues.length}</div>
              <p className="text-sm text-green-700">Corrigés</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">{openIssues.length}</div>
              <p className="text-sm text-orange-700">En cours</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={runAudit}
              className="flex-1 h-12 rounded-xl"
              variant="outline"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Exécuter Audit
            </Button>
            <Button 
              onClick={forceFixAll}
              className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Corriger Tout
            </Button>
          </div>

          {/* Résultats d'audit */}
          {auditResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold">Score d'Accessibilité</h3>
                  <p className="text-sm text-gray-500">Conformité aux standards WCAG</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    auditResults.score >= 90 ? 'text-green-600' :
                    auditResults.score >= 70 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {auditResults.score}%
                  </div>
                  <Badge className={
                    auditResults.score >= 90 ? 'bg-green-100 text-green-800' :
                    auditResults.score >= 70 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                  }>
                    {auditResults.score >= 90 ? 'Excellent' :
                     auditResults.score >= 70 ? 'Bien' : 'À améliorer'}
                  </Badge>
                </div>
              </div>

              {auditResults.issues.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Problèmes Détectés
                  </h4>
                  <div className="space-y-2">
                    {auditResults.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {auditResults.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recommandations</h4>
                  <div className="space-y-2">
                    {auditResults.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Liste des issues */}
          <div>
            <h4 className="font-medium mb-3">Historique des Corrections</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun problème d'accessibilité détecté</p>
                </div>
              ) : (
                issues.map((issue) => (
                  <div key={issue.id} className={`flex items-center justify-between p-3 rounded-xl ${
                    issue.fixed ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {issue.fixed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${
                          issue.fixed ? 'text-green-800' : 'text-orange-800'
                        }`}>
                          {issue.component}
                        </p>
                        <p className={`text-xs ${
                          issue.fixed ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {issue.issue}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {issue.fixed && issue.fixedAt && (
                        <span>Corrigé {new Date(issue.fixedAt).toLocaleTimeString('fr-FR')}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Note informative */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">À propos des Corrections d'Accessibilité</h4>
            <p className="text-sm text-blue-800">
              Ce système corrige automatiquement les problèmes d'accessibilité des composants Dialog 
              en ajoutant les attributs aria-describedby manquants et en injectant des descriptions 
              cachées visuellement mais accessibles aux lecteurs d'écran.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={onClose}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}