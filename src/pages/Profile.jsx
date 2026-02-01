/**
 * Profile - OSMAUSIA
 * Page de profil utilisateur affichant les informations du compte
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './Profile.css';

const Profile = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isAuthenticated) return;
            try {
                const data = await authService.getCurrentUserAPI();
                setProfileData(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="profile-not-auth">
                        <div className="profile-not-auth__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <h2>Connexion requise</h2>
                        <p>Veuillez vous connecter pour accéder à votre profil.</p>
                        <Link to="/login" className="btn btn-primary">Se connecter</Link>
                    </div>
                </div>
            </div>
        );
    }

    const data = profileData || user;
    const isProvider = data?.type === 'PROVIDER' || user?.role === 'PARTNER';

    return (
        <div className="profile-page">
            <div className="container">
                {/* Header */}
                <header className="profile-header">
                    <div className="profile-avatar">
                        <span className="profile-avatar__initial">
                            {isProvider
                                ? (data?.companyName?.[0] || 'P')
                                : (data?.firstName?.[0] || data?.email?.[0] || 'U')
                            }
                        </span>
                    </div>
                    <div className="profile-header__info">
                        <h1>
                            {isProvider
                                ? data?.companyName
                                : `${data?.firstName || ''} ${data?.lastName || ''}`
                            }
                        </h1>
                        <p className="profile-header__email">{data?.email}</p>
                        <span className={`profile-badge profile-badge--${isProvider ? 'partner' : 'traveler'}`}>
                            {isProvider ? 'Partenaire' : 'Voyageur'}
                        </span>
                    </div>
                </header>

                {/* Content */}
                <div className="profile-content">
                    {loading ? (
                        <div className="profile-loading">Chargement...</div>
                    ) : (
                        <section className="profile-section">
                            <h2>Informations personnelles</h2>
                            <div className="profile-info-grid">
                                {isProvider ? (
                                    <>
                                        <div className="profile-info-item">
                                            <label>Nom de l'entreprise</label>
                                            <span>{data?.companyName || '-'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Type de partenaire</label>
                                            <span>
                                                {data?.providerType === 'HEBERGEUR' && 'Hébergeur'}
                                                {data?.providerType === 'GUIDE' && 'Guide / Activités'}
                                                {data?.providerType === 'MIXTE' && 'Mixte'}
                                                {!data?.providerType && '-'}
                                            </span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Statut du compte</label>
                                            <span className={`status-badge status-badge--${data?.providerStatus?.toLowerCase()}`}>
                                                {data?.providerStatus === 'PENDING' && 'En attente'}
                                                {data?.providerStatus === 'APPROVED' && 'Approuvé'}
                                                {data?.providerStatus === 'REJECTED' && 'Refusé'}
                                                {!data?.providerStatus && '-'}
                                            </span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Email</label>
                                            <span>{data?.email || '-'}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="profile-info-item">
                                            <label>Prénom</label>
                                            <span>{data?.firstName || '-'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Nom</label>
                                            <span>{data?.lastName || '-'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Email</label>
                                            <span>{data?.email || '-'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Téléphone</label>
                                            <span>{data?.phone || '-'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Langue préférée</label>
                                            <span>{data?.languagePref === 'fr' ? 'Français' : data?.languagePref === 'en' ? 'English' : '-'}</span>
                                        </div>
                                    </>
                                )}
                                <div className="profile-info-item">
                                    <label>Type de compte</label>
                                    <span>{isProvider ? 'Partenaire' : 'Voyageur'}</span>
                                </div>
                                <div className="profile-info-item">
                                    <label>Membre depuis</label>
                                    <span>
                                        {data?.createdAt
                                            ? new Date(data.createdAt).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : '-'
                                        }
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
