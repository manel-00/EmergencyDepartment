"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import SubtitlesDemoOverlay from "./SubtitlesDemoOverlay";
import Subtitles from "./Subtitles";
import ConsultationChat from "./ConsultationChat";

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
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showSubtitlesDemo, setShowSubtitlesDemo] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [showCompletedMessage, setShowCompletedMessage] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Afficher la démonstration des sous-titres après un court délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubtitlesDemo(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
        } else {
          // Set user information for chat
          const user = sessionResponse.data.user;
          setUserId(user._id || user.id);
          setUserName(user.name || user.prenom || "User");
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

        // First try to fetch as a consultation
        try {
          console.log("Trying to fetch as consultation:", consultationId);
          const response = await axios.get(`http://localhost:3000/api/consultations/${consultationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data) {
            console.log("Found as consultation:", response.data);
            setConsultation(response.data);
            setLoading(false);
            return;
          }
        } catch (consultationError) {
          console.log("Not found as consultation, trying as rendez-vous...");
        }

        // If not found as consultation, try to fetch as a rendez-vous
        try {
          console.log("Trying to fetch as rendez-vous:", consultationId);
          const rendezVousResponse = await axios.get(`http://localhost:3000/api/rendez-vous/${consultationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (rendezVousResponse.data) {
            console.log("Found as rendez-vous:", rendezVousResponse.data);

            // If the rendez-vous has a linked consultation, fetch it
            if (rendezVousResponse.data.consultation) {
              try {
                const linkedConsultationResponse = await axios.get(
                  `http://localhost:3000/api/consultations/${rendezVousResponse.data.consultation}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (linkedConsultationResponse.data) {
                  console.log("Found linked consultation:", linkedConsultationResponse.data);
                  setConsultation(linkedConsultationResponse.data);
                  setLoading(false);
                  return;
                }
              } catch (linkedError) {
                console.log("No linked consultation found");
              }
            }

            // Create a consultation object from the rendez-vous data
            const consultationFromRdv = {
              _id: rendezVousResponse.data._id,
              date: rendezVousResponse.data.date + "T" + rendezVousResponse.data.time,
              medecin: rendezVousResponse.data.medecin,
              patient: rendezVousResponse.data.patient,
              status: rendezVousResponse.data.status,
              typeConsultation: "Vidéo"
            };

            console.log("Created consultation from rendez-vous:", consultationFromRdv);
            setConsultation(consultationFromRdv);
            setLoading(false);
            return;
          }
        } catch (rendezVousError) {
          console.log("Not found as rendez-vous either:", rendezVousError);
        }

        // If we get here, neither consultation nor rendez-vous was found
        throw new Error("Consultation or rendez-vous not found");
      } catch (error) {
        console.error("Error loading consultation:", error);
        setError("Unable to load consultation information");
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

    const initializeSocket = () => {
      // Initialize Socket.io connection for chat
      const socket = io("http://localhost:3000", {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      socket.on('connect', () => {
        console.log("Chat socket connected with ID:", socket.id);

        // Join the consultation room for chat
        socket.emit("join-chat-room", consultationId);
      });

      socket.on('connect_error', (error) => {
        console.error("Chat socket connection error:", error);
      });

      setSocketInstance(socket);

      return socket;
    };

    checkSession();
    fetchConsultation();
    startVideo();
    const socket = initializeSocket();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Disconnect socket when component unmounts
      if (socket) {
        socket.disconnect();
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

      // Try to end the consultation if it exists
      if (consultation?._id) {
        try {
          const response = await axios.post(
            `http://localhost:3000/api/consultations/${consultation._id}/end`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Successfully ended consultation:", response.data);

          // Show a success message
          setShowCompletedMessage(true);

          // Set a timeout to redirect after showing the message
          setTimeout(() => {
            // Stop all media tracks
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }

            // Return to the previous page
            onEnd();
          }, 2000);

          return; // Exit early to prevent immediate redirect
        } catch (endError) {
          console.log("Error ending consultation, may not be a real consultation:", endError);
          // Continue even if this fails, as it might be a rendez-vous without a real consultation
        }
      }

      // If we get here, either there was no consultation ID or the API call failed
      // Stop all media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Return to the previous page
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

  // Fonction pour basculer l'affichage des sous-titres
  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  // Fonction pour changer la langue de traduction
  const toggleLanguage = () => {
    setTargetLanguage(targetLanguage === "en" ? "fr" : "en");
  };

  // Si une erreur se produit, afficher quand même la démo des sous-titres
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={onEnd}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 mb-4"
        >
          Back
        </button>

        {showSubtitlesDemo && (
          <div className="w-full max-w-4xl">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2 text-center">
              Démonstration des sous-titres en temps réel
            </h3>
            <SubtitlesDemoOverlay onClose={() => setShowSubtitlesDemo(false)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {showCompletedMessage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Consultation Completed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The consultation has been successfully marked as completed.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-dark rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            Consultation with Dr. {consultation?.medecin?.prenom || consultation?.medecin?.name} {consultation?.medecin?.nom || consultation?.medecin?.lastname}
          </h2>
          <button
            onClick={handleEndConsultation}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End Consultation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vidéo locale */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden md:col-span-2">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <Subtitles
              text=""
              isVisible={showSubtitles && isAudioEnabled}
              position="bottom"
              language="fr"
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
              <button
                onClick={toggleSubtitles}
                className={`p-2 rounded-full ${
                  showSubtitles ? "bg-green-500" : "bg-red-500"
                } text-white`}
              >
                CC
              </button>
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-full bg-blue-500 text-white text-xs"
              >
                {targetLanguage === "en" ? "FR→EN" : "EN→FR"}
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="md:row-span-2 h-[400px] md:h-auto">
            <ConsultationChat
              consultationId={consultationId}
              userId={userId}
              userName={userName}
              socket={socketInstance}
            />
          </div>

          {/* Vidéo distante */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-center h-full text-gray-500">
              Waiting for doctor to join...
            </div>
            <Subtitles
              text=""
              isVisible={showSubtitles}
              position="bottom"
              language={targetLanguage}
            />
          </div>

          {/* Informations de consultation */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                Consultation Information
              </h3>
              <p className="text-body-color dark:text-body-color-dark">
                Date: {consultation?.date ? new Date(consultation.date).toLocaleString() : 'Date non disponible'}
              </p>
              <p className="text-body-color dark:text-body-color-dark">
                Type: {consultation?.typeConsultation || consultation?.type || 'Vidéo'}
              </p>
              <p className="text-body-color dark:text-body-color-dark">
                Patient: {consultation?.patient?.prenom || consultation?.patient?.name} {consultation?.patient?.nom || consultation?.patient?.lastname}
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

        {/* Afficher la démo des sous-titres si activée */}
        {showSubtitlesDemo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Démonstration des sous-titres en temps réel
                </h2>
                <button
                  onClick={() => setShowSubtitlesDemo(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <SubtitlesDemoOverlay onClose={() => setShowSubtitlesDemo(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}