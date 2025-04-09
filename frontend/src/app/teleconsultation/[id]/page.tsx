"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import TeleconsultationRoom from "@/components/teleconsultation/TeleconsultationRoom";

interface Consultation {
  _id: string;
  date: string;
  medecin: {
    nom: string;
    prenom: string;
    image: string;
  };
  patient: {
    nom: string;
    prenom: string;
  };
  type: string;
  duree: number;
  prix: number;
  statut: string;
}

export default function ConsultationPage() {
  const params = useParams();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInConsultation, setIsInConsultation] = useState(false);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/consultations/${params.id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setConsultation(response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-dark dark:text-white">
          Consultation non trouvée
        </div>
      </div>
    );
  }

  if (isInConsultation) {
    return (
      <TeleconsultationRoom
        consultationId={consultation._id}
        onEnd={() => {
          setIsInConsultation(false);
        }}
      />
    );
  }

  return (
    <section className="pt-[120px] pb-[90px]">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-dark p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <div className="relative w-24 h-24 mr-6">
                <Image
                  src={consultation.medecin.image || "/images/default-avatar.png"}
                  alt={`${consultation.medecin.prenom} ${consultation.medecin.nom}`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark dark:text-white mb-2">
                  Dr. {consultation.medecin.prenom} {consultation.medecin.nom}
                </h1>
                <p className="text-body-color dark:text-body-color-dark">
                  {consultation.type}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    Date
                  </p>
                  <p className="font-semibold text-dark dark:text-white">
                    {new Date(consultation.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    Heure
                  </p>
                  <p className="font-semibold text-dark dark:text-white">
                    {new Date(consultation.date).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    Durée
                  </p>
                  <p className="font-semibold text-dark dark:text-white">
                    {consultation.duree} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    Prix
                  </p>
                  <p className="font-semibold text-dark dark:text-white">
                    {consultation.prix}€
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-body-color dark:text-body-color-dark">
                  Statut
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    consultation.statut === "planifie"
                      ? "bg-yellow-100 text-yellow-800"
                      : consultation.statut === "en_cours"
                      ? "bg-blue-100 text-blue-800"
                      : consultation.statut === "termine"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {consultation.statut}
                </span>
              </div>
            </div>

            {consultation.statut === "planifie" && (
              <div className="flex gap-4">
                <button
                  onClick={() => setIsInConsultation(true)}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Rejoindre la consultation
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 bg-gray-200 text-dark py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Retour
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 