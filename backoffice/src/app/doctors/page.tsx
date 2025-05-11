"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

interface Doctor {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  specialty: string;
  image: string;
}

interface Specialities {
  [key: string]: string;
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialities, setSpecialities] = useState<Specialities>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get<Doctor[]>("http://localhost:3000/user/getDoctors");
        const doctorsData = response.data;
        setDoctors(doctorsData);

        const specialityIds = [...new Set(doctorsData.map(doc => doc.specialty))];
        const specialityPromises = specialityIds.map(id =>
          axios.get(`http://localhost:3000/specialite/getspecialite/${id}`).then(res => ({ id, name: res.data.name }))
        );

        const specialityResults = await Promise.all(specialityPromises);
        const specialityMap: Specialities = {};
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médecin ?")) {
      try {
        await axios.delete(`http://localhost:3000/user/deleteDoctor/${id}`);
        setDoctors(doctors.filter(doctor => doctor._id !== id));
      } catch (error) {
        console.error("❌ Erreur lors de la suppression :", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleEdit = (doctorId: string) => {
    router.push(`/add-doctor?id=${doctorId}`);
  };

  const handleAddDoctor = () => {
    router.push("/add-doctor"); // Redirige vers la page d'ajout de médecin
  };

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb pageName="Doctors" />
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center text-dark mb-6">Liste des Médecins</h2>

        {/* Ajouter un bouton pour ajouter un médecin */}
        <div className="text-right mb-4">
          <button
            className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600 transition duration-200"
            onClick={handleAddDoctor}
          >
            Ajouter un Médecin
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Chargement en cours...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-left">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3">Photo</th>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Spécialité</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <tr key={doctor._id} className="border-t hover:bg-gray-100">
                      <td className="px-6 py-3">
                        <img
                          src={`http://localhost:3002/images/${doctor.image}`}
                          alt="Médecin"
                          className="rounded-full w-16 h-16 object-cover border-2 border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-3">{doctor.name} {doctor.lastname}</td>
                      <td className="px-6 py-3">{doctor.email}</td>
                      <td className="px-6 py-3">{specialities[doctor.specialty] || "Non définie"}</td>
                      <td className="px-6 py-3">
                        <button
                          className="bg-yellow-500 text-white py-1 px-3 rounded-sm text-sm hover:bg-blue-600 transition duration-200"
                          onClick={() => handleEdit(doctor._id)}
                        >
                          <i className="fas fa-edit mr-2"></i> Modifier
                        </button>
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded-sm text-sm hover:bg-red-600 transition duration-200 ml-2"
                          onClick={() => handleDelete(doctor._id)}
                        >
                          <i className="fas fa-trash mr-2"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">Aucun médecin trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
