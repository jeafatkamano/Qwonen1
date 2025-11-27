# Guide d'Intégration de l'Authentification Sociale - Qwonen

Ce guide explique comment intégrer les vraies APIs Google et Apple pour l'authentification sociale dans l'application Qwonen.

## État Actuel

L'application utilise actuellement des simulations pour l'authentification Google et Apple. Cette approche permet de tester l'interface utilisateur et la logique d'authentification sans avoir besoin des vraies clés API.

## Configuration Google Sign-In

### 1. Prérequis
- Compte Google Cloud Platform
- Projet Google Cloud configuré

### 2. Configuration Google Cloud Console

1. **Créer un projet Google Cloud** (si pas déjà fait)
   ```
   https://console.cloud.google.com/
   ```

2. **Activer l'API Google+ et Google Identity**
   - Aller dans "APIs & Services" > "Library"
   - Rechercher et activer "Google+ API"
   - Rechercher et activer "Google Identity"

3. **Créer des identifiants OAuth 2.0**
   - Aller dans "APIs & Services" > "Credentials"
   - Cliquer "Create Credentials" > "OAuth 2.0 Client IDs"
   - Type d'application : "Web application"
   - Nom : "Qwonen Web App"
   - Origines JavaScript autorisées :
     ```
     http://localhost:3000
     https://votre-domaine.com
     ```
   - URIs de redirection autorisées :
     ```
     http://localhost:3000/auth/google/callback
     https://votre-domaine.com/auth/google/callback
     ```

4. **Récupérer le Client ID**
   - Copier le Client ID généré
   - Le remplacer dans `/services/socialAuth.ts`

### 3. Installation des dépendances

```bash
npm install gapi-script
```

### 4. Code de production pour Google

Remplacer la simulation dans `/services/socialAuth.ts` :

```typescript
import { gapi } from 'gapi-script';

export const GoogleAuthService = {
  init: async (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      gapi.load('auth2', {
        callback: () => {
          gapi.auth2.init({
            client_id: socialAuthConfig.google.clientId,
          }).then(() => {
            resolve(true);
          }).catch(reject);
        },
        onerror: reject
      });
    });
  },

  signIn: async (): Promise<SocialAuthUser> => {
    const authInstance = gapi.auth2.getAuthInstance();
    const googleUser = await authInstance.signIn();
    const profile = googleUser.getBasicProfile();
    
    return {
      id: profile.getId(),
      email: profile.getEmail(),
      name: profile.getName(),
      avatar: profile.getImageUrl(),
      provider: 'google'
    };
  },

  signOut: async (): Promise<void> => {
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signOut();
  }
};
```

## Configuration Apple Sign-In

### 1. Prérequis
- Compte Apple Developer Program (payant)
- App ID configuré

### 2. Configuration Apple Developer Portal

1. **Créer un App ID**
   - Aller sur https://developer.apple.com/account/
   - "Certificates, Identifiers & Profiles" > "Identifiers"
   - Créer un nouveau App ID
   - Activer "Sign In with Apple"

2. **Créer un Service ID**
   - "Certificates, Identifiers & Profiles" > "Identifiers"
   - Créer un nouveau Service ID
   - Identifier : `com.sinaiproduction.qwonen.web`
   - Description : "Qwonen Web Service"
   - Activer "Sign In with Apple"
   - Configurer les domaines :
     ```
     Domaines : votre-domaine.com
     Return URLs : https://votre-domaine.com/auth/apple/callback
     ```

3. **Créer une clé privée**
   - "Certificates, Identifiers & Profiles" > "Keys"
   - Créer une nouvelle clé
   - Activer "Sign In with Apple"
   - Télécharger le fichier `.p8`

### 3. Code de production pour Apple

```typescript
export const AppleAuthService = {
  init: async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.AppleID) {
        window.AppleID.auth.init({
          clientId: socialAuthConfig.apple.clientId,
          scope: 'name email',
          redirectURI: socialAuthConfig.apple.redirectUri,
          state: 'state',
          usePopup: true
        });
        resolve(true);
      } else {
        // Charger le SDK Apple
        const script = document.createElement('script');
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.onload = () => {
          window.AppleID.auth.init({
            clientId: socialAuthConfig.apple.clientId,
            scope: 'name email',
            redirectURI: socialAuthConfig.apple.redirectUri,
            state: 'state',
            usePopup: true
          });
          resolve(true);
        };
        document.head.appendChild(script);
      }
    });
  },

  signIn: async (): Promise<SocialAuthUser> => {
    const response = await window.AppleID.auth.signIn();
    const { user, name, email } = response.authorization;
    
    return {
      id: user,
      email: email,
      name: name ? `${name.firstName} ${name.lastName}` : 'Utilisateur Apple',
      provider: 'apple'
    };
  }
};
```

### 4. Ajout du SDK Apple

Ajouter dans le `<head>` de votre HTML :

```html
<script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
```

## Variables d'environnement

Créer un fichier `.env` :

```bash
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=votre-google-client-id

# Apple Sign-In
REACT_APP_APPLE_CLIENT_ID=com.sinaiproduction.qwonen.web
REACT_APP_APPLE_REDIRECT_URI=https://votre-domaine.com/auth/apple/callback
```

## Mise à jour de la configuration

Dans `/services/socialAuth.ts`, remplacer :

```typescript
const socialAuthConfig: SocialAuthConfig = {
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    redirectUri: `${window.location.origin}/auth/google/callback`
  },
  apple: {
    clientId: process.env.REACT_APP_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
    redirectUri: process.env.REACT_APP_APPLE_REDIRECT_URI || `${window.location.origin}/auth/apple/callback`
  }
};
```

## Gestion des erreurs en production

```typescript
const handleAuthError = (error: any, provider: string) => {
  console.error(`Erreur ${provider}:`, error);
  
  // Différents types d'erreurs
  if (error.error === 'popup_blocked_by_browser') {
    toast.error('Popup bloquée par le navigateur. Veuillez autoriser les popups.');
  } else if (error.error === 'access_denied') {
    toast.error('Accès refusé par l\'utilisateur.');
  } else {
    toast.error(`Erreur lors de la connexion avec ${provider}.`);
  }
};
```

## Tests en développement

1. **Mode simulation** (actuel) : Aucune configuration requise
2. **Mode développement avec vraies APIs** : Utiliser localhost dans la configuration
3. **Mode production** : Utiliser le vrai domaine

## Considérations de sécurité

1. **Ne jamais exposer les clés privées** dans le code frontend
2. **Valider les tokens côté serveur** avant de créer une session
3. **Implémenter une expiration des tokens**
4. **Utiliser HTTPS** en production

## Intégration avec Supabase

```typescript
// Exemple d'intégration avec Supabase
const handleSocialLogin = async (provider: 'google' | 'apple') => {
  try {
    const { user, session, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    
    // Créer le profil utilisateur dans Qwonen
    await createQwonenProfile(user, selectedRole);
    
  } catch (error) {
    console.error('Erreur d\'authentification sociale:', error);
  }
};
```

## Points de contrôle

- [ ] Configuration Google Cloud Console
- [ ] Configuration Apple Developer Portal  
- [ ] Installation des dépendances
- [ ] Configuration des variables d'environnement
- [ ] Tests sur localhost
- [ ] Tests en production
- [ ] Gestion des erreurs
- [ ] Validation des tokens côté serveur

## Support

Pour toute question sur l'intégration, contacter l'équipe de développement Sinaiproduction.