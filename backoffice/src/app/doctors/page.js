"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Wrapper from "../components/wrapper";
import { useRouter } from "next/navigation";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user/getDoctors");
        const doctorsData = response.data;
        setDoctors(doctorsData);

        // Récupérer les spécialités associées aux médecins
        const specialityIds = [...new Set(doctorsData.map(doc => doc.specialty))]; // Éviter les doublons
        const specialityPromises = specialityIds.map(id =>
          axios.get(`http://localhost:3000/specialite/getspecialite/${id}`).then(res => ({ id, name: res.data.name }))
        );

        const specialityResults = await Promise.all(specialityPromises);
        const specialityMap = {};
        specialityResults.forEach(spec => {
          specialityMap[spec.id] = spec.name;
        });

        setSpecialities(specialityMap);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des docteurs :", error);
        setError("Erreur lors du chargement des docteurs.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fonction pour gérer la suppression d'un médecin
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médecin ?")) {
      try {
        await axios.delete(`http://localhost:3000/user/deleteDoctor/${id}`);
        setDoctors(doctors.filter(doctor => doctor._id !== id)); // Mise à jour de la liste après suppression
      } catch (error) {
        console.error("❌ Erreur lors de la suppression :", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  // Fonction pour gérer la modification d'un médecin
  const handleEdit = (doctorId) => {
    router.push(`/add-doctor?id=${doctorId}`);
  };

  return (
    <Wrapper>
      <div className="container mt-5">
        <h2 className="text-center mb-4">Liste des Médecins</h2>
        {loading ? (
          <p className="text-center">Chargement en cours...</p>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : (
          <table className="table table-striped table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Photo</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Spécialité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>
                      <img
                        src={`http://localhost:3002/images/${doctor.image}`}
                        alt="Médecin"
                        className="rounded-circle"
                        style={{ width: "60px", height: "60px", objectFit: "cover", border: "2px solid #ddd" }}
                      />
                    </td>
                    <td>{doctor.name} {doctor.lastname}</td>
                    <td>{doctor.email}</td>
                    <td>{specialities[doctor.specialty] || "Non définie"}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(doctor._id)}>
                        <i className="fas fa-edit"></i> Modifier
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(doctor._id)}>
                        <i className="fas fa-trash"></i> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">Aucun médecin trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Wrapper>
  );
}
