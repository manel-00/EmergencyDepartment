@echo off
echo Installation des dépendances pour le traducteur en temps réel...

:: Vérifier si npm est installé
npm --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: npm n'est pas installé ou n'est pas dans le PATH.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

:: Se déplacer dans le répertoire frontend
if exist frontend (
    cd frontend
) else (
    echo ERREUR: Le répertoire frontend n'existe pas.
    echo Assurez-vous d'exécuter ce script depuis la racine du projet.
    pause
    exit /b 1
)

:: Installer les dépendances
echo Installation des dépendances...
npm install react-speech-recognition --save
npm install regenerator-runtime --save

:: Vérifier si l'installation a réussi
if %errorlevel% neq 0 (
    echo ERREUR: L'installation des dépendances a échoué.
    echo Vérifiez votre connexion Internet et réessayez.
    cd ..
    pause
    exit /b 1
) else (
    echo Dépendances installées avec succès!
    cd ..
    pause
)

