# Seasonal Messages Application

Une application web permettant de créer et partager des messages saisonniers.

## Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)

## Installation

1. Clonez ce dépôt
2. Installez les dépendances :
```bash
npm install
```

3. Créez un projet Firebase et ajoutez vos configurations dans `src/config/firebase.ts`

4. Démarrez l'application en mode développement :
```bash
npm start
```

## Fonctionnalités

- Authentification via Google et LinkedIn
- Création de messages saisonniers (limités à 200 caractères)
- Catégorisation par saison (Été, Automne, Hiver, Printemps)
- Interface responsive
- Mode sombre
- Pagination des messages

## Structure du Projet

```
src/
  ├── components/     # Composants réutilisables
  ├── config/        # Configuration Firebase
  ├── contexts/      # Contextes React
  ├── hooks/         # Hooks personnalisés
  ├── pages/         # Pages de l'application
  ├── styles/        # Styles globaux
  ├── types/         # Types TypeScript
  └── utils/         # Fonctions utilitaires
```

## Technologies Utilisées

- React.js
- TypeScript
- Firebase (Auth, Firestore)
- Material-UI
- React Router
