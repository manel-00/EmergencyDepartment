// Ce service simule une API de traduction pour le développement
// Dans un environnement de production, vous devriez utiliser une vraie API comme Google Translate

type TranslationCache = {
  [key: string]: {
    [targetLang: string]: string;
  };
};

// Cache simple pour éviter de traduire plusieurs fois la même phrase
const translationCache: TranslationCache = {};

// Dictionnaire de traduction mot à mot pour la traduction générique
const wordDictionary: Record<string, Record<string, string>> = {
  'fr': {
    'en': {
      // Articles et déterminants
      'le': 'the', 'la': 'the', 'les': 'the', 'un': 'a', 'une': 'a', 'des': 'some', 'du': 'some', 'de': 'of', 'ce': 'this', 'cette': 'this', 'ces': 'these',

      // Pronoms
      'je': 'I', 'tu': 'you', 'il': 'he', 'elle': 'she', 'nous': 'we', 'vous': 'you', 'ils': 'they', 'elles': 'they',
      'mon': 'my', 'ma': 'my', 'mes': 'my', 'ton': 'your', 'ta': 'your', 'tes': 'your', 'son': 'his', 'sa': 'her', 'ses': 'his',
      'notre': 'our', 'nos': 'our', 'votre': 'your', 'vos': 'your', 'leur': 'their', 'leurs': 'their',
      'moi': 'me', 'toi': 'you', 'lui': 'him', 'eux': 'them',

      // Verbes communs
      'suis': 'am', 'es': 'are', 'est': 'is', 'sommes': 'are', 'êtes': 'are', 'sont': 'are',
      'ai': 'have', 'as': 'have', 'a': 'has', 'avons': 'have', 'avez': 'have', 'ont': 'have',
      'vais': 'go', 'vas': 'go', 'va': 'goes', 'allons': 'go', 'allez': 'go', 'vont': 'go',
      'fais': 'do', 'fait': 'does', 'faisons': 'do', 'faites': 'do', 'font': 'do',
      'dis': 'say', 'dit': 'says', 'disons': 'say', 'dites': 'say', 'disent': 'say',
      'vois': 'see', 'voit': 'sees', 'voyons': 'see', 'voyez': 'see', 'voient': 'see',
      'veux': 'want', 'veut': 'wants', 'voulons': 'want', 'voulez': 'want', 'veulent': 'want',
      'peux': 'can', 'peut': 'can', 'pouvons': 'can', 'pouvez': 'can', 'peuvent': 'can',
      'dois': 'must', 'doit': 'must', 'devons': 'must', 'devez': 'must', 'doivent': 'must',
      'sais': 'know', 'sait': 'knows', 'savons': 'know', 'savez': 'know', 'savent': 'know',
      'prends': 'take', 'prend': 'takes', 'prenons': 'take', 'prenez': 'take', 'prennent': 'take',
      'parle': 'speak', 'parles': 'speak', 'parlons': 'speak', 'parlez': 'speak', 'parlent': 'speak',
      'écoute': 'listen', 'écoutes': 'listen', 'écoutons': 'listen', 'écoutez': 'listen', 'écoutent': 'listen',
      'comprends': 'understand', 'comprend': 'understands', 'comprenons': 'understand', 'comprenez': 'understand', 'comprennent': 'understand',
      'aime': 'like', 'aimes': 'like', 'aimons': 'like', 'aimez': 'like', 'aiment': 'like',
      'pense': 'think', 'penses': 'think', 'pensons': 'think', 'pensez': 'think', 'pensent': 'think',
      'crois': 'believe', 'croit': 'believes', 'croyons': 'believe', 'croyez': 'believe', 'croient': 'believe',
      'viens': 'come', 'vient': 'comes', 'venons': 'come', 'venez': 'come', 'viennent': 'come',
      'mets': 'put', 'met': 'puts', 'mettons': 'put', 'mettez': 'put', 'mettent': 'put',
      'trouve': 'find', 'trouves': 'find', 'trouvons': 'find', 'trouvez': 'find', 'trouvent': 'find',
      'donne': 'give', 'donnes': 'give', 'donnons': 'give', 'donnez': 'give', 'donnent': 'give',
      'appelle': 'call', 'appelles': 'call', 'appelons': 'call', 'appelez': 'call', 'appellent': 'call',
      'essaie': 'try', 'essaies': 'try', 'essayons': 'try', 'essayez': 'try', 'essaient': 'try',
      'utilise': 'use', 'utilises': 'use', 'utilisons': 'use', 'utilisez': 'use', 'utilisent': 'use',
      'travaille': 'work', 'travailles': 'work', 'travaillons': 'work', 'travaillez': 'work', 'travaillent': 'work',
      'joue': 'play', 'joues': 'play', 'jouons': 'play', 'jouez': 'play', 'jouent': 'play',
      'regarde': 'look', 'regardes': 'look', 'regardons': 'look', 'regardez': 'look', 'regardent': 'look',
      'aide': 'help', 'aides': 'help', 'aidons': 'help', 'aidez': 'help', 'aident': 'help',
      'besoin': 'need',

      // Adverbes
      'très': 'very', 'bien': 'well', 'mal': 'badly', 'vite': 'quickly', 'lentement': 'slowly',
      'souvent': 'often', 'toujours': 'always', 'jamais': 'never', 'parfois': 'sometimes',
      'ici': 'here', 'là': 'there', 'maintenant': 'now', 'aujourd\'hui': 'today', 'demain': 'tomorrow', 'hier': 'yesterday',
      'beaucoup': 'a lot', 'peu': 'little', 'trop': 'too much', 'assez': 'enough',

      // Conjonctions
      'et': 'and', 'ou': 'or', 'mais': 'but', 'car': 'because', 'si': 'if', 'quand': 'when', 'comme': 'as', 'que': 'that',

      // Prépositions
      'à': 'to', 'de': 'from', 'pour': 'for', 'avec': 'with', 'sans': 'without', 'dans': 'in', 'sur': 'on', 'sous': 'under',
      'entre': 'between', 'devant': 'in front of', 'derrière': 'behind', 'après': 'after', 'avant': 'before',

      // Interrogatifs
      'qui': 'who', 'quoi': 'what', 'où': 'where', 'quand': 'when', 'comment': 'how', 'pourquoi': 'why', 'combien': 'how much',

      // Mots spécifiques au domaine médical
      'docteur': 'doctor', 'médecin': 'doctor', 'patient': 'patient', 'malade': 'sick', 'maladie': 'disease', 'symptôme': 'symptom',
      'douleur': 'pain', 'fièvre': 'fever', 'toux': 'cough', 'rhume': 'cold', 'grippe': 'flu', 'virus': 'virus',
      'infection': 'infection', 'blessé': 'injured', 'blessure': 'injury', 'sang': 'blood', 'coeur': 'heart', 'poumon': 'lung',
      'estomac': 'stomach', 'tête': 'head', 'bras': 'arm', 'jambe': 'leg', 'dos': 'back', 'pied': 'foot', 'main': 'hand',
      'oeil': 'eye', 'yeux': 'eyes', 'oreille': 'ear', 'nez': 'nose', 'bouche': 'mouth', 'dent': 'tooth', 'dents': 'teeth',
      'gorge': 'throat', 'peau': 'skin', 'os': 'bone', 'muscle': 'muscle',
      'hôpital': 'hospital', 'clinique': 'clinic', 'pharmacie': 'pharmacy', 'médicament': 'medication', 'traitement': 'treatment',
      'opération': 'surgery', 'urgence': 'emergency', 'ambulance': 'ambulance',

      // Salutations et expressions courantes
      'bonjour': 'hello', 'salut': 'hi', 'au revoir': 'goodbye', 'merci': 'thank you', 's\'il vous plaît': 'please',
      'excusez-moi': 'excuse me', 'pardon': 'sorry', 'oui': 'yes', 'non': 'no', 'd\'accord': 'okay',
      'comment ça va': 'how are you', 'ça va': 'fine', 'bien': 'good', 'mal': 'bad',
      'j\'ai': 'I have', 'j\'aime': 'I like', 'je n\'aime pas': 'I don\'t like',
      'je veux': 'I want', 'je ne veux pas': 'I don\'t want',
      'je peux': 'I can', 'je ne peux pas': 'I can\'t',
      'je suis': 'I am', 'je ne suis pas': 'I am not',
      'je sais': 'I know', 'je ne sais pas': 'I don\'t know',
      'je comprends': 'I understand', 'je ne comprends pas': 'I don\'t understand',
      'je parle': 'I speak', 'je ne parle pas': 'I don\'t speak',
      'aidez-moi': 'help me', 'au secours': 'help',

      // Mots spécifiques à la traduction
      'traduire': 'translate', 'traduction': 'translation', 'traduit': 'translates', 'traduise': 'translate',
      'anglais': 'English', 'français': 'French', 'langue': 'language',
      'mot': 'word', 'phrase': 'sentence', 'texte': 'text',
      'toute': 'all', 'tout': 'all', 'tous': 'all', 'toutes': 'all',
      'réplique': 'reply', 'message': 'message',
      'en': 'in'
    }
  },
  'en': {
    'fr': {
      // Articles et déterminants
      'the': 'le', 'a': 'un', 'an': 'un', 'some': 'des', 'this': 'ce', 'these': 'ces', 'that': 'ce', 'those': 'ces',

      // Pronoms
      'I': 'je', 'you': 'vous', 'he': 'il', 'she': 'elle', 'we': 'nous', 'they': 'ils',
      'my': 'mon', 'your': 'votre', 'his': 'son', 'her': 'sa', 'our': 'notre', 'their': 'leur',
      'me': 'moi', 'him': 'lui', 'them': 'eux',

      // Verbes communs
      'am': 'suis', 'is': 'est', 'are': 'sont', 'was': 'étais', 'were': 'étaient',
      'have': 'ai', 'has': 'a', 'had': 'avais',
      'do': 'fais', 'does': 'fait', 'did': 'ai fait',
      'go': 'vais', 'goes': 'va', 'went': 'suis allé',
      'say': 'dis', 'says': 'dit', 'said': 'ai dit',
      'see': 'vois', 'sees': 'voit', 'saw': 'ai vu',
      'want': 'veux', 'wants': 'veut', 'wanted': 'voulais',
      'can': 'peux', 'could': 'pouvais',
      'must': 'dois', 'should': 'devrais',
      'know': 'sais', 'knows': 'sait', 'knew': 'savais',
      'take': 'prends', 'takes': 'prend', 'took': 'ai pris',
      'speak': 'parle', 'speaks': 'parle', 'spoke': 'ai parlé',
      'listen': 'écoute', 'listens': 'écoute', 'listened': 'ai écouté',
      'understand': 'comprends', 'understands': 'comprend', 'understood': 'ai compris',
      'like': 'aime', 'likes': 'aime', 'liked': 'ai aimé',
      'think': 'pense', 'thinks': 'pense', 'thought': 'ai pensé',
      'believe': 'crois', 'believes': 'croit', 'believed': 'ai cru',
      'come': 'viens', 'comes': 'vient', 'came': 'suis venu',
      'put': 'mets', 'puts': 'met', 'put': 'ai mis',
      'find': 'trouve', 'finds': 'trouve', 'found': 'ai trouvé',
      'give': 'donne', 'gives': 'donne', 'gave': 'ai donné',
      'call': 'appelle', 'calls': 'appelle', 'called': 'ai appelé',
      'try': 'essaie', 'tries': 'essaie', 'tried': 'ai essayé',
      'use': 'utilise', 'uses': 'utilise', 'used': 'ai utilisé',
      'work': 'travaille', 'works': 'travaille', 'worked': 'ai travaillé',
      'play': 'joue', 'plays': 'joue', 'played': 'ai joué',
      'look': 'regarde', 'looks': 'regarde', 'looked': 'ai regardé',
      'help': 'aide', 'helps': 'aide', 'helped': 'ai aidé',
      'need': 'besoin',

      // Adverbes
      'very': 'très', 'well': 'bien', 'badly': 'mal', 'quickly': 'vite', 'slowly': 'lentement',
      'often': 'souvent', 'always': 'toujours', 'never': 'jamais', 'sometimes': 'parfois',
      'here': 'ici', 'there': 'là', 'now': 'maintenant', 'today': 'aujourd\'hui', 'tomorrow': 'demain', 'yesterday': 'hier',
      'a lot': 'beaucoup', 'little': 'peu', 'too much': 'trop', 'enough': 'assez',

      // Conjonctions
      'and': 'et', 'or': 'ou', 'but': 'mais', 'because': 'car', 'if': 'si', 'when': 'quand', 'as': 'comme', 'that': 'que',

      // Prépositions
      'to': 'à', 'from': 'de', 'for': 'pour', 'with': 'avec', 'without': 'sans', 'in': 'dans', 'on': 'sur', 'under': 'sous',
      'between': 'entre', 'in front of': 'devant', 'behind': 'derrière', 'after': 'après', 'before': 'avant',

      // Interrogatifs
      'who': 'qui', 'what': 'quoi', 'where': 'où', 'when': 'quand', 'how': 'comment', 'why': 'pourquoi', 'how much': 'combien',

      // Mots spécifiques au domaine médical
      'doctor': 'docteur', 'patient': 'patient', 'sick': 'malade', 'disease': 'maladie', 'symptom': 'symptôme',
      'pain': 'douleur', 'fever': 'fièvre', 'cough': 'toux', 'cold': 'rhume', 'flu': 'grippe', 'virus': 'virus',
      'infection': 'infection', 'injured': 'blessé', 'injury': 'blessure', 'blood': 'sang', 'heart': 'coeur', 'lung': 'poumon',
      'stomach': 'estomac', 'head': 'tête', 'arm': 'bras', 'leg': 'jambe', 'back': 'dos', 'foot': 'pied', 'hand': 'main',
      'eye': 'oeil', 'eyes': 'yeux', 'ear': 'oreille', 'nose': 'nez', 'mouth': 'bouche', 'tooth': 'dent', 'teeth': 'dents',
      'throat': 'gorge', 'skin': 'peau', 'bone': 'os', 'muscle': 'muscle',
      'hospital': 'hôpital', 'clinic': 'clinique', 'pharmacy': 'pharmacie', 'medication': 'médicament', 'treatment': 'traitement',
      'surgery': 'opération', 'emergency': 'urgence', 'ambulance': 'ambulance',

      // Salutations et expressions courantes
      'hello': 'bonjour', 'hi': 'salut', 'goodbye': 'au revoir', 'thank you': 'merci', 'please': 's\'il vous plaît',
      'excuse me': 'excusez-moi', 'sorry': 'pardon', 'yes': 'oui', 'no': 'non', 'okay': 'd\'accord',
      'how are you': 'comment ça va', 'fine': 'ça va', 'good': 'bien', 'bad': 'mal',
      'I have': 'j\'ai', 'I like': 'j\'aime', 'I don\'t like': 'je n\'aime pas',
      'I want': 'je veux', 'I don\'t want': 'je ne veux pas',
      'I can': 'je peux', 'I can\'t': 'je ne peux pas',
      'I am': 'je suis', 'I am not': 'je ne suis pas',
      'I know': 'je sais', 'I don\'t know': 'je ne sais pas',
      'I understand': 'je comprends', 'I don\'t understand': 'je ne comprends pas',
      'I speak': 'je parle', 'I don\'t speak': 'je ne parle pas',
      'help me': 'aidez-moi', 'help': 'au secours',

      // Mots spécifiques à la traduction
      'translate': 'traduire', 'translation': 'traduction', 'translates': 'traduit',
      'English': 'anglais', 'French': 'français', 'language': 'langue',
      'word': 'mot', 'sentence': 'phrase', 'text': 'texte',
      'all': 'tout', 'reply': 'réplique', 'message': 'message',
      'in': 'en'
    }
  }
};

