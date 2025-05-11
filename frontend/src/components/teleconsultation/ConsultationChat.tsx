"use client";

import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface ConsultationChatProps {
  consultationId: string;
  userId: string;
  userName: string;
  socket: Socket | null;
}

export default function ConsultationChat({
  consultationId,
  userId,
  userName,
  socket
}: ConsultationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `http://localhost:3000/api/chat-messages/consultation/${consultationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Convert database messages to our Message format
          const formattedMessages = data.map((msg: any) => ({
            id: msg._id,
            sender: msg.sender._id || msg.sender,
            senderName: msg.senderName,
            text: msg.text,
            timestamp: new Date(msg.timestamp || msg.createdAt).getTime(),
          }));

          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (consultationId) {
      fetchMessages();
    }
  }, [consultationId]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Check if socket is connected
    setIsConnected(socket.connected);

    // Handle connection events
    socket.on("connect", () => {
      console.log("Chat socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Chat socket disconnected");
      setIsConnected(false);
    });

    // Handle chat messages
    socket.on("chat-message", (message: Message) => {
      console.log("Received message:", message);
      if (message.sender !== userId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Handle user joined notification
    socket.on("chat-user-joined", (data) => {
      console.log("User joined chat:", data);
    });

    // Clean up event listeners
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat-message");
      socket.off("chat-user-joined");
    };
  }, [socket, userId]);

  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !isConnected) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: userId,
      senderName: userName,
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    // Add message to local state
    setMessages((prevMessages) => [...prevMessages, message]);

    // Send message to socket server for real-time delivery
    socket.emit("chat-message", {
      consultationId,
      message
    });

    // Also save message to database
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:3000/api/chat-messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            consultationId,
            text: newMessage.trim(),
          }),
        });
      }
    } catch (error) {
      console.error("Error saving message to database:", error);
    }

    // Clear input
    setNewMessage("");
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-3 bg-primary text-white font-semibold">
        Chat de consultation
        <span className={`ml-2 inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            Aucun message. Commencez la conversation !
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === userId ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender === userId
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                }`}
              >
                {msg.text}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {msg.sender !== userId && <span className="font-medium mr-1">{msg.senderName}</span>}
                {formatTime(msg.timestamp)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-l-lg focus:outline-none"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={!newMessage.trim() || !isConnected}
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
