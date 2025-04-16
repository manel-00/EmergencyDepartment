'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function AddSpeciality() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const API_URL = "http://localhost:3000/specialite";

  // Charger les données de la spécialité à modifier
  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      fetchSpeciality(editId);
    }
  }, [editId]);

  const fetchSpeciality = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/getspecialite/${id}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération de la spécialité");
      const data = await res.json();
      setName(data.name);
      setDescription(data.description);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    if (name.length > 8) {
      setError("Le nom ne doit pas dépasser 8 caractères.");
      return false;
    }

    const lettersOnlyRegex = /^[A-Za-z]+$/;
    if (!lettersOnlyRegex.test(name)) {
      setError("Le nom ne doit contenir que des lettres.");
      return false;
    }

    if (!description.trim()) {
      setError("La description est requise.");
      return false;
    }

    setError(null);
    return true;
  };

  // Ajouter ou mettre à jour une spécialité
  const handleSubmit = async (e: React.FormEvent) => {
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

      // Rediriger vers la page d'affichage
      router.push("/specialities");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb pageName={isEditing ? "Modifier une Spécialité" : "Ajouter une Spécialité"} />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto"
      >
        <h2 className="text-3xl font-semibold text-dark text-center mb-8">
          {isEditing ? "Modifier une Spécialité" : "Ajouter une Spécialité"}
        </h2>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        {isLoading ? (
          <p className="text-center text-gray-500">Chargement en cours...</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nom *</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Ajouter la Spécialité"}
              </button>
              
            </div>
            <div className="mt-6 text-center">
  <Link href="/specialities">
    <button
      className="w-full py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
    >
      Retour à la liste
    </button>
  </Link>
</div>

          </>
        )}
      </form>
    </div>
  );
}
