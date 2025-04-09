"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface TeleconsultationRoomProps {
  consultationId: string;
  onEnd: () => void;
}

export default function TeleconsultationRoom({ consultationId, onEnd }: TeleconsultationRoomProps) {
  const router = useRouter();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin?redirect=/teleconsultation");
          return;
        }

        const sessionResponse = await axios.get("http://localhost:3000/user/session", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!sessionResponse.data.user) {
          localStorage.removeItem("token");
          router.push("/signin?redirect=/teleconsultation");
        }
      } catch (error) {
        console.error("❌ Session check failed:", error);
        localStorage.removeItem("token");
        router.push("/signin?redirect=/teleconsultation");
      }
    };

    const fetchConsultation = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/consultations/${consultationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConsultation(response.data);
      } catch (error) {
        console.error("Error loading consultation:", error);
        setError("Unable to load consultation information");
      } finally {
        setLoading(false);
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setError("Unable to access camera or microphone");
      }
    };

    checkSession();
    fetchConsultation();
    startVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [consultationId, router]);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const handleEndConsultation = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/consultations/${consultationId}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      onEnd();
    } catch (error) {
      console.error("Error ending consultation:", error);
      setError("Unable to end consultation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={onEnd}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-dark rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            Consultation with Dr. {consultation?.medecin?.prenom} {consultation?.medecin?.nom}
          </h2>
          <button
            onClick={handleEndConsultation}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End Consultation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={toggleVideo}
                className={`p-2 rounded-full ${
                  isVideoEnabled ? "bg-green-500" : "bg-red-500"
                } text-white`}
              >
                {isVideoEnabled ? "🎥" : "🚫"}
              </button>
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-full ${
                  isAudioEnabled ? "bg-green-500" : "bg-red-500"
                } text-white`}
              >
                {isAudioEnabled ? "🎤" : "🚫"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                Consultation Information
              </h3>
              <p className="text-body-color dark:text-body-color-dark">
                Date: {new Date(consultation?.date).toLocaleString()}
              </p>
              <p className="text-body-color dark:text-body-color-dark">
                Type: {consultation?.typeConsultation}
              </p>
              {consultation?.notes && (
                <p className="text-body-color dark:text-body-color-dark">
                  Notes: {consultation.notes}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                Instructions
              </h3>
              <ul className="list-disc list-inside text-body-color dark:text-body-color-dark space-y-2">
                <li>Make sure you are in a quiet and well-lit place</li>
                <li>Check that your camera and microphone are working properly</li>
                <li>Prepare your questions and medical documents if needed</li>
                <li>Contact support if you experience technical issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 