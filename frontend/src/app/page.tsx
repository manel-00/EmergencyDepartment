"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import FacturePage from "./facture/page";
import MesFactures from "./facture/mes-factures/page";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Chargement de la session...</p>;
  }

  if (user?.role === "doctor") {
    return <FacturePage />;
  }

  if (user?.role === "patient") {
    return <MesFactures />;
  }

  return (
    <>
      <ScrollUp />
      <Hero />
      {/* autres composants... */}
    </>
  );
}
