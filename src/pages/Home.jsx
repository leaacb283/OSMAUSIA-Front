import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchBar from '../components/SearchBar';
import ThematicFilters from '../components/ThematicFilters';
import OfferCard from '../components/OfferCard';
import { searchAll, mapAccommodationToOffer, mapActivityToOffer } from '../services/searchService';
import './Home.css';

const Home = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch offers from API
    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                const { accommodations, activities } = await searchAll('', { limit: 20 });
                const mappedAccommodations = (accommodations.hits || []).map(mapAccommodationToOffer);
                const mappedActivities = (activities.hits || []).map(mapActivityToOffer);
                let results = [...mappedAccommodations, ...mappedActivities];

                // Mark first 4 as featured
                results = results.slice(0, 6).map((offer, idx) => ({ ...offer, featured: idx < 4 }));
                setOffers(results);
            } catch (err) {
                console.error('Failed to fetch offers:', err);
                setOffers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    // Filter offers by category
    const filteredOffers = activeFilter
        ? offers.filter(offer => offer.category === activeFilter)
        : offers.filter(offer => offer.featured);

    const handleSearch = (searchData) => {
        const params = new URLSearchParams();
        if (searchData.destination) params.set('destination', searchData.destination);
        if (searchData.checkIn) params.set('checkIn', searchData.checkIn);
        if (searchData.checkOut) params.set('checkOut', searchData.checkOut);
        if (searchData.guests) params.set('guests', searchData.guests);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero__background">
                    <div className="hero__gradient" />
                    <div className="hero__pattern" />
                </div>

                <div className="hero__content container">
                    <h1 className="hero__title animate-slideUp">
                        {t('home.heroTitle')}
                        <span className="hero__title-highlight">
                            {t('home.heroTitleHighlight')}
                        </span>
                    </h1>

                    <p className="hero__subtitle animate-slideUp">
                        {t('home.heroSubtitle')}
                    </p>

                    {/* Search Bar */}
                    <div className="hero__search animate-slideUp">
                        <SearchBar onSearch={handleSearch} variant="hero" />
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="hero__decoration hero__decoration--1">🌿</div>
                <div className="hero__decoration hero__decoration--2">🌊</div>
                <div className="hero__decoration hero__decoration--3">🏔️</div>
            </section>

            {/* Thematic Filters */}
            <section className="section container">
                <ThematicFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
            </section>

            {/* Featured Offers */}
            <section className="section section--featured container">
                <div className="section__header">
                    <h2 className="section__title">
                        {activeFilter
                            ? `${t(`home.filter${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`)} - ${filteredOffers.length} ${filteredOffers.length > 1 ? 'offres' : 'offre'}`
                            : t('home.featuredTitle')
                        }
                    </h2>
                    {!activeFilter && (
                        <p className="section__subtitle">{t('home.featuredSubtitle')}</p>
                    )}
                </div>

                {loading ? (
                    <div className="no-results">
                        <span className="no-results__icon">⏳</span>
                        <p>Chargement des offres...</p>
                    </div>
                ) : (
                    <>
                        <div className="offers-grid">
                            {filteredOffers.map((offer) => (
                                <OfferCard
                                    key={offer.id}
                                    offer={offer}
                                    featured={!activeFilter}
                                />
                            ))}
                        </div>

                        {filteredOffers.length === 0 && (
                            <div className="no-results">
                                <span className="no-results__icon">🔍</span>
                                <p>Aucune offre disponible dans cette catégorie pour le moment.</p>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass">
                        <div className="cta-card__content">
                            <h2 className="cta-card__title">
                                Vous êtes un partenaire régénératif ?
                            </h2>
                            <p className="cta-card__text">
                                Rejoignez notre communauté de prestataires engagés et proposez vos expériences éthiques à des voyageurs en quête de sens.
                            </p>
                            <a href="/register/partner" className="btn btn-secondary btn-lg">
                                Devenir partenaire
                            </a>
                        </div>
                        <div className="cta-card__decoration">
                            🌏
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
