"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiHome, SlSocialGoogle } from "../assets/icons/vander";
import { FaSquareFacebook } from "react-icons/fa6";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "patient",
    image: null,  // Ajoute un champ pour l'image
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Crée un objet FormData pour envoyer les données au backend
    const form = new FormData();
    form.append("name", formData.name);
    form.append("lastname", formData.lastname);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("role", formData.role);
    form.append("creationDate", new Date().toISOString());
    form.append("image", formData.image); // Ajoute l'image au formulaire

    try {
      const response = await axios.post("http://localhost:3000/user/signup", form, {
        headers: {
          "Content-Type": "multipart/form-data", // Indique que c'est une requête contenant des fichiers
        },
      });

      console.log("✅ Réponse reçue :", response.data);
      if (response.data.status === "PENDING") {
        alert("Vérifiez votre email pour activer votre compte !");
        router.push("/signup");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("❌ Erreur d'inscription :", error.response?.data || error);
      alert("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-home d-flex bg-light align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <Image src="/images/logo-dark.png" width={115} height={22} className="mx-auto d-block" alt="Logo" />
            <div className="card login-page shadow mt-4 rounded border-0">
              <div className="card-body">
                <h4 className="text-center">Sign Up</h4>
                <form onSubmit={handleSubmit} className="login-form mt-4">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastname"
                        required
                        value={formData.lastname}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Your Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        className="form-control"
                        name="image"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <div className="d-grid">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? "Registering..." : "Register"}
                        </button>
                      </div>
                    </div>
                    <div className="mx-auto">
                      <p className="mb-0 mt-3">
                        <small className="text-dark me-2">Already have an account?</small>{" "}
                        <Link href="/login" className="text-dark fw-bold">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
