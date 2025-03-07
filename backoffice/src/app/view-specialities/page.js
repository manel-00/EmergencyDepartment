'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Wrapper from "../components/wrapper";

export default function ViewSpecialities() {
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      console.log("Erreur lors de la récupération des spécialités");
      const data = await res.json();
      setSpecialities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une spécialité
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/deletespecialite/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      // Mettre à jour la liste des spécialités après suppression
      setSpecialities(specialities.filter((spec) => spec._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Wrapper>
      <div className="container-fluid">
        <div className="layout-specing">
          <div className="d-md-flex justify-content-between">
            <h5 className="mb-0">Liste des spécialités</h5>

            <nav aria-label="breadcrumb" className="d-inline-block mt-4 mt-sm-0">
              <ul className="breadcrumb bg-transparent rounded mb-0 p-0">
                <li className="breadcrumb-item"><Link href="/">Accueil</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Spécialités</li>
              </ul>
            </nav>
          </div>

          {/* Bouton pour ajouter une spécialité */}
          <div className="text-end mt-4">
            <Link href="/add-speciality">
              <button
                className="btn btn-primary"
                style={{
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Ajouter une spécialité
              </button>
            </Link>
          </div>

          {/* Tableau des spécialités */}
          <div className="row">
            <div className="col-12 mt-4">
              <div className="table-responsive shadow rounded">
                <table className="table table-center bg-white mb-0">
                  <thead>
                    <tr>
                      <th className="border-bottom p-3" style={{ minWidth: '180px' }}>Nom</th>
                      <th className="border-bottom p-3">Description</th>
                      <th className="border-bottom p-3" style={{ minWidth: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center p-3">Chargement...</td>
                      </tr>
                    ) : specialities.length > 0 ? (
                      specialities.map((spec, index) => (
                        <tr key={spec._id}>
                          <td className="p-3">{spec.name}</td>
                          <td className="p-3">{spec.description}</td>
                          <td className="p-3">
                            {/* Bouton pour modifier une spécialité */}
                            <Link href={`/add-speciality?edit=${spec._id}`}>
                              <button
                                className="btn btn-sm btn-primary me-2"
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                              >
                                Modifier
                              </button>
                            </Link>
                            {/* Bouton pour supprimer une spécialité */}
                            <button
                              onClick={() => handleDelete(spec._id)}
                              className="btn btn-sm btn-danger"
                              style={{
                                padding: "5px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-3">Aucune spécialité trouvée.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </Wrapper>
  );
}