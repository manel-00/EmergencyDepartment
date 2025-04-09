"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppointmentForm from "@/components/teleconsultation/RendezVousForm";
import WebRTCRoom from "@/components/teleconsultation/WebRTCRoom";

interface Consultation {
  _id: string;
  date: string;
  medecin: {
    name?: string;
    lastname?: string;
    image?: string;
  };
  patient: {
    name?: string;
    lastname?: string;
  };
  type?: string;
  typeConsultation?: string;
  duree?: number;
  prix?: number;
  status: string;
}

export default function TeleconsultationPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRendezVousForm, setShowRendezVousForm] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'planifié': 'Scheduled',
      'en_cours': 'In Progress',
      'terminé': 'Completed',
      'annulé': 'Cancelled',
      // Fallback pour les valeurs en anglais au cas où
      'pending': 'Scheduled',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const checkSession = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin?redirect=/teleconsultation");
        return false;
      }

      const sessionResponse = await axios.get("http://localhost:3000/user/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!sessionResponse.data.user) {
        localStorage.removeItem("token");
        router.push("/signin?redirect=/teleconsultation");
        return false;
      }

      setUserId(sessionResponse.data.user._id);
      return true;
    } catch (error) {
      console.error("❌ Session check failed:", error);
      localStorage.removeItem("token");
      router.push("/signin?redirect=/teleconsultation");
      return false;
    }
  };

  const fetchConsultations = async () => {
    try {
      const isSessionValid = await checkSession();
      if (!isSessionValid) return;

      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Consultations received:", response.data);
      setConsultations(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/signin?redirect=/teleconsultation");
      } else {
        console.error("Error loading consultations:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeConsultation && userId) {
    return (
      <WebRTCRoom
        consultationId={activeConsultation}
        userId={userId}
        onEnd={() => {
          setActiveConsultation(null);
          fetchConsultations();
        }}
      />
    );
  }

  return (
    <section className="pt-[120px] pb-[90px]">
      <div className="container">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="max-w-[620px] mx-auto mb-[60px] text-center lg:mb-20">
              <h1 className="text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[42px] mb-4">
                Teleconsultations
              </h1>
              <p className="text-lg leading-relaxed text-body-color dark:text-body-color-dark">
                Manage your online consultations and access your virtual appointments.
              </p>
              <button
                onClick={() => setShowRendezVousForm(true)}
                className="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Schedule a Consultation
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.map((consultation) => (
            <div
              key={consultation._id}
              className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16 mr-4">
                  <Image
                    src={"/images/default-avatar.png"}
                    alt={`Doctor ${consultation.medecin?.lastname || consultation.medecin?.name || 'Unknown'}`}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-dark dark:text-white">
                    Dr. {consultation.medecin?.lastname || ''} {consultation.medecin?.name || ''}
                  </h3>
                  <p className="text-body-color dark:text-body-color-dark">
                    {consultation.typeConsultation || consultation.type || 'Video Consultation'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(consultation.date).toLocaleDateString()}
                </p>
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Time:</span>{" "}
                  {new Date(consultation.date).toLocaleTimeString()}
                </p>
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Duration:</span> {consultation.duree} minutes
                </p>
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Price:</span> ${consultation.prix}
                </p>
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      consultation.status.toLowerCase() === "planifié" || consultation.status.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : consultation.status.toLowerCase() === "en_cours" || consultation.status.toLowerCase() === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : consultation.status.toLowerCase() === "terminé" || consultation.status.toLowerCase() === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {translateStatus(consultation.status)}
                  </span>
                </p>
              </div>

              {(consultation.status.toLowerCase() === "planifié" || consultation.status.toLowerCase() === "pending") && (
                <div className="mt-4 space-y-2">
                  <button
                    className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                    onClick={() => setActiveConsultation(consultation._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <span>Démarrer la consultation</span>
                  </button>
                  <button
                    className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                    onClick={() => router.push(`/teleconsultation/${consultation._id}`)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span>Détails du rendez-vous</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showRendezVousForm && (
        <AppointmentForm
          onSuccess={() => {
            setShowRendezVousForm(false);
            fetchConsultations();
          }}
          onCancel={() => setShowRendezVousForm(false)}
        />
      )}
    </section>
  );
} 