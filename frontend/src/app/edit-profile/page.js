"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './EditProfile.css';

const EditProfile = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    grade: '',
    service: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/user/profile', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du profil');
        }
        
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3000/user/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/Profile');
      }, 2000);
    } catch (error) {
      setError('Une erreur est survenue lors de la mise à jour du profil');
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="edit-profile-container">
      <h1>Modifier mon profil</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Profil mis à jour avec succès !</div>}

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-section">
          <h2>Informations personnelles</h2>
          
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prenom">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Informations professionnelles</h2>
          
          <div className="form-group">
            <label htmlFor="specialite">Spécialité</label>
            <input
              type="text"
              id="specialite"
              name="specialite"
              value={formData.specialite}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="grade">Grade</label>
            <input
              type="text"
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="service">Service</label>
            <input
              type="text"
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => router.push('/Profile')} className="cancel-button">
            Annuler
          </button>
          <button type="submit" className="submit-button">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile; 