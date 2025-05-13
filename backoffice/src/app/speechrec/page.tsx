'use client';
import { useState } from 'react';

export default function SpeechRecPage() {
  const [transcript, setTranscript] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const categorizeTags = (text: string) => {
    const tagKeywords = {
      "Infectious Diseases Ward": ["infection", "virus", "disease", "fever", "sick"],
      "Psych Ward": ["psychology", "therapy", "mental", "psychosis", "depression"],
      "Surgical Ward": ["surgery", "operation", "wound", "scalpel", "incision"],
      "Cardiology Ward": ["heart", "cardiac", "ECG", "arrhythmia", "blood pressure"],
      "heart": ["heart", "cardiac", "ECG", "arrhythmia", "blood pressure"],
      "ECG": ["heart", "cardiac", "ECG", "arrhythmia", "blood pressure"],
      "Arrhythmia": ["heart", "cardiac", "ECG", "arrhythmia", "blood pressure"],
      "Neurology Ward": ["brain", "neurology", "nervous", "stroke", "headache"],
    };

    const detectedTags: string[] = [];
    const lower = text.toLowerCase();

    for (const [ward, keywords] of Object.entries(tagKeywords)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword.toLowerCase())) {
          detectedTags.push(ward);
          break;
        }
      }
    }
    return detectedTags;
  };

  const fetchTranscript = async (buttonId: string) => {
    setTranscript('');
    setTags([]);
    try {
      const res = await fetch(`http://127.0.0.1:5000/transcribe?buttonId=${buttonId}`);
      const data = await res.json();
      setTranscript(data.transcript || 'No transcript available');
    } catch (err) {
      console.error(err);
      setTranscript('Error fetching transcript.');
    }
  };

  const handleClassify = () => {
    const results = categorizeTags(transcript);
    setTags(results);
  };

  return (
    <div className="p-4">
      {/* Audio Buttons */}
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          onClick={() => fetchTranscript(`button${n}`)}
          className="inline-block rounded border-2 border-[#1E90FF] bg-[#1E90FF] text-white hover:border-[#4169E1] hover:bg-[#4169E1] px-8 pb-3 pt-3 text-lg font-semibold uppercase transition duration-150 ease-in-out focus:outline-none mr-4"
        >
          Audio {n}
          <svg xmlns="http://www.w3.org/2000/svg" className="inline ml-2 pb-[3px] w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M10.5 3.75a6 6 0 00-5.98 6.496A5.25 5.25 0 006.75 20.25H18a4.5 4.5 0 002.206-8.423 3.75 3.75 0 00-4.133-4.303A6.001 6.001 0 0010.5 3.75zm2.25 6a.75.75 0 00-1.5 0v4.94l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V9.75z" clipRule="evenodd" />
          </svg>
        </button>
      ))}

      {/* Transcript */}
      <h1 className="text-xl font-bold mt-6">Transcript</h1>
      <p>{transcript || 'No transcript yet.'}</p>

      {/* Classify Button */}
      {transcript && (
        <button
          onClick={handleClassify}
          className="mt-4 px-6 py-2 bg-green-700 text-white  font-bold rounded hover:bg-green-900 transition"
        >
          Classify
        </button>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">Tags:</h2>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <li key={index} className="border-2 border-red-500 text-red-500 rounded-lg px-4 py-2 text-base">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
