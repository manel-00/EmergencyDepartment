"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function withAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userId, setUserId] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    const [authError, setAuthError] = useState<string>("");

    useEffect(() => {
      const checkAuth = async () => {
        try {
          console.log(`Vérification de l'authentification pour la page: ${window.location.pathname}`);
          const token = localStorage.getItem("token");

          if (!token) {
            console.log("Aucun token trouvé, redirection vers la page de connexion");
            setIsAuthenticated(false);
            router.push("/signin?redirect=" + window.location.pathname);
            return;
          }

          // Récupérer l'ID directement depuis le token décodé
          let tokenData;
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
              console.error("Format de token invalide");
              localStorage.removeItem("token");
              setIsAuthenticated(false);
              setAuthError("Format de token invalide. Veuillez vous reconnecter.");
              router.push("/signin?redirect=" + window.location.pathname);
              return;
            }

            tokenData = JSON.parse(atob(tokenParts[1]));
            console.log("Token décodé:", tokenData);

            // Vérifier si le token est expiré
            const expirationTime = tokenData.exp * 1000; // Convertir en millisecondes
            const currentTime = Date.now();

            if (expirationTime < currentTime) {
              console.error("Token expiré");
              localStorage.removeItem("token");
              setIsAuthenticated(false);
              setAuthError("Votre session a expiré. Veuillez vous reconnecter.");
              router.push("/signin?redirect=" + window.location.pathname);
              return;
            }
          } catch (decodeError) {
            console.error("Erreur lors du décodage du token:", decodeError);
            localStorage.removeItem("token"); // Token invalide, le supprimer
            setIsAuthenticated(false);
            setAuthError("Session invalide. Veuillez vous reconnecter.");
            router.push("/signin?redirect=" + window.location.pathname);
            return;
          }

          // Si nous avons un token valide, essayons d'extraire les informations directement
          // pour éviter une requête réseau supplémentaire
          if (tokenData && tokenData.userId) {
            console.log("Utilisation des informations du token pour l'authentification");

            // Essayer différentes propriétés possibles pour l'ID
            const userId = tokenData.userId || tokenData._id || tokenData.id || tokenData.sub;

            if (!userId) {
              console.error("Impossible de déterminer l'ID utilisateur depuis le token");
              // Continuer avec la vérification de session pour obtenir l'ID
            } else {
              // Essayer différentes propriétés possibles pour le rôle
              let userRole = tokenData.role || 'patient';

              // Nettoyer le rôle
              userRole = userRole.toString().trim().toLowerCase();
              if (userRole.includes('med') || userRole === 'doctor') userRole = 'medecin';
              if (userRole.includes('pat')) userRole = 'patient';

              console.log(`Authentification réussie depuis le token: ID=${userId}, Rôle=${userRole}`);

              setUserId(userId);
              setUserRole(userRole);
              setIsAuthenticated(true);

              // Vérifier la session en arrière-plan pour s'assurer que le token est toujours valide
              try {
                console.log("Vérification de la session avec le serveur en arrière-plan...");
                const response = await axios.get("http://localhost:3000/user/session", {
                  headers: { Authorization: `Bearer ${token}` },
                  withCredentials: true
                });

                if (response.data && response.data.user) {
                  console.log("Session confirmée par le serveur");
                }
              } catch (sessionError) {
                console.warn("Erreur lors de la vérification de la session en arrière-plan:", sessionError);
                // Ne pas rediriger l'utilisateur, car nous avons déjà validé le token
              }

              return; // Sortir de la fonction car l'authentification est réussie
            }
          }

          // Si nous n'avons pas pu extraire les informations du token, vérifier la session
          try {
            console.log("Vérification de la session avec le serveur...");
            const response = await axios.get("http://localhost:3000/user/session", {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true
            });

            console.log("Réponse de session:", response.data);

            if (response.data && response.data.user) {
              const userData = response.data.user;

              // Essayer différentes propriétés possibles pour l'ID
              const userId = userData._id || userData.id || userData.userId ||
                            tokenData.id || tokenData._id || tokenData.userId || tokenData.sub;

              if (!userId) {
                console.error("Impossible de déterminer l'ID utilisateur");
                setIsAuthenticated(false);
                setAuthError("Impossible d'identifier votre compte. Veuillez vous reconnecter.");
                router.push("/signin?redirect=" + window.location.pathname);
                return;
              }

              // Essayer différentes propriétés possibles pour le rôle
              let userRole = userData.role || userData.type || tokenData.role || 'patient';

              // Nettoyer le rôle
              userRole = userRole.toString().trim().toLowerCase();
              if (userRole.includes('med') || userRole === 'doctor') userRole = 'medecin';
              if (userRole.includes('pat')) userRole = 'patient';

              console.log(`Authentification réussie depuis la session: ID=${userId}, Rôle=${userRole}`);

              setUserId(userId);
              setUserRole(userRole);
              setIsAuthenticated(true);
            } else {
              console.error("Données utilisateur manquantes dans la réponse");
              setIsAuthenticated(false);
              setAuthError("Session expirée. Veuillez vous reconnecter.");
              router.push("/signin?redirect=" + window.location.pathname);
            }
          } catch (error) {
            console.error("Erreur lors de la vérification de la session:", error);

            // Vérifier si c'est une erreur d'authentification
            if (axios.isAxiosError(error) && error.response?.status === 401) {
              localStorage.removeItem("token"); // Token invalide ou expiré, le supprimer
              setAuthError("Session expirée. Veuillez vous reconnecter.");
            } else {
              setAuthError("Erreur de connexion au serveur. Veuillez réessayer.");
            }

            setIsAuthenticated(false);
            router.push("/signin?redirect=" + window.location.pathname);
          }
        } catch (error) {
          console.error("Erreur générale lors de la vérification de l'authentification:", error);
          setIsAuthenticated(false);
          setAuthError("Une erreur s'est produite. Veuillez réessayer.");
          router.push("/signin?redirect=" + window.location.pathname);
        }
      };

      checkAuth();
    }, [router]);

    if (isAuthenticated === null) {
      // Afficher un indicateur de chargement pendant la vérification
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Vérification de votre session...</p>
          </div>
        </div>
      );
    }

    if (isAuthenticated === false) {
      // Afficher un message d'erreur si nécessaire
      if (authError) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erreur d'authentification: </strong>
              <span className="block sm:inline">{authError}</span>
              <p className="mt-2">Redirection vers la page de connexion...</p>
            </div>
          </div>
        );
      }

      // Sinon, ne rien rendre, la redirection est déjà en cours
      return null;
    }

    // Passer les props d'authentification au composant enveloppé
    return <Component {...props} userId={userId} userRole={userRole} />;
  };
}
