export interface Symptom {
  id: number;
  name: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Condition {
  id: number;
  name: string;
  symptoms: number[];
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
}

export const symptoms: Symptom[] = [
  { id: 1, name: "Fever", severity: "medium" },
  { id: 2, name: "Cough", severity: "low" },
  { id: 3, name: "Fatigue", severity: "low" },
  { id: 4, name: "Difficulty Breathing", severity: "high" },
  { id: 5, name: "Headache", severity: "medium" },
  { id: 6, name: "Sore Throat", severity: "low" },
  { id: 7, name: "Body Aches", severity: "medium" },
  { id: 8, name: "Loss of Taste/Smell", severity: "medium" },
  { id: 9, name: "Nausea", severity: "medium" },
  { id: 10, name: "Diarrhea", severity: "medium" }
];

export const conditions: Condition[] = [
  {
    id: 1,
    name: "Common Cold",
    symptoms: [2, 3, 5, 6],
    severity: "low",
    description: "A viral infection of the upper respiratory tract",
    recommendations: [
      "Rest and stay hydrated",
      "Over-the-counter cold medications may help",
      "Monitor symptoms for worsening"
    ]
  },
  {
    id: 2,
    name: "Flu",
    symptoms: [1, 2, 3, 5, 7],
    severity: "medium",
    description: "A viral infection that attacks your respiratory system",
    recommendations: [
      "Get plenty of rest",
      "Stay hydrated",
      "Consider antiviral medications if diagnosed early",
      "Seek medical attention if symptoms worsen"
    ]
  },
  {
    id: 3,
    name: "COVID-19",
    symptoms: [1, 2, 3, 4, 8],
    severity: "high",
    description: "A viral respiratory illness caused by the SARS-CoV-2 virus",
    recommendations: [
      "Isolate immediately",
      "Contact healthcare provider",
      "Monitor oxygen levels if possible",
      "Seek emergency care if breathing becomes difficult"
    ]
  },
  {
    id: 4,
    name: "Gastroenteritis",
    symptoms: [1, 3, 9, 10],
    severity: "medium",
    description: "Inflammation of the digestive system, often caused by a virus",
    recommendations: [
      "Stay hydrated with clear fluids",
      "Rest and eat bland foods",
      "Seek medical attention if severe dehydration occurs",
      "Gradually return to normal diet"
    ]
  }
];

export const calculateConditionProbability = (
  selectedSymptomIds: number[],
  condition: Condition
): number => {
  const matchingSymptoms = condition.symptoms.filter(id => 
    selectedSymptomIds.includes(id)
  );
  
  const probability = (matchingSymptoms.length / condition.symptoms.length) * 100;
  return Math.round(probability);
};

export const getSeverityLevel = (probability: number): 'low' | 'medium' | 'high' => {
  if (probability >= 75) return 'high';
  if (probability >= 40) return 'medium';
  return 'low';
}; 