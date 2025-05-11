"use client";

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import Subtitles from '@/components/teleconsultation/Subtitles';
import SubtitlesDemoOverlay from '@/components/teleconsultation/SubtitlesDemoOverlay';
import ChatBox from '@/components/teleconsultation/ChatBox';
import useSpeechTranslation from '@/hooks/useSpeechTranslation';

export default function TeleconsultationRoom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showSubtitlesDemo, setShowSubtitlesDemo] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRemoteStreamConnected, setIsRemoteStreamConnected] = useState(false);
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const [participantNames, setParticipantNames] = useState({
    patient: 'Patient',
    doctor: 'Doctor'
  });

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

  // Références pour les éléments vidéo
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Références pour WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<any>(null);

  // Paramètres de la consultation
  const consultationId = searchParams.get('consultation');
  const patientId = searchParams.get('patient');
  const medecinId = searchParams.get('medecin');
  const userRole = searchParams.get('role');
  const userId = searchParams.get('userId');

  // Afficher la démonstration des sous-titres après un court délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubtitlesDemo(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Vérification des paramètres requis
    const missingParams = [];
    if (!consultationId) missingParams.push('consultation');
    if (!userId) missingParams.push('userId');
    if (!userRole) missingParams.push('role');
    if (!patientId) missingParams.push('patient');
    if (!medecinId) missingParams.push('medecin');

    if (missingParams.length > 0) {
      setError(`Missing required parameters: ${missingParams.join(', ')}`);
      setConnectionStatus('Error: Missing parameters');
      return;
    }

    // Vérification de l'authentification
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in first.');
      setConnectionStatus('Error: Not authenticated');
      router.push('/sign-in');
      return;
    }

    // Récupération des noms des participants
    const fetchParticipantNames = async () => {
      try {
        setConnectionStatus('Fetching participant information...');
        console.log('Fetching participant info for:', { patientId, medecinId });

        // Récupération des informations du patient
        const patientResponse = await fetch(`http://localhost:3000/api/session`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-User-Id': patientId
          }
        });

        console.log('Patient response status:', patientResponse.status);

        if (!patientResponse.ok) {
          console.error('Patient fetch error:', await patientResponse.text());
          setParticipantNames(prev => ({
            ...prev,
            patient: 'Patient'
          }));
        } else {
          const patientData = await patientResponse.json();
          console.log('Patient data:', patientData);
          if (patientData.status === 'SUCCESS' && patientData.user) {
            setParticipantNames(prev => ({
              ...prev,
              patient: `${patientData.user.name} ${patientData.user.lastname}`
            }));
          }
        }

        // Récupération des informations du médecin
        const medecinResponse = await fetch(`http://localhost:3000/api/session`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-User-Id': medecinId
          }
        });

        console.log('Doctor response status:', medecinResponse.status);

        if (!medecinResponse.ok) {
          console.error('Doctor fetch error:', await medecinResponse.text());
          setParticipantNames(prev => ({
            ...prev,
            doctor: 'Doctor'
          }));
        } else {
          const medecinData = await medecinResponse.json();
          console.log('Doctor data:', medecinData);
          if (medecinData.status === 'SUCCESS' && medecinData.user) {
            setParticipantNames(prev => ({
              ...prev,
              doctor: `${medecinData.user.name} ${medecinData.user.lastname}`
            }));
          }
        }

        setConnectionStatus('Starting video connection...');
      } catch (error) {
        console.error('Error fetching participant names:', error);
        setConnectionStatus('Starting video connection with default names...');
      }
    };

    fetchParticipantNames();

    setConnectionStatus('Connecting to server...');

    // Configuration de la connexion WebRTC
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
          urls: [
            'turn:numb.viagenie.ca',
            'turn:numb.viagenie.ca?transport=tcp'
          ],
          username: 'webrtc@live.com',
          credential: 'muazkh'
        }
      ],
      iceCandidatePoolSize: 10
    };

    // Initialisation de la connexion Socket.IO
    socketRef.current = io('http://localhost:3000', {
      path: '/socket.io',
      query: {
        consultationId,
        userId,
        role: userRole,
        patientId,
        medecinId,
        userName: userRole === 'medecin' ? participantNames.doctor : participantNames.patient
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true
    });

    // Création de la connexion WebRTC
    peerConnectionRef.current = new RTCPeerConnection(configuration);
    console.log('WebRTC peer connection created');

    // Gestion des événements Socket.IO
    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', socketRef.current.id);
      setIsConnected(true);
      setConnectionStatus('Connected to server');

      // Rejoindre la salle de consultation
      socketRef.current.emit('join-room', {
        consultationId,
        userId,
        role: userRole
      });
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setConnectionStatus('Connection error: ' + error.message);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket.IO error:', error);
      setConnectionStatus('Socket error: ' + error);
    });

    socketRef.current.on('user-connected', async (data: any) => {
      console.log('User connected to room:', data);
      setConnectionStatus('Other participant connected');

      // Si on est l'initiateur, on déclenche la négociation
      if (searchParams.get('initiator') === userRole && peerConnectionRef.current) {
        try {
          console.log('We are the initiator, creating offer...');
          // S'assurer que le flux local est ajouté avant de créer l'offre
          if (!localStreamRef.current) {
            console.log('Waiting for local stream before creating offer...');
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
              audio: true
            });
            console.log('Local stream obtained for offer:', stream.id);
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach(track => {
              if (peerConnectionRef.current && localStreamRef.current) {
                console.log('Adding track to peer connection for offer:', track.kind);
                peerConnectionRef.current.addTrack(track, localStreamRef.current);
              }
            });
          }

          const offer = await peerConnectionRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          console.log('Created offer:', offer.type);
          await peerConnectionRef.current.setLocalDescription(offer);

          // Include consultation ID in the offer
          socketRef.current.emit('offer', {
            ...offer,
            consultationId: consultationId
          });

          console.log('Sent initial offer after user connected');
          setConnectionStatus('Sent connection offer');
        } catch (error) {
          console.error('Error creating initial offer:', error);
          setConnectionStatus('Error creating offer');
        }
      } else {
        console.log('We are not the initiator, waiting for offer...');
        setConnectionStatus('Waiting for connection offer');
      }
    });

    socketRef.current.on('user-disconnected', (data: any) => {
      console.log('User disconnected from room:', data);
      setConnectionStatus('Other participant disconnected');
      setIsRemoteStreamConnected(false);

      // Clear remote video stream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    // Gestion des candidats ICE
    socketRef.current.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      console.log('Received ICE candidate:', candidate);
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Successfully added ICE candidate');
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Gestion des événements WebRTC
    socketRef.current.on('offer', async (offer: RTCSessionDescriptionInit) => {
      console.log('Received WebRTC offer');
      try {
        if (peerConnectionRef.current) {
          console.log('Setting remote description from offer');
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));

          // S'assurer que le flux local est ajouté avant de créer la réponse
          if (!localStreamRef.current) {
            console.log('Waiting for local stream before creating answer...');
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach(track => {
              if (peerConnectionRef.current && localStreamRef.current) {
                peerConnectionRef.current.addTrack(track, localStreamRef.current);
              }
            });
          }

          console.log('Creating answer');
          const answer = await peerConnectionRef.current.createAnswer();
          console.log('Setting local description');
          await peerConnectionRef.current.setLocalDescription(answer);
          console.log('Sending answer');
          socketRef.current.emit('answer', {
            ...answer,
            consultationId: consultationId
          });
          setConnectionStatus('WebRTC connection established');
        }
      } catch (error) {
        console.error('Error processing offer:', error);
        setError('Error establishing video connection');
      }
    });

    socketRef.current.on('answer', async (answer: RTCSessionDescriptionInit) => {
      console.log('Received WebRTC answer');
      try {
        if (peerConnectionRef.current) {
          console.log('Setting remote description from answer');
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setConnectionStatus('WebRTC connection established');
        }
      } catch (error) {
        console.error('Error processing answer:', error);
        setError('Error establishing video connection');
      }
    });

    // Gestion des événements de la connexion WebRTC
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate);
          socketRef.current.emit('ice-candidate', {
            ...event.candidate,
            consultationId: consultationId
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track:', event.streams[0]);
        if (remoteVideoRef.current && event.streams[0]) {
          console.log('Setting remote video stream');
          remoteVideoRef.current.srcObject = event.streams[0];
          setConnectionStatus('Remote video stream connected');
          setIsRemoteStreamConnected(true);
        }
      };

      peerConnectionRef.current.onnegotiationneeded = async () => {
        console.log('Negotiation needed');
        if (searchParams.get('initiator') === userRole) {
          try {
            const offer = await peerConnectionRef.current?.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            if (offer && peerConnectionRef.current) {
              await peerConnectionRef.current.setLocalDescription(offer);
              socketRef.current.emit('offer', {
                ...offer,
                consultationId: consultationId
              });
              console.log('Sent renegotiation offer');
            }
          } catch (error) {
            console.error('Error during renegotiation:', error);
          }
        }
      };

      peerConnectionRef.current.onconnectionstatechange = () => {
        if (peerConnectionRef.current) {
          const state = peerConnectionRef.current.connectionState;
          console.log('WebRTC connection state changed:', state);
          setConnectionStatus(`Connection state: ${state}`);

          // Si la connexion échoue, on essaie de la rétablir
          if (state === 'failed' && searchParams.get('initiator') === userRole) {
            console.log('Connection failed, attempting to restart ICE');
            peerConnectionRef.current.restartIce();
          }
        }
      };

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        if (peerConnectionRef.current) {
          const state = peerConnectionRef.current.iceConnectionState;
          console.log('ICE connection state changed:', state);
        }
      };

      peerConnectionRef.current.onicegatheringstatechange = () => {
        if (peerConnectionRef.current) {
          const state = peerConnectionRef.current.iceGatheringState;
          console.log('ICE gathering state changed:', state);
        }
      };
    }

    // Initialisation du flux vidéo local
    const startLocalStream = async () => {
      try {
        setConnectionStatus('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: true
        });

        console.log('Local stream obtained:', stream.id);
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setConnectionStatus('Camera access granted');
        }

        // Ajout des pistes au peer connection
        if (peerConnectionRef.current) {
          stream.getTracks().forEach(track => {
            if (peerConnectionRef.current && localStreamRef.current) {
              console.log('Adding track to peer connection:', track.kind);
              peerConnectionRef.current.addTrack(track, localStreamRef.current);
            }
          });
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Unable to access camera or microphone');
        setConnectionStatus('Camera access failed');
      }
    };

    startLocalStream();

    // Nettoyage
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [consultationId, userId, userRole, patientId, medecinId, router]);

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);

        // Si on désactive l'audio, on arrête aussi la reconnaissance vocale
        if (!audioTrack.enabled) {
          stopLocalListening();
        } else {
          startLocalListening();
        }
      }
    }
  };

  // Fonction pour basculer l'affichage des sous-titres
  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  // Fonction pour changer la langue de traduction
  const toggleLanguage = () => {
    setTargetLanguage(targetLanguage === "en" ? "fr" : "en");
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleEndConsultation = async () => {
    try {
      const token = localStorage.getItem("token");

      // Use the consultation ID from the URL parameters
      const idToUse = consultationId;

      if (idToUse) {
        try {
          console.log("Ending consultation with ID:", idToUse);

          const response = await fetch(
            `http://localhost:3000/api/consultations/${idToUse}/end`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            console.log("Successfully ended consultation/rendez-vous:", responseData);

            // Show success message
            setShowCompletedMessage(true);

            // Wait 2 seconds before redirecting
            setTimeout(() => {
              // Clean up resources
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
              }
              if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
              }
              if (socketRef.current) {
                socketRef.current.disconnect();
              }

              // Redirect to teleconsultation page
              router.push('/teleconsultation');
            }, 2000);

            return;
          } else {
            console.error("Failed to end consultation:", responseData.message);
            setError(`Failed to end consultation: ${responseData.message}`);
          }
        } catch (error) {
          console.error("Error ending consultation:", error);
          setError("Error communicating with the server");
        }
      } else {
        setError("No consultation ID provided");
      }

      // If we get here, either there was no consultation ID or the API call failed
      // Still clean up resources and redirect after a delay
      setTimeout(() => {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
        }
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        router.push('/teleconsultation');
      }, 3000); // Give user time to read the error message
    } catch (error) {
      console.error("Error in handleEndConsultation:", error);
      setError("Failed to end consultation");

      // Still clean up and redirect after a delay
      setTimeout(() => {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
        }
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        router.push('/teleconsultation');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">Teleconsultation</h1>
                <p className="text-gray-600">
                  {userRole === 'medecin' ?
                    `Consultation with ${participantNames.patient}` :
                    `Consultation with ${participantNames.doctor}`}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Status: {connectionStatus}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEndConsultation}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  End Meeting
                </button>
                <button
                  onClick={toggleChat}
                  className="bg-primary text-white p-2 rounded-full hover:bg-primary/90"
                  title="Ouvrir le chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Video */}
            <div className="relative">
              <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {userRole === 'medecin' ? 'Doctor (You)' : 'Patient (You)'}
              </div>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[400px] rounded-lg bg-black object-cover"
              />
              <Subtitles
                text={localTranscript}
                isVisible={showSubtitles && isMicOn}
                position="bottom"
                language={localDetectedLanguage || 'fr'}
              />
              <div className="absolute bottom-4 left-4 space-x-2">
                <button
                  onClick={toggleCamera}
                  className={`p-2 rounded-full ${isCameraOn ? 'bg-blue-500' : 'bg-red-500'} text-white`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={toggleMicrophone}
                  className={`p-2 rounded-full ${isMicOn ? 'bg-blue-500' : 'bg-red-500'} text-white`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  onClick={toggleSubtitles}
                  className={`p-2 rounded-full ${showSubtitles ? 'bg-blue-500' : 'bg-red-500'} text-white`}
                  title="Activer/désactiver les sous-titres"
                >
                  <span className="font-bold">CC</span>
                </button>
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-full bg-blue-500 text-white text-xs font-bold"
                  title="Changer la langue de traduction"
                >
                  {targetLanguage === "en" ? "FR→EN" : "EN→FR"}
                </button>
              </div>
            </div>

            {/* Remote Video */}
            <div className="relative">
              <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {userRole === 'medecin' ? 'Patient' : 'Doctor'}
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-[400px] rounded-lg bg-black object-cover"
              />
              <Subtitles
                text={localTranslatedText}
                isVisible={showSubtitles && isMicOn}
                position="bottom"
                language={targetLanguage}
              />
              {!isRemoteStreamConnected && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 rounded-lg">
                  Waiting for {userRole === 'medecin' ? 'patient' : 'doctor'} to join...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success message when consultation is completed */}
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

      {/* Chat en temps réel */}
      <ChatBox
        socket={socketRef.current}
        consultationId={consultationId || ''}
        userId={userId || ''}
        userName={userRole === 'medecin' ? participantNames.doctor : participantNames.patient}
        isOpen={isChatOpen}
        onClose={toggleChat}
      />
    </div>
  );
}