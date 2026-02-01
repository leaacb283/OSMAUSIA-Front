/**
 * Explore Page - OSMAUSIA
 * Displays all accommodations and activities from the database
 * Uses catalog API directly (not Meilisearch) for reliability
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OfferCard from '../components/OfferCard';
import SearchBar from '../components/SearchBar';
import SearchFilters from '../components/SearchFilters';
import api from '../services/api';
import { searchAll, mapAccommodationToOffer, mapActivityToOffer } from '../services/searchService';
import './Explore.css';

const Explore = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const lang = i18n.language === 'en' ? 'en' : 'fr';

    // Initialize state from URL params
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'hebergement', 'activite'
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [dateFilter, setDateFilter] = useState({
        checkIn: searchParams.get('checkIn') || '',
        checkOut: searchParams.get('checkOut') || ''
    });
    const [guestsFilter, setGuestsFilter] = useState(
        searchParams.get('guests') ? parseInt(searchParams.get('guests')) : null
    );
    const [advancedFilters, setAdvancedFilters] = useState({});

    const [resetKey, setResetKey] = useState(0);

    // Import search service
    // Ensure you have: import { searchAll, mapAccommodationToOffer, mapActivityToOffer } from '../services/searchService';

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Use searchAll from searchService which handles availability
            const searchRes = await searchAll(searchQuery, {
                checkInDate: dateFilter.checkIn,
                checkOutDate: dateFilter.checkOut,
                guests: guestsFilter, // Filter by capacity
                priceMin: advancedFilters.priceMin,
                priceMax: advancedFilters.priceMax,
                minRegenScore: advancedFilters.regenScoreMin,
                limit: 100 // Load more to simulate "all" for explore, or implement pagination later
            });

            const { accommodations, activities } = searchRes;

            // Map results
            const mappedAccommodations = (accommodations.hits || []).map(mapAccommodationToOffer);
            const mappedActivities = (activities.hits || []).map(mapActivityToOffer);

            setOffers([...mappedAccommodations, ...mappedActivities]);
        } catch (err) {
            console.error('Failed to fetch offers:', err);
            setError('Impossible de charger les offres. Vérifiez que le backend est démarré.');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, dateFilter, guestsFilter, advancedFilters]);

    // Fetch on change
    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    // Handle search from SearchBar
    const handleSearch = (searchParams) => {
        setSearchQuery(searchParams.destination?.toLowerCase() || '');
        setDateFilter({
            checkIn: searchParams.checkIn || '',
            checkOut: searchParams.checkOut || ''
        });
        // Capture guests for capacity filtering (only if > 1, otherwise no filtering needed)
        setGuestsFilter(searchParams.guests > 1 ? searchParams.guests : null);
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setDateFilter({ checkIn: '', checkOut: '' });
        setGuestsFilter(null);
        setAdvancedFilters({});
        setFilter('all');
        setResetKey(prev => prev + 1); // Force reset of SearchFilters component
    };

    // Check if any filter is active
    const hasActiveFilters = searchQuery || dateFilter.checkIn || dateFilter.checkOut ||
        advancedFilters.priceMin || advancedFilters.priceMax || advancedFilters.regenScoreMin;

    // Handle advanced filters
    const handleFiltersChange = useCallback((filters) => {
        setAdvancedFilters(filters);
    }, []);

    // Filter offers based on type, search query, and advanced filters
    const filteredOffers = offers.filter(offer => {
        // Type filter
        if (filter !== 'all' && offer.type !== filter) return false;

        // NOTE: Search query filtering is now handled by Meilisearch with typo tolerance
        // Do NOT add client-side searchQuery filtering here - it breaks typo tolerance

        // Price filters
        const price = offer.price?.amount || 0;
        if (advancedFilters.priceMin && price < advancedFilters.priceMin) return false;
        if (advancedFilters.priceMax && price > advancedFilters.priceMax) return false;

        // Regen score filter
        if (advancedFilters.regenScoreMin) {
            const avgScore = Math.round(
                (offer.regenScore.environmental + offer.regenScore.social + offer.regenScore.experience) / 3
            );
            if (avgScore < advancedFilters.regenScoreMin) return false;
        }

        return true;
    });

    return (
        <div className="explore">
            <div className="container">
                {/* Header */}
                <header className="explore__header">
                    <h1>Explorer nos offres</h1>
                    <p>Découvrez tous les hébergements et activités régénératifs</p>
                </header>

                {/* Search Bar */}
                <div className="explore__search">
                    <SearchBar key={resetKey} onSearch={handleSearch} variant="compact" showDates={true} />
                </div>

                {/* Advanced Filters */}
                <SearchFilters key={resetKey} onFiltersChange={handleFiltersChange} />

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

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <button
                            className="explore__reset-btn"
                            onClick={handleResetFilters}
                        >
                            Réinitialiser les filtres
                        </button>
                    )}
                </div>

                {/* Active Date Filter Display */}
                {(dateFilter.checkIn || dateFilter.checkOut) && (
                    <div className="explore__active-filters">
                        <span className="explore__active-filter">
                            Dates: {dateFilter.checkIn && new Date(dateFilter.checkIn).toLocaleDateString('fr-FR')}
                            {dateFilter.checkIn && dateFilter.checkOut && ' → '}
                            {dateFilter.checkOut && new Date(dateFilter.checkOut).toLocaleDateString('fr-FR')}
                            <button
                                onClick={() => setDateFilter({ checkIn: '', checkOut: '' })}
                                className="explore__active-filter-remove"
                            >
                                ×
                            </button>
                        </span>
                    </div>
                )}

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
