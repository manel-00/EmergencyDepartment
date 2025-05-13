export interface Symptom {
  id: number;
  name: string;
  weight: number;  // Importance of the symptom
}

export interface Disease {
  id: number;
  name: string;
  description: string;
  symptoms: number[];  // Array of symptom IDs
  severity: 'mild' | 'moderate' | 'severe';
  precautions: string[];
}

// This is sample data from the Kaggle dataset - we'll replace with the full dataset
export const symptoms: Symptom[] = [
  { id: 1, name: "Fever", weight: 0.7 },
  { id: 2, name: "Cough", weight: 0.6 },
  { id: 3, name: "Fatigue", weight: 0.4 },
  { id: 4, name: "Difficulty Breathing", weight: 0.8 },
  { id: 5, name: "Loss of Taste or Smell", weight: 0.9 },
  { id: 6, name: "Body Aches", weight: 0.5 },
  { id: 7, name: "Headache", weight: 0.4 },
  { id: 8, name: "Sore Throat", weight: 0.5 },
  { id: 9, name: "Congestion", weight: 0.3 },
  { id: 10, name: "Nausea", weight: 0.4 }
];

export const diseases: Disease[] = [
  {
    id: 1,
    name: "Common Cold",
    description: "A viral infection of the upper respiratory tract",
    symptoms: [2, 8, 9],
    severity: "mild",
    precautions: [
      "Rest and stay hydrated",
      "Use over-the-counter medications",
      "Practice good hygiene",
      "Monitor symptoms"
    ]
  },
  {
    id: 2,
    name: "Influenza",
    description: "A viral infection that attacks your respiratory system",
    symptoms: [1, 2, 3, 6, 7],
    severity: "moderate",
    precautions: [
      "Get plenty of rest",
      "Stay hydrated",
      "Take fever-reducing medication",
      "Seek medical attention if symptoms worsen"
    ]
  },
  {
    id: 3,
    name: "COVID-19",
    description: "A viral respiratory illness caused by the SARS-CoV-2 virus",
    symptoms: [1, 2, 3, 4, 5],
    severity: "severe",
    precautions: [
      "Isolate immediately",
      "Contact healthcare provider",
      "Monitor oxygen levels",
      "Seek emergency care if breathing becomes difficult"
    ]
  }
];

export const calculateDiseaseMatch = (
  selectedSymptoms: number[],
  disease: Disease,
  allSymptoms: Symptom[]
): { 
  matchPercentage: number;
  matchedSymptoms: Symptom[];
  severity: string;
} => {
  const matchedSymptoms = disease.symptoms
    .filter(id => selectedSymptoms.includes(id))
    .map(id => allSymptoms.find(s => s.id === id)!)
    .filter(Boolean);

  const totalWeight = disease.symptoms
    .map(id => allSymptoms.find(s => s.id === id)?.weight || 0)
    .reduce((a, b) => a + b, 0);

  const matchedWeight = matchedSymptoms
    .reduce((sum, symptom) => sum + symptom.weight, 0);

  const matchPercentage = (matchedWeight / totalWeight) * 100;

  return {
    matchPercentage: Math.round(matchPercentage),
    matchedSymptoms,
    severity: disease.severity
  };
}; 