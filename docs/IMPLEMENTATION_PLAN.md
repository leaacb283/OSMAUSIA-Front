# OSMAUSIA - Plan d'Implémentation

Création d'une application React "fantôme" pour la plateforme de tourisme régénératif OSMAUSIA avec données mockées.

---

## Proposed Changes

### 1. Project Setup

#### [NEW] package.json
- React 18 + Vite pour performances optimales
- react-router-dom v6 pour le routing
- react-i18next pour l'internationalisation

#### [NEW] vite.config.js
- Configuration Vite avec alias de paths

#### [NEW] index.html
- Import Google Fonts (Roca One + Montserrat)
- Meta tags PWA-ready

---

### 2. Design System

#### [NEW] src/styles/variables.css
- Palette de couleurs (light/dark mode)
- Typographies Roca One (titres) + Montserrat (corps)
- Espacements et breakpoints mobile-first

#### [NEW] src/styles/global.css
- Reset CSS + styles de base
- Classes utilitaires accessibilité (contraste > 4.5:1)

---

### 3. Mock Data

#### [NEW] src/data/mockUsers.js
- Utilisateurs mockés (voyageurs, partenaires, admin)
- Structure: `{ id, email, role, profile, preferences }`

#### [NEW] src/data/mockOffers.js
- Offres régénératives (hébergements, activités)
- Structure: `{ id, title, type, category, regenScore, partner, images }`

#### [NEW] src/data/mockBookings.js
- Réservations avec statuts (pending, confirmed, cancelled)

---

### 4. Internationalisation (i18n)

#### [NEW] src/i18n/index.js
- Configuration react-i18next

#### [NEW] src/i18n/locales/fr.json
- Traductions françaises

#### [NEW] src/i18n/locales/en.json
- Traductions anglaises

---

### 5. Authentication

#### [NEW] src/contexts/AuthContext.jsx
- Contexte d'authentification React
- Fonctions: login, logout, register

#### [NEW] src/pages/Login.jsx
- Interface unique tous profils
- Champs: email + mot de passe

#### [NEW] src/pages/RegisterTraveler.jsx
- Formulaire: nom, prénom, email, téléphone, langue

#### [NEW] src/pages/RegisterPartner.jsx
- Formulaire: raison sociale, type (hébergeur/guide/mixte)

#### [NEW] src/utils/validation.js
- Validation mot de passe (12+ chars, caractères spéciaux)

---

### 6. Home Page

#### [NEW] src/pages/Home.jsx
- Hero avec barre de recherche flottante
- Filtres thématiques (Nature, Social, Culture)
- Section "Coups de cœur régénératifs"

#### [NEW] src/components/SearchBar.jsx
- Destination, dates, nombre de voyageurs

#### [NEW] src/components/ThematicFilters.jsx
- Boutons Nature / Social / Culture

#### [NEW] src/components/OfferCard.jsx
- Carte d'offre avec visuel + RegenScore

---

### 7. Client Dashboard

#### [NEW] src/pages/Dashboard.jsx
- Vue d'ensemble voyageur
- Suivi d'impact personnel

#### [NEW] src/components/BookingsList.jsx
- Liste réservations avec statuts

#### [NEW] src/components/ImpactMetrics.jsx
- Métriques post-séjour (J+3)

#### [NEW] src/pages/Preferences.jsx
- Centre de préférences RGPD

---

### 8. Transversal Components

#### [NEW] src/components/RegenScore.jsx
- Score = (Env * 0.4) + (Social * 0.3) + (Exp * 0.3)
- Visualisation graphique (jauge circulaire)

#### [NEW] src/components/Layout.jsx
- Header avec navigation responsive
- Toggle dark mode + language switcher
- Footer

#### [NEW] src/contexts/ThemeContext.jsx
- Gestion mode sombre/clair

---

### 9. Routing

#### [NEW] src/App.jsx
- Configuration React Router
- Routes protégées (espace client)

#### [NEW] src/main.jsx
- Point d'entrée avec providers

---

## Verification Plan

### Vérification Automatisée (Dev Server)

```bash
# 1. Installation des dépendances
npm install

# 2. Lancement du serveur de développement
npm run dev
```

### Vérification Manuelle Navigateur

| Test | Actions | Résultat Attendu |
|------|---------|------------------|
| **Home Page** | Ouvrir http://localhost:5173 | Page d'accueil avec recherche et filtres visibles |
| **i18n** | Cliquer toggle FR/EN | Tous les textes changent de langue |
| **Dark Mode** | Cliquer toggle thème | Couleurs s'inversent, contraste maintenu |
| **Login** | Naviguer vers /login | Formulaire email + password affiché |
| **Register Traveler** | Naviguer vers /register/traveler | Formulaire complet avec validation |
| **Register Partner** | Naviguer vers /register/partner | Champs raison sociale + type affichés |
| **Dashboard** | Se connecter puis /dashboard | Liste réservations + métriques impact |
| **Mobile** | Redimensionner < 768px | Layout adapté, navigation hamburger |
| **Accessibilité** | Inspecter contrastes | Ratio > 4.5:1 sur tous les textes |

---

## Arborescence Finale

```
PING/
├── index.html
├── package.json
├── vite.config.js
├── docs/
│   └── IMPLEMENTATION_PLAN.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── SearchBar.jsx
│   │   ├── ThematicFilters.jsx
│   │   ├── OfferCard.jsx
│   │   ├── RegenScore.jsx
│   │   ├── BookingsList.jsx
│   │   └── ImpactMetrics.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── data/
│   │   ├── mockUsers.js
│   │   ├── mockOffers.js
│   │   └── mockBookings.js
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/
│   │       ├── fr.json
│   │       └── en.json
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── RegisterTraveler.jsx
│   │   ├── RegisterPartner.jsx
│   │   ├── Dashboard.jsx
│   │   └── Preferences.jsx
│   ├── styles/
│   │   ├── variables.css
│   │   └── global.css
│   └── utils/
│       └── validation.js
```

---

## Formule RegenScore

```
Score = (Points_Env × 0.4) + (Points_Social × 0.3) + (Points_Exp × 0.3)
```

- **Points_Env** : Impact environnemental (0-100)
- **Points_Social** : Impact social (0-100)
- **Points_Exp** : Qualité de l'expérience (0-100)
