"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import TeleconsultationRoom from "@/components/teleconsultation/TeleconsultationRoom";

interface Consultation {
  _id: string;
  date: string;
  medecin: {
    _id?: string;
    name?: string;
    lastname?: string;
    nom?: string;
    prenom?: string;
    image?: string;
  };
  patient: {
    _id?: string;
    name?: string;
    lastname?: string;
    nom?: string;
    prenom?: string;
  };
  type?: string;
  typeConsultation?: string;
  duree?: number;
  prix?: number;
  status?: string;
  statut?: string;
}

interface RendezVous {
  _id: string;
  date: string;
  time: string;
  medecin: {
    _id: string;
    name?: string;
    lastname?: string;
    image?: string;
  };
  patient: {
    _id: string;
    name?: string;
    lastname?: string;
  };
  status: string;
  notes?: string;
  consultation?: string;
}

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [rendezVous, setRendezVous] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInConsultation, setIsInConsultation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // First try to fetch as a consultation
        try {
          const consultationResponse = await axios.get(
            `http://localhost:3000/api/consultations/${params.id}`,
            { headers }
          );

          if (consultationResponse.data) {
            console.log("Consultation found:", consultationResponse.data);
            setConsultation(consultationResponse.data);
            setLoading(false);
            return;
          }
        } catch (consultationError) {
          console.log("Not a consultation, trying rendez-vous...");
        }

        // If not found as consultation, try to fetch as a rendez-vous
        try {
          const rendezVousResponse = await axios.get(
            `http://localhost:3000/api/rendez-vous/${params.id}`,
            { headers }
          );

          if (rendezVousResponse.data) {
            console.log("Rendez-vous found:", rendezVousResponse.data);
            setRendezVous(rendezVousResponse.data);

            // If the rendez-vous has a linked consultation, fetch it
            if (rendezVousResponse.data.consultation) {
              try {
                const linkedConsultationResponse = await axios.get(
                  `http://localhost:3000/api/consultations/${rendezVousResponse.data.consultation}`,
                  { headers }
                );

                if (linkedConsultationResponse.data) {
                  console.log("Linked consultation found:", linkedConsultationResponse.data);
                  setConsultation(linkedConsultationResponse.data);
                }
              } catch (linkedError) {
                console.log("No linked consultation found");
              }
            } else {
              // Create a consultation object from the rendez-vous data
              const consultationFromRdv: Consultation = {
                _id: rendezVousResponse.data._id,
                date: rendezVousResponse.data.date + "T" + rendezVousResponse.data.time,
                medecin: rendezVousResponse.data.medecin,
                patient: rendezVousResponse.data.patient,
                status: rendezVousResponse.data.status,
                statut: rendezVousResponse.data.status // For compatibility with both field names
              };

              setConsultation(consultationFromRdv);
            }

            setLoading(false);
            return;
          }
        } catch (rendezVousError) {
          console.log("Not found as rendez-vous either");
          setError("Consultation ou rendez-vous non trouvé");
        }

        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.message || "Une erreur est survenue");
        setLoading(false);
      }
    };

    fetchData();
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

  if (!consultation && !rendezVous) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-dark dark:text-white">
          Consultation ou rendez-vous non trouvé
        </div>
      </div>
    );
  }

  if (isInConsultation) {
    // Use either consultation ID or rendez-vous ID
    const consultationId = consultation?._id || rendezVous?._id;

    if (!consultationId) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Unable to load consultation information
          </div>
          <button
            onClick={() => window.history.back()}
            className="ml-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <TeleconsultationRoom
        consultationId={consultationId}
        onEnd={() => {
          setIsInConsultation(false);
        }}
      />
    );
  }

  // Get doctor name from either consultation or rendez-vous
  const getDoctorName = () => {
    if (consultation) {
      if (consultation.medecin.name && consultation.medecin.lastname) {
        return `Dr. ${consultation.medecin.name} ${consultation.medecin.lastname}`;
      } else if (consultation.medecin.prenom && consultation.medecin.nom) {
        return `Dr. ${consultation.medecin.prenom} ${consultation.medecin.nom}`;
      }
    }
    if (rendezVous && rendezVous.medecin) {
      return `Dr. ${rendezVous.medecin.name || ''} ${rendezVous.medecin.lastname || ''}`;
    }
    return 'Dr.';
  };

  // Get doctor image
  const getDoctorImage = () => {
    if (consultation && consultation.medecin.image) {
      return consultation.medecin.image;
    }
    if (rendezVous && rendezVous.medecin.image) {
      return rendezVous.medecin.image;
    }
    return "/images/default-avatar.png";
  };

  // Get patient name
  const getPatientName = () => {
    if (consultation) {
      if (consultation.patient.name && consultation.patient.lastname) {
        return `${consultation.patient.name} ${consultation.patient.lastname}`;
      } else if (consultation.patient.prenom && consultation.patient.nom) {
        return `${consultation.patient.prenom} ${consultation.patient.nom}`;
      }
    }
    if (rendezVous && rendezVous.patient) {
      return `${rendezVous.patient.name || ''} ${rendezVous.patient.lastname || ''}`;
    }
    return 'Patient';
  };

  // Get status
  const getStatus = () => {
    if (consultation) {
      return consultation.status || consultation.statut || 'planifié';
    }
    if (rendezVous) {
      return rendezVous.status || 'planifié';
    }
    return 'planifié';
  };

  // Get date and time
  const getDate = () => {
    try {
      if (consultation && consultation.date) {
        // Try to parse the date, handling different formats
        const dateObj = new Date(consultation.date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleDateString();
        }
      }

      if (rendezVous && rendezVous.date) {
        // For rendezVous, the date might be in YYYY-MM-DD format
        const dateObj = new Date(rendezVous.date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleDateString();
        }
        // If direct parsing fails, try to handle YYYY-MM-DD format
        const parts = rendezVous.date.split('-');
        if (parts.length === 3) {
          const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString();
          }
        }
      }

      // If all parsing attempts fail
      console.log("Date parsing failed for:", consultation?.date || rendezVous?.date);
      return 'Date non disponible';
    } catch (error) {
      console.error("Error parsing date:", error);
      return 'Date non disponible';
    }
  };

  const getTime = () => {
    try {
      if (consultation && consultation.date) {
        const dateObj = new Date(consultation.date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleTimeString();
        }
      }

      if (rendezVous && rendezVous.time) {
        // Return the time directly from rendezVous
        return rendezVous.time;
      }

      console.log("Time parsing failed for:", consultation?.date || rendezVous?.time);
      return 'Heure non disponible';
    } catch (error) {
      console.error("Error parsing time:", error);
      return 'Heure non disponible';
    }
  };

  // Get consultation type
  const getConsultationType = () => {
    if (consultation) {
      return consultation.type || consultation.typeConsultation || 'Vidéo';
    }
    return 'Vidéo';
  };

  return (
    <section className="pt-[120px] pb-[90px]">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-dark p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <div className="relative w-24 h-24 mr-6">
                <Image
                  src={getDoctorImage()}
                  alt={getDoctorName()}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark dark:text-white mb-2">
                  {getDoctorName()}
                </h1>
                <p className="text-body-color dark:text-body-color-dark">
                  {getConsultationType()}
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
                    {getDate()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    Heure
                  </p>
                  <p className="font-semibold text-dark dark:text-white">
                    {getTime()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-body-color dark:text-body-color-dark">
                    Patient
                  </p>
                  <p className="font-semibold text-dark dark:text-white">
                    {getPatientName()}
                  </p>
                </div>
                {consultation && consultation.duree && (
                  <div>
                    <p className="text-sm text-body-color dark:text-body-color-dark">
                      Durée
                    </p>
                    <p className="font-semibold text-dark dark:text-white">
                      {consultation.duree} minutes
                    </p>
                  </div>
                )}
                {consultation && consultation.prix && (
                  <div>
                    <p className="text-sm text-body-color dark:text-body-color-dark">
                      Prix
                    </p>
                    <p className="font-semibold text-dark dark:text-white">
                      {consultation.prix}€
                    </p>
                  </div>
                )}
                {rendezVous && rendezVous.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-body-color dark:text-body-color-dark">
                      Notes
                    </p>
                    <p className="font-semibold text-dark dark:text-white">
                      {rendezVous.notes}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-body-color dark:text-body-color-dark">
                  Statut
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    getStatus().toLowerCase() === "planifié" || getStatus().toLowerCase() === "planifie"
                      ? "bg-yellow-100 text-yellow-800"
                      : getStatus().toLowerCase() === "en cours" || getStatus().toLowerCase() === "en_cours"
                      ? "bg-blue-100 text-blue-800"
                      : getStatus().toLowerCase() === "terminé" || getStatus().toLowerCase() === "termine"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {getStatus()}
                </span>
              </div>
            </div>

            {(getStatus().toLowerCase() === "planifié" || getStatus().toLowerCase() === "planifie") && (
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    console.log("Starting consultation with ID:", consultation?._id || rendezVous?._id);
                    setIsInConsultation(true);
                  }}
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

            {(getStatus().toLowerCase() !== "planifié" && getStatus().toLowerCase() !== "planifie") && (
              <div className="flex justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="bg-gray-200 text-dark py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
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