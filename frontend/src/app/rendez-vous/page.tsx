"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";



interface RendezVous {
  _id: string;
  date: string;
  medecin: {
    _id?: string;
    nom?: string;
    prenom?: string;
    name?: string;
    lastname?: string;
    image?: string;
  };
  patient: {
    _id?: string;
    nom?: string;
    prenom?: string;
    name?: string;
    lastname?: string;
    email?: string;
  };
  type?: string;
  typeConsultation?: string;
  duree?: number;
  prix?: number;
  notes?: string;
  status: string;
  isPaid?: boolean;
  paymentDate?: string;
  paymentSessionId?: string;
}

interface RendezVousPageProps {
  userId: string;
  userRole: string;
}

function RendezVousPage({ userId, userRole }: RendezVousPageProps) {
  const router = useRouter();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour la recherche et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [filteredRendezVous, setFilteredRendezVous] = useState<RendezVous[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Modal states
  const [showUnpaidModal, setShowUnpaidModal] = useState(false);
  const [unpaidConsultationId, setUnpaidConsultationId] = useState<string | null>(null);

  const getAppointmentStatus = (appointmentDate: string, status: string) => {
    const now = new Date();
    const appointmentTime = new Date(appointmentDate);

    // If the appointment is cancelled, keep that status
    if (status.toLowerCase() === 'annulé' || status.toLowerCase() === 'cancelled') {
      return 'Cancelled';
    }

    // If the appointment is marked as completed, keep that status
    if (status.toLowerCase() === 'terminé' || status.toLowerCase() === 'completed') {
      return 'Completed';
    }

    // If the appointment date is in the future
    if (appointmentTime > now) {
      return 'Scheduled';
    }

    // If the appointment date is today and within a 30-minute window (before or after)
    const timeDiff = Math.abs(appointmentTime.getTime() - now.getTime());
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (
      appointmentTime.getDate() === now.getDate() &&
      appointmentTime.getMonth() === now.getMonth() &&
      appointmentTime.getFullYear() === now.getFullYear() &&
      minutesDiff <= 30
    ) {
      return 'In Progress';
    }

    // If the appointment date is in the past
    if (appointmentTime < now) {
      return 'Missed';
    }

    // Default fallback
    return 'Scheduled';
  };

  // Fonction pour rafraîchir la liste des rendez-vous
  const fetchRendezVous = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      console.log("Envoi de la requête API pour récupérer les rendez-vous...");

      const response = await axios.get("http://localhost:3000/api/rendez-vous", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      console.log('Rendez-vous reçus:', response.data);
      setRendezVous(response.data);

      // Mettre à jour les rendez-vous filtrés
      filterAppointments();

    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
      setError("Impossible de récupérer vos rendez-vous. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour annuler un rendez-vous
  const handleCancelAppointment = async (rdvId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour annuler un rendez-vous");
        return;
      }

      // Appel à l'API pour annuler le rendez-vous
      const response = await axios.put(
        `http://localhost:3000/api/rendez-vous/${rdvId}/annuler`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Rendez-vous annulé avec succès:", response.data);

      // Mettre à jour la liste des rendez-vous localement
      const updatedRendezVous = rendezVous.map(rdv =>
        rdv._id === rdvId ? { ...rdv, status: 'annulé' } : rdv
      );

      setRendezVous(updatedRendezVous);

      // Rafraîchir les statistiques
      if (userRole === 'medecin' || userRole === 'doctor') {
        const stats = calculateAppointmentStats();
        if (stats) {
          stats.scheduled--;
          stats.cancelled++;
        }
      }

      // Afficher un message de succès temporaire
      setError(null);
      const successMessage = "Le rendez-vous a été annulé avec succès";
      alert(successMessage);

      // Rafraîchir la liste des rendez-vous depuis le serveur
      fetchRendezVous();

    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error);
      setError("Une erreur est survenue lors de l'annulation du rendez-vous");
    }
  };

  const handleStartConsultation = (rdv: RendezVous) => {
    // Vérifier si les IDs sont présents
    if (!rdv.medecin._id || !rdv.patient._id) {
      console.error('IDs manquants dans le rendez-vous');
      alert("Erreur: Informations manquantes dans le rendez-vous");
      return;
    }

    // Vérifier si l'utilisateur est le médecin ou le patient
    const isMedecin = userRole === 'medecin' && rdv.medecin._id === userId;
    const isPatient = userRole === 'patient' && rdv.patient._id === userId;

    // Check if patient has unpaid completed consultations
    if (isPatient && hasUnpaidCompletedConsultations()) {
      // Find the first unpaid completed consultation
      const unpaidConsultation = rendezVous.find(r => {
        const status = getAppointmentStatus(r.date, r.status);
        return status === 'Completed' && !r.isPaid;
      });

      if (unpaidConsultation) {
        // Show the modal with the unpaid consultation ID
        setUnpaidConsultationId(unpaidConsultation._id);
        setShowUnpaidModal(true);
        return;
      }
    }

    // Autoriser l'accès si l'utilisateur est soit le médecin soit le patient
    if (isMedecin || isPatient) {
      const consultationUrl = new URL('http://localhost:3001/test-video');

      // Paramètres de base
      consultationUrl.searchParams.append('consultation', rdv._id);
      consultationUrl.searchParams.append('patient', rdv.patient._id);
      consultationUrl.searchParams.append('medecin', rdv.medecin._id);

      // Informations sur l'utilisateur courant
      consultationUrl.searchParams.append('role', userRole);
      consultationUrl.searchParams.append('userId', userId);

      // Informations sur les participants
      consultationUrl.searchParams.append('patientName', `${rdv.patient.prenom || rdv.patient.name || ''} ${rdv.patient.nom || rdv.patient.lastname || ''}`);
      consultationUrl.searchParams.append('medecinName', `Dr. ${rdv.medecin.prenom || rdv.medecin.name || ''} ${rdv.medecin.nom || rdv.medecin.lastname || ''}`);

      // Informations sur la consultation
      consultationUrl.searchParams.append('type', rdv.typeConsultation || rdv.type);
      consultationUrl.searchParams.append('date', rdv.date);
      if (rdv.duree) consultationUrl.searchParams.append('duree', rdv.duree.toString());

      // Paramètre pour indiquer qui est l'initiateur
      consultationUrl.searchParams.append('initiator', isMedecin ? 'medecin' : 'patient');

      router.push(consultationUrl.toString());
    } else {
      alert("Vous n'êtes pas autorisé à accéder à cette consultation.");
    }
  };

  // Check if patient has any unpaid completed consultations
  const hasUnpaidCompletedConsultations = () => {
    if (userRole !== 'patient') return false;

    return rendezVous.some(rdv => {
      const status = getAppointmentStatus(rdv.date, rdv.status);
      return status === 'Completed' && !rdv.isPaid;
    });
  };

  // Fonction pour filtrer les rendez-vous en fonction du terme de recherche
  const filterAppointments = () => {
    if (!searchTerm.trim()) {
      setFilteredRendezVous(rendezVous);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = rendezVous.filter((rdv) => {
      // Recherche dans le nom du médecin
      const medecinName = `${rdv.medecin.prenom || rdv.medecin.name || ''} ${rdv.medecin.nom || rdv.medecin.lastname || ''}`.toLowerCase();

      // Recherche dans le nom du patient
      const patientName = `${rdv.patient.prenom || rdv.patient.name || ''} ${rdv.patient.nom || rdv.patient.lastname || ''}`.toLowerCase();

      // Recherche dans le type de consultation
      const consultationType = (rdv.typeConsultation || rdv.type || '').toLowerCase();

      // Recherche dans la date
      const appointmentDate = new Date(rdv.date).toLocaleDateString().toLowerCase();

      // Recherche dans les notes
      const notes = (rdv.notes || '').toLowerCase();

      // Recherche dans le statut
      const status = getAppointmentStatus(rdv.date, rdv.status).toLowerCase();

      return (
        medecinName.includes(searchTermLower) ||
        patientName.includes(searchTermLower) ||
        consultationType.includes(searchTermLower) ||
        appointmentDate.includes(searchTermLower) ||
        notes.includes(searchTermLower) ||
        status.includes(searchTermLower)
      );
    });

    setFilteredRendezVous(filtered);
  };

  // Calculer les rendez-vous à afficher sur la page actuelle
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredRendezVous.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredRendezVous.length / itemsPerPage);

  // Fonction pour changer de page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Calculer les statistiques des rendez-vous pour les médecins
  const calculateAppointmentStats = () => {
    if (userRole !== 'medecin' && userRole !== 'doctor') return null;

    // Initialiser les compteurs
    const stats = {
      total: rendezVous.length,
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      missed: 0,
      cancelled: 0
    };

    // Compter les rendez-vous par statut
    rendezVous.forEach(rdv => {
      const status = getAppointmentStatus(rdv.date, rdv.status);

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
    });

    return stats;
  };

  // Fonction pour obtenir le prochain rendez-vous du médecin
  const getNextAppointment = () => {
    if (userRole !== 'medecin' && userRole !== 'doctor') return null;

    const now = new Date();

    // Filtrer les rendez-vous à venir (date future et statut planifié)
    const upcomingAppointments = rendezVous.filter(rdv => {
      const appointmentDate = new Date(rdv.date);
      const status = getAppointmentStatus(rdv.date, rdv.status);
      return appointmentDate > now && (status === 'Scheduled' || status === 'In Progress');
    });

    // Si aucun rendez-vous à venir, retourner null
    if (upcomingAppointments.length === 0) return null;

    // Trier les rendez-vous par date (du plus proche au plus éloigné)
    upcomingAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Retourner le prochain rendez-vous
    return upcomingAppointments[0];
  };

  // Obtenir le prochain rendez-vous
  const nextAppointment = getNextAppointment();

  // Mettre à jour les rendez-vous filtrés lorsque les rendez-vous ou le terme de recherche changent
  useEffect(() => {
    filterAppointments();
  }, [rendezVous, searchTerm]);

  // Handle payment for a completed consultation
  const handlePayment = async (rdv: RendezVous) => {
    try {
      setIsProcessingPayment(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to make a payment");
        setIsProcessingPayment(false);
        return;
      }

      // Get the user's email from localStorage or use a default
      const userEmail = localStorage.getItem("userEmail") || "patient@example.com";

      // Create a payment session
      const response = await axios.post(
        `http://localhost:3000/api/consultations/${rdv._id}/payment`,
        { patientEmail: userEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to Stripe checkout
      if (response.data.url && response.data.sessionId) {
        // Store the session ID in localStorage for later use
        localStorage.setItem("stripeSessionId", response.data.sessionId);

        // Redirect to Stripe checkout page
        window.location.href = response.data.url;
      } else {
        setError("Failed to create payment session");
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("An error occurred while processing your payment");
      setIsProcessingPayment(false);
    }
  };

  // Check for payment success or cancellation in URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentSuccess = searchParams.get('payment_success');
    const paymentCancelled = searchParams.get('payment_cancelled');
    const appointmentId = searchParams.get('id');

    if (paymentSuccess === 'true' && appointmentId) {
      setSuccessMessage("Payment successful! Your consultation has been marked as paid.");

      // Mark the consultation as paid in the database
      const markAsPaid = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          // Get the Stripe session ID from localStorage if available
          const sessionId = localStorage.getItem("stripeSessionId");

          if (sessionId) {
            await axios.post(
              `http://localhost:3000/api/consultations/${appointmentId}/mark-paid`,
              { sessionId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (error) {
          console.error("Error marking consultation as paid:", error);
        }
      };

      markAsPaid();

      // Remove the query parameters from the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Refresh the appointments list
      fetchRendezVous();
    } else if (paymentCancelled === 'true') {
      setError("Payment was cancelled. You can try again later.");
      // Remove the query parameters from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Vérifier si le token est valide
    const validateToken = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return false;
        }

        // Vérifier d'abord si le token est valide en décodant
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error("Format de token invalide");
          localStorage.removeItem("token");
          setLoading(false);
          return false;
        }

        try {
          const tokenData = JSON.parse(atob(tokenParts[1]));
          console.log("Token décodé:", tokenData);

          if (!tokenData.userId) {
            console.error("Token ne contient pas d'ID utilisateur");
            return false;
          }

          // Store email in localStorage if available
          if (tokenData.email) {
            localStorage.setItem("userEmail", tokenData.email);
          }

          return true;
        } catch (decodeError) {
          console.error("Erreur lors du décodage du token:", decodeError);
          return false;
        }
      } catch (error) {
        console.error("Erreur lors de la validation du token:", error);
        return false;
      }
    };

    // Try to get user information from the API
    const getUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Try to get user info from the user API
        try {
          const response = await axios.get("http://localhost:3000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data && response.data.email) {
            localStorage.setItem("userEmail", response.data.email);
          }
        } catch (error) {
          console.log("Could not fetch user info from API, using token data instead");
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };

    const initializeData = async () => {
      const isTokenValid = await validateToken();
      if (isTokenValid) {
        await fetchRendezVous();
        await getUserInfo();
      } else {
        setLoading(false);
      }
    };

    initializeData();
  }, [userId, userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
                My Appointments
              </h1>
              <p className="text-lg leading-relaxed text-body-color dark:text-body-color-dark">
                View and manage your medical appointments
              </p>

              {/* Afficher un message d'erreur s'il y en a un */}
              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Afficher un message de succès s'il y en a un */}
              {successMessage && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}
            </div>

            {/* Barre de recherche */}
            <div className="max-w-md mx-auto mt-8 mb-8">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prochain rendez-vous pour les médecins */}
        {nextAppointment && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4">Next Appointment</h2>
            <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg border-l-4 border-primary">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="relative w-16 h-16 mr-4 bg-primary text-white rounded-full overflow-hidden flex items-center justify-center">
                    <span className="text-xl font-bold">
                      {`${(nextAppointment.patient.prenom?.[0] || nextAppointment.patient.name?.[0] || 'P')}${(nextAppointment.patient.nom?.[0] || nextAppointment.patient.lastname?.[0] || 'P')}`}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-dark dark:text-white">
                      {`${nextAppointment.patient.prenom || nextAppointment.patient.name || ''} ${nextAppointment.patient.nom || nextAppointment.patient.lastname || ''}`}
                    </h3>
                    <p className="text-body-color dark:text-body-color-dark">
                      {nextAppointment.typeConsultation || nextAppointment.type}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 md:text-right">
                  <div className="flex items-center md:justify-end">
                    <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="font-semibold">{new Date(nextAppointment.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center md:justify-end">
                    <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="font-semibold">{new Date(nextAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {nextAppointment.duree && (
                    <div className="flex items-center md:justify-end">
                      <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="font-semibold">{nextAppointment.duree} minutes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Temps restant avant le rendez-vous */}
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time until appointment:</span>
                  <span className="text-sm font-bold text-primary">
                    {(() => {
                      const now = new Date();
                      const appointmentDate = new Date(nextAppointment.date);
                      const diffMs = appointmentDate.getTime() - now.getTime();
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                      if (diffDays > 0) {
                        return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
                      } else if (diffHours > 0) {
                        return `${diffHours} hour${diffHours > 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
                      } else {
                        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleStartConsultation(nextAppointment)}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span>Start Consultation</span>
                </button>
                <button
                  onClick={() => handleCancelAppointment(nextAppointment._id)}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel Appointment</span>
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Display a message if no appointments are available */}
        {rendezVous.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-xl text-gray-600">No appointments found</p>
            <p className="mt-2 text-gray-500">Check your connection or try logging in again</p>
          </div>
        ) : filteredRendezVous.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-xl text-gray-600">No appointments match your search</p>
            <p className="mt-2 text-gray-500">Try different search terms</p>
          </div>
        ) : (
          <>
            {/* Grille de rendez-vous */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentPageItems().map((rdv) => (
            <div
              key={rdv._id}
              id={`consultation-${rdv._id}`}
              className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg transition-colors duration-500"
            >
              <div className="flex items-center mb-4">
                {/* Afficher les initiales du médecin ou du patient selon le rôle de l'utilisateur */}
                <div className="relative w-16 h-16 mr-4 bg-primary text-white rounded-full overflow-hidden flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {userRole === 'medecin'
                      ? /* Afficher les initiales du patient si l'utilisateur est médecin */
                        `${(rdv.patient.prenom?.[0] || rdv.patient.name?.[0] || 'P')}${(rdv.patient.nom?.[0] || rdv.patient.lastname?.[0] || 'P')}`
                      : /* Afficher les initiales du médecin si l'utilisateur est patient */
                        `${(rdv.medecin.prenom?.[0] || rdv.medecin.name?.[0] || 'D')}${(rdv.medecin.nom?.[0] || rdv.medecin.lastname?.[0] || 'M')}`
                    }
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-dark dark:text-white">
                    {userRole === 'medecin'
                      ? /* Afficher le nom du patient si l'utilisateur est médecin */
                        `${rdv.patient.prenom || rdv.patient.name || ''} ${rdv.patient.nom || rdv.patient.lastname || ''}`
                      : /* Afficher le nom du médecin si l'utilisateur est patient */
                        `Dr. ${rdv.medecin.prenom || rdv.medecin.name || ''} ${rdv.medecin.nom || rdv.medecin.lastname || ''}`
                    }
                  </h3>
                  <p className="text-body-color dark:text-body-color-dark">
                    {rdv.typeConsultation || rdv.type}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(rdv.date).toLocaleDateString()}
                </p>
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Time:</span>{" "}
                  {new Date(rdv.date).toLocaleTimeString()}
                </p>
                {rdv.duree && (
                  <p className="text-body-color dark:text-body-color-dark">
                    <span className="font-semibold">Duration:</span> {rdv.duree} minutes
                  </p>
                )}
                {rdv.prix && (
                  <p className="text-body-color dark:text-body-color-dark">
                    <span className="font-semibold">Price:</span> {rdv.prix}€
                  </p>
                )}
                {rdv.notes && (
                  <p className="text-body-color dark:text-body-color-dark">
                    <span className="font-semibold">Notes:</span> {rdv.notes}
                  </p>
                )}
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Status:</span>{" "}
                  {(() => {
                    const status = getAppointmentStatus(rdv.date, rdv.status);
                    return (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          status === "Scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : status === "Missed"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {status}
                      </span>
                    );
                  })()}
                </p>
              </div>

              {(() => {
                const status = getAppointmentStatus(rdv.date, rdv.status);

                // Afficher les boutons en fonction du statut
                if (status === "Scheduled" || status === "In Progress") {
                  return (
                    <div className="mt-4 space-y-2">
                      <button
                        className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                        onClick={() => handleStartConsultation(rdv)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <span>Start Consultation</span>
                      </button>

                      {/* Bouton d'annulation */}
                      <button
                        className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                        onClick={() => handleCancelAppointment(rdv._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Cancel Appointment</span>
                      </button>
                    </div>
                  );
                } else if (status === "Completed") {
                  // For completed consultations, show payment button if not paid and user is patient
                  if (userRole === 'patient' && !rdv.isPaid) {
                    return (
                      <div className="mt-4">
                        <button
                          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                          onClick={() => handlePayment(rdv)}
                          disabled={isProcessingPayment}
                        >
                          {isProcessingPayment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span>Pay Now</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  } else if (rdv.isPaid) {
                    // Show paid status
                    return (
                      <div className="mt-4">
                        <div className="w-full bg-gray-100 text-green-600 py-2 px-4 rounded flex items-center justify-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Paid on {rdv.paymentDate ? new Date(rdv.paymentDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    );
                  }
                } else if (status !== "Cancelled") {
                  // For missed consultations, no action needed
                  return (
                    <div className="mt-4">
                    </div>
                  );
                }

                return null;
              })()}
            </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === number
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Unpaid Consultation Warning Modal */}
      {showUnpaidModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-8 shadow-2xl border border-gray-700 transform transition-all duration-300 animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Payment Required
              </h2>
              <button
                onClick={() => setShowUnpaidModal(false)}
                className="text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700 p-1"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-500/20 p-4 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-300 text-center mb-6 text-lg leading-relaxed">
                You have unpaid completed consultations. Please pay for them before joining a new consultation.
              </p>

              {unpaidConsultationId && (
                <div className="bg-white/10 p-6 rounded-xl border border-white/20 mb-6 backdrop-blur-sm">
                  <p className="text-red-400 font-semibold mb-4 text-lg">Unpaid Consultation:</p>
                  {rendezVous.filter(rdv => rdv._id === unpaidConsultationId).map(rdv => (
                    <div key={rdv._id} className="text-white space-y-2">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-300">Date:</span>
                        <span className="ml-2">{new Date(rdv.date).toLocaleDateString()}</span>
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium text-gray-300">Doctor:</span>
                        <span className="ml-2">Dr. {rdv.medecin.prenom || rdv.medecin.name || ''} {rdv.medecin.nom || rdv.medecin.lastname || ''}</span>
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium text-gray-300">Type:</span>
                        <span className="ml-2">{rdv.typeConsultation || rdv.type}</span>
                      </p>
                      {rdv.prix && (
                        <p className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-300">Price:</span>
                          <span className="ml-2">{rdv.prix}€</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {/* Pay Now Button */}
              {unpaidConsultationId && (
                <button
                  onClick={() => {
                    setShowUnpaidModal(false);

                    // Find the unpaid consultation and process payment
                    const unpaidConsultation = rendezVous.find(rdv => rdv._id === unpaidConsultationId);
                    if (unpaidConsultation) {
                      handlePayment(unpaidConsultation);
                    }
                  }}
                  className="w-full bg-green-500 text-white py-4 px-6 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 font-medium text-lg shadow-lg shadow-green-500/20"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>Pay Now</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowUnpaidModal(false);

                    // Find and scroll to the unpaid consultation
                    if (unpaidConsultationId) {
                      const consultationElement = document.getElementById(`consultation-${unpaidConsultationId}`);
                      if (consultationElement) {
                        setTimeout(() => {
                          consultationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          consultationElement.classList.add('bg-red-50');
                          setTimeout(() => {
                            consultationElement.classList.remove('bg-red-50');
                            consultationElement.classList.add('bg-red-100');
                            setTimeout(() => {
                              consultationElement.classList.remove('bg-red-100');
                            }, 2000);
                          }, 500);
                        }, 300);
                      }
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-blue-600/20"
                >
                  Find Unpaid Consultation
                </button>
                <button
                  onClick={() => setShowUnpaidModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.02] font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add animations to global styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
}

export default withAuth(RendezVousPage);