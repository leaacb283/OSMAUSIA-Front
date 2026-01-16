// Mock Offers Data for OSMAUSIA
// Categories: nature, social, culture

export const mockOffers = [
    {
        id: 'off_001',
        title: {
            fr: 'Éco-lodge Vue Océan',
            en: 'Ocean View Eco-Lodge'
        },
        type: 'hebergement',
        category: 'nature',
        partnerId: 'prt_001',
        partnerName: 'Eco Suites Maurice',
        location: {
            city: 'Grand Baie',
            country: 'Île Maurice',
            coordinates: { lat: -20.0133, lng: 57.5833 }
        },
        description: {
            fr: 'Séjournez dans notre éco-lodge alimenté à 100% par l\'énergie solaire, avec vue panoramique sur l\'océan Indien. Petit-déjeuner bio inclus.',
            en: 'Stay in our 100% solar-powered eco-lodge with panoramic views of the Indian Ocean. Organic breakfast included.'
        },
        price: {
            amount: 185,
            currency: 'EUR',
            unit: 'night'
        },
        capacity: {
            min: 1,
            max: 4
        },
        regenScore: {
            environmental: 92,
            social: 85,
            experience: 88
        },
        images: [
            '/images/offers/eco-lodge-1.jpg',
            '/images/offers/eco-lodge-2.jpg'
        ],
        featured: true,
        available: true,
        tags: ['eco-friendly', 'ocean-view', 'solar-powered', 'organic']
    },
    {
        id: 'off_002',
        title: {
            fr: 'Randonnée Biodiversité',
            en: 'Biodiversity Hiking Tour'
        },
        type: 'activite',
        category: 'nature',
        partnerId: 'prt_002',
        partnerName: 'Nature Tours Mauritius',
        location: {
            city: 'Black River Gorges',
            country: 'Île Maurice',
            coordinates: { lat: -20.4167, lng: 57.4500 }
        },
        description: {
            fr: 'Partez à la découverte de la forêt tropicale mauricienne et observez des espèces endémiques avec un guide naturaliste certifié.',
            en: 'Discover the Mauritian tropical forest and observe endemic species with a certified naturalist guide.'
        },
        price: {
            amount: 75,
            currency: 'EUR',
            unit: 'person'
        },
        capacity: {
            min: 2,
            max: 8
        },
        regenScore: {
            environmental: 95,
            social: 90,
            experience: 92
        },
        images: [
            '/images/offers/hiking-1.jpg',
            '/images/offers/hiking-2.jpg'
        ],
        featured: true,
        available: true,
        duration: '6 hours',
        tags: ['hiking', 'wildlife', 'endemic-species', 'guided']
    },
    {
        id: 'off_003',
        title: {
            fr: 'Atelier Vannerie Traditionnelle',
            en: 'Traditional Basket Weaving Workshop'
        },
        type: 'activite',
        category: 'culture',
        partnerId: 'prt_003',
        partnerName: 'Artisans de La Réunion',
        location: {
            city: 'Cilaos',
            country: 'La Réunion',
            coordinates: { lat: -21.1333, lng: 55.4667 }
        },
        description: {
            fr: 'Apprenez l\'art ancestral de la vannerie avec des artisans locaux. Repartez avec votre création et une histoire à raconter.',
            en: 'Learn the ancestral art of basket weaving with local artisans. Leave with your creation and a story to tell.'
        },
        price: {
            amount: 45,
            currency: 'EUR',
            unit: 'person'
        },
        capacity: {
            min: 1,
            max: 6
        },
        regenScore: {
            environmental: 78,
            social: 95,
            experience: 85
        },
        images: [
            '/images/offers/weaving-1.jpg',
            '/images/offers/weaving-2.jpg'
        ],
        featured: true,
        available: true,
        duration: '3 hours',
        tags: ['handicraft', 'traditional', 'workshop', 'local-artisans']
    },
    {
        id: 'off_004',
        title: {
            fr: 'Séjour Solidaire en Village',
            en: 'Solidarity Village Stay'
        },
        type: 'hebergement',
        category: 'social',
        partnerId: 'prt_003',
        partnerName: 'Artisans de La Réunion',
        location: {
            city: 'Mafate',
            country: 'La Réunion',
            coordinates: { lat: -21.0667, lng: 55.4167 }
        },
        description: {
            fr: 'Vivez une immersion authentique chez l\'habitant dans le cirque isolé de Mafate. Partagez le quotidien d\'une famille et découvrez leurs traditions.',
            en: 'Experience an authentic homestay in the isolated cirque of Mafate. Share daily life with a local family and discover their traditions.'
        },
        price: {
            amount: 95,
            currency: 'EUR',
            unit: 'night'
        },
        capacity: {
            min: 1,
            max: 2
        },
        regenScore: {
            environmental: 88,
            social: 98,
            experience: 90
        },
        images: [
            '/images/offers/village-1.jpg',
            '/images/offers/village-2.jpg'
        ],
        featured: false,
        available: true,
        tags: ['homestay', 'authentic', 'community', 'off-grid']
    },
    {
        id: 'off_005',
        title: {
            fr: 'Cours de Cuisine Créole',
            en: 'Creole Cooking Class'
        },
        type: 'activite',
        category: 'culture',
        partnerId: 'prt_001',
        partnerName: 'Eco Suites Maurice',
        location: {
            city: 'Grand Baie',
            country: 'Île Maurice',
            coordinates: { lat: -20.0133, lng: 57.5833 }
        },
        description: {
            fr: 'Découvrez les secrets de la cuisine créole mauricienne avec notre chef local. Marché, préparation et dégustation au programme.',
            en: 'Discover the secrets of Mauritian Creole cuisine with our local chef. Market visit, preparation, and tasting included.'
        },
        price: {
            amount: 65,
            currency: 'EUR',
            unit: 'person'
        },
        capacity: {
            min: 2,
            max: 10
        },
        regenScore: {
            environmental: 82,
            social: 88,
            experience: 94
        },
        images: [
            '/images/offers/cooking-1.jpg',
            '/images/offers/cooking-2.jpg'
        ],
        featured: false,
        available: true,
        duration: '4 hours',
        tags: ['cooking', 'local-food', 'cultural', 'hands-on']
    },
    {
        id: 'off_006',
        title: {
            fr: 'Reforestation Participative',
            en: 'Community Reforestation'
        },
        type: 'activite',
        category: 'nature',
        partnerId: 'prt_002',
        partnerName: 'Nature Tours Mauritius',
        location: {
            city: 'Chamarel',
            country: 'Île Maurice',
            coordinates: { lat: -20.4333, lng: 57.3833 }
        },
        description: {
            fr: 'Participez à un projet de reforestation d\'espèces endémiques. Plantez votre arbre et recevez un certificat de suivi géolocalisé.',
            en: 'Join an endemic species reforestation project. Plant your tree and receive a geolocated tracking certificate.'
        },
        price: {
            amount: 55,
            currency: 'EUR',
            unit: 'person'
        },
        capacity: {
            min: 4,
            max: 20
        },
        regenScore: {
            environmental: 99,
            social: 92,
            experience: 86
        },
        images: [
            '/images/offers/reforestation-1.jpg',
            '/images/offers/reforestation-2.jpg'
        ],
        featured: true,
        available: true,
        duration: '5 hours',
        tags: ['reforestation', 'volunteering', 'environmental', 'impactful']
    }
];

// Helper function to calculate final Regen Score
export const calculateRegenScore = (scores) => {
    const { environmental, social, experience } = scores;
    return Math.round((environmental * 0.4) + (social * 0.3) + (experience * 0.3));
};

// Get offers by category
export const getOffersByCategory = (category) => {
    return mockOffers.filter(offer => offer.category === category);
};

// Get featured offers
export const getFeaturedOffers = () => {
    return mockOffers.filter(offer => offer.featured);
};

// Get offer by ID
export const getOfferById = (id) => {
    return mockOffers.find(offer => offer.id === id);
};

export default mockOffers;
