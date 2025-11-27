
# Qwonen V2

  This is a code bundle for Qwonen V2. The original project is available at <https://www.figma.com/design/76yjhxXVOhZVNrmZtBXb84/Qwonen-V2>.

## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
---

# 🛵 Qwonen — Réservez un taxi où que vous soyez

![React](https://img.shields.io/badge/React-18.0.0-61DAFB?style=flat&logo=react)
![License](https://img.shields.io/badge/Licence-MIT-green?style=flat)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat)
![Status](https://img.shields.io/badge/Version-1.0.0-blue?style=flat)

---

## 🌍 Présentation

**Qwonen** est une application web innovante développée avec **React** qui simplifie la **réservation de taxi ou taxi-moto** grâce à la **géolocalisation en temps réel**.  
Elle connecte instantanément les utilisateurs et les chauffeurs les plus proches, tout en garantissant une **expérience fluide, rapide et sécurisée**.

Pensée pour répondre aux besoins de mobilité urbaine en Afrique et ailleurs, Qwonen ambitionne de devenir **le compagnon de transport intelligent** de tous les jours.

---

## 🚀 Fonctionnalités principales

- 📍 **Géolocalisation en temps réel** : localise l’utilisateur et les chauffeurs disponibles autour de lui.  
- 🛵 **Réservation instantanée** : permet de réserver un taxi ou un taxi-moto en un clic.  
- 🗺️ **Suivi du trajet** : visualisation dynamique de la position du chauffeur sur la carte.  
- 💳 **Paiement intégré** *(en développement)* : support prévu pour Mobile Money et cartes bancaires.  
- 🔐 **Authentification sécurisée** : création de compte, connexion, récupération de mot de passe.  
- 🧭 **Historique des courses** : consultation des trajets récents et des montants payés.  
- 🌙 **Interface moderne et responsive** : design adaptatif compatible mobile, tablette et desktop.  

---

## 🧰 Technologies utilisées

| Technologie | Rôle |
|--------------|------|
| **React.js** | Développement du front-end et de l’interface utilisateur |
| **Node.js** | Environnement JavaScript pour le développement local |
| **Supabase / Firebase** | Backend as a Service pour la base de données et l’authentification |
| **React Router** | Navigation entre les différentes pages |
| **Tailwind CSS** | Framework CSS moderne et réactif |
| **Leaflet.js / Google Maps API** | Gestion de la carte et de la géolocalisation |
| **Vite** | Outil de build et serveur de développement ultra-rapide |

---

## 🏗️ Architecture du projet

qwonen/ ├── public/ │   ├── index.html │   └── favicon.ico ├── src/ │   ├── assets/             # Images, icônes, fichiers statiques │   ├── components/         # Composants réutilisables (Header, Footer, etc.) │   ├── pages/              # Pages principales (Accueil, Réservation, Profil) │   ├── services/           # Gestion API, authentification, base de données │   ├── hooks/              # Hooks personnalisés (géolocalisation, session) │   ├── App.jsx             # Structure principale de l'application │   └── main.jsx            # Point d'entrée React ├── package.json └── README.md

---

## ⚙️ Installation et exécution

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/<ton-utilisateur-github>/qwonen.git
cd qwonen

2️⃣ Installer les dépendances

npm install

3️⃣ Démarrer le serveur de développement

npm run dev

Le projet sera accessible sur :
👉 http://localhost:3000

4️⃣ Construire la version de production

npm run build


---

🌐 Déploiement

Qwonen peut être facilement déployé sur :

Vercel — Recommandé pour React

Netlify

GitHub Pages


Déploiement avec Vercel :

1. Connectez-vous sur vercel.com


2. Importez le dépôt GitHub du projet


3. Vercel détectera automatiquement la configuration React/Vite


4. Votre app sera en ligne en quelques secondes 🎉




---

🧠 Vision du projet

> “Qwonen vise à révolutionner la mobilité urbaine en Afrique,
en offrant une solution locale, technologique et durable
pour les déplacements du quotidien.”



Qwonen a pour mission de :

Promouvoir la sécurité et la fiabilité du transport urbain ;

Créer un écosystème équitable entre chauffeurs et clients ;

Faciliter la mobilité intelligente, même sans connexion constante.



---

🤝 Contribution

Les contributions, suggestions et collaborations sont les bienvenues !
Pour participer au développement :

git checkout -b feature/ma-nouvelle-fonctionnalite
git commit -m "Ajout d'une nouvelle fonctionnalité"
git push origin feature/ma-nouvelle-fonctionnalite

Puis ouvre une Pull Request pour examen.


---

👨‍💻 Auteur

Jeafat Kamano
💼 Développeur Full Stack | Fondateur de Qwonen
🌍 Guinée — Passionné par la technologie, la mobilité et l’innovation sociale
📧 jeafatkamano123@gmail.com
🌐 sinai-production.com


---

📝 Licence

Ce projet est sous licence MIT.
Vous êtes libre de l’utiliser, le modifier et le redistribuer,
à condition de citer l’auteur original.


---

> 🛵 Qwonen — L’application qui vous rapproche de votre chauffeur, en un clic.



---
