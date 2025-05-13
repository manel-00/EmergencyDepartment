"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function GoogleCalendarIntegration() {
  const [integrationStatus, setIntegrationStatus] = useState({
    enabled: false,
    connected: false,
    loading: true,
    error: null,
    testResult: null,
    testLoading: false,
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
          error: "You must be logged in to access this feature",
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
      console.error("Error retrieving status:", error);
      setIntegrationStatus({
        ...integrationStatus,
        loading: false,
        error:
          error.response?.data?.message ||
          "Error retrieving integration status",
      });
    }
  };

  const handleToggleIntegration = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIntegrationStatus({
          ...integrationStatus,
          error: "You must be logged in to access this feature",
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
      console.error("Error modifying status:", error);
      setIntegrationStatus({
        ...integrationStatus,
        error:
          error.response?.data?.message ||
          "Error modifying integration status",
      });
    }
  };

  const handleAuthorize = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIntegrationStatus({
          ...integrationStatus,
          error: "You must be logged in to access this feature",
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
      console.error("Error during authorization:", error);
      setIntegrationStatus({
        ...integrationStatus,
        error:
          error.response?.data?.message ||
          "Error during Google Calendar authorization",
      });
    }
  };

  const handleForceReauthorize = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIntegrationStatus({
          ...integrationStatus,
          error: "You must be logged in to access this feature",
        });
        return;
      }

      // Display a confirmation message
      if (!confirm("Are you sure you want to reset the Google Calendar connection? You will need to reconnect.")) {
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/api/google-calendar/reauthorize",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Redirect to Google authorization page
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Error during reauthorization:", error);
      setIntegrationStatus({
        ...integrationStatus,
        error:
          error.response?.data?.message ||
          "Error resetting Google Calendar connection",
      });
    }
  };

  const handleTestIntegration = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIntegrationStatus({
          ...integrationStatus,
          error: "You must be logged in to access this feature",
          testResult: null,
        });
        return;
      }

      // Update state to indicate that the test is in progress
      setIntegrationStatus({
        ...integrationStatus,
        testLoading: true,
        testResult: null,
        error: null,
      });

      const response = await axios.get(
        "http://localhost:3000/api/google-calendar/test",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Test successful
      setIntegrationStatus({
        ...integrationStatus,
        testLoading: false,
        testResult: {
          success: true,
          message: "Integration test successful! A test event was created and then removed from your calendar.",
          details: response.data
        },
        error: null,
      });

    } catch (error) {
      console.error("Error during integration test:", error);

      // If the error indicates that authentication has expired
      if (error.response?.status === 401 && error.response?.data?.needsReauthorization) {
        if (confirm("Your Google Calendar authentication has expired. Would you like to reconnect now?")) {
          window.location.href = error.response.data.authUrl;
          return;
        }
      }

      setIntegrationStatus({
        ...integrationStatus,
        testLoading: false,
        testResult: {
          success: false,
          message: "The integration test failed.",
          details: error.response?.data || { error: error.message }
        },
        error: error.response?.data?.message || "Error during Google Calendar integration test",
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
        Google Calendar Integration
      </h3>

      {integrationStatus.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {integrationStatus.error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Integration Status:{" "}
          <span
            className={`font-semibold ${
              integrationStatus.enabled
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {integrationStatus.enabled ? "Enabled" : "Disabled"}
          </span>
        </p>

        <p className="text-gray-600 dark:text-gray-300">
          Google Calendar Connection:{" "}
          <span
            className={`font-semibold ${
              integrationStatus.connected
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {integrationStatus.connected ? "Connected" : "Not connected"}
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
            ? "Disable Integration"
            : "Enable Integration"}
        </button>

        {!integrationStatus.connected && (
          <button
            onClick={handleAuthorize}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Connect to Google Calendar
          </button>
        )}

        {integrationStatus.connected && (
          <button
            onClick={handleForceReauthorize}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            title="Use this option if appointments don't appear in your Google Calendar"
          >
            Reset Connection
          </button>
        )}

        {integrationStatus.connected && integrationStatus.enabled && (
          <button
            onClick={handleTestIntegration}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md"
            disabled={integrationStatus.testLoading}
            title="Test the integration with Google Calendar by creating a test event"
          >
            {integrationStatus.testLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </span>
            ) : (
              "Test Integration"
            )}
          </button>
        )}
      </div>

      {/* Test result */}
      {integrationStatus.testResult && (
        <div className={`mt-4 p-4 rounded-md ${
          integrationStatus.testResult.success
            ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200"
            : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200"
        }`}>
          <h4 className="font-medium text-lg mb-2">
            {integrationStatus.testResult.success ? "✅ Test successful" : "❌ Test failed"}
          </h4>
          <p className="mb-2">{integrationStatus.testResult.message}</p>

          {!integrationStatus.testResult.success && (
            <div className="mt-2 text-sm">
              <p className="font-medium">Error details:</p>
              <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900/50 rounded overflow-x-auto">
                {JSON.stringify(integrationStatus.testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          By enabling this integration, teleconsultation appointments
          will be automatically added to your Google Calendar.
        </p>

        {integrationStatus.connected && integrationStatus.enabled && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Troubleshooting tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>If appointments don't appear in your calendar, verify that you're connected to the correct Google account.</li>
              <li>Make sure notifications are enabled in your Google Calendar settings.</li>
              <li>If the problem persists, use the "Reset Connection" button above to reauthorize the application.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
