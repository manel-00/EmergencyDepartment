'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Choices {
  [key: string]: string[];
}

export default function SymptomesForm() {
  const [choices, setChoices] = useState<Choices>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<string | null>(null);

  useEffect(() => {
    fetch('/choices.json')
      .then((res) => res.json())
      .then((data: Choices) => {
        setChoices(data);
        const initial: Record<string, string> = {};
        Object.keys(data).forEach((key) => { initial[key] = ''; });
        initial['Age'] = '';
        setForm(initial);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const inputArray = [
      form['Disease'],
      form['Fever'],
      form['Cough'],
      form['Fatigue'],
      form['Difficulty Breathing'],
      form['Age'],
      form['Gender'],
      form['Blood Pressure'],
      form['Cholesterol Level'],
    ];

    const res = await fetch('http://localhost:3000/symptomes/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: inputArray }),
    });
    const data = await res.json();
    setPrediction(data.prediction ?? data.error);
  };

  if (Object.keys(choices).length === 0) {
    return <div className="flex items-center justify-center h-screen">Chargement des choix…</div>;
  }

  return (
    <main className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Diagnostic Médical</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(choices).map(([key, opts]) => (
          <div key={key} className="grid grid-cols-1 gap-2">
            <label className="text-gray-700 dark:text-gray-200 font-medium">{key}</label>
            <select
              name={key}
              value={form[key] || ''}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled hidden>— Choisir —</option>
              {opts.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Age field */}
        <div className="grid grid-cols-1 gap-2">
          <label className="text-gray-700 dark:text-gray-200 font-medium">Age</label>
          <input
            type="number"
            name="Age"
            value={form['Age'] || ''}
            onChange={handleChange}
            required
            min={0}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-colors"
        >
          Envoyer
        </button>
      </form>

      {prediction && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center font-medium">
          Résultat : {prediction}
        </div>
      )}
    </main>
  );
}
