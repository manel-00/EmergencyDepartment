'use client';

import React, { useState } from 'react';
import Breadcrumb from "@/components/Common/Breadcrumb";
import Image from 'next/image';

interface Question {
  id: number;
  text: string;
  category: string;
  relatedSymptoms: string[];
  type: 'yes_no' | 'scale' | 'multiple';
  options?: string[];
  context?: string;
}

interface TestCase {
  name: string;
  description: string;
  answers: { [questionId: number]: string[] };
  expectedSymptoms: string[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "Are you experiencing any injuries or physical trauma?",
    category: "Injuries",
    context: "Trauma assessment",
    relatedSymptoms: ['Cuts', 'Abrasions', 'Bruises', 'Wound', 'Broken Toe', 'Fracture', 'Head Injury'],
    type: 'multiple',
    options: ['Cuts/Abrasions', 'Bruises', 'Broken Bone/Fracture', 'Head Injury', 'None']
  },
  {
    id: 2,
    text: "What symptoms are you experiencing related to temperature or exposure?",
    category: "Temperature",
    context: "Environmental conditions",
    relatedSymptoms: ['Fever', 'Frost bite', 'Heat Exhaustion', 'Heat Stroke', 'Sun Burn', 'Headache', 'Dizziness'],
    type: 'multiple',
    options: ['Fever', 'Frost Bite', 'Heat Related', 'Sunburn', 'Headache', 'None']
  },
  {
    id: 3,
    text: "Are you having any of these respiratory or cold-related symptoms?",
    category: "Respiratory",
    context: "Respiratory assessment",
    relatedSymptoms: ['Nasal Congestion', 'Cough', 'Sore Throat', 'Cold', 'Fever', 'Headache'],
    type: 'multiple',
    options: ['Nasal Congestion', 'Cough', 'Sore Throat', 'Fever', 'None']
  },
  {
    id: 4,
    text: "Do you have any of these digestive or abdominal symptoms?",
    category: "Digestive",
    context: "Gastrointestinal assessment",
    relatedSymptoms: ['Gastrointestinal problems', 'Abdonominal Pain', 'Diarrhea', 'Rectal bleeding', 'Nausea', 'Poison'],
    type: 'multiple',
    options: ['Stomach Pain', 'Diarrhea', 'Rectal Bleeding', 'Nausea', 'None']
  },
  {
    id: 5,
    text: "Have you experienced any bites, stings, or skin reactions?",
    category: "Skin and Bites",
    context: "Skin and exposure assessment",
    relatedSymptoms: ['stings', 'Insect Bites', 'snake bite', 'animal bite', 'Rash', 'Skin problems', 'Chemical Burn'],
    type: 'multiple',
    options: ['Insect Bite/Sting', 'Snake Bite', 'Animal Bite', 'Rash', 'Chemical Burn', 'None']
  },
  {
    id: 6,
    text: "Are you experiencing any head or neurological symptoms?",
    category: "Neurological",
    context: "Neurological assessment",
    relatedSymptoms: ['Vertigo', 'Head Injury', 'Headache', 'Fainting', 'seizure', 'Dizziness'],
    type: 'multiple',
    options: ['Headache', 'Dizziness/Vertigo', 'Head Injury', 'Seizure', 'Fainting', 'None']
  },
  {
    id: 7,
    text: "Are you experiencing any muscle or joint-related problems?",
    category: "Musculoskeletal",
    context: "Physical strain assessment",
    relatedSymptoms: ['Sprains', 'Strains', 'Pulled Muscle', 'Broken Toe', 'Fracture'],
    type: 'multiple',
    options: ['Muscle Strain', 'Joint Pain', 'Broken Bone/Fracture', 'None']
  },
  {
    id: 8,
    text: "Are you experiencing any emergency or severe conditions?",
    category: "Emergency",
    context: "Emergency assessment",
    relatedSymptoms: ['Choking', 'Drowning', 'CPR', 'Poison', 'Head Injury', 'seizure', 'Chemical Burn'],
    type: 'multiple',
    options: ['Choking', 'Drowning', 'Poison Exposure', 'Severe Head Injury', 'None']
  },
  {
    id: 9,
    text: "Do you have any bleeding or wound-related issues?",
    category: "Bleeding",
    context: "Bleeding assessment",
    relatedSymptoms: ['Cuts', 'Wound', 'nose bleed', 'Normal Bleeding', 'Rectal bleeding'],
    type: 'multiple',
    options: ['Cuts/Wounds', 'Nose Bleed', 'Other Bleeding', 'None']
  },
  {
    id: 10,
    text: "Are you experiencing any sensory organ problems?",
    category: "Sensory",
    context: "Sensory assessment",
    relatedSymptoms: ['Eye Injury', 'Teeth', 'Vertigo', 'Chemical Burn'],
    type: 'multiple',
    options: ['Eye Problems', 'Dental Issues', 'Vision/Balance Issues', 'None']
  }
];

