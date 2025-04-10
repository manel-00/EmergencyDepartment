"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AdminDashboard = () => {


  const [user, setUser] = useState(null);
  const router = useRouter();

  // ✅ Vérifie la session et le rôle admin
  const fetchUserSession = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/user/session", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });

      if (response.data.status === "SUCCESS") {
        const currentUser = response.data.user;

        if (currentUser.role !== "admin") {
          alert("⛔ Accès refusé. Vous n’êtes pas un administrateur.");
          router.push("http://localhost:3001"); // redirection vers le front normal
          return;
        }
        setUser(currentUser);
      } else {
        router.push("/signin");
      }
    } catch (error) {
      console.error("❌ Erreur session:", error);
      router.push("/signin");
    }
  };

  // ✅ Déconnexion propre
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/user/logout", {
        withCredentials: true,
      });
  
      // Supprimer le token s’il existe
      localStorage.removeItem("token");
  
      // Supprimer les cookies manuellement (juste au cas où)
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
  
      // Émettre un événement de déconnexion
      window.dispatchEvent(new Event('userLoggedOut'));
  
      setUser (null);
      router.push("/signin");
    } catch (error) {
      console.error("❌ Échec de la déconnexion:", error);
    }
  };

  useEffect(() => {
    fetchUserSession();
  }, []);

  if (!user) return <p className="text-white p-10">Chargement...</p>;


  return (
 
     <p></p>
  );
};

export default AdminDashboard;
