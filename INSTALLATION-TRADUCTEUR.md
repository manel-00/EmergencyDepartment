# Guide d'installation du traducteur en temps réel

Ce guide vous aidera à installer les dépendances nécessaires pour le traducteur en temps réel dans la téléconsultation WebRTC.

## Prérequis

- Node.js et npm installés sur votre système
- Accès à Internet pour télécharger les packages

## Option 1 : Installation automatique (Windows)

1. Double-cliquez sur le fichier `install-dependencies.bat` à la racine du projet
2. Suivez les instructions à l'écran
3. Si l'installation réussit, vous verrez le message "Dépendances installées avec succès!"

## Option 2 : Installation manuelle

Si l'installation automatique ne fonctionne pas, vous pouvez installer les dépendances manuellement :

### Pour Windows (PowerShell ou Command Prompt)

```
cd chemin\vers\votre\projet\frontend
npm install react-speech-recognition --save
npm install regenerator-runtime --save
```

### Pour macOS/Linux (Terminal)

```
cd chemin/vers/votre/projet/frontend
npm install react-speech-recognition --save
npm install regenerator-runtime --save
```

## Vérification de l'installation

Pour vérifier que les dépendances ont été correctement installées, vous pouvez :

1. Ouvrir le fichier `package.json` dans le dossier `frontend`
2. Vérifier que les dépendances suivantes sont présentes dans la section "dependencies" :
   - "react-speech-recognition"
   - "regenerator-runtime"

## Problèmes courants

### Erreur "npm n'est pas reconnu comme une commande interne ou externe"

Cela signifie que Node.js n'est pas installé ou n'est pas dans votre PATH. Installez Node.js depuis [https://nodejs.org/](https://nodejs.org/).

### Erreur "Impossible de résoudre 'react-speech-recognition'"

Cela peut être dû à un problème de connexion Internet ou à un problème avec le registre npm. Essayez de :

1. Vérifier votre connexion Internet
2. Exécuter `npm cache clean --force` puis réessayer l'installation

### Erreur "regeneratorRuntime is not defined"

Si vous voyez cette erreur dans le navigateur après l'installation, assurez-vous que :

1. Le fichier `frontend\src\lib\regenerator-runtime.ts` existe
2. Ce fichier est importé dans `frontend\src\app\layout.tsx`

## Support

Si vous rencontrez des problèmes lors de l'installation, veuillez contacter l'équipe de développement.
