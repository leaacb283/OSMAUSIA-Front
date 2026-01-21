/**
 * Partner Dashboard - OSMAUSIA
 * Dashboard for partners to manage their offers
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { createHebergement, getAllHebergements } from '../services/offerService';
import './PartnerDashboard.css';

// Fonction utilitaire pour calculer le score régénératif
const calculateRegenScore = (scores) => {
    if (!scores) return 0;
    // Si c'est un objet
    if (typeof scores === 'object') {
        return Math.round((scores.environmental + scores.social + scores.experience) / 3);
    }
    // Si c'est déjà un nombre
    return scores;
};

// Mapper DTO backend vers format frontend
const mapDTOToOffer = (dto) => ({
    id: dto.id,
    title: { fr: dto.title, en: dto.title },
    type: 'hebergement',
    category: 'nature',
    partnerId: dto.providerDTO?.id,
    partnerName: dto.providerDTO?.companyName,
    location: {
        city: dto.locationDTO?.city,
        country: 'Île Maurice',
        coordinates: {
            lat: dto.locationDTO?.latitude || -20.0,
            lng: dto.locationDTO?.longitude || 57.5
        }
    },
    description: { fr: dto.hDescription, en: dto.hDescription },
    price: {
        amount: dto.basePrice,
        currency: 'EUR',
        unit: 'night'
    },
    capacity: { min: 1, max: dto.maxGuests },
    regenScore: {
        environmental: dto.regenScore,
        social: dto.regenScore,
        experience: dto.regenScore
    },
    images: ['/images/offers/default.jpg'],
    featured: false,
    available: true, // Par défaut true car pas de champ dans le DTO
    tags: []
});

const PartnerDashboard = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Commencer avec une liste vide - les offres seront chargées depuis l'API
    const [offers, setOffers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOffer, setNewOffer] = useState({
        title: '',
        type: 'hebergement',
        category: 'nature',
        description: '',
        price: '',
        city: '',
        country: 'Île Maurice',
        capacity: 2,
        environmental: 80,
        social: 80,
        experience: 80
    });
    const [createError, setCreateError] = useState('');

    // Charger les offres au montage
    useState(() => {
        const fetchOffers = async () => {
            if (user?.id) {
                try {
                    const allOffers = await getAllHebergements();
                    // Filtrage côté client car endpoint getAll renvoie tout
                    // On compare l'ID ou l'email du provider
                    const myOffers = allOffers.filter(o =>
                        o.providerDTO?.id === user.id ||
                        o.providerDTO?.email === user.email
                    );
                    setOffers(myOffers.map(mapDTOToOffer));
                } catch (error) {
                    console.error("Erreur chargement offres:", error);
                }
            }
        };
        fetchOffers();
    }, [user]);

    // Redirect if not authenticated or not a partner
    if (!isAuthenticated) {
        return (
            <div className="partner-dashboard">
                <div className="container">
                    <div className="partner-not-auth">
                        <span className="partner-not-auth__icon">🔒</span>
                        <h2>Accès réservé aux partenaires</h2>
                        <p>Veuillez vous connecter pour accéder à votre dashboard.</p>
                        <Link to="/login" className="btn btn-primary">Se connecter</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        setCreateError('');

        // Validation
        if (!newOffer.title.trim() || !newOffer.description.trim() || !newOffer.price) {
            setCreateError('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        try {
            // Appel API
            const createdOfferDTO = await createHebergement(newOffer, user);

            // Mapping du DTO backend vers le format frontend local pour affichage immédiat
            const offer = mapDTOToOffer(createdOfferDTO);

            setOffers([offer, ...offers]);
            setShowCreateModal(false);
            setNewOffer({
                title: '',
                type: 'hebergement',
                category: 'nature',
                description: '',
                price: '',
                city: '',
                country: 'Île Maurice',
                capacity: 2,
                environmental: 80,
                social: 80,
                experience: 80
            });
        } catch (error) {
            console.error('Erreur création offre:', error);
            setCreateError(error.message || "Erreur lors de la création de l'offre");
        }
    };

    const handleDeleteOffer = (offerId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
            setOffers(offers.filter(o => o.id !== offerId));
        }
    };

    const stats = {
        totalOffers: offers.length,
        activeOffers: offers.filter(o => o.available).length,
        totalViews: 1247,
        totalBookings: 23
    };

    return (
        <div className="partner-dashboard">
            {/* Header */}
            <header className="partner-header">
                <div className="container">
                    <div className="partner-header__content">
                        <div className="partner-header__info">
                            <div className="partner-header__avatar">🏢</div>
                            <div className="partner-header__text">
                                <h1>{user?.profile?.companyName || 'Partenaire'}</h1>
                                <div className="partner-header__status">
                                    <span className="partner-status partner-status--pending">
                                        ⏳ En attente de validation
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            ➕ Créer une offre
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <section className="partner-stats">
                <div className="container">
                    <div className="partner-stats__grid">
                        <div className="partner-stat-card">
                            <span className="partner-stat-card__icon">📋</span>
                            <div className="partner-stat-card__content">
                                <span className="partner-stat-card__value">{stats.totalOffers}</span>
                                <span className="partner-stat-card__label">Offres totales</span>
                            </div>
                        </div>
                        <div className="partner-stat-card">
                            <span className="partner-stat-card__icon">✅</span>
                            <div className="partner-stat-card__content">
                                <span className="partner-stat-card__value">{stats.activeOffers}</span>
                                <span className="partner-stat-card__label">Offres actives</span>
                            </div>
                        </div>
                        <div className="partner-stat-card">
                            <span className="partner-stat-card__icon">👁️</span>
                            <div className="partner-stat-card__content">
                                <span className="partner-stat-card__value">{stats.totalViews}</span>
                                <span className="partner-stat-card__label">Vues ce mois</span>
                            </div>
                        </div>
                        <div className="partner-stat-card">
                            <span className="partner-stat-card__icon">📅</span>
                            <div className="partner-stat-card__content">
                                <span className="partner-stat-card__value">{stats.totalBookings}</span>
                                <span className="partner-stat-card__label">Réservations</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Offers List */}
            <section className="partner-offers">
                <div className="container">
                    <h2 className="partner-offers__title">Mes offres</h2>

                    {offers.length === 0 ? (
                        <div className="partner-offers__empty">
                            <span className="partner-offers__empty-icon">📭</span>
                            <p>Vous n'avez pas encore créé d'offre.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Créer ma première offre
                            </button>
                        </div>
                    ) : (
                        <div className="partner-offers__list">
                            {offers.map(offer => (
                                <div key={offer.id} className="partner-offer-card">
                                    <div className="partner-offer-card__image">
                                        <div className="partner-offer-card__placeholder">🏨</div>
                                    </div>
                                    <div className="partner-offer-card__content">
                                        <div className="partner-offer-card__header">
                                            <h3>{offer.title.fr}</h3>
                                            <span className={`partner-offer-card__status ${offer.available ? 'active' : 'inactive'}`}>
                                                {offer.available ? '✓ Active' : '✗ Inactive'}
                                            </span>
                                        </div>
                                        <p className="partner-offer-card__location">
                                            📍 {offer.location.city}, {offer.location.country}
                                        </p>
                                        <div className="partner-offer-card__meta">
                                            <span className="partner-offer-card__price">
                                                {offer.price.amount}€/{offer.price.unit === 'night' ? 'nuit' : 'pers.'}
                                            </span>
                                            <span className="partner-offer-card__score">
                                                🌿 Score: {calculateRegenScore(offer.regenScore)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="partner-offer-card__actions">
                                        <button className="btn btn-secondary btn-sm">✏️ Modifier</button>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => handleDeleteOffer(offer.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Create Offer Modal */}
            {showCreateModal && (
                <div className="partner-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="partner-modal" onClick={e => e.stopPropagation()}>
                        <div className="partner-modal__header">
                            <h2>Créer une nouvelle offre</h2>
                            <button
                                className="partner-modal__close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {createError && (
                            <div className="partner-modal__error">
                                ⚠️ {createError}
                            </div>
                        )}

                        <form className="partner-modal__form" onSubmit={handleCreateOffer}>
                            <div className="form-group">
                                <label htmlFor="title">Titre de l'offre *</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={newOffer.title}
                                    onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                                    placeholder="Ex: Éco-lodge Vue Océan"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="type">Type</label>
                                    <select
                                        id="type"
                                        value={newOffer.type}
                                        onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value })}
                                    >
                                        <option value="hebergement">🏨 Hébergement</option>
                                        <option value="activite">🎯 Activité</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Catégorie</label>
                                    <select
                                        id="category"
                                        value={newOffer.category}
                                        onChange={(e) => setNewOffer({ ...newOffer, category: e.target.value })}
                                    >
                                        <option value="nature">🌿 Nature</option>
                                        <option value="culture">🎭 Culture</option>
                                        <option value="social">🤝 Social</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    value={newOffer.description}
                                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                    placeholder="Décrivez votre offre..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">Ville *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        value={newOffer.city}
                                        onChange={(e) => setNewOffer({ ...newOffer, city: e.target.value })}
                                        placeholder="Ex: Grand Baie"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="country">Pays</label>
                                    <input
                                        type="text"
                                        id="country"
                                        value={newOffer.country}
                                        onChange={(e) => setNewOffer({ ...newOffer, country: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price">Prix (€) *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        value={newOffer.price}
                                        onChange={(e) => setNewOffer({ ...newOffer, price: e.target.value })}
                                        placeholder="120"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="capacity">Capacité max</label>
                                    <input
                                        type="number"
                                        id="capacity"
                                        value={newOffer.capacity}
                                        onChange={(e) => setNewOffer({ ...newOffer, capacity: e.target.value })}
                                        min="1"
                                        max="50"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Score Régénératif</label>
                                <div className="regen-score-inputs">
                                    <div className="regen-score-input">
                                        <label>🌍 Environnement</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={newOffer.environmental}
                                            onChange={(e) => setNewOffer({ ...newOffer, environmental: e.target.value })}
                                        />
                                        <span>{newOffer.environmental}%</span>
                                    </div>
                                    <div className="regen-score-input">
                                        <label>🤝 Social</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={newOffer.social}
                                            onChange={(e) => setNewOffer({ ...newOffer, social: e.target.value })}
                                        />
                                        <span>{newOffer.social}%</span>
                                    </div>
                                    <div className="regen-score-input">
                                        <label>⭐ Expérience</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={newOffer.experience}
                                            onChange={(e) => setNewOffer({ ...newOffer, experience: e.target.value })}
                                        />
                                        <span>{newOffer.experience}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="partner-modal__actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Créer l'offre
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerDashboard;