const symptomMappings: { [key: string]: string[] } = {
  'Cuts/Wounds': ['Cuts', 'Wound'],
  'Broken Bone/Fracture': ['Broken Toe', 'Fracture'],
  'Heat Related': ['Heat Exhaustion', 'Heat Stroke'],
  'Muscle Strain': ['Sprains', 'Strains', 'Pulled Muscle'],
  'Stomach Pain': ['Gastrointestinal problems', 'Abdonominal Pain'],
  'Insect Bite/Sting': ['stings', 'Insect Bites'],
  'Dizziness/Vertigo': ['Vertigo', 'Dizziness'],
  'Vision/Balance Issues': ['Vertigo', 'Eye Injury'],
  'Eye Problems': ['Eye Injury'],
  'Dental Issues': ['Teeth'],
  'Other Bleeding': ['Normal Bleeding', 'Rectal bleeding']
};

const testCases: TestCase[] = [
  {
    name: "Sports Injury Case",
    description: "A person who got injured during a basketball game",
    answers: {
      1: ['Bruises', 'Cuts/Abrasions'],           // Injuries question
      2: ['None'],                                // Temperature question
      3: ['None'],                                // Respiratory question
      4: ['None'],                                // Digestive question
      5: ['None'],                                // Skin and Bites question
      6: ['None'],                                // Neurological question
      7: ['Muscle Strain', 'Joint Pain'],         // Musculoskeletal question
      8: ['None'],                                // Emergency question
      9: ['Cuts/Wounds'],                         // Bleeding question
      10: ['None']                                // Sensory question
    },
    expectedSymptoms: ['Bruises', 'Cuts', 'Abrasions', 'Sprains', 'Strains', 'Pulled Muscle', 'Wound']
  },
  {
    name: "Flu-like Symptoms Case",
    description: "A person with typical flu symptoms",
    answers: {
      1: ['None'],                                // Injuries question
      2: ['Fever', 'Headache'],                   // Temperature question
      3: ['Nasal Congestion', 'Cough', 'Sore Throat', 'Fever'], // Respiratory question
      4: ['Nausea'],                              // Digestive question
      5: ['None'],                                // Skin and Bites question
      6: ['Headache', 'Dizziness/Vertigo'],       // Neurological question
      7: ['None'],                                // Musculoskeletal question
      8: ['None'],                                // Emergency question
      9: ['None'],                                // Bleeding question
      10: ['None']                                // Sensory question
    },
    expectedSymptoms: ['Fever', 'Headache', 'Nasal Congestion', 'Cough', 'Sore Throat', 'Cold', 'Vertigo', 'Dizziness']
  },
  {
    name: "Emergency Trauma Case",
    description: "A person who had a serious accident",
    answers: {
      1: ['Head Injury', 'Broken Bone/Fracture', 'Cuts/Abrasions'], // Injuries question
      2: ['None'],                                // Temperature question
      3: ['None'],                                // Respiratory question
      4: ['None'],                                // Digestive question
      5: ['None'],                                // Skin and Bites question
      6: ['Head Injury', 'Dizziness/Vertigo', 'Fainting'], // Neurological question
      7: ['Broken Bone/Fracture'],                // Musculoskeletal question
      8: ['Severe Head Injury'],                  // Emergency question
      9: ['Cuts/Wounds'],                         // Bleeding question
      10: ['Vision/Balance Issues']               // Sensory question
    },
    expectedSymptoms: ['Head Injury', 'Broken Toe', 'Fracture', 'Cuts', 'Abrasions', 'Vertigo', 'Dizziness', 'Fainting', 'Wound', 'Eye Injury']
  }
];

const DiagnosisPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [identifiedSymptoms, setIdentifiedSymptoms] = useState<Set<string>>(new Set());
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string[] }>({});
  const [apiResponse, setApiResponse] = useState<any>(null);

  const sendSymptomsToBackend = async (symptoms: string[]) => {
    try {
      const response = await fetch('http://localhost:3000/api/analyze-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptoms.join(', ') }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }
      
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error('Error sending symptoms to backend:', error);
    }
  };

  const handleOptionSelect = (option: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    let selectedOptions: string[];

    if (option === 'None') {
      selectedOptions = ['None'];
    } else {
      const currentAnswers = selectedAnswers[currentQuestion.id] || [];
      selectedOptions = [option]; // Only keep the current selection
    }

    // Update selected answers
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: selectedOptions
    });

    // Update symptoms
    const newSymptoms = new Set(identifiedSymptoms);
    selectedOptions.forEach(opt => {
      if (opt !== 'None') {
        if (symptomMappings[opt]) {
          symptomMappings[opt].forEach(symptom => newSymptoms.add(symptom));
        } else if (currentQuestion.relatedSymptoms.includes(opt)) {
          newSymptoms.add(opt);
        }
      }
    });
    setIdentifiedSymptoms(newSymptoms);

    // Immediately move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      const symptomsArray = Array.from(newSymptoms);
      console.log('Identified Symptoms:', symptomsArray);
      // Send symptoms to backend when quiz is completed
      sendSymptomsToBackend(symptomsArray);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <Breadcrumb
        pageName="Symptom Assessment For First Aid"
        description="Answer these questions to help us identify your symptoms"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Quiz Section */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {!quizCompleted ? (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">{currentQuestion.context}</p>
                    <p className="text-lg mb-4">{currentQuestion.text}</p>
                    
                    <div className="space-y-2">
                      {currentQuestion.options?.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleOptionSelect(option)}
                          className={`w-full p-3 text-left border rounded-md hover:bg-gray-50 
                            flex items-center justify-between
                            ${selectedAnswers[currentQuestion.id]?.includes(option)
                              ? 'bg-blue-50 border-blue-500'
                              : 'hover:border-gray-400'
                            }`}
                        >
                          <span>{option}</span>
                          {selectedAnswers[currentQuestion.id]?.includes(option) && (
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex justify-between">
                      {currentQuestionIndex > 0 && (
                        <button
                          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          Previous
                        </button>
                      )}
                      <button
                        onClick={() => handleOptionSelect('None')}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md ml-auto"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-4">Assessment Complete</h2>
                  
                

                  {apiResponse && (
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-medium">Analysis Results:</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {apiResponse.responses.map((response: string, index: number) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <p className="text-gray-800 flex-1">{response}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setIdentifiedSymptoms(new Set());
                      setSelectedAnswers({});
                      setQuizCompleted(false);
                      setApiResponse(null);
                    }}
                    className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
                  >
                    Start New Assessment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* First Aid Kit Image */}
          <div className="w-full md:w-1/3">
            <div className="sticky top-8">
              <div className="relative w-full h-[500px]">
                <Image
                  src="/firstaidkit.PNG"
                  alt="First Aid Kit"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-lg shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiagnosisPage;
