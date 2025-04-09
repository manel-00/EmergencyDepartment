"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import Chatbot from "@/components/chatbot";
import Doctors from "@/components/Doctors";
import AppointmentList from "@/components/AppointmentList";
import AppointmentListDoctor from "@/components/AppontmentListDoctor";

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      // Appel API pour récupérer le rôle de l'utilisateur
      axios
        .get(`http://localhost:3000/user/getDoctor/${userId}`)
        .then((response) => {
          setRole(response.data.role); // La réponse contient le rôle de l'utilisateur
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération du rôle de l'utilisateur :", error);
        });
    } else {
      alert("Veuillez vous reconnecter !");
    }
  }, []);

  const navigateToAppointment = () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Veuillez vous reconnecter !");
      return;
    }

    router.push(`/makeappointment/${userId}`);
  };

  // Vérification du rôle avant l'affichage
  if (!role) return <p>Chargement...</p>; // Si le rôle est encore en attente

  return (
    <>
      <ScrollUp />
      <Hero />
      {role === "patient" &&<Chatbot />}
      {role === "patient" && <AppointmentList />} {/* Si le rôle est patient, afficher AppointmentList */}
      {role === "doctor" && <AppointmentListDoctor />} {/* Si le rôle est docteur, afficher AppointmentListDoctor */}
      {role === "patient" && <Doctors />}
      {role === "patient" && (
        <button onClick={navigateToAppointment}>Make Appointment</button>
      )}
    </>
  );
}
