/**
 * Search Service - OSMAUSIA
 * Intégration avec les endpoints Meilisearch du backend
 */

import api from './api';

/**
 * Recherche d'hébergements
 * @param {string} query - Texte de recherche (typo-tolerant)
 * @param {Object} params - Paramètres optionnels
 * @param {number} params.lat - Latitude pour geo-search
 * @param {number} params.lng - Longitude pour geo-search
 * @param {number} params.radius - Rayon en km pour geo-search
 * @param {number} params.offset - Offset pour pagination
 * @param {number} params.limit - Limite de résultats
 * @returns {Promise<SearchResponse>}
 */
export const searchAccommodations = async (query = '', params = {}) => {
    const payload = {
        query: query || params.q,
        // Mapping names to match SearchRequestDTO on Backend
        latitude: params.lat || params.latitude,
        longitude: params.lng || params.longitude,
        radiusKm: params.radius || params.radiusKm,
        offset: params.offset || 0,
        limit: params.limit || 20,
        // Filters
        city: params.city,
        category: params.category,
        minPrice: params.priceMin || params.minPrice,
        maxPrice: params.priceMax || params.maxPrice,
        minGuests: params.guests || params.minGuests,
        tags: Array.isArray(params.tags) ? params.tags : (params.tags ? params.tags.split(',') : []),
        // Dates (Server-side Deep Pagination depends on these!)
        checkInDate: params.checkInDate || params.checkIn,
        checkOutDate: params.checkOutDate || params.checkOut,
        facets: params.facets || ['tags', 'city', 'category'],
        attributesToRetrieve: params.attributesToRetrieve
    };

    const { data } = await api.post('/search/accommodations', payload);
    return data;
};

/**
 * Recherche d'activités
 * @param {string} query - Texte de recherche
 * @param {Object} params - Paramètres optionnels
 * @returns {Promise<SearchResponse>}
 */
export const searchActivities = async (query = '', params = {}) => {
    const payload = {
        query: query || params.q,
        offset: params.offset || 0,
        limit: params.limit || 20,
        // Activities specific
        minPlaces: params.guests || params.minPlaces || params.minGuests,
        startDateTime: params.startDateTime || params.startDate,
        category: params.category,
        city: params.city,
        minPrice: params.priceMin || params.minPrice,
        maxPrice: params.priceMax || params.maxPrice,
        tags: Array.isArray(params.tags) ? params.tags : (params.tags ? params.tags.split(',') : [])
    };

    const { data } = await api.post('/search/activities', payload);
    return data;
};

/**
 * Recherche de partenaires
 * @param {string} query - Texte de recherche
 * @param {Object} params - Paramètres: type (HEBERGEUR/GUIDE), status (APPROVED/PENDING)
 * @returns {Promise<SearchResponse>}
 */
export const searchProviders = async (query = '', params = {}) => {
    const queryParams = new URLSearchParams();

    if (query) queryParams.set('q', query);
    if (params.type) queryParams.set('type', params.type);
    if (params.status) queryParams.set('status', params.status);

    const endpoint = `/search/providers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const { data } = await api.get(endpoint);
    return data;
};

/**
 * Recherche combinée hébergements + activités
 * @param {string} query - Texte de recherche
 * @param {Object} params - Paramètres de recherche
 * @returns {Promise<{accommodations: SearchResponse, activities: SearchResponse}>}
 */
export const searchAll = async (query = '', params = {}) => {
    const [accommodations, activities] = await Promise.all([
        searchAccommodations(query, params).catch(() => ({ hits: [], totalHits: 0 })),
        searchActivities(query, params).catch(() => ({ hits: [], totalHits: 0 }))
    ]);

    return { accommodations, activities };
};



/**
 * Mapper un résultat API hébergement vers le format frontend
 * @param {Object} hit - Résultat de recherche Meilisearch
 * @returns {Object} - Format compatible avec OfferCard
 */
export const mapAccommodationToOffer = (hit) => ({
    id: typeof hit.id === 'string' && hit.id.includes('_') ? parseInt(hit.id.split('_')[1]) : hit.id,
    title: {
        fr: hit.title,
        en: hit.title
    },
    type: 'hebergement',
    category: hit.category || 'nature',
    partnerId: hit.providerId || null,
    partnerName: hit.providerName || 'Partenaire',
    location: {
        city: hit.city || '',
        country: 'Île Maurice',
        coordinates: hit._geo || { lat: 0, lng: 0 }
    },
    description: {
        fr: hit.description || '',
        en: hit.description || ''
    },
    price: {
        amount: hit.price || 0,
        currency: 'EUR',
        unit: 'night'
    },
    capacity: {
        min: 1,
        max: hit.maxGuests || 4
    },
    regenScore: {
        environmental: hit.regenScore || 80,
        social: hit.regenScore || 80,
        experience: hit.regenScore || 80
    },
    // Use API images if available, otherwise use fallback
    images: hit.medias?.length > 0
        ? hit.medias.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)).map(m => m.url)
        : (hit.images?.length > 0 ? hit.images : ['/images/placeholder-offer.jpg']),
    featured: false,
    available: true,
    tags: hit.tags || []
});

/**
 * Mapper un résultat API activité vers le format frontend
 * @param {Object} hit - Résultat de recherche Meilisearch
 * @returns {Object} - Format compatible avec OfferCard
 */
export const mapActivityToOffer = (hit) => ({
    id: typeof hit.id === 'string' && hit.id.includes('_') ? parseInt(hit.id.split('_')[1]) : hit.id,
    title: {
        fr: hit.name,
        en: hit.name
    },
    type: 'activite',
    category: hit.category || 'culture',
    partnerId: hit.providerId || null,
    partnerName: hit.providerName || 'Partenaire',
    location: {
        city: hit.city || '',
        country: 'Île Maurice',
        coordinates: hit._geo || { lat: 0, lng: 0 }
    },
    description: {
        fr: hit.storyContent || '',
        en: hit.storyContent || ''
    },
    price: {
        amount: hit.pricePerson || hit.pricePerPerson || 0,
        currency: 'EUR',
        unit: 'person'
    },
    capacity: {
        min: 1,
        max: hit.nbrMaxPlaces || hit.maxPlaces || 10
    },
    regenScore: {
        environmental: 95,
        social: 95,
        experience: 95
    },
    // Use API images if available, otherwise use fallback
    images: hit.medias?.length > 0
        ? hit.medias.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)).map(m => m.url)
        : (hit.images?.length > 0 ? hit.images : ['/images/placeholder-offer.jpg']),
    featured: false,
    available: true,
    duration: hit.durationMin ? `${hit.durationMin} min` : null,
    tags: []
});

export default {
    searchAccommodations,
    searchActivities,
    searchProviders,
    searchAll,
    mapAccommodationToOffer,
    mapActivityToOffer
};
