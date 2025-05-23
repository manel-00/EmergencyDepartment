"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Video from "@/components/Video";
import Brands from "@/components/Brands";
import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import TablePage from './document/table/page';
import Chatbot from "@/components/chatbot";
import Doctors from "@/components/Doctors";
import AppointmentList from "@/components/AppointmentList";
import AppointmentListDoctor from "@/components/AppontmentListDoctor";
import FacturePage from "./facture/page";
import MesFactures from "./facture/mes-factures/page";
import Link from "next/link";



import Symptomes from "@/components/Symptomes";


const Home: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user/session", {
          withCredentials: true,
        });
        console.log("response", response);
        setRole(response.data.user.role);
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user role", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get("http://localhost:3000/user/session", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("❌ Erreur session :", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);


  // if (user?.role === "doctor") {
  //   return <FacturePage />;
  // }

  // if (user?.role === "patient") {
  //   return <MesFactures />;
  // }

  if (loading)
    return (
      <div
        role="status"
        className="flex items-center justify-center w-full h-screen"
      >
        <svg
          aria-hidden="true"
          className="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );

  const navigateToAppointment = () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Veuillez vous reconnecter !");
      return;
    }

    router.push(`/makeappointment/${userId}`);
  };

  if (!role) return <p>Chargement...</p>; // If the role is still pending

  return (
    <>
      <ScrollUp />
      {role === "doctor" ? <TablePage /> : <Hero />}

      
      {/* Conditional Rendering for Patients */}
      {role === "patient" && <MesFactures/>}
      {role === "doctor" && <FacturePage />}
      {role === "patient" && <Chatbot />}

      
      {role === "patient" && <Symptomes/>}








      {role === "patient" && <AppointmentList />} {/* Show AppointmentList for patient */}
      {role === "doctor" && <AppointmentListDoctor />} {/* Show AppointmentListDoctor for doctor */}
      {role === "patient" && <Doctors />}
      {role === "patient" && (
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <button
            onClick={navigateToAppointment}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Make Appointment
          </button>
          <Link
            href="/subtitle-demo"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <span>Essayer les sous-titres</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      )}

        <button onClick={navigateToAppointment}>Make Appointment</button>
      
      
    </>
  );
};

export default Home;