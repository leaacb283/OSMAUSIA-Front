import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchBar from '../components/SearchBar';
import ThematicFilters from '../components/ThematicFilters';
import OfferCard from '../components/OfferCard';
import ImageCarousel from '../components/ImageCarousel';
import api from '../services/api'; // Use direct API instead of searchService
import './Home.css';

// Hero carousel images - landscapes and destinations
const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=2070&auto=format&fit=crop',   // Grand Bleu Profond (Idéal pour le texte)
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop', // Plage avec petite maison/paillote
    'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=2073&auto=format&fit=crop' // Eau Turquoise & Palmiers (Fiable)
];

// Fallback images for offers
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



const Home = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'nature', 'culture', 'marine', 'wellness', 'gastronomy'
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch offers from API directly (Meilisearch fallback)
    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                // Fetch hébergements
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
                    category: 'nature', // Default category
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
                    images: h.medias?.length > 0
                        ? h.medias.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)).map(m => m.url)
                        : ['/images/placeholder-offer.jpg'],
                    featured: true, // Show on home
                    available: true,
                    tags: h.tags || []
                }));

                // Map activities to common format
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
                        coordinates: { lat: a.latitude || 0, lng: a.longitude || 0 }
                    },
                    description: {
                        fr: a.storyContent || '',
                        en: a.storyContent || ''
                    },
                    price: {
                        amount: a.pricePerson || a.price || 0,
                        currency: 'EUR',
                        unit: 'person'
                    },
                    capacity: { min: 1, max: a.nbrMaxPlaces || 10 },
                    regenScore: {
                        environmental: 95,
                        social: 95,
                        experience: 95
                    },
                    images: a.medias?.length > 0
                        ? a.medias.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)).map(m => m.url)
                        : [getFallbackImage(a.id + 100)],
                    featured: true, // Force to true for now to see them on home
                    available: true,
                    tags: []
                }));

                const allOffers = [...mappedHebergements, ...mappedActivities];

                // Featured logic: Score > 90
                const processedOffers = allOffers.map(o => {
                    const avgScore = (o.regenScore.environmental + o.regenScore.social + o.regenScore.experience) / 3;
                    return {
                        ...o,
                        featured: avgScore > 90
                    };
                });

                // Sort by score descending to push best offers to top
                processedOffers.sort((a, b) => {
                    const scoreA = (a.regenScore.environmental + a.regenScore.social + a.regenScore.experience) / 3;
                    const scoreB = (b.regenScore.environmental + b.regenScore.social + b.regenScore.experience) / 3;
                    return scoreB - scoreA;
                });

                setOffers(processedOffers);

            } catch (err) {
                console.error('Failed to fetch offers:', err);
                setOffers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    // Filter logic
    const filteredOffers = activeFilter && activeFilter !== 'all'
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
                {/* Background Carousel */}
                <div className="hero__background">
                    <ImageCarousel
                        images={HERO_IMAGES}
                        interval={6000}
                        className="image-carousel--hero"
                    />
                    <div className="hero__overlay" />
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

                {/* Decorative elements - OSMAUSIA Brand */}

            </section>

            {/* Thematic Filters */}
            <section className="section">
                <div className="container">
                    <ThematicFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />
                </div>
            </section>

            {/* Featured Offers */}
            <section className="section section--featured">
                <div className="container">
                    <div className="section__header">
                        <h2 className="section__title">
                            {activeFilter && activeFilter !== 'all'
                                ? `${t(`home.filter${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`)} - ${filteredOffers.length} ${filteredOffers.length > 1 ? 'offres' : 'offre'}`
                                : t('home.featuredTitle')
                            }
                        </h2>
                        {(!activeFilter || activeFilter === 'all') && (
                            <p className="section__subtitle">{t('home.featuredSubtitle')}</p>
                        )}
                    </div>

                    {loading ? (
                        <div className="no-results">
                            <span className="no-results__icon"></span>
                            <p>Chargement des offres...</p>
                        </div>
                    ) : (
                        <>
                            <div className="offers-grid">
                                {filteredOffers.map((offer) => (
                                    <OfferCard
                                        key={`${offer.type}-${offer.id}`}
                                        offer={offer}
                                        featured={true}
                                    />
                                ))}
                            </div>

                            {filteredOffers.length === 0 && (
                                <div className="no-results">
                                    <span className="no-results__icon"></span>
                                    <p>Aucune offre disponible dans cette catégorie pour le moment.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
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
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
