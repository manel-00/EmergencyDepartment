# Instructions pour la fonctionnalité de traduction en temps réel

## Installation des dépendances

Pour utiliser la fonctionnalité de traduction en temps réel, vous devez installer les dépendances nécessaires :

1. Exécutez le script `install-speech-recognition.bat` à la racine du projet frontend.
2. Redémarrez l'application si elle est en cours d'exécution.

## Utilisation de la fonctionnalité

1. Accédez à la page de téléconsultation.
2. Même si vous voyez une erreur de connexion websocket, vous devriez voir apparaître une fenêtre de démonstration qui explique comment fonctionnent les sous-titres.
3. Vous pouvez activer/désactiver les sous-titres en cliquant sur le bouton "CC".
4. Vous pouvez changer la langue de traduction en cliquant sur le bouton "FR→EN".

## Mode de démonstration

Si la connexion websocket échoue ou si les dépendances ne sont pas installées, la fonctionnalité passera automatiquement en mode de démonstration. Ce mode simule la reconnaissance vocale et la traduction pour vous montrer comment la fonctionnalité est censée fonctionner.

## Résolution des problèmes de connexion websocket

Si vous rencontrez des erreurs de connexion websocket, voici quelques étapes pour résoudre le problème :

1. Vérifiez que le serveur backend est en cours d'exécution.
2. Vérifiez que le port 3000 est disponible et non bloqué par un pare-feu.
3. Essayez de redémarrer le serveur backend.
4. Vérifiez les logs du serveur pour voir s'il y a des erreurs spécifiques.

## Documentation complète

Pour plus d'informations sur la fonctionnalité de traduction en temps réel, consultez le fichier `src/components/teleconsultation/README-TRADUCTION.md`.
