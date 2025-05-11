"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaClock, FaTimesCircle, FaTrashAlt } from "react-icons/fa";

export default function AppointmentListDoctor() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null); // Pour afficher la confirmation

  const token = localStorage.getItem("token");
  const doctorId = localStorage.getItem("userId");

  useEffect(() => {
    if (!doctorId) {
      setError("Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/makeappointment/doctor/appointments/${doctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAppointments(response.data);
      } catch (err) {
        setError("Erreur lors de la récupération des rendez-vous.");
        console.error("Erreur récupération rendez-vous :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId, token]);

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/makeappointment/appointments/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        // Suppression réussie, mettre à jour la liste des rendez-vous
        setAppointments(appointments.filter((appointment) => appointment.id !== appointmentId));
        alert("Rendez-vous supprimé avec succès !");
        setShowConfirmDelete(null); // Réinitialiser la confirmation après suppression
      }
    } catch (err) {
      alert("Erreur lors de la suppression du rendez-vous.");
      console.error("Erreur suppression rendez-vous :", err);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/makeappointment/update-status/${appointmentId}`,
        { status: "confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        alert("Rendez-vous confirmé !");
        // Mettre à jour l'état des rendez-vous dans le composant (si nécessaire)
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: "confirmed" }
              : appointment
          )
        );
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut.");
      console.error("Erreur de confirmation du rendez-vous :", error);
    }
  };

  const confirmDelete = (appointmentId: string) => {
    setShowConfirmDelete(appointmentId);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(null);
  };

  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-4xl font-bold text-center text-indigo-800 mb-8">
          📅 Rendez-vous du Médecin
        </h2>

        {appointments.length === 0 ? (
          <p className="text-center text-gray-600">Aucun rendez-vous trouvé.</p>
        ) : (
          <ul className="space-y-6">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="p-6 bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    {/* Vérifier si l'objet patient existe avant d'afficher les informations */}
                    <p className="text-xl font-semibold text-indigo-800">
                      {appointment.patientName ? appointment.patientName : "Patient inconnu"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {appointment.date} à {appointment.time}
                    </p>
                  </div>

                  {/* Affichage dynamique du statut avec icônes */}
                  <span
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold
                      ${appointment.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : appointment.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"}`}
                  >
                    {appointment.status === "confirmed" && (
                      <FaCheckCircle className="text-green-600" />
                    )}
                    {appointment.status === "pending" && (
                      <FaClock className="text-yellow-600" />
                    )}
                    {appointment.status === "cancelled" && (
                      <FaTimesCircle className="text-red-600" />
                    )}
                    <span>
                      {appointment.status === "confirmed"
                        ? "Confirmé"
                        : appointment.status === "pending"
                        ? "En attente"
                        : "Annulé"}
                    </span>
                  </span>

                  {/* Bouton pour valider le rendez-vous */}
                  {appointment.status === "pending" && (
                    <button
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      className="ml-4 text-green-600 hover:text-green-800"
                    >
                      <FaCheckCircle />
                    </button>
                  )}

                  {/* Bouton de suppression */}
                  {showConfirmDelete === appointment.id ? (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="ml-4 text-gray-600 hover:text-gray-800"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmDelete(appointment.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}