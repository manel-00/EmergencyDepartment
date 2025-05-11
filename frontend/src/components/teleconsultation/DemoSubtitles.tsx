"use client";

import React, { useState, useEffect } from 'react';

interface DemoSubtitlesProps {
  onClose: () => void;
}

const DemoSubtitles: React.FC<DemoSubtitlesProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDemo, setShowDemo] = useState(true);

  const steps = [
    {
      title: "Bienvenue dans la démonstration des sous-titres en temps réel",
      content: "Cette démonstration vous montre comment fonctionnent les sous-titres de traduction en temps réel dans la téléconsultation.",
      image: "/demo-subtitles-1.png"
    },
    {
      title: "Reconnaissance vocale",
      content: "Lorsque vous parlez, votre voix est transcrite en texte et affichée en bas de votre vidéo.",
      image: "/demo-subtitles-2.png"
    },
    {
      title: "Traduction en temps réel",
      content: "Le texte est traduit dans la langue de votre interlocuteur et affiché en bas de sa vidéo.",
      image: "/demo-subtitles-3.png"
    },
    {
      title: "Contrôles des sous-titres",
      content: "Vous pouvez activer/désactiver les sous-titres avec le bouton CC et changer la langue avec le bouton FR→EN.",
      image: "/demo-subtitles-4.png"
    }
  ];

  useEffect(() => {
    // Fermer automatiquement après le dernier step
    if (currentStep >= steps.length) {
      setShowDemo(false);
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [currentStep, steps.length, onClose]);

  if (!showDemo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {steps[currentStep]?.title || "Démonstration terminée"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {steps[currentStep]?.content}
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 flex justify-center items-center h-64">
            <div className="text-center text-gray-500 dark:text-gray-400">
              {steps[currentStep]?.image ? (
                <img 
                  src={steps[currentStep].image} 
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
            {steps.map((_, index) => (
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
            {currentStep < steps.length - 1 ? 'Suivant' : 'Terminer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoSubtitles;
