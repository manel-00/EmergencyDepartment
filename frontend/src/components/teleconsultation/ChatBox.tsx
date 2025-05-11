"use client";

import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface Message {
  _id?: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatBoxProps {
  socket: Socket | null;
  consultationId: string;
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatBox = ({ socket, consultationId, userId, userName, isOpen, onClose }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fonction pour tenter de rafraîchir le token
  const refreshToken = async () => {
    try {
      setIsTokenRefreshing(true);
      setError('Tentative de rafraîchissement de la session...');

      // Ici, vous devriez implémenter la logique pour rafraîchir le token
      // Par exemple, appeler une API de rafraîchissement de token

      // Pour l'instant, nous allons simplement simuler un délai
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Si vous avez une API de rafraîchissement, vous pourriez faire quelque chose comme:
      // const response = await fetch('http://localhost:3000/api/refresh-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
      // });
      //
      // if (response.ok) {
      //   const data = await response.json();
      //   localStorage.setItem('token', data.token);
      //   return true;
      // }

      // Pour l'instant, nous allons simplement rediriger vers la page de connexion
      window.location.href = '/sign-in';
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      setError('Impossible de rafraîchir la session. Veuillez vous reconnecter.');
      return false;
    } finally {
      setIsTokenRefreshing(false);
    }
  };

  // Charger les messages précédents
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous devez être connecté pour accéder au chat');
          setIsLoading(false);
          return;
        }

        // Afficher le token pour débogage
        console.log('Token utilisé:', token);

        // Décoder le token pour vérifier son contenu (uniquement pour le débogage)
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('Contenu du token JWT:', payload);

            // Vérifier si le token contient les informations nécessaires
            if (!payload._id) {
              console.warn('Le token ne contient pas d\'ID utilisateur (_id)');
            }
          }
        } catch (e) {
          console.error('Erreur lors du décodage du token:', e);
        }

        console.log(`Récupération des messages pour la consultation: ${consultationId}`);
        const response = await fetch(`http://localhost:3000/api/chat-messages/consultation/${consultationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erreur API:', response.status, errorData);

          // Si c'est une erreur d'authentification, proposer une solution
          if (response.status === 401) {
            // Essayer de récupérer un nouveau token ou rediriger vers la page de connexion
            setError('Session expirée. Veuillez vous reconnecter ou rafraîchir la page.');

            // Option: tenter de rafraîchir le token
            // await refreshToken();

            setIsLoading(false);
            return;
          }

          throw new Error(`Erreur ${response.status}: ${errorData.message || 'Erreur lors de la récupération des messages'}`);
        }

        const data = await response.json();
        console.log('Messages récupérés:', data);

        const formattedMessages = data.map((msg: any) => {
          // Gérer le cas où sender est null ou undefined
          const sender = msg.sender || {};

          return {
            _id: msg._id,
            sender: sender._id || msg.sender || '',
            senderName: sender.name || sender.prenom || sender.firstname || msg.senderName || 'Utilisateur',
            text: msg.text,
            timestamp: new Date(msg.timestamp || msg.createdAt),
            isCurrentUser: (sender._id === userId) || (msg.sender === userId)
          };
        });

        setMessages(formattedMessages);
      } catch (err: any) {
        console.error('Erreur lors du chargement des messages:', err);
        setError(err.message || 'Impossible de charger les messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [consultationId, userId, isOpen]);

  // Rejoindre la salle de chat
  useEffect(() => {
    if (!socket || !isOpen) return;

    console.log(`Rejoindre la salle de chat: chat-${consultationId}`);
    // Rejoindre la salle de chat
    socket.emit('join-chat-room', consultationId);

    // Écouter les nouveaux messages
    socket.on('chat-message', (message: any) => {
      console.log('Message reçu via socket:', message);

      const newMsg: Message = {
        _id: message._id || `temp-${Date.now()}`,
        sender: message.sender,
        senderName: message.senderName,
        text: message.text,
        timestamp: new Date(message.timestamp),
        isCurrentUser: message.sender === userId
      };

      // Éviter les doublons (si le message a déjà été ajouté localement)
      setMessages(prev => {
        // Vérifier si le message existe déjà
        const exists = prev.some(msg =>
          (msg._id && msg._id === newMsg._id) ||
          (msg.text === newMsg.text &&
           msg.sender === newMsg.sender &&
           Math.abs(new Date(msg.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 1000)
        );

        if (exists) {
          return prev;
        }

        return [...prev, newMsg];
      });
    });

    // Écouter les confirmations d'envoi de message
    socket.on('chat-message-sent', (confirmation: any) => {
      console.log('Confirmation de message:', confirmation);
      if (confirmation.success) {
        // Mettre à jour l'ID du message temporaire si nécessaire
        setMessages(prev => prev.map(msg => {
          // Si c'est un message temporaire avec le même texte et timestamp proche
          if (msg._id && msg._id.toString().startsWith('temp-')) {
            return {
              ...msg,
              _id: confirmation.messageId || msg._id,
              status: 'sent'
            };
          }
          return msg;
        }));
      }
    });

    // Nettoyage
    return () => {
      socket.off('chat-message');
      socket.off('chat-message-sent');
    };
  }, [socket, consultationId, userId, isOpen]);

  // Faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    // Effacer les erreurs précédentes
    setError('');

    // Sauvegarder le message à envoyer
    const messageText = newMessage.trim();

    try {
      // Créer l'objet message
      const messageData = {
        consultationId,
        sender: userId,
        senderName: userName,
        text: messageText,
        timestamp: new Date()
      };

      // Générer un ID temporaire pour le message local
      const tempId = `temp-${Date.now()}`;

      // Ajouter le message localement
      const localMessage: Message = {
        _id: tempId,
        ...messageData,
        isCurrentUser: true,
        status: 'sending'
      };
      setMessages(prev => [...prev, localMessage]);

      // Réinitialiser le champ de saisie immédiatement pour une meilleure expérience utilisateur
      setNewMessage('');

      // Envoyer le message via socket
      socket.emit('chat-message', {
        consultationId,
        message: messageData
      });

      // Enregistrer le message dans la base de données
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour envoyer un message');
        return;
      }

      console.log('Envoi du message à l\'API:', {
        consultationId,
        text: messageText
      });

      const response = await fetch('http://localhost:3000/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          consultationId,
          text: messageText
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur API lors de l\'envoi:', response.status, errorData);

        // Si c'est une erreur d'authentification, proposer une solution
        if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter pour envoyer des messages.');

          // Mettre à jour le statut du message en erreur
          setMessages(prev => prev.map(msg =>
            msg._id === tempId
              ? { ...msg, status: 'error' }
              : msg
          ));

          return;
        }

        throw new Error(`Erreur ${response.status}: ${errorData.message || 'Erreur lors de l\'envoi du message'}`);
      }

      // Récupérer le message enregistré avec son ID réel
      const savedMessage = await response.json();
      console.log('Message enregistré avec succès:', savedMessage);

      // Mettre à jour le message local avec l'ID réel et le statut
      setMessages(prev => prev.map(msg =>
        msg._id === tempId
          ? { ...msg, _id: savedMessage._id, status: 'sent' }
          : msg
      ));

    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err.message || 'Impossible d\'envoyer le message');

      // Mettre à jour le statut du message en erreur
      setMessages(prev => prev.map(msg =>
        msg._id === tempId
          ? { ...msg, status: 'error' }
          : msg
      ));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg flex flex-col z-50 max-h-[500px]">
      {/* En-tête du chat */}
      <div className="bg-primary text-white p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Chat</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Corps du chat */}
      <div className="flex-1 p-3 overflow-y-auto max-h-[350px] min-h-[200px] bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-2">
            <p>{error}</p>
            {error.includes('Session expirée') && (
              <div className="flex justify-center space-x-2 mt-2">
                <button
                  onClick={() => window.location.href = '/sign-in'}
                  className="bg-primary text-white px-4 py-1 rounded text-sm hover:bg-primary/90"
                >
                  Se reconnecter
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-500 text-white px-4 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Rafraîchir
                </button>
              </div>
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center p-2">Aucun message</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`mb-2 ${msg.isCurrentUser ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block p-2 rounded-lg max-w-[80%] break-words ${
                  msg.isCurrentUser
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-gray-200 text-gray-800 rounded-tl-none'
                }`}
              >
                {!msg.isCurrentUser && (
                  <div className="text-xs font-semibold mb-1">{msg.senderName}</div>
                )}
                <p>{msg.text}</p>
                <div className="text-xs opacity-70 mt-1 flex items-center justify-end">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.isCurrentUser && msg.status && (
                    <span className="ml-1">
                      {msg.status === 'sending' && (
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                        </svg>
                      )}
                      {msg.status === 'sent' && (
                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {msg.status === 'error' && (
                        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSendMessage} className="p-2 border-t flex">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Votre message..."
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          className="bg-primary text-white p-2 rounded-r-lg hover:bg-primary/90"
          disabled={!newMessage.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
