"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CalendarConnectedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to teleconsultation page after 5 seconds
    const timer = setTimeout(() => {
      router.push("/teleconsultation");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Connexion réussie !
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Votre compte a été connecté avec succès à Google Calendar. Vos
          rendez-vous de téléconsultation seront désormais synchronisés
          automatiquement.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Vous serez redirigé automatiquement dans quelques secondes...
        </div>
        <Link
          href="/teleconsultation"
          className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Retour aux téléconsultations
        </Link>
      </div>
    </div>
  );
}
