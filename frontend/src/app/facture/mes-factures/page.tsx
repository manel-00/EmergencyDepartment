"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Facture {
  _id: string;
  totalCost?: number;
  tva?: number;
  subtotal?: number;
  daysSpent: number;
  extraCharges: number;
  extraDetails: string[];
  treatments: { name: string; cost: number }[];
  doctor: { name: string; lastname: string };
  createdAt: string;
  description?: string;
  status: string;
}

interface User {
  email: string;
  role: string;
}

export default function MesFactures() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await axios.get("http://localhost:3000/user/session", {
          withCredentials: true,
        });
        setUser(session.data.user);

        const res = await axios.get("http://localhost:3000/user/factures/patient", {
          withCredentials: true,
        });
        setFactures(res.data);
      } catch (err) {
        console.error("❌ Erreur chargement factures :", err);
      }
    };

    fetchData();
  }, []);

  const handleStripePayment = async (billId: string, amount: number) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/user/create-checkout-session",
        {
          amount,
          billId,
          patientEmail: user?.email,
        },
        { withCredentials: true }
      );

      if (res.data.url) window.location.href = res.data.url;
    } catch (err) {
      console.error("❌ Erreur Stripe :", err);
    }
  };

  const handleFlouciPayment = async (billId: string, amount: number) => {
    if (!amount || amount <= 0) {
      alert("Montant invalide. Veuillez vérifier la facture.");
      return;
    }
  
    try {
      const res = await axios.post(
        "http://localhost:3000/user/flouci/create-payment",
        {
          amount: Math.round(amount * 1000), // 💡 en millimes (ex: 64.2 TND → 64200)
          billId,
          patientEmail: user?.email,
        },
        { withCredentials: true }
      );
  
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) {
      console.error("❌ Erreur Flouci :", err);
      alert("Erreur lors du paiement avec Flouci.");
    }
  };
  
  
  

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">📂 Mes Factures</h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {factures.length === 0 ? (
          <p className="text-center text-gray-500">Aucune facture trouvée.</p>
        ) : (
          factures.map((facture) => (
            <div
              key={facture._id}
              className="bg-white p-6 rounded-xl shadow border border-gray-200"
            >
              <div className="mb-2 text-gray-700">
                <p>
                  👨‍⚕️ <strong>Docteur :</strong> {facture.doctor?.name} {facture.doctor?.lastname}
                </p>
                <p>
                  📆 <strong>Date :</strong> {new Date(facture.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mb-2">
                <p className="font-semibold text-gray-700 mb-1">💊 Traitements :</p>
                <ul className="list-disc ml-6 text-gray-700">
                  {facture.treatments.map((t, i) => (
                    <li key={i}>
                      {t.name} - {t.cost} TND
                    </li>
                  ))}
                </ul>
              </div>

              {facture.extraDetails?.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-gray-700 mb-1">➕ Suppléments :</p>
                  <ul className="list-disc ml-6 text-gray-700">
                    {facture.extraDetails.map((label, i) => (
                      <li key={i}>{label}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-gray-700">📅 Jours passés : {facture.daysSpent}</p>

              {facture.description && (
                <p className="text-gray-700 mt-2">
                  ✍️ <strong>Remarques :</strong> {facture.description}
                </p>
              )}

<div className="mt-4 border-t pt-4 text-gray-800 text-sm space-y-1">
  <p>
    💵 Sous-total :{" "}
    {facture.subtotal !== undefined
      ? `${facture.subtotal.toFixed(2)} TND`
      : "Non disponible"}
  </p>
  <p>
    🧾 TVA (7%) :{" "}
    {facture.tva !== undefined ? `${facture.tva.toFixed(2)} TND` : "Non disponible"}
  </p>
  <p className="text-lg font-bold text-green-700">
    ✅ Total TTC :{" "}
    {facture.totalCost !== undefined
      ? `${facture.totalCost.toFixed(2)} TND`
      : "Non disponible"}
  </p>
  <p className={`font-bold ${facture.status === "paid" ? "text-green-500" : "text-red-500"}`}>
    📌 Statut : {facture.status === "paid" ? "Payée" : "Non payée"}
  </p>
</div>


<div className="mt-4 flex flex-col sm:flex-row gap-3">
  <button
    onClick={() => handleStripePayment(facture._id, facture.totalCost || 0)}
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
    disabled={facture.status === "paid"}
  >
    💳 Payer avec Stripe
  </button>
  <button
    onClick={() => handleFlouciPayment(facture._id, facture.totalCost || 0)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    disabled={facture.status === "paid"}
  >
    💳 Payer avec Flouci
  </button>
</div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