// Simulation de traduction - à remplacer par une vraie API en production
const mockTranslations: Record<string, Record<string, string>> = {
  "fr": {
    "en": {
      "bonjour": "hello",
      "docteur": "doctor",
      "comment allez-vous": "how are you",
      "comment ça va": "how are you",
      "je veux": "I want",
      "qu'elle": "that it",
      "traduise": "translates",
      "traduit": "translates",
      "toute": "all",
      "la": "the",
      "réplique": "reply",
      "en anglais": "in English",
      "je ne me sens pas bien": "I don't feel well",
      "j'ai mal à la tête": "I have a headache",
      "j'ai de la fièvre": "I have a fever",
      "depuis quand avez-vous ces symptômes": "since when do you have these symptoms",
      "prenez-vous des médicaments": "are you taking any medication",
      "avez-vous des allergies": "do you have any allergies",
      "je vais vous prescrire": "I will prescribe you",
      "merci": "thank you",
      "au revoir": "goodbye",
      "bonjour docteur": "hello doctor",
      "bonjour docteur bonjour docteur bonjour docteur bonjour docteur": "hello doctor hello doctor hello doctor hello doctor",
      "bonjour docteur comment ça va je veux qu'elle traduise toute la réplique en anglais": "hello doctor how are you I want it to translate all the reply in English",
      "je ne me sens pas très bien depuis plusieurs jours": "I haven't been feeling well for several days",
      "quels sont vos symptômes exactement pouvez-vous me décrire la douleur": "what are your exact symptoms can you describe the pain",
      "j'ai de la fièvre et mal à la gorge depuis trois jours": "I have a fever and a sore throat for three days",
      "depuis combien de temps avez-vous ces symptômes et avez-vous pris des médicaments": "how long have you had these symptoms and have you taken any medication",
      "depuis deux jours environ et j'ai pris du paracétamol": "for about two days and I took some paracetamol",
      "comment vous sentez-vous aujourd'hui": "how are you feeling today",
      "j'ai besoin d'aide": "I need help",
      "j'ai besoin": "I need",
      "besoin": "need",
      "de toi": "you",
      "j'ai besoin de toi": "I need you",
      "pouvez-vous m'aider": "can you help me",
      "je vous écoute": "I'm listening",
      "je comprends": "I understand",
      "c'est normal": "it's normal",
      "ne vous inquiétez pas": "don't worry",
      "prenez ce médicament": "take this medication",
      "revenez me voir dans": "come back to see me in",
      "avez-vous des questions": "do you have any questions",
      "je vous remercie": "thank you",
      "à bientôt": "see you soon"
    }
  },
  "en": {
    "fr": {
      "hello": "bonjour",
      "doctor": "docteur",
      "how are you": "comment allez-vous",
      "i want": "je veux",
      "that it": "qu'elle",
      "translates": "traduise",
      "all": "toute",
      "the": "la",
      "reply": "réplique",
      "in english": "en anglais",
      "in french": "en français",
      "i don't feel well": "je ne me sens pas bien",
      "i have a headache": "j'ai mal à la tête",
      "i have a fever": "j'ai de la fièvre",
      "since when do you have these symptoms": "depuis quand avez-vous ces symptômes",
      "are you taking any medication": "prenez-vous des médicaments",
      "do you have any allergies": "avez-vous des allergies",
      "i will prescribe you": "je vais vous prescrire",
      "thank you": "merci",
      "goodbye": "au revoir",
      "hello doctor": "bonjour docteur",
      "hello doctor hello doctor hello doctor hello doctor": "bonjour docteur bonjour docteur bonjour docteur bonjour docteur",
      "hello doctor how are you I want it to translate all the reply in English": "bonjour docteur comment ça va je veux qu'elle traduise toute la réplique en anglais",
      "hello doctor how are you I want it to translate all the reply in French": "bonjour docteur comment ça va je veux qu'elle traduise toute la réplique en français",
      "I haven't been feeling well for several days": "je ne me sens pas très bien depuis plusieurs jours",
      "what are your exact symptoms can you describe the pain": "quels sont vos symptômes exactement pouvez-vous me décrire la douleur",
      "I have a fever and a sore throat for three days": "j'ai de la fièvre et mal à la gorge depuis trois jours",
      "how long have you had these symptoms and have you taken any medication": "depuis combien de temps avez-vous ces symptômes et avez-vous pris des médicaments",
      "for about two days and I took some paracetamol": "depuis deux jours environ et j'ai pris du paracétamol",
      "how are you feeling today": "comment vous sentez-vous aujourd'hui",
      "i need help": "j'ai besoin d'aide",
      "i need": "j'ai besoin",
      "need": "besoin",
      "you": "de toi",
      "i need you": "j'ai besoin de toi",
      "can you help me": "pouvez-vous m'aider",
      "i'm listening": "je vous écoute",
      "i understand": "je comprends",
      "it's normal": "c'est normal",
      "don't worry": "ne vous inquiétez pas",
      "take this medication": "prenez ce médicament",
      "come back to see me in": "revenez me voir dans",
      "do you have any questions": "avez-vous des questions",
      "thank you": "je vous remercie",
      "see you soon": "à bientôt"
    }
  }
};

