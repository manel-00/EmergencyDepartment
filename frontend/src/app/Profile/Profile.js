'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
                setUser(data);
            } catch (error) {
                console.error('Erreur:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    if (!user) {
        return <div>Profil non trouvé</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Mon Profil</h1>
                <Link href="/edit-profile" className="edit-button">
                    Modifier le profil
                </Link>
            </div>
            
            <div className="profile-content">
                <div className="profile-section">
                    <h2>Informations personnelles</h2>
                    <div className="info-group">
                        <label>Nom</label>
                        <p>{user.nom}</p>
                    </div>
                    <div className="info-group">
                        <label>Prénom</label>
                        <p>{user.prenom}</p>
                    </div>
                    <div className="info-group">
                        <label>Email</label>
                        <p>{user.email}</p>
                    </div>
                    <div className="info-group">
                        <label>Téléphone</label>
                        <p>{user.telephone || 'Non renseigné'}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Informations professionnelles</h2>
                    <div className="info-group">
                        <label>Spécialité</label>
                        <p>{user.specialite || 'Non renseignée'}</p>
                    </div>
                    <div className="info-group">
                        <label>Grade</label>
                        <p>{user.grade || 'Non renseigné'}</p>
                    </div>
                    <div className="info-group">
                        <label>Service</label>
                        <p>{user.service || 'Non renseigné'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;