/**
 * Search Results Page - OSMAUSIA
 * Displays filtered offers based on search criteria
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OfferCard from '../components/OfferCard';
import SearchBar from '../components/SearchBar';
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

    // Fetch offers from API based on search criteria
    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            setError(null);

            try {
                // Appel à l'API Meilisearch ou directe
                const { accommodations, activities } = await searchAll(destination, {
                    limit: 50
                });

                // Mapper les résultats API vers le format frontend
                const mappedAccommodations = (accommodations.hits || []).map(mapAccommodationToOffer);
                const mappedActivities = (activities.hits || []).map(mapActivityToOffer);

                let results = [...mappedAccommodations, ...mappedActivities];

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
    }, [destination, guests, sortBy]);

    const handleSearch = (searchData) => {
        const params = new URLSearchParams();
        if (searchData.destination) params.set('destination', searchData.destination);
        if (searchData.checkIn) params.set('checkIn', searchData.checkIn);
        if (searchData.checkOut) params.set('checkOut', searchData.checkOut);
        if (searchData.guests) params.set('guests', searchData.guests);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="search-results">
            {/* Search Header */}
            <section className="search-results__header">
                <div className="container">
                    <SearchBar onSearch={handleSearch} variant="compact" />
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
                            <span>⚠️</span> {error}
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
                            <span className="search-results__empty-icon">🔍</span>
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
