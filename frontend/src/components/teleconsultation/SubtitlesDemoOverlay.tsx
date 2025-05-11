"use client";

import React, { useState, useEffect } from 'react';
import Subtitles from './Subtitles';

interface SubtitlesDemoOverlayProps {
  onClose?: () => void;
}

const SubtitlesDemoOverlay: React.FC<SubtitlesDemoOverlayProps> = ({ onClose }) => {
  const [showDemo, setShowDemo] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [demoTranscript, setDemoTranscript] = useState('');
  const [demoTranslation, setDemoTranslation] = useState('');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [sourceLang, setSourceLang] = useState('fr');

  // Textes de démonstration
  const demoTexts = {
    'fr': [
      "Bonjour docteur comment ça va je veux qu'elle traduise toute la réplique en anglais",
      "Je ne me sens pas très bien depuis plusieurs jours",
      "Quels sont vos symptômes exactement pouvez-vous me décrire la douleur",
      "J'ai de la fièvre et mal à la gorge depuis trois jours",
      "Depuis combien de temps avez-vous ces symptômes et avez-vous pris des médicaments",
      "Depuis deux jours environ et j'ai pris du paracétamol"
    ],
    'en': [
      "Hello doctor how are you I want it to translate all the reply in French",
      "I haven't been feeling well for several days",
      "What are your exact symptoms can you describe the pain",
      "I have a fever and a sore throat for three days",
      "How long have you had these symptoms and have you taken any medication",
      "For about two days and I took some paracetamol"
    ]
  };

  // Traductions prédéfinies
  const translations = {
    "Bonjour docteur comment ça va je veux qu'elle traduise toute la réplique en anglais": "Hello doctor how are you I want it to translate all the reply in English",
    "Je ne me sens pas très bien depuis plusieurs jours": "I haven't been feeling well for several days",
    "Quels sont vos symptômes exactement pouvez-vous me décrire la douleur": "What are your exact symptoms can you describe the pain",
    "J'ai de la fièvre et mal à la gorge depuis trois jours": "I have a fever and a sore throat for three days",
    "Depuis combien de temps avez-vous ces symptômes et avez-vous pris des médicaments": "How long have you had these symptoms and have you taken any medication",
    "Depuis deux jours environ et j'ai pris du paracétamol": "For about two days and I took some paracetamol",
    "Hello doctor how are you I want it to translate all the reply in French": "Bonjour docteur comment ça va je veux qu'elle traduise toute la réplique en français",
    "I haven't been feeling well for several days": "Je ne me sens pas très bien depuis plusieurs jours",
    "What are your exact symptoms can you describe the pain": "Quels sont vos symptômes exactement pouvez-vous me décrire la douleur",
    "I have a fever and a sore throat for three days": "J'ai de la fièvre et mal à la gorge depuis trois jours",
    "How long have you had these symptoms and have you taken any medication": "Depuis combien de temps avez-vous ces symptômes et avez-vous pris des médicaments",
    "For about two days and I took some paracetamol": "Depuis deux jours environ et j'ai pris du paracétamol"
  };

  // Étapes du tutoriel
  const tutorialSteps = [
    {
      title: "Bienvenue dans la démonstration des sous-titres en temps réel",
      content: "Cette démonstration vous montre comment fonctionnent les sous-titres de traduction en temps réel dans la téléconsultation.",
      image: "/demo-subtitles-1.svg"
    },
    {
      title: "Reconnaissance vocale",
      content: "Lorsque vous parlez, votre voix est transcrite en texte et affichée en bas de votre vidéo.",
      image: "/demo-subtitles-2.svg"
    },
    {
      title: "Traduction en temps réel",
      content: "Le texte est traduit dans la langue de votre interlocuteur et affiché en bas de sa vidéo.",
      image: "/demo-subtitles-3.svg"
    },
    {
      title: "Contrôles des sous-titres",
      content: "Vous pouvez activer/désactiver les sous-titres avec le bouton CC et changer la langue avec le bouton FR→EN.",
      image: "/demo-subtitles-4.svg"
    }
  ];

  // Simuler la reconnaissance vocale et la traduction
  useEffect(() => {
    if (!showTutorial) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        const texts = demoTexts[sourceLang];
        const text = texts[currentIndex % texts.length];
        setDemoTranscript(text);

        // Traduire le texte
        const translatedText = translations[text] || `[${targetLanguage}] ${text}`;
        console.log(`Demo translation: "${text}" -> "${translatedText}"`);
        setDemoTranslation(translatedText);

        currentIndex++;
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [showTutorial, sourceLang, targetLanguage]);

  // Fermer automatiquement le tutoriel après la dernière étape
  useEffect(() => {
    if (currentStep >= tutorialSteps.length) {
      setShowTutorial(false);
    }
  }, [currentStep, tutorialSteps.length]);

  // Gérer la fermeture du composant
  const handleClose = () => {
    setShowDemo(false);
    if (onClose) onClose();
  };

  // Changer la langue de traduction
  const toggleLanguage = () => {
    if (targetLanguage === 'en') {
      setTargetLanguage('fr');
      setSourceLang('en');
    } else {
      setTargetLanguage('en');
      setSourceLang('fr');
    }
  };

  if (!showDemo) return null;

  return (
    <div className="relative w-full h-full">
      {/* Tutoriel */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {tutorialSteps[currentStep]?.title || "Démonstration terminée"}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {tutorialSteps[currentStep]?.content}
              </p>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 flex justify-center items-center h-64">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  {tutorialSteps[currentStep]?.image ? (
                    <img
                      src={tutorialSteps[currentStep].image}
                      alt={`Démonstration étape ${currentStep + 1}`}
                      className="max-h-60 max-w-full mx-auto rounded"
                    />
                  ) : (
                    <p>Image non disponible</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded ${
                  currentStep === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Précédent
              </button>

              <div className="flex space-x-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                {currentStep < tutorialSteps.length - 1 ? 'Suivant' : 'Commencer la démo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Démonstration des sous-titres */}
      {!showTutorial && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Vidéo du patient */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Patient
              </div>
              <Subtitles
                text={demoTranscript}
                isVisible={showSubtitles}
                position="bottom"
                language={sourceLang}
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  className="p-2 rounded-full bg-green-500 text-white"
                >
                  🎥
                </button>
                <button
                  className="p-2 rounded-full bg-green-500 text-white"
                >
                  🎤
                </button>
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`p-2 rounded-full ${
                    showSubtitles ? 'bg-green-500' : 'bg-red-500'
                  } text-white`}
                >
                  CC
                </button>
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-full bg-blue-500 text-white text-xs"
                >
                  {sourceLang === 'fr' ? 'FR→EN' : 'EN→FR'}
                </button>
              </div>
            </div>

            {/* Vidéo du médecin */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Médecin
              </div>
              <div className="flex items-center justify-center h-full text-gray-500">
                En attente du médecin...
              </div>
              <Subtitles
                text={demoTranslation}
                isVisible={showSubtitles}
                position="bottom"
                language={targetLanguage}
              />
            </div>
          </div>

          {/* Bouton pour fermer la démo */}
          <div className="absolute top-4 right-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Fermer la démo
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SubtitlesDemoOverlay;
