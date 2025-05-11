"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import AppointmentForm from "@/components/teleconsultation/RendezVousForm";
import WebRTCRoom from "@/components/teleconsultation/WebRTCRoom";
import GoogleCalendarIntegration from "@/components/teleconsultation/GoogleCalendarIntegration";
import withAuth from "@/components/auth/withAuth";



interface AppointmentStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  missed: number;
  cancelled: number;
  paid: number;
  unpaid: number;
}

interface RendezVous {
  _id: string;
  patient: any;
  medecin: any;
  date: string;
  status: string;
  typeConsultation?: string;
  type?: string;
  duree?: number;
  prix?: number;
  notes?: string;
  isPaid?: boolean;
  paymentDate?: string;
}

interface TeleconsultationPageProps {
  userId: string;
  userRole: string;
}

function TeleconsultationPage({ userId, userRole }: TeleconsultationPageProps) {
  const [showRendezVousForm, setShowRendezVousForm] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<string | null>(null);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour déterminer le statut d'un rendez-vous
  const getAppointmentStatus = (date: string, status?: string): string => {
    // Normalize status to lowercase for case-insensitive comparison
    const normalizedStatus = status?.toLowerCase() || '';

    // Check for cancelled status with various possible values
    if (normalizedStatus.includes('annul') || normalizedStatus.includes('cancel')) {
      return 'Cancelled';
    }

    // Check for completed status with various possible values
    if (normalizedStatus.includes('termin') || normalizedStatus.includes('complet')) {
      return 'Completed';
    }

    const appointmentDate = new Date(date);
    const now = new Date();

    // Si la date est passée
    if (appointmentDate < now) {
      // Si le rendez-vous est passé mais n'est pas marqué comme terminé
      const diffMs = now.getTime() - appointmentDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Si le rendez-vous est passé depuis plus de 1 heure, on le considère comme manqué
      if (diffHours > 1) return 'Missed';

      // Sinon, on le considère comme en cours
      return 'In Progress';
    }

    // Si la date est dans moins d'une heure, on considère que le rendez-vous est en cours
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'In Progress';

    // Default fallback
    return 'Scheduled';
  };

  // Fonction pour récupérer les rendez-vous
  const fetchRendezVous = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:3000/api/rendez-vous", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      setRendezVous(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
      setError("Impossible de récupérer vos rendez-vous. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  // Charger les rendez-vous au chargement de la page
  useEffect(() => {
    if (userRole === 'medecin' || userRole === 'doctor') {
      fetchRendezVous();
    }
  }, [userRole]);

  // Calculer les statistiques des rendez-vous pour les médecins
  const calculateAppointmentStats = (): AppointmentStats | null => {
    if (userRole !== 'medecin' && userRole !== 'doctor') return null;
    if (rendezVous.length === 0) return null;

    // Initialiser les compteurs
    const stats: AppointmentStats = {
      total: rendezVous.length,
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      missed: 0,
      cancelled: 0,
      paid: 0,
      unpaid: 0
    };

    // Compter les rendez-vous par statut
    rendezVous.forEach(rdv => {
      const status = getAppointmentStatus(rdv.date, rdv.status);

      // Count by status
      switch(status) {
        case 'Scheduled':
          stats.scheduled++;
          break;
        case 'In Progress':
          stats.inProgress++;
          break;
        case 'Completed':
          stats.completed++;
          break;
        case 'Missed':
          stats.missed++;
          break;
        case 'Cancelled':
          stats.cancelled++;
          break;
      }

      // Count paid consultations (any status)
      if (rdv.isPaid) {
        stats.paid++;
      }

      // Count unpaid completed consultations only
      if (status === 'Completed' && !rdv.isPaid) {
        stats.unpaid++;
      }
    });

    return stats;
  };

  // Fonction pour ouvrir Google Calendar
  const openGoogleCalendar = () => {
    window.open('https://calendar.google.com/', '_blank');
  };

  // Obtenir les statistiques
  const appointmentStats = calculateAppointmentStats();

  if (activeConsultation && userId) {
    return (
      <WebRTCRoom
        consultationId={activeConsultation}
        userId={userId}
        onEnd={() => {
          // Refresh the rendez-vous list to update statistics
          if (userRole === 'medecin' || userRole === 'doctor') {
            fetchRendezVous();
          }
          setActiveConsultation(null);
        }}
      />
    );
  }

  if (loading && (userRole === 'medecin' || userRole === 'doctor')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && (userRole === 'medecin' || userRole === 'doctor')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={() => setShowRendezVousForm(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Schedule a Consultation
                </button>

                {(userRole === 'medecin' || userRole === 'doctor') && (
                  <button
                    onClick={openGoogleCalendar}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.5 22.5H4.5C3.12 22.5 2 21.38 2 20V6C2 4.62 3.12 3.5 4.5 3.5H5V2H7V3.5H17V2H19V3.5H19.5C20.88 3.5 22 4.62 22 6V20C22 21.38 20.88 22.5 19.5 22.5ZM4.5 8H19.5V6H4.5V8ZM19.5 20V10H4.5V20H19.5Z" />
                    </svg>
                    Open Google Calendar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques pour les médecins */}
        {appointmentStats && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dark dark:text-white">Appointment Statistics</h2>
              <button
                onClick={fetchRendezVous}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
              {/* Total des rendez-vous */}
              <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-primary mb-2">{appointmentStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>

              {/* Rendez-vous planifiés */}
              <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-2">{appointmentStats.scheduled}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled</div>
              </div>

              {/* Rendez-vous en cours */}
              <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">{appointmentStats.inProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
              </div>

              {/* Rendez-vous terminés */}
              <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">{appointmentStats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>

              {/* Rendez-vous manqués */}
              <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">{appointmentStats.missed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Missed</div>
              </div>

              {/* Rendez-vous annulés */}
              <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">{appointmentStats.cancelled}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cancelled</div>
              </div>

              {/* Consultations payées */}
              <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-2">{appointmentStats.paid}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Paid</div>
              </div>

              {/* Consultations terminées non payées */}
              <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-rose-500 mb-2">{appointmentStats.unpaid}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unpaid Completed</div>
              </div>
            </div>

            {/* Graphique de visualisation */}
            <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">Appointment Distribution</h3>

              {/* Barre de progression pour les rendez-vous planifiés */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Scheduled</span>
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 font-bold">
                    {appointmentStats.scheduled} ({Math.round((appointmentStats.scheduled / appointmentStats.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{ width: `${(appointmentStats.scheduled / appointmentStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Barre de progression pour les rendez-vous en cours */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 font-bold">
                    {appointmentStats.inProgress} ({Math.round((appointmentStats.inProgress / appointmentStats.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${(appointmentStats.inProgress / appointmentStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Barre de progression pour les rendez-vous terminés */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Completed</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 font-bold">
                    {appointmentStats.completed} ({Math.round((appointmentStats.completed / appointmentStats.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${(appointmentStats.completed / appointmentStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Barre de progression pour les rendez-vous manqués */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Missed</span>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400 font-bold">
                    {appointmentStats.missed} ({Math.round((appointmentStats.missed / appointmentStats.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full"
                    style={{ width: `${(appointmentStats.missed / appointmentStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Barre de progression pour les rendez-vous annulés */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Cancelled</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400 font-bold">
                    {appointmentStats.cancelled} ({Math.round((appointmentStats.cancelled / appointmentStats.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{ width: `${(appointmentStats.cancelled / appointmentStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Barre de progression pour les consultations payées */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Paid</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 font-bold">
                    {appointmentStats.paid} ({Math.round((appointmentStats.paid / appointmentStats.total) * 100)}% of all)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full"
                    style={{ width: `${(appointmentStats.paid / appointmentStats.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Barre de progression pour les consultations terminées non payées */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Unpaid Completed</span>
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400 font-bold">
                    {appointmentStats.unpaid} ({appointmentStats.completed > 0 ? Math.round((appointmentStats.unpaid / appointmentStats.completed) * 100) : 0}% of completed)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-rose-500 h-2.5 rounded-full"
                    style={{ width: `${appointmentStats.completed > 0 ? (appointmentStats.unpaid / appointmentStats.completed) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Google Calendar Integration for doctors */}
        {userRole === "doctor" && (
          <div className="mb-10">
            <GoogleCalendarIntegration />
          </div>
        )}
      </div>

      {showRendezVousForm && (
        <AppointmentForm
          onSuccess={() => {
            setShowRendezVousForm(false);
          }}
          onCancel={() => setShowRendezVousForm(false)}
        />
      )}
    </section>
  );
}

export default withAuth(TeleconsultationPage);