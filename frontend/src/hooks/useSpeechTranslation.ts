"use client";

import { useState, useEffect, useCallback } from 'react';
import { translateText, detectLanguage } from '@/services/translationService';

// Essayer d'importer react-speech-recognition, mais utiliser une version de démonstration si ça échoue
let SpeechRecognition: any;
let useSpeechRecognition: any;

try {
  // Essayer d'importer dynamiquement
  const speechModule = require('react-speech-recognition');
  SpeechRecognition = speechModule.default;
  useSpeechRecognition = speechModule.useSpeechRecognition;
  console.log('Module react-speech-recognition chargé avec succès');
} catch (error) {
  console.warn('Module react-speech-recognition non disponible, utilisation du mode démo', error);

  // Créer des versions factices pour le mode démo
  useSpeechRecognition = () => {
    const [demoTranscript, setDemoTranscript] = useState('');

    // Simuler des transcriptions aléatoires pour la démo
    useEffect(() => {
      const demoTexts = [
        "Bonjour, comment allez-vous aujourd'hui ?",
        "Je ne me sens pas très bien.",
        "Quels sont vos symptômes ?",
        "J'ai de la fièvre et mal à la gorge.",
        "Depuis combien de temps avez-vous ces symptômes ?",
        "Depuis deux jours environ.",
        "Avez-vous pris des médicaments ?",
        "Juste du paracétamol, mais ça n'a pas beaucoup aidé."
      ];

      const interval = setInterval(() => {
        const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
        setDemoTranscript(randomText);
      }, 5000); // Changer toutes les 5 secondes

      return () => clearInterval(interval);
    }, []);

    return {
      transcript: demoTranscript,
      listening: true,
      browserSupportsSpeechRecognition: false,
      resetTranscript: () => setDemoTranscript('')
    };
  };

  SpeechRecognition = {
    startListening: () => console.log('Démo: démarrage de lécoute'),
    stopListening: () => console.log('Démo: arrêt de lécoute'),
    abortListening: () => console.log('Démo: abandon de lécoute')
  };
}

interface UseSpeechTranslationProps {
  sourceLang?: string;
  targetLang?: string;
  autoStart?: boolean;
  continuous?: boolean;
}

interface UseSpeechTranslationReturn {
  transcript: string;
  translatedText: string;
  isListening: boolean;
  isSpeechSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  detectedLanguage: string;
}

const useSpeechTranslation = ({
  sourceLang = 'fr',
  targetLang = 'en',
  autoStart = false,
  continuous = true,
}: UseSpeechTranslationProps = {}): UseSpeechTranslationReturn => {
  const [translatedText, setTranslatedText] = useState('');
  const [currentSourceLang, setCurrentSourceLang] = useState(sourceLang);
  const [currentTargetLang, setCurrentTargetLang] = useState(targetLang);
  const [detectedLanguage, setDetectedLanguage] = useState(sourceLang);
  const [translationTimeout, setTranslationTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Fonction pour démarrer l'écoute
  const startListening = useCallback(() => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({
        continuous,
        language: currentSourceLang === 'fr' ? 'fr-FR' : 'en-US',
      });
    }
  }, [browserSupportsSpeechRecognition, continuous, currentSourceLang]);

  // Fonction pour arrêter l'écoute
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  // Démarrer automatiquement si autoStart est true
  useEffect(() => {
    if (autoStart) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [autoStart, startListening, stopListening]);

  // Traduire le texte lorsque le transcript change
  useEffect(() => {
    if (!transcript) {
      setTranslatedText('');
      return;
    }

    // Annuler le timeout précédent pour éviter trop de requêtes
    if (translationTimeout) {
      clearTimeout(translationTimeout);
    }

    // Définir un nouveau timeout pour traduire après un court délai
    const timeout = setTimeout(async () => {
      try {
        console.log('Translating text:', transcript);

        // Détecter la langue (en production)
        const detected = await detectLanguage(transcript);
        console.log('Detected language:', detected);
        setDetectedLanguage(detected);

        // Déterminer la langue cible en fonction de la langue détectée
        const targetLang = detected === 'fr' ? 'en' : 'fr';
        console.log('Target language:', targetLang);

        // Nettoyer le texte avant de le traduire (enlever les espaces multiples, etc.)
        const cleanedTranscript = transcript.replace(/\s+/g, ' ').trim();

        // Traduire le texte
        const translated = await translateText(
          cleanedTranscript,
          detected,
          targetLang
        );
        console.log('Translated text:', translated);

        // Ajouter un préfixe de langue pour le débogage
        // const prefixedTranslation = `[${targetLang}] ${translated}`;
        // setTranslatedText(prefixedTranslation);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
      }
    }, 100); // Délai réduit à 100ms pour une réaction encore plus rapide

    setTranslationTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [transcript]);

  return {
    transcript,
    translatedText,
    isListening: listening,
    isSpeechSupported: browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    resetTranscript,
    setSourceLang: setCurrentSourceLang,
    setTargetLang: setCurrentTargetLang,
    detectedLanguage,
  };
};

export default useSpeechTranslation;
