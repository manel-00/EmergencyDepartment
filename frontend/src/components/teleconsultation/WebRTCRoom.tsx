"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

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
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Media permissions granted");
        setLocalStream(stream);
        setConnectionStatus("Media permissions granted");

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
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

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
          stream.getTracks().forEach((track) => track.stop());
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
    } catch (error) {
      console.error("Error ending consultation:", error);
      setError("Failed to end consultation");
    }
  };

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
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              Video Consultation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {connectionStatus}
            </p>
          </div>
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
              ref={localVideoRef}
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

          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 