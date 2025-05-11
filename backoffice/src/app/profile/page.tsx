"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


export default function Page() {
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
          alert("⛔ Acces denied. Admin only interface.");
          router.push("http://localhost:3001"); // redirection
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
      router.push("http://localhost:3001/signin");
    } catch (error) {
      console.error("❌ Échec de la déconnexion:", error);
    }
  };

  useEffect(() => {
    fetchUserSession();
  }, []);

  if (!user) return <p className="text-white p-10">Chargement...</p>;

  return (
    <div className="p-10 text-white bg-gray-900 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={`http://localhost:3001/images/${user.image}`}
          alt="Admin Avatar"
          width={80}
          height={80}
          className="rounded-full border-2 border-white"
        />
        <div>
          <h2 className="text-2xl font-bold">Welcome, {user.email}</h2>
          <p className="text-sm opacity-70">{user.role}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
      >
        Logout
      </button>
    </div>
  );
};  
