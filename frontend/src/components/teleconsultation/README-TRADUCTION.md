# Fonctionnalité de Traduction en Temps Réel pour la Téléconsultation

Cette fonctionnalité permet de traduire automatiquement les paroles des participants lors d'une téléconsultation et d'afficher les sous-titres en bas de l'écran, similaire au sous-titrage dans les films.

## Fonctionnalités

- Reconnaissance vocale en temps réel
- Traduction automatique entre le français et l'anglais
- Affichage des sous-titres en bas de l'écran vidéo
- Possibilité d'activer/désactiver les sous-titres
- Possibilité de changer la langue de traduction

## Installation

Pour utiliser cette fonctionnalité, vous devez installer les dépendances suivantes :

```bash
npm install react-speech-recognition regenerator-runtime
```

Ou exécutez le script `install-speech-recognition.bat` à la racine du projet.

## Mode de démonstration

Si les dépendances ne sont pas installées ou si la connexion WebRTC échoue, la fonctionnalité passera automatiquement en mode de démonstration. Ce mode simule la reconnaissance vocale et la traduction pour vous montrer comment la fonctionnalité est censée fonctionner.

## Utilisation

### Boutons de contrôle

- **CC** : Activer/désactiver les sous-titres
- **FR→EN** : Changer la langue de traduction (Français vers Anglais ou Anglais vers Français)

### Fonctionnement

1. Lorsque vous parlez, votre voix est transcrite en texte et affichée en bas de votre vidéo.
2. Le texte est traduit dans la langue de votre interlocuteur et affiché en bas de sa vidéo.
3. Vous pouvez activer/désactiver les sous-titres avec le bouton CC.
4. Vous pouvez changer la langue de traduction avec le bouton FR→EN.

## Dépannage

Si vous rencontrez des problèmes avec la fonctionnalité de traduction en temps réel :

1. Vérifiez que les dépendances sont correctement installées.
2. Assurez-vous que votre navigateur prend en charge la reconnaissance vocale (Chrome est recommandé).
3. Vérifiez que vous avez autorisé l'accès au microphone.
4. Si la connexion WebRTC échoue, vous pouvez quand même voir la démonstration des sous-titres.

## Limitations actuelles

- La reconnaissance vocale fonctionne mieux avec Chrome.
- La traduction est simulée en mode de développement (utilise une liste prédéfinie de traductions).
- En production, il faudrait intégrer une vraie API de traduction comme Google Translate.

## Améliorations futures

- Intégration avec l'API Google Translate pour une traduction plus précise
- Support pour plus de langues
- Amélioration de la détection de la langue parlée
- Possibilité de personnaliser l'apparence des sous-titres
