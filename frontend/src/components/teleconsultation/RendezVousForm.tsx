"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

interface AppointmentData {
  date: string;
  typeConsultation: string;
  notes: string;
  patient: string;
  medecin?: string;
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
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin?redirect=/teleconsultation");
        return;
      }

      const sessionResponse = await axios.get("http://localhost:3000/user/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Session response:", sessionResponse.data);

      const userId = sessionResponse.data?.user?.userId;
      
      if (!userId) {
        console.error("Session structure:", sessionResponse.data);
        throw new Error("Unable to get user ID from session");
      }

      const appointmentData = {
        date: formData.date,
        typeConsultation: formData.typeConsultation,
        notes: formData.notes,
        patient: userId,
        medecin: formData.medecin || undefined,
        statut: "planifie"
      };

      console.log("Sending appointment data:", appointmentData);

      const response = await axios.post(
        "http://localhost:3000/api/rendez-vous",
        appointmentData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Appointment created:", response.data);
      onSuccess();
    } catch (error: any) {
      console.error("Error details:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        router.push("/signin?redirect=/teleconsultation");
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to create appointment. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-dark dark:text-white">
          Schedule a Consultation
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-dark dark:text-white mb-2">
              Doctor (Optional)
            </label>
            <select
              value={formData.medecin}
              onChange={(e) => setFormData({ ...formData, medecin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark"
            >
              <option value="">Select a doctor (optional)</option>
              {doctors.map((doctor: any) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.lastname} {doctor.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              If no doctor is selected, one will be assigned automatically
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Date and Time
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Consultation Type
            </label>
            <select
              name="typeConsultation"
              value={formData.typeConsultation}
              onChange={(e) => setFormData({ ...formData, typeConsultation: e.target.value })}
              className="w-full rounded border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
              required
            >
              <option value="video">Video Consultation</option>
              <option value="audio">Audio Consultation</option>
              <option value="chat">Chat Consultation</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-500 text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
} 