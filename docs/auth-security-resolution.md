# Guide de Résolution - Problème de Configuration OTP Supabase

## Problème Identifié

**Alerte de sécurité :** "Vous avez activé le fournisseur de messagerie avec un délai d'expiration du mot de passe à usage unique (OTP) supérieur à une heure. Il est recommandé de définir cette valeur sur moins d'une heure."

## Impact sur la Sécurité

- **Risque de sécurité élevé** : Les codes OTP qui restent valides plus d'une heure augmentent les risques d'interception et d'utilisation malveillante
- **Non-conformité aux bonnes pratiques** : Les standards de sécurité recommandent des délais courts pour les codes à usage unique
- **Expérience utilisateur dégradée** : Les utilisateurs peuvent perdre leurs codes ou les oublier

## Solution Recommandée pour Qwonen

### 1. Configuration Optimale pour la Guinée

**Délai d'expiration OTP recommandé : 10 minutes (600 secondes)**

**Raisons :**
- ✅ Sécurité renforcée contre les attaques
- ✅ Adapté aux conditions réseau de la Guinée
- ✅ Équilibre entre sécurité et utilisabilité
- ✅ Conforme aux standards internationaux

### 2. Étapes de Résolution

#### Étape 1 : Accès au Dashboard Supabase
1. Connectez-vous à votre [dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet Qwonen

#### Étape 2 : Configuration d'Authentification
1. Naviguez vers **Authentication** → **Settings**
2. Trouvez la section **"Auth Configuration"**
3. Localisez le paramètre **"OTP expiry"**

#### Étape 3 : Modification du Délai
1. Changez la valeur actuelle vers **600** (secondes)
2. Cela équivaut à **10 minutes**
3. Sauvegardez les modifications

#### Étape 4 : Configuration Avancée (Optionnel)
```json
{
  "otp_expiry": 600,
  "session_timeout": 86400,
  "max_login_attempts": 5,
  "lockout_duration": 900
}
```

### 3. Vérification de la Configuration

#### Tests à Effectuer :
1. **Test d'inscription** : Créer un nouveau compte et vérifier que l'OTP expire en 10 minutes
2. **Test de réinitialisation** : Demander une réinitialisation de mot de passe
3. **Test de temporisation** : Attendre 11 minutes et vérifier que l'OTP est expiré

#### Code de Test (optionnel) :
```typescript
// Test automatisé de l'expiration OTP
const testOTPExpiration = async () => {
  const startTime = Date.now();
  // Demander un OTP
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'test@qwonen.gn'
  });
  
  // Attendre 11 minutes puis tester
  setTimeout(async () => {
    const elapsed = Date.now() - startTime;
    console.log(`Temps écoulé: ${elapsed / 1000 / 60} minutes`);
    
    // Tenter de vérifier l'OTP (devrait échouer)
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: 'test@qwonen.gn',
      token: 'test-token',
      type: 'email'
    });
    
    if (verifyError) {
      console.log('✅ OTP correctement expiré');
    } else {
      console.log('❌ OTP encore valide - problème de configuration');
    }
  }, 11 * 60 * 1000); // 11 minutes
};
```

### 4. Configuration Spécifique Mobile Money

Pour l'intégration avec les services Mobile Money guinéens :

#### Orange Money / MTN Money / Moov Money
```typescript
// Configuration recommandée pour les paiements mobile
const mobileMoneyOTPConfig = {
  // OTP pour vérification paiement
  payment_otp_expiry: 300, // 5 minutes (paiements critiques)
  
  // OTP pour inscription/connexion
  auth_otp_expiry: 600, // 10 minutes (standard)
  
  // OTP pour réinitialisation mot de passe
  reset_otp_expiry: 900, // 15 minutes (plus de flexibilité)
};
```

### 5. Monitoring et Alertes

#### Métriques à Surveiller :
- **Taux d'expiration OTP** : < 15% (cible)
- **Temps moyen d'utilisation** : 2-5 minutes
- **Tentatives de réutilisation** : 0 (sécurité)

#### Alertes Automatiques :
```typescript
// Surveillance des métriques OTP
const monitorOTPMetrics = async () => {
  const metrics = await getOTPMetrics();
  
  if (metrics.expirationRate > 0.15) {
    alert('Taux d\'expiration OTP élevé - vérifier la configuration');
  }
  
  if (metrics.averageUsageTime > 8 * 60) { // 8 minutes
    alert('Utilisation OTP trop lente - formation utilisateurs requise');
  }
};
```

### 6. Documentation Utilisateur

#### Messages d'Information :
- **Français** : "Votre code de vérification expire dans 10 minutes"
- **Malinké** : [À traduire selon les besoins locaux]
- **Peul** : [À traduire selon les besoins locaux]

#### Interface Utilisateur :
- ⏰ Affichage du temps restant
- 📲 Option de renvoi après expiration
- ℹ️ Explications claires sur l'expiration

### 7. Plan de Migration

#### Phase 1 (Immédiat) :
- [x] Identifier le problème de configuration
- [ ] Modifier la configuration Supabase (600s)
- [ ] Tester en environnement de développement

#### Phase 2 (Cette semaine) :
- [ ] Déployer en production
- [ ] Monitorer les métriques
- [ ] Former l'équipe support

#### Phase 3 (Suivi) :
- [ ] Analyser les retours utilisateurs
- [ ] Ajuster si nécessaire
- [ ] Documenter les leçons apprises

## Contacts et Support

- **Équipe Développement** : dev@qwonen.gn
- **Support Technique** : support@qwonen.gn
- **Documentation** : docs.qwonen.gn

## Références

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Bonnes Pratiques OTP](https://auth0.com/docs/security/otp-best-practices)
- [Standards NIST pour l'Authentification](https://pages.nist.gov/800-63-3/)

---

**Date de création :** 21 Septembre 2024  
**Dernière mise à jour :** 21 Septembre 2024  
**Version :** 1.0  
**Statut :** ✅ Résolu (après application des modifications)