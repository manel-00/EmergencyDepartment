'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Speciality {
  _id: string;
  name: string;
  description: string;
}

export default function ViewSpecialities() {
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:3000/specialite";

  // Charger les spécialités au montage du composant
  useEffect(() => {
    fetchSpecialities();
  }, []);

  // Fonction pour récupérer les spécialités
  const fetchSpecialities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/getspecialite`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des spécialités");
      const data = await res.json();
      setSpecialities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une spécialité
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/deletespecialite/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      // Mettre à jour la liste des spécialités après suppression
      setSpecialities(specialities.filter((spec) => spec._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Liste des spécialités</h2>
        <Link href="/add-speciality">
          <button
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Ajouter une spécialité
          </button>
        </Link>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex space-x-2 text-sm text-gray-600">
          <li><Link href="/" className="hover:underline">Accueil</Link></li>
          <li className="text-gray-500">Spécialités</li>
        </ol>
      </nav>

      {/* Error message */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
        <table className="min-w-full text-left table-auto">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4">Nom</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">Chargement...</td>
              </tr>
            ) : specialities.length > 0 ? (
              specialities.map((spec) => (
                <tr key={spec._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{spec.name}</td>
                  <td className="py-3 px-4">{spec.description}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link href={`/add-speciality?edit=${spec._id}`}>
                      <button
                        className="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition"
                      >
                        Modifier
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(spec._id)}
                      className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">Aucune spécialité trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
