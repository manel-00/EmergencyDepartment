"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Wrapper from "../components/wrapper";

export default function Doctor() {
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
    image: null,
  });

  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Récupérer les spécialités disponibles
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get("http://localhost:3000/specialite/getspecialite");
        setSpecialties(response.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des spécialités :", error);
      }
    };
    fetchSpecialties();
  }, []);

  // Récupérer les infos du médecin si on est en mode modification
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
            password: "", // Ne pas préremplir pour des raisons de sécurité
            role: "doctor",
            creationDate: doctorData.creationDate,
            image: doctorData.image || null,
          });

          if (doctorData.image) {
            setImagePreview(`http://localhost:3002/images/${doctorData.image}`);
          }
        } catch (error) {
          console.error("❌ Erreur lors de la récupération du médecin :", error);
        }
      };

      fetchDoctor();
    }
  }, [doctorId]);

  // Gestion des inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestion du fichier image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file)); // Affichage de l'aperçu de l'image
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
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

    console.log("📩 Données envoyées :", Object.fromEntries(form.entries())); // Ajout du log

    try {
        let response;
        if (doctorId) {
            // 🔄 Mettre à jour le médecin
            response = await axios.put(`http://localhost:3000/user/updateDoctor/${doctorId}`, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        } else {
            // ➕ Ajouter un nouveau médecin
            response = await axios.post("http://localhost:3000/user/addDoctor", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

        console.log("✅ Réponse reçue :", response.data);
        alert(response.data.message);
        router.push("/doctors");
    } catch (error) {
        console.error("❌ Erreur :", error.response?.data || error);
        alert("Erreur lors de l'opération");
    } finally {
        setLoading(false);
    }
};


  return (
    <Wrapper>
      <div className="container mt-5">
        <h2 className="text-center mb-4">
          {doctorId ? "Modifier un Médecin" : "Ajouter un Médecin"}
        </h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="mx-auto" style={{ maxWidth: "600px" }}>
          <div className="mb-3">
            <label className="form-label">Prénom *</label>
            <input type="text" className="form-control" name="name" required value={formData.name} onChange={handleChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Nom *</label>
            <input type="text" className="form-control" name="lastname" required value={formData.lastname} onChange={handleChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input type="email" className="form-control" name="email" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Spécialité *</label>
            <select name="specialty" className="form-control" required value={formData.specialty} onChange={handleChange}>
              <option value="">Sélectionner une spécialité</option>
              {specialties.length > 0 ? (
                specialties.map((specialty, index) => (
                  <option key={index} value={specialty._id}>{specialty.name}</option>
                ))
              ) : (
                <option>Chargement...</option>
              )}
            </select>
          </div>

          {!doctorId && (
            <div className="mb-3">
              <label className="form-label">Mot de passe *</label>
              <input type="password" className="form-control" name="password" required={!doctorId} value={formData.password} onChange={handleChange} />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Image de Profil</label>
            <input type="file" className="form-control" name="image" onChange={handleImageChange} />
          </div>

          {imagePreview && (
            <div className="mt-3 d-flex justify-content-center">
              <Image src={imagePreview} alt="Doctor Image" width={150} height={150} className="img-thumbnail" />
            </div>
          )}

          <div className="d-grid mt-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Enregistrement..." : doctorId ? "Mettre à Jour" : "Ajouter Médecin"}
            </button>
          </div>
        </form>
      </div>
    </Wrapper>
  );
}
