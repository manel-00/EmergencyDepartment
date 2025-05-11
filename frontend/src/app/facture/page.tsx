"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Patient {
  _id: string;
  name: string;
  lastname: string;
}

interface Treatment {
  name: string;
  cost: number;
}

interface User {
  role: string;
  name: string;
  email: string;
}

export default function FacturePage() {
  const [user, setUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [daysSpent, setDaysSpent] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const FIXED_TREATMENTS: Treatment[] = [
    { name: "Consultation rapide", cost: 30 },
    { name: "Injection d’urgence", cost: 45 },
    { name: "Radiographie", cost: 80 },
    { name: "Hospitalisation brève", cost: 150 },
    { name: "Transfusion", cost: 100 },
  ];

  const EXTRA_OPTIONS = [
    { label: "🥘 Repas spécial (30 TND)", value: 30 },
    { label: "🩺 Suivi personnalisé (80 TND)", value: 80 },
  ];

  useEffect(() => {
    const fetchUserAndPatients = async () => {
      try {
        const userRes = await axios.get("http://localhost:3000/user/session", {
          withCredentials: true,
        });
        setUser(userRes.data.user);

        if (userRes.data.user.role === "doctor") {
          const patientsRes = await axios.get("http://localhost:3000/user/listPatients", {
            withCredentials: true,
          });
          setPatients(patientsRes.data);
        }
      } catch (err) {
        console.error("❌ Erreur :", err);
        alert("Session expirée ou accès refusé.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPatients();
  }, []);

  const toggleTreatment = (t: Treatment) => {
    setTreatments((prev) =>
      prev.find((tr) => tr.name === t.name)
        ? prev.filter((tr) => tr.name !== t.name)
        : [...prev, t]
    );
  };

  const toggleExtra = (value: number) => {
    setSelectedExtras((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const subtotal =
    treatments.reduce((sum, t) => sum + t.cost, 0) +
    daysSpent * 100 +
    selectedExtras.reduce((sum, e) => sum + e, 0);

  const tva = subtotal * 0.07;
  const totalTTC = subtotal + tva;

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();

    const billData = {
      patientId: selectedPatient,
      treatments,
      daysSpent,
      extraCharges: selectedExtras.reduce((a, b) => a + b, 0),
      extraDetails: selectedExtras.map(v => EXTRA_OPTIONS.find(e => e.value === v)?.label),
      description,
    };

    try {
      const res = await axios.post("http://localhost:3000/user/facture/create", billData, {
        withCredentials: true,
      });
      alert("✅ Facture créée !");
    } catch (err: any) {
      console.error("❌ Erreur :", err);
      alert("Erreur lors de la création.");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement...</p>;

  if (!user || user.role !== "doctor") {
    return (
      <div className="text-center mt-10 text-red-600 font-semibold text-lg">
        ⛔️ Accès interdit
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4">
      <form
        onSubmit={handleCreateBill}
        className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8"
      >
        <h2 className="text-4xl font-bold text-center text-green-700 mb-10">
          🧾 Nouvelle Facture
        </h2>

        {/* Patient */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">👤 Patient</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-green-400 focus:outline-none"
            required
          >
            <option value="">-- Sélectionner un patient --</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} {p.lastname}
              </option>
            ))}
          </select>
        </div>

        {/* Traitements */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">💊 Traitements</label>
          <div className="grid grid-cols-2 gap-3">
            {FIXED_TREATMENTS.map((t, idx) => (
              <label
                key={idx}
                className="flex items-center space-x-2 bg-gray-50 p-3 border rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={treatments.some((tr) => tr.name === t.name)}
                  onChange={() => toggleTreatment(t)}
                />
                <span>
                  {t.name} - {t.cost} TND
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">➕ Options supplémentaires</label>
          <div className="grid grid-cols-2 gap-3">
            {EXTRA_OPTIONS.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center space-x-2 bg-blue-50 p-3 border rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedExtras.includes(opt.value)}
                  onChange={() => toggleExtra(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Jours + Remarques */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">📅 Jours passés</label>
            <input
              type="number"
              value={daysSpent}
              onChange={(e) => setDaysSpent(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              min={0}
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-2">✍️ Remarques / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              placeholder="Ex : soins intensifs, patient sous surveillance..."
            />
          </div>
        </div>

        {/* Totaux */}
        <div className="bg-gray-50 p-4 rounded border mb-6">
          <p>💵 <strong>Sous-total :</strong> {subtotal.toFixed(2)} TND</p>
          <p>🧾 <strong>TVA (7%) :</strong> {tva.toFixed(2)} TND</p>
          <p className="text-xl font-bold text-green-700">✅ Total TTC : {totalTTC.toFixed(2)} TND</p>
        </div>

        {/* Bouton */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded transition duration-200"
        >
          Générer la facture
        </button>
      </form>
    </div>
  );
}
