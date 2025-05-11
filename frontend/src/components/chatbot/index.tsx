'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Animation d'ouverture du chatbot avec une animation fade-in
    document.querySelector('.chatbot-container')?.classList.add('animate__animated', 'animate__fadeIn');
  }, []);

  const handleSendMessage = async () => {
    if (!message) return;

    // Ajoute le message de l'utilisateur à l'historique
    const newMessage = { user: 'You', text: message, id: Date.now() }; // Utilisation de l'ID unique
    setChatHistory([...chatHistory, newMessage]);
    setLoading(true);
    setMessage('');

    try {
      // Envoie la requête au backend Express
      const response = await axios.post('http://localhost:3000/chat/chat', { message });

      // Ajoute la réponse du chatbot à l'historique
      const botMessage = {
        user: 'Bot',
        text: response.data.message, // Réponse modifiée ici : `message` au lieu de `reply`
        id: Date.now() + 1, // Autre ID unique pour le message du bot
      };

      setChatHistory([
        ...chatHistory,
        newMessage,
        botMessage,
      ]);
    } catch (error) {
      console.error('Error sending message to backend:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg overflow-hidden transform transition-all duration-500 ease-in-out scale-95 hover:scale-100">
        <h1 className="text-2xl font-bold text-indigo-700 text-center mb-2">ChatNova: Your AI Companion</h1>
        <p className="text-gray-600 text-center mb-6">Ask anything, and let our AI guide you with insightful answers.</p>
        <div className="h-[450px] overflow-y-auto mb-6 space-y-4 bg-gray-50 p-4 rounded-lg shadow-inner">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`flex ${chat.user === 'You' ? 'justify-end' : 'justify-start'} animate__animated animate__fadeIn animate__delay-0.2s`}
            >
              <div
                className={`p-4 rounded-lg ${chat.user === 'You' ? 'bg-blue-100' : 'bg-gray-200'} max-w-xs shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
              >
                <div className="font-semibold text-sm text-gray-700">{chat.user}:</div>
                <p className="text-gray-900">{chat.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4 mt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 p-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="px-6 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-400 transition-all"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;