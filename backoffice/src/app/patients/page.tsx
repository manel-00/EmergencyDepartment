"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

interface Patient {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  creationDate: string;
  image: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get<Patient[]>("http://localhost:3000/user/listPatients");
        setPatients(response.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des patients :", error);
        setError("Erreur lors du chargement des patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) {
      try {
        await axios.delete(`http://localhost:3000/user/deletePatient/${id}`);
        setPatients(patients.filter(patient => patient._id !== id));
      } catch (error) {
        console.error("❌ Erreur lors de la suppression :", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb pageName="Patients" />
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center text-dark mb-6">Liste des Patients</h2>

        {loading ? (
          <p className="text-center text-gray-500">Chargement en cours...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-left">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Date de création</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient._id} className="border-t hover:bg-gray-100">
                      
                      <td className="px-6 py-3">{patient.name} {patient.lastname}</td>
                      <td className="px-6 py-3">{patient.email}</td>
                      <td className="px-6 py-3">{new Date(patient.creationDate).toLocaleDateString()}</td>
                      <td className="px-6 py-3">
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded-sm text-sm hover:bg-red-600 transition duration-200"
                          onClick={() => handleDelete(patient._id)}
                        >
                          <i className="fas fa-trash mr-2"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">Aucun patient trouvé.</td>
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