// Fonction pour traduire du texte
export const translateText = async (
  text: string,
  sourceLang: string = 'fr',
  targetLang: string = 'en'
): Promise<string> => {
  // Si le texte est vide, retourner une chaîne vide
  if (!text || text.trim() === '') {
    return '';
  }

  // Vérifier si la traduction est dans le cache
  if (translationCache[text]?.[targetLang]) {
    return translationCache[text][targetLang];
  }

  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 50)); // Délai réduit pour une réponse plus rapide

  // Normaliser le texte pour la recherche (minuscules, sans ponctuation)
  const normalizedText = text.toLowerCase().replace(/[.,?!;:]/g, '');

  // Vérifier si nous avons une traduction prédéfinie exacte
  if (mockTranslations[sourceLang]?.[targetLang]?.[normalizedText]) {
    const translation = mockTranslations[sourceLang][targetLang][normalizedText];

    // Mettre en cache
    if (!translationCache[text]) {
      translationCache[text] = {};
    }
    translationCache[text][targetLang] = translation;

    return translation;
  }

  // Utiliser la traduction mot à mot pour une traduction générique
  const words = normalizedText.split(' ');
  let translatedParts: string[] = [];

  // Essayer d'abord de traduire la phrase entière avec le dictionnaire prédéfini
  if (mockTranslations[sourceLang]?.[targetLang]?.[normalizedText]) {
    return mockTranslations[sourceLang][targetLang][normalizedText];
  }

  // Traduire mot par mot en utilisant le dictionnaire générique
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();

    // Essayer d'abord les expressions de plusieurs mots
    let foundMultiWord = false;
    for (let j = 5; j > 1; j--) { // Essayer des expressions de 5, 4, 3, 2 mots
      if (i + j <= words.length) {
        const phrase = words.slice(i, i + j).join(' ').toLowerCase();
        if (wordDictionary[sourceLang]?.[targetLang]?.[phrase]) {
          translatedParts.push(wordDictionary[sourceLang][targetLang][phrase]);
          i += j - 1; // Avancer dans le tableau de mots
          foundMultiWord = true;
          break;
        }
      }
    }

    if (foundMultiWord) continue;

    // Essayer de traduire avec le dictionnaire prédéfini
    if (mockTranslations[sourceLang]?.[targetLang]?.[word]) {
      translatedParts.push(mockTranslations[sourceLang][targetLang][word]);
    }
    // Sinon, essayer avec le dictionnaire générique
    else if (wordDictionary[sourceLang]?.[targetLang]?.[word]) {
      translatedParts.push(wordDictionary[sourceLang][targetLang][word]);
    }
    // Si pas de traduction, garder le mot original
    else {
      translatedParts.push(words[i]);
    }
  }

  // Joindre les parties traduites
  let translation = translatedParts.join(' ');

  // Capitaliser la première lettre
  translation = translation.charAt(0).toUpperCase() + translation.slice(1);

  // Nettoyer la traduction (supprimer les espaces multiples)
  translation = translation.replace(/\s+/g, ' ').trim();

  // Mettre en cache
  if (!translationCache[text]) {
    translationCache[text] = {};
  }
  translationCache[text][targetLang] = translation;

  console.log(`Traduction de "${text}" (${sourceLang} -> ${targetLang}): "${translation}"`);
  return translation;
};

