"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "@/styles/consultationForm.css";

interface AppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  date: string;
  typeConsultation: string;
  notes: string;
  medecin: string;
}

// Define the appointment data structure with proper types
interface AppointmentData {
  date: string;
  typeConsultation: string;
  notes: string;
  patient: string;
  medecin?: string;
  status: string;
}

export default function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    date: "",
    typeConsultation: "video",
    notes: "",
    medecin: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin?redirect=/teleconsultation");
          return;
        }

        const sessionResponse = await axios.get("http://localhost:3000/user/session", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!sessionResponse.data.user) {
          localStorage.removeItem("token");
          router.push("/signin?redirect=/teleconsultation");
        }
      } catch (error) {
        console.error("❌ Session check failed:", error);
        localStorage.removeItem("token");
        router.push("/signin?redirect=/teleconsultation");
      }
    };

    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching doctors...");
        const response = await axios.get("http://localhost:3000/user/getDoctors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Doctors received:", response.data);
        setDoctors(response.data);
      } catch (error) {
        console.error("Error loading doctors:", error);
      }
    };

    checkSession();
    fetchDoctors();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Starting appointment creation process...");

      // Vérifier que tous les champs requis sont remplis
      if (!formData.date) {
        setError("La date et l'heure sont requises");
        setLoading(false);
        return;
      }

      // Vérifier que la date est dans le futur
      const selectedDate = new Date(formData.date);
      const now = new Date();
      if (selectedDate <= now) {
        setError("La date du rendez-vous doit être dans le futur");
        setLoading(false);
        return;
      }

      // Vérifier que l'heure est raisonnable (entre 8h et 20h)
      const hour = selectedDate.getHours();
      if (hour < 8 || hour >= 20) {
        setError("Veuillez choisir une heure entre 8h00 et 20h00");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        router.push("/signin?redirect=/teleconsultation");
        return;
      }

      console.log("Getting user session...");
      const sessionResponse = await axios.get("http://localhost:3000/user/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Session response:", sessionResponse.data);

      // Essayer de récupérer l'ID utilisateur de différentes manières
      let userId = null;
      if (sessionResponse.data?.user) {
        const userData = sessionResponse.data.user;
        userId = userData.userId || userData._id || userData.id;

        // Si on a toujours pas d'ID, essayer de le récupérer du token
        if (!userId) {
          try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            userId = tokenData.id || tokenData._id || tokenData.userId || tokenData.sub;
          } catch (e) {
            console.error("Error decoding token:", e);
          }
        }
      }

      if (!userId) {
        console.error("Session structure:", sessionResponse.data);
        throw new Error("Unable to get user ID from session");
      }

      console.log("User ID found:", userId);

      const appointmentData: AppointmentData = {
        date: formData.date,
        typeConsultation: formData.typeConsultation,
        notes: formData.notes,
        patient: userId,
        status: "planifié"
      };

      // Ajouter le médecin seulement s'il est sélectionné
      if (formData.medecin) {
        appointmentData.medecin = formData.medecin;
      }

      console.log("Sending appointment data:", appointmentData);

      try {
        console.log("Envoi de la requête avec le token:", token);
        const response = await axios.post(
          "http://localhost:3000/api/rendez-vous",
          appointmentData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true // Pour envoyer les cookies également
          }
        );

        console.log("Appointment created successfully:", response.data);
        onSuccess();
      } catch (postError: any) {
        console.error("Error posting appointment:", postError);
        console.error("Response data:", postError.response?.data);
        console.error("Response status:", postError.response?.status);

        // Afficher un message d'erreur plus détaillé
        let errorMessage = "Échec de la création du rendez-vous. Veuillez réessayer.";

        if (postError.response?.data?.message) {
          errorMessage = postError.response.data.message;

          // Améliorer le message d'erreur pour la disponibilité du médecin
          if (errorMessage.includes("n'est pas disponible à cette date et heure")) {
            errorMessage = "Le médecin sélectionné n'est pas disponible à cette date et heure. Veuillez choisir un autre créneau horaire ou un autre médecin.";
          }
        } else if (postError.message) {
          errorMessage = postError.message;
        }

        setError(errorMessage);
      }
    } catch (error: any) {
      console.error("General error:", error);

      if (error.response?.status === 401) {
        router.push("/signin?redirect=/teleconsultation");
      } else {
        let errorMessage = "Une erreur s'est produite. Veuillez réessayer.";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="consultation-form-container">
        <h2 className="consultation-form-title">
          Schedule a Consultation
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Doctor (Required)
            </label>
            <select
              value={formData.medecin}
              onChange={(e) => setFormData({ ...formData, medecin: e.target.value })}
              className="form-select"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor: any) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.lastname} {doctor.name}
                </option>
              ))}
            </select>
            <div className="form-info">
            If no doctor is selected, an available doctor will be assigned automatically            </div>
            <div className="form-info">
              <span style={{ color: '#f59e0b' }}>Note:</span> The doctor must be available on the selected date and time
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Date and Time
            </label>
            <div className="date-time-picker">
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-input"
                required
              />
              <span className="calendar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
              </span>
            </div>
            <div className="form-info">
            Consultations are available from 8:00 a.m. to 8:00 p.m .            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Consultation Type
            </label>
            <select
              name="typeConsultation"
              value={formData.typeConsultation}
              onChange={(e) => setFormData({ ...formData, typeConsultation: e.target.value })}
              className="form-select"
              required
            >
              <option value="video">Video Consultation</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-textarea"
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>

          {error && (
            <div className="form-error mt-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}