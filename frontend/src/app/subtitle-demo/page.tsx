"use client";

import { useState, useEffect } from 'react';
import SubtitlesDemoOverlay from '@/components/teleconsultation/SubtitlesDemoOverlay';
import Link from 'next/link';

export default function SubtitleDemoPage() {
  const [showFullDemo, setShowFullDemo] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    // Afficher automatiquement la démo complète après un court délai
    const timer = setTimeout(() => {
      setShowFullDemo(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Démonstration des sous-titres en temps réel</h1>
          <p className="text-gray-600 mb-6">
            Cette page vous permet de tester la fonctionnalité de traduction en temps réel avec sous-titres
            pour les téléconsultations.
          </p>

          {showInstructions && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Instructions</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Vous verrez une démonstration interactive des sous-titres en temps réel</li>
                      <li>Vous pouvez activer/désactiver les sous-titres avec le bouton CC</li>
                      <li>Vous pouvez changer la langue de traduction avec le bouton FR→EN</li>
                      <li>Pour tester avec votre propre voix, utilisez la page de test vidéo</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowInstructions(false)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Fermer les instructions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowFullDemo(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Voir la démonstration
            </button>
            <Link
              href="/test-video?consultation=demo&userId=demo&role=patient&patient=demo&medecin=demo&initiator=patient"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Tester avec la vidéo
            </Link>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Comment ça marche ?</h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité utilise la reconnaissance vocale pour transcrire la parole en texte,
              puis traduit ce texte dans la langue de votre interlocuteur. Les sous-titres apparaissent
              en bas de l'écran, similaire au sous-titrage dans les films.
            </p>

            <h3 className="text-lg font-semibold mb-2">Fonctionnalités</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 mb-4">
              <li>Reconnaissance vocale en temps réel</li>
              <li>Traduction automatique entre le français et l'anglais</li>
              <li>Affichage des sous-titres en bas de l'écran vidéo</li>
              <li>Possibilité d'activer/désactiver les sous-titres</li>
              <li>Possibilité de changer la langue de traduction</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Installation</h3>
            <p className="text-gray-600 mb-2">
              Pour utiliser cette fonctionnalité dans votre propre application, vous devez installer les dépendances suivantes :
            </p>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm mb-4">
              npm install react-speech-recognition regenerator-runtime
            </div>
            <p className="text-gray-600">
              Ou exécutez le script <code className="bg-gray-100 px-2 py-1 rounded">install-speech-recognition.bat</code> à la racine du projet.
            </p>
          </div>
        </div>
      </div>

      {/* Démonstration complète */}
      {showFullDemo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Démonstration des sous-titres en temps réel
              </h2>
              <button 
                onClick={() => setShowFullDemo(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <SubtitlesDemoOverlay onClose={() => setShowFullDemo(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
