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
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [advancedFilters, setAdvancedFilters] = useState({});

    // Pagination states
    const [nextCursor, setNextCursor] = useState(0);
    const [totalHits, setTotalHits] = useState(0);

    // Fetch offers from API based on search criteria
    const fetchOffers = useCallback(async (isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else {
            setLoading(true);
            setNextCursor(0);
        }
        setError(null);

        try {
            const currentOffset = isLoadMore ? nextCursor : 0;
            const limit = 20;

            // 1. Fetch only verified search results (Meili + Deep Pagination check is done server-side)
            const searchRes = await searchAll(destination, {
                limit,
                offset: currentOffset,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                ...advancedFilters
            });

            const { accommodations, activities } = searchRes;

            // 2. Map Results (Images are already in the hits from Meilisearch)
            const mappedAccommodations = (accommodations.hits || []).map(mapAccommodationToOffer);
            const mappedActivities = (activities.hits || []).map(mapActivityToOffer);

            let newResults = [...mappedAccommodations, ...mappedActivities];

            // 3. Update state
            if (isLoadMore) {
                setFilteredOffers(prev => [...prev, ...newResults]);
            } else {
                setFilteredOffers(newResults);
            }

            // 4. Update Pagination
            // Strategy: we take the highest cursor from both pools or handle them separately.
            // For mixed view, we use a combined logic.
            const accCursor = accommodations.nextCursor || (currentOffset + limit);
            const actCursor = activities.nextCursor || (currentOffset + limit);
            setNextCursor(Math.max(accCursor, actCursor));
            setTotalHits((accommodations.totalHits || 0) + (activities.totalHits || 0));

        } catch (err) {
            console.error('Search API error:', err);
            setError('Impossible de charger les offres. Vérifiez que le serveur est démarré.');
            if (!isLoadMore) setFilteredOffers([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [destination, checkIn, checkOut, guests, advancedFilters, nextCursor]);

    // Initial fetch or filter change
    useEffect(() => {
        fetchOffers(false);
    }, [destination, checkIn, checkOut, guests, sortBy, advancedFilters]);

    const handleLoadMore = () => {
        fetchOffers(true);
    };

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
                                {totalHits} {totalHits === 1 ? 'offre trouvée' : 'offres trouvées'}
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
                        <div className="search-results__grid-container">
                            <div className="offers-grid">
                                {filteredOffers.map((offer) => (
                                    <OfferCard
                                        key={`${offer.type}-${offer.id}`}
                                        offer={offer}
                                        featured={false}
                                    />
                                ))}
                            </div>

                            {/* Load More Button */}
                            {filteredOffers.length < totalHits && (
                                <div className="search-results__load-more">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? 'Chargement...' : 'Voir plus d\'offres'}
                                    </button>
                                </div>
                            )}
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
