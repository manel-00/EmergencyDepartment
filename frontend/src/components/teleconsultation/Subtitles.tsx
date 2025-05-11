"use client";

import React, { useEffect, useState } from 'react';

interface SubtitlesProps {
  text: string;
  isVisible: boolean;
  position?: 'top' | 'bottom';
  language?: string;
}

const Subtitles: React.FC<SubtitlesProps> = ({
  text,
  isVisible,
  position = 'bottom',
  language = 'fr'
}) => {
  const [displayText, setDisplayText] = useState('');

  // Traiter le texte à afficher
  useEffect(() => {
    if (isVisible) {
      if (text) {
        // Nettoyer le texte des préfixes de langue
        let cleanText = text;
        if (cleanText.startsWith('[en]') || cleanText.startsWith('[fr]')) {
          cleanText = cleanText.substring(4).trim();
        }

        // Capitaliser la première lettre si nécessaire
        if (cleanText.length > 0) {
          cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
        }

        setDisplayText(cleanText);
      } else {
        // Texte de démonstration pour le développement
        const demoTexts = {
          'fr': [
            "Bonjour, comment allez-vous aujourd'hui ?",
            "Je ne me sens pas très bien.",
            "Quels sont vos symptômes ?",
            "J'ai de la fièvre et mal à la gorge."
          ],
          'en': [
            "Hello, how are you today?",
            "I'm not feeling very well.",
            "What are your symptoms?",
            "I have a fever and a sore throat."
          ]
        };

        // Sélectionner un texte aléatoire pour la démonstration
        const langTexts = demoTexts[language === 'fr' ? 'fr' : 'en'];
        const randomText = langTexts[Math.floor(Math.random() * langTexts.length)];
        setDisplayText(randomText + " (Démo)");
      }
    } else {
      setDisplayText("");
    }
  }, [text, isVisible, language]);

  if (!isVisible) return null;

  return (
    <div
      className={`absolute ${position === 'bottom' ? 'bottom-16' : 'top-16'} left-0 right-0 mx-auto px-4 py-2 text-center z-50`}
    >
      <div className="bg-black/80 text-white px-4 py-3 rounded-md inline-block max-w-full shadow-lg border border-gray-700">
        <p className="text-sm md:text-base break-words font-medium">
          {displayText || "Parlez pour voir les sous-titres..."}
        </p>
        {language && (
          <span className="text-xs text-gray-300 block mt-1 font-bold">
            {language === 'fr' ? 'Français' : 'English'}
          </span>
        )}
      </div>
    </div>
  );
};

export default Subtitles;
