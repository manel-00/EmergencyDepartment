"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  
  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      alert("✅ Connexion réussie via OAuth !");
      router.push("/"); // ou dashboard
    } else {
      alert("❌ Erreur OAuth");
      router.push("/signin");
    }
  }, [params, router]);

  return <p className="text-center text-white mt-20">Connexion en cours...</p>;
}
