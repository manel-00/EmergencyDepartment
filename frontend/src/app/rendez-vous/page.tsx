"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface RendezVous {
  _id: string;
  date: string;
  medecin: {
    _id?: string;
    nom: string;
    prenom: string;
    image: string;
  };
  patient: {
    _id?: string;
    nom: string;
    prenom: string;
  };
  type: string;
  typeConsultation?: string;
  duree?: number;
  prix?: number;
  notes: string;
  status: string;
}

export default function RendezVousPage() {
  const router = useRouter();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'planifié': 'Planifié',
      'en_cours': 'En cours',
      'terminé': 'Terminé',
      'annulé': 'Annulé'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const handleStartConsultation = (rdv: RendezVous) => {
    console.log('=== Vérification de l\'autorisation ===');
    console.log('User Role:', userRole);
    console.log('User ID:', userId);
    console.log('Rendez-vous complet:', rdv);
    console.log('Patient dans RDV:', rdv.patient);
    console.log('Medecin dans RDV:', rdv.medecin);

    // Vérifier si les IDs sont présents
    if (!rdv.medecin._id || !rdv.patient._id) {
      console.error('IDs manquants dans le rendez-vous');
      alert("Erreur: Informations manquantes dans le rendez-vous");
      return;
    }

    // Vérifier si l'utilisateur est le médecin ou le patient
    const isMedecin = userRole === 'medecin' && rdv.medecin._id === userId;
    const isPatient = userRole === 'patient' && rdv.patient._id === userId;
    
    console.log('Vérification détaillée:', {
      userRole,
      userId,
      patientId: rdv.patient._id,
      medecinId: rdv.medecin._id,
      roleIsPatient: userRole === 'patient',
      roleIsMedecin: userRole === 'medecin',
      idMatchesPatient: rdv.patient._id === userId,
      idMatchesMedecin: rdv.medecin._id === userId,
      isMedecin,
      isPatient
    });

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
      consultationUrl.searchParams.append('patientName', `${rdv.patient.prenom} ${rdv.patient.nom}`);
      consultationUrl.searchParams.append('medecinName', `Dr. ${rdv.medecin.prenom} ${rdv.medecin.nom}`);
      
      // Informations sur la consultation
      consultationUrl.searchParams.append('type', rdv.typeConsultation || rdv.type);
      consultationUrl.searchParams.append('date', rdv.date);
      if (rdv.duree) consultationUrl.searchParams.append('duree', rdv.duree.toString());
      
      // Paramètre pour indiquer qui est l'initiateur
      consultationUrl.searchParams.append('initiator', isMedecin ? 'medecin' : 'patient');

      console.log('URL de redirection:', consultationUrl.toString());
      router.push(consultationUrl.toString());
    } else {
      console.log('Accès refusé car:', {
        pasUnMedecin: !isMedecin,
        pasUnPatient: !isPatient,
        roleIncorrect: userRole !== 'medecin' && userRole !== 'patient',
        idNonCorrespondant: rdv.medecin._id !== userId && rdv.patient._id !== userId,
        roleRecu: userRole,
        idRecu: userId
      });
      alert("Vous n'êtes pas autorisé à accéder à cette consultation.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin?redirect=/rendez-vous");
          return;
        }

        // Récupérer l'ID directement depuis le token décodé
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        console.log('Token décodé:', tokenData);

        const response = await axios.get("http://localhost:3000/user/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Response complète:', response.data);

        // Essayer de récupérer l'ID et le rôle de différentes manières possibles
        let userId = '';
        let userRole = '';

        if (response.data && response.data.user) {
          const userData = response.data.user;
          console.log('User data from response:', userData);
          
          // Essayer différentes propriétés possibles pour l'ID
          userId = userData._id || userData.id || tokenData.id || tokenData._id || tokenData.userId || tokenData.sub;
          
          // Essayer différentes propriétés possibles pour le rôle
          userRole = userData.role || userData.type || tokenData.role || 'patient';

          // Nettoyer le rôle
          userRole = userRole.toString().trim().toLowerCase();
          if (userRole.includes('med') || userRole === 'doctor') userRole = 'medecin';
          if (userRole.includes('pat')) userRole = 'patient';

          console.log('Rôle avant nettoyage:', userData.role);
          console.log('Rôle après nettoyage:', userRole);
        }

        console.log('Données finales:', {
          userId,
          userRole,
          tokenDataId: tokenData.id || tokenData._id || tokenData.userId || tokenData.sub,
          tokenDataRole: tokenData.role || tokenData.type
        });

        if (!userId) {
          console.error('Aucun ID trouvé dans les données utilisateur ni dans le token');
          return;
        }

        setUserId(userId);
        setUserRole(userRole);

      } catch (error) {
        console.error("Erreur complète lors du chargement des données utilisateur:", error);
        if (error instanceof Error) {
          console.error("Message d'erreur:", error.message);
        }
      }
    };

    const fetchRendezVous = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin?redirect=/rendez-vous");
          return;
        }
        const response = await axios.get("http://localhost:3000/api/rendez-vous", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Rendez-vous reçus:', response.data);
        setRendezVous(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des rendez-vous:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/signin?redirect=/rendez-vous");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchRendezVous();
  }, [router]);

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
                Mes Rendez-vous
              </h1>
              <p className="text-lg leading-relaxed text-body-color dark:text-body-color-dark">
                Consultez et gérez vos rendez-vous médicaux
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rendezVous.map((rdv) => (
            <div
              key={rdv._id}
              className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16 mr-4">
                  <Image
                    src={rdv.medecin.image || "/images/default-avatar.png"}
                    alt={`${rdv.medecin.prenom} ${rdv.medecin.nom}`}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-dark dark:text-white">
                    Dr. {rdv.medecin.prenom} {rdv.medecin.nom}
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
                  <span className="font-semibold">Heure:</span>{" "}
                  {new Date(rdv.date).toLocaleTimeString()}
                </p>
                {rdv.duree && (
                  <p className="text-body-color dark:text-body-color-dark">
                    <span className="font-semibold">Durée:</span> {rdv.duree} minutes
                  </p>
                )}
                {rdv.prix && (
                  <p className="text-body-color dark:text-body-color-dark">
                    <span className="font-semibold">Prix:</span> {rdv.prix}€
                  </p>
                )}
                {rdv.notes && (
                  <p className="text-body-color dark:text-body-color-dark">
                    <span className="font-semibold">Notes:</span> {rdv.notes}
                  </p>
                )}
                <p className="text-body-color dark:text-body-color-dark">
                  <span className="font-semibold">Statut:</span>{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      rdv.status.toLowerCase() === "planifié"
                        ? "bg-yellow-100 text-yellow-800"
                        : rdv.status.toLowerCase() === "en_cours"
                        ? "bg-blue-100 text-blue-800"
                        : rdv.status.toLowerCase() === "terminé"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {translateStatus(rdv.status)}
                  </span>
                </p>
              </div>

              {rdv.status.toLowerCase() === "planifié" && (
                <div className="mt-4 space-y-2">
                  <button
                    className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                    onClick={() => handleStartConsultation(rdv)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <span>Démarrer la consultation</span>
                  </button>
                  <button
                    className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                    onClick={() => router.push(`/teleconsultation/${rdv._id}`)}
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
    </section>
  );
} 