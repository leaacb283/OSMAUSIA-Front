/**
 * Search Results Page - OSMAUSIA
 * Displays filtered offers based on search criteria
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OfferCard from '../components/OfferCard';
import SearchBar from '../components/SearchBar';
import SearchFilters from '../components/SearchFilters';
import { searchAll, mapAccommodationToOffer, mapActivityToOffer } from '../services/searchService';
import './SearchResults.css';

const SearchResults = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const destination = searchParams.get('destination') || '';
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';
    const guests = parseInt(searchParams.get('guests')) || 2;

    const [filteredOffers, setFilteredOffers] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [advancedFilters, setAdvancedFilters] = useState({});

    // Fetch offers from API based on search criteria
    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Parallel Fetch: Search Results (Meili) + Full Catalog (Source of Truth for Images)
                const [searchRes, hebergementsRes, activitiesRes] = await Promise.all([
                    searchAll(destination, { limit: 50, ...advancedFilters }),
                    // We catch errors on catalog fetch to avoid breaking search if catalog fails
                    import('../services/api').then(m => m.default.get('/offer/hebergements')).catch(() => ({ data: [] })),
                    import('../services/api').then(m => m.default.get('/offer/activites')).catch(() => ({ data: [] }))
                ]);

                const { accommodations, activities } = searchRes;
                const fullHebergements = hebergementsRes.data || [];
                const fullActivities = activitiesRes.data || [];

                // 2. Map Search Results
                const mappedAccommodations = (accommodations.hits || []).map(mapAccommodationToOffer);
                const mappedActivities = (activities.hits || []).map(mapActivityToOffer);

                // 3. Hydrate with Images from Catalog
                // Since Meilisearch index doesn't have images (yet), we match by ID with the catalog data
                const hydratedAccommodations = mappedAccommodations.map(offer => {
                    const fullData = fullHebergements.find(h => h.id === offer.id);
                    if (fullData && fullData.medias?.length > 0) {
                        return {
                            ...offer,
                            images: fullData.medias
                                .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0))
                                .map(m => m.url)
                        };
                    }
                    return offer;
                });

                const hydratedActivities = mappedActivities.map(offer => {
                    const fullData = fullActivities.find(a => a.id === offer.id);
                    if (fullData && fullData.medias?.length > 0) {
                        return {
                            ...offer,
                            images: fullData.medias
                                .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0))
                                .map(m => m.url)
                        };
                    }
                    return offer;
                });

                // 4. Hybrid Search Merge (Client-Side Fallback)
                // If Meili missed the new offer (indexing lag), we find it in fullHebergements
                let extraMatches = [];
                if (destination) {
                    const q = destination.toLowerCase();

                    // Accommodations fallback
                    const extraAccommodations = fullHebergements.filter(h => {
                        const alreadyFound = hydratedAccommodations.some(ha => ha.id === h.id);
                        if (alreadyFound) return false;
                        const titleMatch = h.title?.toLowerCase().includes(q);
                        const cityMatch = (h.city || h.etablissement?.city)?.toLowerCase().includes(q);
                        return titleMatch || cityMatch;
                    }).map(h => mapBackendToFront({ ...h, type: 'hebergement' }));

                    // Activities fallback
                    const extraActivities = fullActivities.filter(a => {
                        const alreadyFound = hydratedActivities.some(ha => ha.id === a.id);
                        if (alreadyFound) return false;
                        const titleMatch = a.name?.toLowerCase().includes(q);
                        const cityMatch = a.city?.toLowerCase().includes(q);
                        return titleMatch || cityMatch;
                    }).map(a => mapBackendToFront({ ...a, type: 'activite' }));

                    extraMatches = [...extraAccommodations, ...extraActivities];
                }

                // Merge and Dedupe (Priority to Meili results as they are ranked, append new matches at top or bottom?)
                // Appending at top implies "New/Relevant" if manual match
                let results = [...hydratedAccommodations, ...extraMatches, ...hydratedActivities];

                // Deduplicate by ID just in case
                const seen = new Set();
                results = results.filter(o => {
                    const duplicate = seen.has(o.id);
                    seen.add(o.id);
                    return !duplicate;
                });

                // Filter by capacity
                if (guests) {
                    results = results.filter(offer =>
                        offer.capacity.max >= guests
                    );
                }

                // Sort results
                switch (sortBy) {
                    case 'price-asc':
                        results.sort((a, b) => a.price.amount - b.price.amount);
                        break;
                    case 'price-desc':
                        results.sort((a, b) => b.price.amount - a.price.amount);
                        break;
                    case 'score':
                        results.sort((a, b) => {
                            const scoreA = (a.regenScore.environmental + a.regenScore.social + a.regenScore.experience) / 3;
                            const scoreB = (b.regenScore.environmental + b.regenScore.social + b.regenScore.experience) / 3;
                            return scoreB - scoreA;
                        });
                        break;
                    case 'featured':
                    default:
                        results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                }

                setFilteredOffers(results);
            } catch (err) {
                console.error('Search API error:', err);
                setError('Impossible de charger les offres. Vérifiez que le serveur est démarré.');
                setFilteredOffers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [destination, guests, sortBy, advancedFilters]);

    // Callback stable pour éviter les re-renders
    const handleFiltersChange = useCallback((newFilters) => {
        setAdvancedFilters(newFilters);
    }, []);

    const handleSearch = (searchData) => {
        const params = new URLSearchParams();
        if (searchData.destination) params.set('destination', searchData.destination);
        if (searchData.checkIn) params.set('checkIn', searchData.checkIn);
        if (searchData.checkOut) params.set('checkOut', searchData.checkOut);
        if (searchData.guests) params.set('guests', searchData.guests);
        navigate(`/search?${params.toString()}`);
    };

    // Helper to map Backend DTO (from full catalog) to Frontend Offer
    const mapBackendToFront = (item) => {
        // Fallbacks
        const FALLBACK_IMAGES = [
            '/images/offers/overwater-bungalow.jpg',
            '/images/offers/chalet-montagne.jpg',
            '/images/offers/maison-coloniale.jpg',
            '/images/offers/eco-lodge.jpg'
        ];
        const getFallback = (id) => FALLBACK_IMAGES[Math.abs(id || 0) % FALLBACK_IMAGES.length];

        const isActivity = item.type === 'activite' || item.id_activity || item.pricePerson;

        return {
            id: item.id || item.idActivity,
            title: {
                fr: item.title || item.name || (isActivity ? 'Activité' : 'Hébergement'),
                en: item.title || item.name || (isActivity ? 'Activity' : 'Accommodation')
            },
            type: isActivity ? 'activite' : 'hebergement',
            category: item.category || (isActivity ? 'culture' : 'nature'),
            partnerId: item.providerId || item.provider?.id || null,
            partnerName: item.providerName || item.provider?.name || 'Partenaire',
            location: {
                city: item.city || item.etablissement?.city || 'Île Maurice',
                country: 'Île Maurice',
                coordinates: {
                    lat: item.latitude || item.etablissement?.latitude || -20.0,
                    lng: item.longitude || item.etablissement?.longitude || 57.5
                }
            },
            description: {
                fr: item.description || item.hDescription || item.storyContent || '',
                en: item.description || item.hDescription || item.storyContent || ''
            },
            price: {
                amount: item.basePrice || item.price || item.pricePerson || 0,
                currency: 'EUR',
                unit: isActivity ? 'person' : 'night'
            },
            capacity: { min: 1, max: item.maxGuests || item.nbrMaxPlaces || 4 },
            regenScore: {
                environmental: item.regenScore || 95,
                social: item.regenScore || 95,
                experience: item.regenScore || 95
            },
            // Images
            images: item.medias?.length > 0
                ? item.medias.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)).map(m => m.url)
                : [getFallback(item.id || item.idActivity)],
            medias: item.medias || [],
            featured: false,
            available: true,
            tags: item.tags || []
        };
    };

    return (
        <div className="search-results">
            {/* Search Header */}
            <section className="search-results__header">
                <div className="container">
                    <SearchBar onSearch={handleSearch} variant="compact" />
                    <SearchFilters onFiltersChange={handleFiltersChange} />
                </div>
            </section>

            {/* Results */}
            <section className="search-results__content">
                <div className="container">
                    {/* Results Info */}
                    <div className="search-results__info">
                        <div className="search-results__count">
                            <h1>
                                {filteredOffers.length} {filteredOffers.length === 1 ? 'offre trouvée' : 'offres trouvées'}
                            </h1>
                            {destination && (
                                <p className="search-results__query">
                                    pour "{destination}"
                                    {checkIn && ` • du ${new Date(checkIn).toLocaleDateString('fr-FR')}`}
                                    {checkOut && ` au ${new Date(checkOut).toLocaleDateString('fr-FR')}`}
                                    {guests && ` • ${guests} voyageur${guests > 1 ? 's' : ''}`}
                                </p>
                            )}
                        </div>

                        <div className="search-results__sort">
                            <label htmlFor="sort">Trier par :</label>
                            <select
                                id="sort"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="featured">En vedette</option>
                                <option value="price-asc">Prix croissant</option>
                                <option value="price-desc">Prix décroissant</option>
                                <option value="score">Score régénératif</option>
                            </select>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="search-results__warning">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="search-results__loading">
                            <div className="search-results__spinner"></div>
                            <p>Recherche en cours...</p>
                        </div>
                    ) : filteredOffers.length > 0 ? (
                        <div className="offers-grid">
                            {filteredOffers.map((offer) => (
                                <OfferCard
                                    key={offer.id}
                                    offer={offer}
                                    featured={false}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="search-results__empty">
                            <span className="search-results__empty-icon"></span>
                            <h2>Aucune offre trouvée</h2>
                            <p>
                                Essayez de modifier vos critères de recherche ou explorez toutes nos offres.
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/explore')}
                            >
                                Explorer toutes les offres
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default SearchResults;