// Fonction pour détecter la langue (simulation)
export const detectLanguage = async (text: string): Promise<string> => {
  if (!text || text.trim() === '') {
    return 'fr'; // Langue par défaut
  }

  // Simulation simple - en production, utilisez une API de détection de langue
  const frenchWords = ['bonjour', 'merci', 'salut', 'oui', 'non', 'je', 'tu', 'nous', 'vous',
    'docteur', 'comment', 'allez', 'bien', 'mal', 'tête', 'fièvre', 'depuis', 'quand',
    'symptômes', 'prenez', 'médicaments', 'allergies', 'prescrire', 'revoir', 'inquiétez',
    'j\'ai', 'besoin', 'de', 'toi', 'avez', 'ces', 'pour', 'avec', 'sans', 'mais', 'et'];

  const englishWords = ['hello', 'thank', 'you', 'yes', 'no', 'i', 'we', 'they', 'he', 'she',
    'doctor', 'how', 'are', 'good', 'bad', 'head', 'fever', 'since', 'when',
    'symptoms', 'take', 'medicine', 'allergies', 'prescribe', 'see', 'worry',
    'need', 'have', 'has', 'had', 'these', 'for', 'with', 'without', 'but', 'and'];

  const lowerText = text.toLowerCase();

  let frenchWordCount = 0;
  let englishWordCount = 0;

  for (const word of frenchWords) {
    if (lowerText.includes(word)) {
      frenchWordCount++;
    }
  }

  for (const word of englishWords) {
    if (lowerText.includes(word)) {
      englishWordCount++;
    }
  }

  console.log(`Détection de langue: mots français=${frenchWordCount}, mots anglais=${englishWordCount}`);

  // Si plus de mots français que de mots anglais, considérer comme du français
  if (frenchWordCount > englishWordCount) {
    return 'fr';
  }

  // Si plus de mots anglais que de mots français, considérer comme de l'anglais
  if (englishWordCount > frenchWordCount) {
    return 'en';
  }

  // Si égalité, vérifier les premiers mots
  if (lowerText.startsWith('bonjour') || lowerText.startsWith('salut') || lowerText.startsWith('je') || lowerText.startsWith('j\'ai')) {
    return 'fr';
  }

  if (lowerText.startsWith('hello') || lowerText.startsWith('hi') || lowerText.startsWith('i ')) {
    return 'en';
  }

  return 'fr'; // Par défaut, retourner français
};

export default {
  translateText,
  detectLanguage
};
