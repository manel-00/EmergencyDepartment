"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Le token est déjà dans un cookie HTTP-only (secure)
    // Aucune action côté client n'est nécessaire ici
    router.push("/"); // Redirige vers la page d'accueil ou dashboard
  }, [router]);

  return (
    <p className="text-center text-white mt-20">
      ✅ Connexion réussie. Redirection en cours...
    </p>
  );
}
