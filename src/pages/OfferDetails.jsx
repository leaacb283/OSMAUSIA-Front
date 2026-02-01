/**
 * OfferDetails Page - OSMAUSIA
 * Clean, site-cohesive design
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import OfferGallery from '../components/OfferGallery';
import DateRangePicker from '../components/DateRangePicker';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import './OfferDetails.css';

const OfferDetails = () => {
    const { type, id } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [blockedDates, setBlockedDates] = useState([]);

    // Booking form state
    const [bookingData, setBookingData] = useState({
        checkInDate: '',
        checkOutDate: '',
        guestCount: 1,
    });

    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [dateConflict, setDateConflict] = useState(false);
    const [notice, setNotice] = useState({ isOpen: false, title: '', message: '', type: 'primary' });

    // Fetch offer details
    useEffect(() => {
        const fetchOffer = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpointType = type === 'hebergement' ? 'hebergements' : 'activites';
                const { data } = await api.get(`/offer/${endpointType}/${id}`);
                if (!data) throw new Error('Données vides');
                setOffer(data);
            } catch (err) {
                console.error('Failed to fetch offer:', err);
                setError('Impossible de charger les détails de cette offre.');
            } finally {
                setLoading(false);
            }
        };
        if (id && type) fetchOffer();
    }, [id, type]);

    // Fetch calendar availability
    useEffect(() => {
        const fetchCalendar = async () => {
            if (type !== 'hebergement' || !id) return;
            try {
                const today = new Date();
                const sixMonthsLater = new Date();
                sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
                const from = today.toISOString().split('T')[0];
                const to = sixMonthsLater.toISOString().split('T')[0];
                const { data } = await api.get(`/offer/hebergements/${id}/calendar?from=${from}&to=${to}`);
                setBlockedDates(data || []);
            } catch (err) {
                console.log('Calendar fetch failed:', err);
            }
        };
        fetchCalendar();
    }, [id, type]);

    // Date conflict check
    const hasDateConflict = (checkIn, checkOut) => {
        if (!checkIn || !checkOut || blockedDates.length === 0) return false;
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        return blockedDates.some(period => {
            const start = new Date(period.start);
            const end = new Date(period.end);
            return inDate <= end && outDate >= start;
        });
    };

    useEffect(() => {
        if (bookingData.checkInDate && bookingData.checkOutDate) {
            const conflict = hasDateConflict(bookingData.checkInDate, bookingData.checkOutDate);
            setDateConflict(conflict);
            setBookingError(conflict ? 'Les dates sélectionnées sont indisponibles.' : null);
        }
    }, [bookingData.checkInDate, bookingData.checkOutDate, blockedDates]);

    // Price calculation
    const calculateNights = () => {
        if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;
        const checkIn = new Date(bookingData.checkInDate);
        const checkOut = new Date(bookingData.checkOutDate);
        return Math.max(0, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    };

    const calculateTotal = () => {
        if (!offer) return 0;
        const price = offer.price || offer.basePrice || offer.pricePerson || 0;
        if (type === 'hebergement') {
            return calculateNights() * price;
        }
        return price * (bookingData.guestCount || 1);
    };

    // Handle booking
    const handleBooking = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/offer/${type}/${id}` } });
            return;
        }
        setSubmitting(true);
        setBookingError(null);
        try {
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
                // Build startDateTime from date at 09:00 AM
                const dateVal = bookingData.checkInDate;
                const startDateTime = dateVal ? `${dateVal}T09:00:00` : null;
                payload = {
                    activiteId: parseInt(id),
                    startDateTime: startDateTime,
                    guestCount: bookingData.guestCount,
                };
                endpoint = '/reservations/activity';
            }
            const { data } = await api.post(endpoint, payload);
            navigate(`/checkout/${data.id}`);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Erreur inconnue';
            setBookingError(`Erreur: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Images
    const getImages = () => {
        if (offer?.medias?.length > 0) {
            return offer.medias.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)).map(m => m.url);
        }
        if (offer?.images?.length > 0) return offer.images;
        return ['/images/placeholder-offer.jpg'];
    };

    // Loading state
    if (loading) {
        return (
            <div className="offer-details offer-details--loading">
                <div className="offer-details__loading-spinner"></div>
                <p>Chargement de l'offre...</p>
            </div>
        );
    }

    // Error state
    if (error || !offer) {
        return (
            <div className="offer-details offer-details--error">
                <span className="material-icons" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                    error_outline
                </span>
                <h1>Oups !</h1>
                <p className="offer-details__error-message">{error || 'Offre non trouvée'}</p>
                <button className="btn btn-primary" onClick={() => navigate('/explore')}>
                    Explorer les offres
                </button>
            </div>
        );
    }

    // Safe accessors
    const title = offer.title || offer.name || 'Offre';
    const description = offer.description || offer.hDescription || offer.storyContent || 'Aucune description disponible.';
    const price = offer.price || offer.basePrice || offer.pricePerson || 0;
    const maxGuests = offer.maxGuests || offer.nbrMaxPlaces || 10;
    const locationCity = offer.city || offer.etablissement?.city || 'Île Maurice';
    const locationName = offer.etablissement?.name || '';
    const providerName = offer.etablissement?.provider?.companyName || offer.provider?.companyName || 'Hôte OSMAUSIA';
    const providerId = offer.etablissement?.provider?.id || offer.provider?.id;
    const isPartner = user?.role === 'partner';
    const images = getImages();
    const nights = calculateNights();
    const total = calculateTotal();

    return (
        <div className="offer-details">
            <div className="container">
                {/* Header - Above Gallery */}
                <header className="offer-details__header">
                    <span className="offer-details__type">
                        <span className="material-icons">
                            {type === 'hebergement' ? 'hotel' : 'explore'}
                        </span>
                        {type === 'hebergement' ? 'Hébergement' : 'Activité'}
                    </span>
                    <h1 className="offer-details__title">{title}</h1>
                    <div className="offer-details__location">
                        <span className="material-icons">place</span>
                        {locationName ? `${locationName}, ` : ''}{locationCity}
                    </div>
                </header>

                {/* Gallery */}
                <section className="offer-details__gallery">
                    <OfferGallery images={images} title={title} />
                </section>

                {/* Content Grid */}
                <div className="offer-details__content">
                    {/* Main Info */}
                    <main className="offer-details__main">
                        {/* Host */}
                        <div className="offer-details__host">
                            <div className="offer-details__host-avatar">
                                {providerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="offer-details__host-info">
                                <h3>Proposé par {providerName}</h3>
                                <p>{type === 'hebergement' ? 'Hébergement régénératif' : 'Expérience locale'}</p>
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="offer-details__highlights">
                            <div className="offer-details__highlight">
                                <div className="offer-details__highlight-icon">
                                    <span className="material-icons">group</span>
                                </div>
                                <div className="offer-details__highlight-text">
                                    <h4>Jusqu'à {maxGuests} personnes</h4>
                                    <p>Capacité</p>
                                </div>
                            </div>
                            {offer.isShared !== undefined && (
                                <div className="offer-details__highlight">
                                    <div className="offer-details__highlight-icon">
                                        <span className="material-icons">{offer.isShared ? 'groups' : 'home'}</span>
                                    </div>
                                    <div className="offer-details__highlight-text">
                                        <h4>{offer.isShared ? 'Partagé' : 'Logement entier'}</h4>
                                        <p>Type</p>
                                    </div>
                                </div>
                            )}
                            {offer.durationMin && (
                                <div className="offer-details__highlight">
                                    <div className="offer-details__highlight-icon">
                                        <span className="material-icons">schedule</span>
                                    </div>
                                    <div className="offer-details__highlight-text">
                                        <h4>{offer.durationMin} minutes</h4>
                                        <p>Durée</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Regen Score */}
                        {offer.regenScore > 0 && (
                            <div className="offer-details__regen-score">
                                <div className="offer-details__regen-icon">
                                    <span className="material-icons">eco</span>
                                </div>
                                <div className="offer-details__regen-content">
                                    <span className="offer-details__regen-label">Score régénératif</span>
                                    <span className="offer-details__regen-value">
                                        {offer.regenScore}<span>/100</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <section className="offer-details__section">
                            <h2 className="offer-details__section-title">À propos</h2>
                            <p className="offer-details__description">{description}</p>
                        </section>

                        {/* Tags */}
                        {offer.tags?.length > 0 && (
                            <section className="offer-details__section">
                                <h2 className="offer-details__section-title">Caractéristiques</h2>
                                <div className="offer-details__tags">
                                    {offer.tags.map((tag, idx) => (
                                        <span key={tag.id || idx} className="offer-details__tag">
                                            <span className="material-icons">
                                                {tag.iconUrl || 'check_circle'}
                                            </span>
                                            {tag.label || tag}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* Booking Sidebar */}
                    <aside className="offer-details__sidebar">
                        <div className="offer-details__booking-card">
                            <div className="offer-details__price">
                                <span className="offer-details__price-amount">{price} €</span>
                                <span className="offer-details__price-unit">/ {type === 'activite' ? 'personne' : 'nuit'}</span>
                            </div>

                            <form className="offer-details__form" onSubmit={handleBooking}>
                                {type === 'hebergement' ? (
                                    <div className="offer-details__form-group">
                                        <label>Dates</label>
                                        <DateRangePicker
                                            checkIn={bookingData.checkInDate}
                                            checkOut={bookingData.checkOutDate}
                                            onDateChange={({ checkIn, checkOut }) => {
                                                setBookingData(prev => ({
                                                    ...prev,
                                                    checkInDate: checkIn,
                                                    checkOutDate: checkOut
                                                }));
                                            }}
                                            blockedDates={blockedDates}
                                            disabled={isPartner}
                                        />
                                    </div>
                                ) : (
                                    <div className="offer-details__form-group">
                                        <label>Date</label>
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
                                    <label>Voyageurs</label>
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
                                                {i + 1} {i === 0 ? 'voyageur' : 'voyageurs'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Breakdown */}
                                {total > 0 && type === 'hebergement' && nights > 0 && (
                                    <div className="offer-details__breakdown">
                                        <div className="offer-details__breakdown-row">
                                            <span>{price} € x {nights} nuit{nights > 1 ? 's' : ''}</span>
                                            <span>{total} €</span>
                                        </div>
                                    </div>
                                )}

                                {total > 0 && (
                                    <div className="offer-details__total">
                                        <span>Total</span>
                                        <span className="offer-details__total-amount">{total} €</span>
                                    </div>
                                )}

                                {bookingError && (
                                    <div className="offer-details__error">{bookingError}</div>
                                )}

                                {!isAuthenticated ? (
                                    <div className="offer-details__login-hint">
                                        <button
                                            type="button"
                                            className="offer-details__submit"
                                            onClick={() => navigate('/login', { state: { from: `/offer/${type}/${id}` } })}
                                        >
                                            Se connecter pour réserver
                                        </button>
                                    </div>
                                ) : isPartner ? (
                                    <div className="offer-details__partner-hint">
                                        <p>Les comptes partenaires ne peuvent pas réserver.</p>
                                        <small>Connectez-vous avec un compte voyageur.</small>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="submit"
                                            className="offer-details__submit"
                                            disabled={submitting || dateConflict}
                                        >
                                            {submitting ? 'Réservation...' : 'Réserver'}
                                        </button>

                                        {providerId && (
                                            <button
                                                type="button"
                                                className="btn-contact-host"
                                                onClick={() => navigate(`/messages/${providerId}`, {
                                                    state: { partnerName: providerName }
                                                })}
                                            >
                                                Contacter l'hôte
                                            </button>
                                        )}
                                    </>
                                )}
                            </form>
                        </div>
                    </aside>
                </div>

                <ConfirmModal
                    isOpen={notice.isOpen}
                    title={notice.title}
                    message={notice.message}
                    confirmText="D'accord"
                    cancelText=""
                    confirmVariant={notice.type}
                    onConfirm={() => setNotice(prev => ({ ...prev, isOpen: false }))}
                    onCancel={() => setNotice(prev => ({ ...prev, isOpen: false }))}
                />
            </div>
        </div>
    );
};

export default OfferDetails;
