"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function GoogleCalendarIntegration() {
  const [integrationStatus, setIntegrationStatus] = useState({
    enabled: false,
    connected: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIntegrationStatus({
          ...integrationStatus,
          loading: false,
          error: "Vous devez être connecté pour accéder à cette fonctionnalité",
        });
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/api/google-calendar/status",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIntegrationStatus({
        enabled: response.data.enabled,
        connected: response.data.connected,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du statut:", error);
      setIntegrationStatus({
        ...integrationStatus,
        loading: false,
        error:
          error.response?.data?.message ||
          "Erreur lors de la récupération du statut d'intégration",
      });
    }
  };

  const handleToggleIntegration = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIntegrationStatus({
          ...integrationStatus,
          error: "Vous devez être connecté pour accéder à cette fonctionnalité",
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/api/google-calendar/toggle",
        {
          enabled: !integrationStatus.enabled,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.needsAuth) {
        // Redirect to Google authorization
        handleAuthorize();
        return;
      }

      setIntegrationStatus({
        ...integrationStatus,
        enabled: response.data.enabled,
        error: null,
      });
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      setIntegrationStatus({
        ...integrationStatus,
        error:
          error.response?.data?.message ||
          "Erreur lors de la modification du statut d'intégration",
      });
    }
  };

  const handleAuthorize = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIntegrationStatus({
          ...integrationStatus,
          error: "Vous devez être connecté pour accéder à cette fonctionnalité",
        });
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/api/google-calendar/auth-url",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Redirect to Google authorization page
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Erreur lors de l'autorisation:", error);
      setIntegrationStatus({
        ...integrationStatus,
        error:
          error.response?.data?.message ||
          "Erreur lors de l'autorisation Google Calendar",
      });
    }
  };

  if (integrationStatus.loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Intégration Google Calendar
      </h3>

      {integrationStatus.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {integrationStatus.error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Statut de l'intégration:{" "}
          <span
            className={`font-semibold ${
              integrationStatus.enabled
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {integrationStatus.enabled ? "Activée" : "Désactivée"}
          </span>
        </p>

        <p className="text-gray-600 dark:text-gray-300">
          Connexion à Google Calendar:{" "}
          <span
            className={`font-semibold ${
              integrationStatus.connected
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {integrationStatus.connected ? "Connecté" : "Non connecté"}
          </span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleToggleIntegration}
          className={`px-4 py-2 rounded-md text-white ${
            integrationStatus.enabled
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={!integrationStatus.connected && !integrationStatus.enabled}
        >
          {integrationStatus.enabled
            ? "Désactiver l'intégration"
            : "Activer l'intégration"}
        </button>

        {!integrationStatus.connected && (
          <button
            onClick={handleAuthorize}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Connecter à Google Calendar
          </button>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          En activant cette intégration, les rendez-vous de téléconsultation
          seront automatiquement ajoutés à votre Google Calendar.
        </p>
      </div>
    </div>
  );
}
