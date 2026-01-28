/**
 * OfferDetails Page - OSMAUSIA
 * Displays detailed information about an accommodation or activity
 * Includes booking form and navigation to payment
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './OfferDetails.css';



const OfferDetails = () => {
    const { type, id } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Booking form state
    const [bookingData, setBookingData] = useState({
        checkInDate: '',
        checkOutDate: '',
        guestCount: 1, // Default 1
    });

    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    const lang = i18n.language === 'en' ? 'en' : 'fr';

    // Fetch offer details
    useEffect(() => {
        const fetchOffer = async () => {
            setLoading(true);
            setError(null);

            try {
                // Determine endpoint based on type
                // Note: Frontend routes usually use 'hebergement' / 'activite'
                // Backend controller might expect 'hebergements' / 'activites'
                const endpointType = type === 'hebergement' ? 'hebergements' : 'activites';
                const endpoint = `/offer/${endpointType}/${id}`;

                console.log(`Fetching offer details from: ${endpoint}`); // Debug
                const { data } = await api.get(endpoint);

                if (!data) {
                    throw new Error('Données vides reçues du serveur');
                }
                setOffer(data);
            } catch (err) {
                console.error('Failed to fetch offer:', err);
                // Try alternate endpoint if singular 'hebergement' failed? 
                // Usually API aligns with REST standards.
                setError('Impossible de charger les détails de cette offre. Vérifiez que le backend est lancé.');
            } finally {
                setLoading(false);
            }
        };

        if (id && type) {
            fetchOffer();
        }
    }, [id, type]);

    // Calculate total price
    const calculateTotal = () => {
        if (!offer) return 0;

        const price = offer.price || offer.basePrice || offer.pricePerson || offer.pricePerPerson || 0;

        if (type === 'hebergement') {
            if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;
            const checkIn = new Date(bookingData.checkInDate);
            const checkOut = new Date(bookingData.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            return nights > 0 ? nights * price : 0;
        } else {
            // Activity: price per person
            return price * (bookingData.guestCount || 1);
        }
    };

    // Handle booking submission
    const handleBooking = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            // Save current location to redirect after login
            navigate('/login', { state: { from: `/offer/${type}/${id}` } });
            return;
        }

        setSubmitting(true);
        setBookingError(null);

        try {
            // Payload depends on type
            let payload = {};
            let endpoint = '';

            if (type === 'hebergement') {
                payload = {
                    hebergementId: parseInt(id),
                    checkInDate: bookingData.checkInDate,
                    checkOutDate: bookingData.checkOutDate,
                    guestCount: bookingData.guestCount,
                };
                endpoint = '/reservations/accommodation';
            } else {
                // Activity reservation endpoint (if it exists)
                // For now, simple console log or different logic
                alert("La réservation d'activité arrive bientôt !");
                setSubmitting(false);
                return;
            }

            const { data } = await api.post(endpoint, payload);

            // Redirect to checkout with reservation ID
            navigate(`/checkout/${data.id}`);
        } catch (err) {
            console.error('Booking error:', err);
            // Better error message
            const msg = err.response?.data?.message || err.message || 'Erreur inconnue';
            setBookingError(`Erreur lors de la réservation: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Image navigation
    const getImages = () => {
        if (offer && offer.medias && offer.medias.length > 0) {
            return offer.medias.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)).map(m => m.url);
        }
        if (offer && offer.images && offer.images.length > 0) return offer.images;
        // Fallback
        return ['/images/placeholder-offer.jpg'];
    };

    const images = getImages();

    const nextImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    if (loading) {
        return (
            <div className="offer-details offer-details--loading">
                <div className="offer-details__spinner"></div>
                <p>Chargement de l'offre...</p>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="offer-details offer-details--error">
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <h1>😕 Oups !</h1>
                    <p>{error || 'Offre non trouvée'}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Retour à l'accueil
                    </button>
                    <button className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={() => navigate('/explore')}>
                        Explorer les offres
                    </button>
                </div>
            </div>
        );
    }

    // Safe accessors
    const title = offer.title || offer.name || 'Offre';
    // Description can be in different fields depending on backend entity (Hebergement vs Activity)
    const description = offer.description || offer.hDescription || offer.storyContent || 'Aucune description disponible.';
    const price = offer.price || offer.basePrice || offer.pricePerson || offer.pricePerPerson || 0;
    const maxGuests = offer.maxGuests || offer.nbrMaxPlaces || 10;
    const locationCity = offer.city || (offer.etablissement ? offer.etablissement.city : 'Île Maurice');
    const locationName = offer.etablissement ? offer.etablissement.name : '';

    const isPartner = user?.role === 'partner';

    return (
        <div className="offer-details">
            {/* Image Gallery */}
            {/* Image Gallery - Bento Grid */}
            <section className="offer-details__gallery-grid">
                {images.slice(0, 5).map((img, idx) => (
                    <div
                        key={idx}
                        className={`gallery-item gallery-item--${idx}`}
                        onClick={() => setCurrentImageIndex(idx)}
                    >
                        <img src={img} alt={`${title} ${idx + 1}`} />
                        <div className="gallery-overlay" />
                    </div>
                ))}

                {images.length > 5 && (
                    <button className="btn-show-all-photos">
                        📸 Afficher toutes les photos ({images.length})
                    </button>
                )}
            </section>

            <div className="container">
                <div className="offer-details__content">
                    {/* Main Info */}
                    <div className="offer-details__main">
                        <div className="offer-details__header">
                            <h1 className="offer-details__title">{title}</h1>
                            <p className="offer-details__location">
                                📍 {locationName ? `${locationName} — ` : ''}{locationCity}
                            </p>
                        </div>

                        {/* Tags */}
                        {offer.tags?.length > 0 && (
                            <div className="offer-details__tags">
                                {offer.tags.map((tag, idx) => (
                                    <span key={idx} className="offer-details__tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Regen Score */}
                        {(offer.regenScore || offer.regenScore === 0) && (
                            <div className="offer-details__score">
                                <span className="offer-details__score-icon">🌱</span>
                                <span className="offer-details__score-value">{offer.regenScore}</span>
                                <span className="offer-details__score-label">Score régénératif</span>
                            </div>
                        )}

                        {/* Description */}
                        <div className="offer-details__description">
                            <h2>À propos</h2>
                            <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
                        </div>

                        {/* Capacity */}
                        <div className="offer-details__info-grid">
                            <div className="offer-details__info-item">
                                <span className="offer-details__info-icon">👥</span>
                                <span>Jusqu'à {maxGuests} personnes</span>
                            </div>
                            {/* Hebergement specific */}
                            {offer.isShared !== undefined && (
                                <div className="offer-details__info-item">
                                    <span className="offer-details__info-icon">🏠</span>
                                    <span>{offer.isShared ? 'Hébergement partagé' : 'Logement entier'}</span>
                                </div>
                            )}
                            {/* Activity specific */}
                            {offer.durationMin && (
                                <div className="offer-details__info-item">
                                    <span className="offer-details__info-icon">⏱️</span>
                                    <span>Durée : {offer.durationMin} min</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <aside className="offer-details__booking">
                        <div className="offer-details__booking-card glass">
                            <div className="offer-details__price">
                                <span className="offer-details__price-amount">{price} €</span>
                                <span className="offer-details__price-unit">/ {type === 'activite' ? 'personne' : 'nuit'}</span>
                            </div>

                            <form className="offer-details__form" onSubmit={handleBooking}>
                                {type === 'hebergement' ? (
                                    <>
                                        <div className="offer-details__form-row">
                                            <div className="offer-details__form-group">
                                                <label>Arrivée</label>
                                                <input
                                                    type="date"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    value={bookingData.checkInDate}
                                                    onChange={(e) => setBookingData(prev => ({
                                                        ...prev,
                                                        checkInDate: e.target.value
                                                    }))}
                                                    disabled={isPartner}
                                                />
                                            </div>
                                            <div className="offer-details__form-group">
                                                <label>Départ</label>
                                                <input
                                                    type="date"
                                                    required
                                                    min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                                                    value={bookingData.checkOutDate}
                                                    onChange={(e) => setBookingData(prev => ({
                                                        ...prev,
                                                        checkOutDate: e.target.value
                                                    }))}
                                                    disabled={isPartner}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Activity Date Picker (Simplified) */
                                    <div className="offer-details__form-group">
                                        <label>Date de l'activité</label>
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={bookingData.checkInDate}
                                            onChange={(e) => setBookingData(prev => ({
                                                ...prev,
                                                checkInDate: e.target.value
                                            }))}
                                            disabled={isPartner}
                                        />
                                    </div>
                                )}

                                <div className="offer-details__form-group">
                                    <label>Voyageurs / Participants</label>
                                    <select
                                        value={bookingData.guestCount}
                                        onChange={(e) => setBookingData(prev => ({
                                            ...prev,
                                            guestCount: parseInt(e.target.value)
                                        }))}
                                        disabled={isPartner}
                                    >
                                        {[...Array(maxGuests)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1} personne{i > 0 ? 's' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {calculateTotal() > 0 && (
                                    <div className="offer-details__total">
                                        <span>Total estimé</span>
                                        <span className="offer-details__total-amount">{calculateTotal()} €</span>
                                    </div>
                                )}

                                {bookingError && (
                                    <div className="offer-details__error">
                                        ⚠️ {bookingError}
                                    </div>
                                )}

                                {!isAuthenticated ? (
                                    <div className="offer-details__login-hint">
                                        <p>Connectez-vous pour réserver</p>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            onClick={() => navigate('/login', { state: { from: `/offer/${type}/${id}` } })}
                                            style={{ marginTop: '10px', width: '100%' }}
                                        >
                                            Se connecter
                                        </button>
                                    </div>
                                ) : user?.role === 'partner' ? (
                                    <div className="offer-details__partner-hint">
                                        <p>🚫 Les comptes partenaires ne peuvent pas effectuer de réservations.</p>
                                        <small>Connectez-vous avec un compte voyageur pour réserver.</small>
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg offer-details__submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Traitement...' : 'Réserver'}
                                    </button>
                                )}
                            </form>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default OfferDetails;
