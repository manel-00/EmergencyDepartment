'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Wrapper from "../components/wrapper";

export default function AddSpeciality() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Pour savoir si on est en mode édition
  const [isLoading, setIsLoading] = useState(false); // Pour gérer l'état de chargement
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit"); // Récupérer l'ID de la spécialité à modifier

  const API_URL = "http://localhost:3000/specialite";

  // Charger les données de la spécialité à modifier
  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      fetchSpeciality(editId);
    }
  }, [editId]);

  const fetchSpeciality = async (id) => {
    setIsLoading(true); // Activer l'état de chargement
    setError(null);
    try {
      const res = await fetch(`${API_URL}/getspecialite/${id}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération de la spécialité");
      const data = await res.json();
      setName(data.name); // Remplir le champ "name"
      setDescription(data.description); // Remplir le champ "description"
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Désactiver l'état de chargement
    }
  };

  // Fonction de validation du formulaire
  const validateForm = () => {
    // Vérifier que le nom ne dépasse pas 8 caractères
    if (name.length > 8) {
      setError("Le nom ne doit pas dépasser 8 caractères.");
      return false;
    }

    // Vérifier que le nom ne contient que des lettres
    const lettersOnlyRegex = /^[A-Za-z]+$/;
    if (!lettersOnlyRegex.test(name)) {
      setError("Le nom ne doit contenir que des lettres (pas de chiffres ni de caractères spéciaux).");
      return false;
    }

    // Vérifier que la description n'est pas vide
    if (!description.trim()) {
      setError("La description est requise.");
      return false;
    }

    setError(null);
    return true;
  };

  // Ajouter ou mettre à jour une spécialité
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError(null);

    try {
      const url = isEditing ? `${API_URL}/updatespecialite/${editId}` : `${API_URL}/addspecialite`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) throw new Error(isEditing ? "Erreur lors de la mise à jour" : "Erreur lors de l'ajout");

      // Rediriger vers la page d'affichage après l'ajout ou la mise à jour
      router.push("/view-specialities");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Wrapper>
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>
        {isEditing ? "Modifier une spécialité" : "Ajouter une spécialité"}
      </h1>

      {error && <p style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>{error}</p>}

      {isLoading ? (
        <p style={{ textAlign: "center" }}>Chargement en cours...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom (max 8 lettres)"
            required
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: isEditing ? "#28a745" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isEditing ? "Mettre à jour" : "Ajouter"}
          </button>
        </form>
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link href="/view-specialities">
          <button
            style={{
              padding: "10px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retour à la liste
          </button>
        </Link>
      </div>
    </div>
    </Wrapper>

  );
}