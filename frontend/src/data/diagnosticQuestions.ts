export interface Question {
  id: number;
  text: string;
  type: 'scale' | 'boolean' | 'multiple';
  options?: string[];
  category: 'primary' | 'secondary' | 'risk-factor';
  followUpQuestions?: number[]; // IDs of questions to ask if this answer is significant
  threshold?: number; // Minimum value to consider symptom significant
}

export interface Condition {
  id: number;
  name: string;
  description: string;
  symptoms: {
    required: Array<{
      questionId: number;
      minValue: number;
    }>;
    supporting: Array<{
      questionId: number;
      weight: number;
    }>;
  };
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
}

export const diagnosticQuestions: Question[] = [
  {
    id: 1,
    text: "How severe is your fever? (Rate from 0-10, where 0 is no fever and 10 is extremely high)",
    type: "scale",
    category: "primary",
    threshold: 5,
    followUpQuestions: [2, 3]
  },
  {
    id: 2,
    text: "How long have you had the fever?",
    type: "multiple",
    options: ["Less than 24 hours", "1-3 days", "More than 3 days"],
    category: "secondary"
  },
  {
    id: 3,
    text: "Rate your fatigue level (0-10)",
    type: "scale",
    category: "primary",
    threshold: 6
  },
  {
    id: 4,
    text: "How severe is your cough? (0-10)",
    type: "scale",
    category: "primary",
    threshold: 5,
    followUpQuestions: [5]
  },
  {
    id: 5,
    text: "What type of cough do you have?",
    type: "multiple",
    options: ["Dry cough", "Wet cough", "Both"],
    category: "secondary"
  },
  {
    id: 6,
    text: "Rate your difficulty breathing (0-10)",
    type: "scale",
    category: "primary",
    threshold: 4,
    followUpQuestions: [7]
  },
  {
    id: 7,
    text: "Do you have chest pain?",
    type: "boolean",
    category: "primary"
  },
  {
    id: 8,
    text: "Rate your headache severity (0-10)",
    type: "scale",
    category: "primary",
    threshold: 5
  },
  {
    id: 9,
    text: "Have you lost your sense of taste or smell?",
    type: "boolean",
    category: "primary"
  },
  {
    id: 10,
    text: "Do you have any pre-existing medical conditions?",
    type: "multiple",
    options: [
      "None",
      "Diabetes",
      "Heart disease",
      "Respiratory disease",
      "Immunocompromised",
      "Other"
    ],
    category: "risk-factor"
  }
];

export const conditions: Condition[] = [
  {
    id: 1,
    name: "Common Cold",
    description: "A viral infection of the upper respiratory tract",
    symptoms: {
      required: [
        { questionId: 4, minValue: 3 }, // Mild to moderate cough
      ],
      supporting: [
        { questionId: 1, weight: 0.3 }, // Mild fever
        { questionId: 3, weight: 0.3 }, // Mild fatigue
        { questionId: 8, weight: 0.2 }, // Mild headache
      ]
    },
    severity: "mild",
    recommendations: [
      "Rest and stay hydrated",
      "Over-the-counter cold medications may help",
      "Monitor symptoms for worsening"
    ],
    urgency: "routine"
  },
  {
    id: 2,
    name: "Influenza",
    description: "A viral infection that attacks your respiratory system",
    symptoms: {
      required: [
        { questionId: 1, minValue: 6 }, // High fever
        { questionId: 3, minValue: 7 }, // Severe fatigue
      ],
      supporting: [
        { questionId: 4, weight: 0.4 }, // Cough
        { questionId: 8, weight: 0.3 }, // Headache
      ]
    },
    severity: "moderate",
    recommendations: [
      "Get plenty of rest",
      "Stay hydrated",
      "Consider antiviral medications if diagnosed early",
      "Seek medical attention if symptoms worsen"
    ],
    urgency: "soon"
  },
  {
    id: 3,
    name: "COVID-19",
    description: "A viral respiratory illness caused by the SARS-CoV-2 virus",
    symptoms: {
      required: [
        { questionId: 9, minValue: 1 }, // Loss of taste/smell
      ],
      supporting: [
        { questionId: 1, weight: 0.4 }, // Fever
        { questionId: 4, weight: 0.3 }, // Cough
        { questionId: 6, weight: 0.5 }, // Difficulty breathing
        { questionId: 3, weight: 0.3 }, // Fatigue
      ]
    },
    severity: "severe",
    recommendations: [
      "Isolate immediately",
      "Contact healthcare provider",
      "Monitor oxygen levels if possible",
      "Seek emergency care if breathing becomes difficult"
    ],
    urgency: "urgent"
  }
];

export interface Answer {
  questionId: number;
  value: number | string | boolean;
}

export const analyzeSymptoms = (answers: Answer[]): {
  possibleConditions: Array<{
    condition: Condition;
    probability: number;
    matchedSymptoms: string[];
  }>;
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
} => {
  const results = conditions.map(condition => {
    let probability = 0;
    const matchedSymptoms = [];

    // Check required symptoms
    const hasAllRequired = condition.symptoms.required.every(req => {
      const answer = answers.find(a => a.questionId === req.questionId);
      if (answer && typeof answer.value === 'number' && answer.value >= req.minValue) {
        matchedSymptoms.push(diagnosticQuestions.find(q => q.id === req.questionId)?.text || '');
        return true;
      }
      return false;
    });

    if (!hasAllRequired) {
      return { condition, probability: 0, matchedSymptoms: [] };
    }

    // Calculate probability based on supporting symptoms
    condition.symptoms.supporting.forEach(support => {
      const answer = answers.find(a => a.questionId === support.questionId);
      if (answer && typeof answer.value === 'number') {
        probability += (answer.value / 10) * support.weight;
        if (answer.value >= 5) {
          matchedSymptoms.push(diagnosticQuestions.find(q => q.id === support.questionId)?.text || '');
        }
      }
    });

    // Normalize probability
    probability = Math.min(probability * 100, 100);

    return { condition, probability, matchedSymptoms };
  });

  // Filter and sort results
  const filteredResults = results
    .filter(r => r.probability > 20)
    .sort((a, b) => b.probability - a.probability);

  // Determine overall urgency
  const urgency = filteredResults.reduce((highest, current) => {
    const urgencyLevel = {
      'routine': 0,
      'soon': 1,
      'urgent': 2,
      'emergency': 3
    };
    return urgencyLevel[current.condition.urgency] > urgencyLevel[highest] 
      ? current.condition.urgency 
      : highest;
  }, 'routine' as const);

  return {
    possibleConditions: filteredResults,
    urgency
  };
}; 