"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Subtitles from "./Subtitles";
import SubtitlesDemoOverlay from "./SubtitlesDemoOverlay";
import useSpeechTranslation from "@/hooks/useSpeechTranslation";
import ChatBox from "./ChatBox";

interface WebRTCRoomProps {
  consultationId: string;
  userId: string;
  onEnd: () => void;
}

export default function WebRTCRoom({ consultationId, userId, onEnd }: WebRTCRoomProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [showDemoSubtitles, setShowDemoSubtitles] = useState(false);
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Utiliser notre hook personnalisé pour la reconnaissance vocale et la traduction
  const {
    transcript: localTranscript,
    translatedText: localTranslatedText,
    startListening: startLocalListening,
    stopListening: stopLocalListening,
    detectedLanguage: localDetectedLanguage
  } = useSpeechTranslation({
    autoStart: true,
    continuous: true
  });

  // Afficher la démonstration après un court délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemoSubtitles(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Récupérer les informations de l'utilisateur
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch('http://localhost:3000/api/user/session', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'SUCCESS' && data.user) {
            // Utiliser le nom complet ou le prénom selon ce qui est disponible
            const name = data.user.name || data.user.firstname || 'User';
            setUserName(name);
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        console.log("Initializing WebRTC...");
        setConnectionStatus("Connecting to signaling server...");

        // Initialize Socket.io connection
        const socketIo = io("http://localhost:3000", {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000
        });
        socketIo.on('connect', () => {
          console.log("Connected to signaling server");
          setConnectionStatus("Connected to signaling server");
        });

        socketIo.on('connect_error', (error) => {
          console.error("Socket connection error:", error);
          setConnectionStatus("Connection error: " + error.message);
        });

        setSocket(socketIo);

        console.log("Requesting media permissions...");
        setConnectionStatus("Requesting camera and microphone access...");

        // Get local media stream
        let mediaStream: MediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          console.log("Media permissions granted");
          setLocalStream(mediaStream);
          setConnectionStatus("Media permissions granted");
        } catch (mediaError) {
          console.error("Media access error:", mediaError);

          // Essayer d'obtenir uniquement l'audio si la vidéo échoue
          try {
            console.log("Trying audio only...");
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            });
            console.log("Audio-only permissions granted");
            setLocalStream(mediaStream);
            setIsVideoEnabled(false);
            setConnectionStatus("Audio only mode - Camera access denied");
          } catch (audioError) {
            console.error("Audio access error:", audioError);
            throw new Error("Impossible d'accéder à la caméra ou au microphone. Veuillez vérifier vos permissions de navigateur.");
          }
        }

        // Initialize WebRTC peer connection
        console.log("Creating peer connection...");
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
        });
        peerConnection.current = pc;

        // Add local stream to peer connection
        if (mediaStream) {
          mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
            pc.addTrack(track, mediaStream);
          });
        }

        // Handle incoming remote stream
        pc.ontrack = (event) => {
          console.log("Received remote stream");
          setRemoteStream(event.streams[0]);
          setConnectionStatus("Remote stream received");
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("New ICE candidate");
            socketIo.emit("ice-candidate", event.candidate, consultationId, userId);
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc.iceConnectionState);
          setConnectionStatus("ICE state: " + pc.iceConnectionState);
        };

        // Join room
        console.log("Joining room:", consultationId);
        socketIo.emit("join-room", consultationId, userId);
        setConnectionStatus("Joining consultation room...");

        // Handle WebRTC signaling
        socketIo.on("user-connected", async (connectedUserId) => {
          console.log("User connected:", connectedUserId);
          if (connectedUserId !== userId) {
            console.log("Creating offer...");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketIo.emit("offer", offer, consultationId, userId);
            setConnectionStatus("Offer created and sent");
          }
        });

        socketIo.on("offer", async (offer, senderId) => {
          console.log("Received offer from:", senderId);
          if (senderId !== userId) {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketIo.emit("answer", answer, consultationId, userId);
            setConnectionStatus("Answer created and sent");
          }
        });

        socketIo.on("answer", async (answer, senderId) => {
          console.log("Received answer from:", senderId);
          if (senderId !== userId) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            setConnectionStatus("Connection established");
          }
        });

        socketIo.on("ice-candidate", async (candidate, senderId) => {
          console.log("Received ICE candidate from:", senderId);
          if (senderId !== userId) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        return () => {
          console.log("Cleaning up...");
          if (mediaStream) {
            mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          }
          pc.close();
          socketIo.disconnect();
        };
      } catch (error) {
        console.error("Error initializing WebRTC:", error);
        setError("Failed to initialize video consultation: " + (error as Error).message);
        setConnectionStatus("Error: " + (error as Error).message);
      }
    };

    initializeWebRTC();
  }, [consultationId, userId]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);

      // Si on désactive l'audio, on arrête aussi la reconnaissance vocale
      if (!audioTrack.enabled) {
        stopLocalListening();
      } else {
        startLocalListening();
      }
    }
  };

  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  const changeTargetLanguage = () => {
    setTargetLanguage(targetLanguage === "en" ? "fr" : "en");
  };

  const handleEndConsultation = async () => {
    try {
      const token = localStorage.getItem("token");

      try {
        // First try with the consultation ID
        let response = await axios.post(
          `http://localhost:3000/api/consultations/${consultationId}/end`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Successfully ended consultation:", response.data);

        // Show success message
        setShowCompletedMessage(true);

        // Wait 2 seconds before closing
        setTimeout(() => {
          if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
          }
          if (peerConnection.current) {
            peerConnection.current.close();
          }
          if (socket) {
            socket.disconnect();
          }
          // Call onEnd to update parent component
          onEnd();
        }, 2000);

        return; // Exit early
      } catch (apiError) {
        console.error("API error when ending consultation:", apiError);
        // Continue with cleanup even if API call fails
      }

      // If we get here, the API call failed
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socket) {
        socket.disconnect();
      }

      // Still call onEnd to update parent component
      onEnd();
    } catch (error) {
      console.error("Error ending consultation:", error);
      setError("Failed to end consultation");

      // Still call onEnd to update parent component even on error
      setTimeout(() => {
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
        }
        if (peerConnection.current) {
          peerConnection.current.close();
        }
        if (socket) {
          socket.disconnect();
        }
        onEnd();
      }, 2000);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <div className="text-gray-600 mb-6">
          <p>La connexion a échoué, mais vous pouvez quand même tester les sous-titres en mode démonstration.</p>
        </div>
        <button
          onClick={onEnd}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 mb-4"
        >
          Back
        </button>

        {showDemoSubtitles && (
          <div className="w-full max-w-4xl">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2 text-center">
              Démonstration des sous-titres en temps réel
            </h3>
            <SubtitlesDemoOverlay onClose={() => setShowDemoSubtitles(false)} />
          </div>
        )}
      </div>
    );
  }

  // Activer le chat par défaut pour le médecin
  useEffect(() => {
    // Vérifier si l'utilisateur est un médecin
    const checkIfDoctor = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/user/session', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && (data.user.role === 'doctor' || data.user.role === 'medecin')) {
            // Activer automatiquement le chat pour les médecins
            setShowChat(true);
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    checkIfDoctor();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* Chat Box */}
      {socket && (
        <ChatBox
          socket={socket}
          consultationId={consultationId}
          userId={userId}
          userName={userName || 'User'}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}

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

      {showDemoSubtitles && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Démonstration des sous-titres en temps réel
              </h2>
              <button
                onClick={() => setShowDemoSubtitles(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <SubtitlesDemoOverlay onClose={() => setShowDemoSubtitles(false)} />
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-dark rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              Video Consultation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {connectionStatus}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
            <button
              onClick={handleEndConsultation}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              End Consultation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <Subtitles
              text={localTranscript}
              isVisible={showSubtitles && isAudioEnabled}
              position="bottom"
              language={localDetectedLanguage}
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
                  showSubtitles ? "bg-green-500" : "bg-gray-500"
                } text-white font-bold text-xs`}
                title="Activer/désactiver les sous-titres"
              >
                CC
              </button>
              <button
                onClick={changeTargetLanguage}
                className="p-2 rounded-full bg-blue-500 text-white font-bold text-xs"
                title="Changer la langue de traduction"
              >
                {targetLanguage === "en" ? "FR→EN" : "EN→FR"}
              </button>
            </div>
          </div>

          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <Subtitles
              text={localTranslatedText}
              isVisible={showSubtitles && isAudioEnabled}
              position="bottom"
              language={targetLanguage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
