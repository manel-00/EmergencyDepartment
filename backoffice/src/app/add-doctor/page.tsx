"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from 'next/link';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("id");

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    specialty: "",
    password: "",
    role: "doctor",
    creationDate: new Date().toISOString(),
    image: null as File | null,
  });

  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get("http://localhost:3000/specialite/getspecialite");
        setSpecialties(response.data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("❌ Erreur lors de la récupération des spécialités :", error.message);
        } else {
          console.error("❌ Erreur inconnue lors de la récupération des spécialités :", error);
        }
      }
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (doctorId) {
      const fetchDoctor = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/user/getDoctor/${doctorId}`);
          const doctorData = response.data;

          setFormData({
            name: doctorData.name,
            lastname: doctorData.lastname,
            email: doctorData.email,
            specialty: doctorData.specialty,
            password: "",
            role: "doctor",
            creationDate: doctorData.creationDate,
            image: doctorData.image || null,
          });

          if (doctorData.image) {
            setImagePreview(`http://localhost:3002/images/${doctorData.image}`);
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("❌ Erreur lors de la récupération du médecin :", error.message);
          } else {
            console.error("❌ Erreur inconnue lors de la récupération du médecin :", error);
          }
        }
      };

      fetchDoctor();
    }
  }, [doctorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append("name", formData.name);
    form.append("lastname", formData.lastname);
    form.append("email", formData.email);
    form.append("specialty", formData.specialty);
    if (formData.password) {
      form.append("password", formData.password);
    }
    if (formData.image) {
      form.append("image", formData.image);
    }

    try {
      let response;
      if (doctorId) {
        response = await axios.put(`http://localhost:3000/user/updateDoctor/${doctorId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axios.post("http://localhost:3000/user/addDoctor", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert(response.data.message);
      router.push("/doctors");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("❌ Erreur :", error.message);
        alert("Erreur lors de l'opération");
      } else {
        console.error("❌ Erreur inconnue :", error);
        alert("Erreur inconnue lors de l'opération");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb pageName={doctorId ? "Modifier un Médecin" : "Ajouter un Médecin"} />
      

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-3xl font-semibold text-dark text-center mb-8">
        {doctorId ? "Modifier un Médecin" : "Ajouter un Médecin"}
      </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Prénom *</label>
          <input
            type="text"
            name="name"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nom *</label>
          <input
            type="text"
            name="lastname"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            required
            value={formData.lastname}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Spécialité *</label>
          <select
            name="specialty"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            required
            value={formData.specialty}
            onChange={handleChange}
          >
            <option value="">Sélectionner une spécialité</option>
            {specialties.length > 0 ? (
              specialties.map((specialty, index) => (
                <option key={index} value={specialty._id}>
                  {specialty.name}
                </option>
              ))
            ) : (
              <option>Chargement...</option>
            )}
          </select>
        </div>

        {!doctorId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required={!doctorId}
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Image de Profil</label>
          <input
            type="file"
            name="image"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            onChange={handleImageChange}
          />
        </div>

        {imagePreview && (
          <div className="mb-4 text-center">
            <img
              src={imagePreview}
              alt="Doctor Image"
              className="w-32 h-32 rounded-full mx-auto border-2 border-gray-300"
            />
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? "Enregistrement..." : doctorId ? "Mettre à Jour" : "Ajouter Médecin"}
          </button>
        </div>
        <div className="mt-6 text-center">
  <Link href="/doctors">
    <button
      className="w-full py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
    >
      Retour à la liste
    </button>
  </Link>
</div>

      </form>
    </div>
  );
}
