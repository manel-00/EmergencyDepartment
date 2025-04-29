import CryptoJS from 'crypto-js';

const API_URL = 'https://sandbox-healthservice.priaid.ch'; // Use production URL in production
const API_KEY = process.env.NEXT_PUBLIC_APIMEDIC_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_APIMEDIC_SECRET;

interface Symptom {
  ID: number;
  Name: string;
}

interface DiagnosisResult {
  Issue: {
    ID: number;
    Name: string;
    Accuracy: number;
    ProfName: string;
    Ranking: number;
  };
  Specialisation: Array<{
    ID: number;
    Name: string;
    SpecialistID: number;
  }>;
}

const generateToken = () => {
  const computedHash = CryptoJS.HmacMD5(API_URL, API_SECRET);
  const computedHashString = computedHash.toString(CryptoJS.enc.Base64);
  return computedHashString;
};

export const diagnosisService = {
  // Get list of all available symptoms
  async getSymptoms(): Promise<Symptom[]> {
    const token = generateToken();
    const response = await fetch(`${API_URL}/symptoms?token=${token}&language=en-gb`);
    return response.json();
  },

  // Search symptoms by name
  async searchSymptoms(searchTerm: string): Promise<Symptom[]> {
    const allSymptoms = await this.getSymptoms();
    return allSymptoms.filter(symptom => 
      symptom.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // Get diagnosis based on symptoms
  async getDiagnosis(symptoms: number[], gender: string, yearOfBirth: number): Promise<DiagnosisResult[]> {
    const token = generateToken();
    const response = await fetch(
      `${API_URL}/diagnosis?symptoms=${JSON.stringify(symptoms)}&gender=${gender}&year_of_birth=${yearOfBirth}&token=${token}&language=en-gb`
    );
    return response.json();
  }
}; 