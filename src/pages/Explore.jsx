/**
 * Explore Page - OSMAUSIA
 * Displays all accommodations and activities from the database
 * Uses catalog API directly (not Meilisearch) for reliability
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OfferCard from '../components/OfferCard';
import api from '../services/api';
import './Explore.css';

const Explore = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const lang = i18n.language === 'en' ? 'en' : 'fr';

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'hebergement', 'activite'

    // Fallback images
    const FALLBACK_IMAGES = [
        '/images/offers/overwater-bungalow.jpg',
        '/images/offers/chalet-montagne.jpg',
        '/images/offers/maison-coloniale.jpg',
        '/images/offers/eco-lodge.jpg'
    ];

    const getFallbackImage = (id) => {
        const numericId = typeof id === 'number' ? id : parseInt(id) || 0;
        return FALLBACK_IMAGES[Math.abs(numericId) % FALLBACK_IMAGES.length];
    };

    // Fetch all offers from catalog API
    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch hébergements directly from catalog API
                const { data: hebergements } = await api.get('/offer/hebergements');

                // Fetch activités
                let activities = [];
                try {
                    const { data: activitesData } = await api.get('/offer/activites');
                    activities = activitesData || [];
                } catch (e) {
                    console.log('No activities endpoint or error:', e);
                }

                // Map hébergements to frontend format
                const mappedHebergements = (hebergements || []).map(h => ({
                    id: h.id,
                    title: { fr: h.title || 'Hébergement', en: h.title || 'Accommodation' },
                    type: 'hebergement',
                    category: 'nature',
                    partnerId: h.providerId || null,
                    partnerName: h.providerName || 'Partenaire OSMAUSIA',
                    location: {
                        city: h.city || h.etablissement?.city || 'Île Maurice',
                        country: 'Île Maurice',
                        coordinates: { lat: 0, lng: 0 }
                    },
                    description: {
                        fr: h.hDescription || h.description || '',
                        en: h.hDescription || h.description || ''
                    },
                    price: {
                        amount: h.basePrice || h.price || 0,
                        currency: 'EUR',
                        unit: 'night'
                    },
                    capacity: { min: 1, max: h.maxGuests || 4 },
                    regenScore: {
                        environmental: h.regenScore || 80,
                        social: h.regenScore || 80,
                        experience: h.regenScore || 80
                    },
                    images: h.images?.length > 0 ? h.images : [getFallbackImage(h.id)],
                    featured: false,
                    available: true,
                    tags: h.tags || []
                }));

                // Map activités
                const mappedActivities = (activities || []).map(a => ({
                    id: a.id,
                    title: { fr: a.name || 'Activité', en: a.name || 'Activity' },
                    type: 'activite',
                    category: 'culture',
                    partnerId: a.providerId || null,
                    partnerName: a.providerName || 'Partenaire',
                    location: {
                        city: a.city || 'Île Maurice',
                        country: 'Île Maurice',
                        coordinates: { lat: 0, lng: 0 }
                    },
                    description: {
                        fr: a.storyContent || '',
                        en: a.storyContent || ''
                    },
                    price: {
                        amount: a.pricePerPerson || a.price || 0,
                        currency: 'EUR',
                        unit: 'person'
                    },
                    capacity: { min: 1, max: a.nbrMaxPlaces || 10 },
                    regenScore: {
                        environmental: 85,
                        social: 85,
                        experience: 85
                    },
                    images: [getFallbackImage(a.id + 100)],
                    featured: false,
                    available: true,
                    tags: []
                }));

                setOffers([...mappedHebergements, ...mappedActivities]);
            } catch (err) {
                console.error('Failed to fetch offers:', err);
                setError('Impossible de charger les offres. Vérifiez que le backend est démarré.');
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    // Filter offers
    const filteredOffers = filter === 'all'
        ? offers
        : offers.filter(o => o.type === filter);

    return (
        <div className="explore">
            <div className="container">
                {/* Header */}
                <header className="explore__header">
                    <h1>Explorer nos offres</h1>
                    <p>Découvrez tous les hébergements et activités régénératifs</p>
                </header>

                {/* Filters */}
                <div className="explore__filters">
                    <button
                        className={`explore__filter ${filter === 'all' ? 'explore__filter--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tout ({offers.length})
                    </button>
                    <button
                        className={`explore__filter ${filter === 'hebergement' ? 'explore__filter--active' : ''}`}
                        onClick={() => setFilter('hebergement')}
                    >
                        Hébergements ({offers.filter(o => o.type === 'hebergement').length})
                    </button>
                    <button
                        className={`explore__filter ${filter === 'activite' ? 'explore__filter--active' : ''}`}
                        onClick={() => setFilter('activite')}
                    >
                        Activités ({offers.filter(o => o.type === 'activite').length})
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="explore__error">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="explore__loading">
                        <div className="explore__spinner"></div>
                        <p>Chargement des offres...</p>
                    </div>
                ) : filteredOffers.length > 0 ? (
                    <div className="offers-grid">
                        {filteredOffers.map((offer) => (
                            <OfferCard
                                key={`${offer.type}-${offer.id}`}
                                offer={offer}
                                featured={false}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="explore__empty">
                        <span className="explore__empty-icon"></span>
                        <h2>Aucune offre disponible</h2>
                        <p>Il n'y a pas encore d'offres dans la base de données.</p>
                        <p className="explore__hint">
                            Les partenaires peuvent ajouter des offres depuis leur dashboard.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
