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
    const queryParams = new URLSearchParams();

    if (query) queryParams.set('q', query);
    if (params.lat) queryParams.set('lat', params.lat);
    if (params.lng) queryParams.set('lng', params.lng);
    if (params.radius) queryParams.set('radius', params.radius);
    if (params.offset) queryParams.set('offset', params.offset);
    if (params.limit) queryParams.set('limit', params.limit);

    const endpoint = `/search/accommodations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const { data } = await api.get(endpoint);
    return data;
};

/**
 * Recherche d'activités
 * @param {string} query - Texte de recherche
 * @param {Object} params - Paramètres optionnels (offset, limit)
 * @returns {Promise<SearchResponse>}
 */
export const searchActivities = async (query = '', params = {}) => {
    const queryParams = new URLSearchParams();

    if (query) queryParams.set('q', query);
    if (params.offset) queryParams.set('offset', params.offset);
    if (params.limit) queryParams.set('limit', params.limit);

    const endpoint = `/search/activities${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const { data } = await api.get(endpoint);
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
    id: hit.id,
    title: {
        fr: hit.title,
        en: hit.title
    },
    type: 'hebergement',
    category: 'nature',
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
    images: [],
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
    id: hit.id,
    title: {
        fr: hit.name,
        en: hit.name
    },
    type: 'activite',
    category: 'culture',
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
        amount: hit.pricePerPerson || 0,
        currency: 'EUR',
        unit: 'person'
    },
    capacity: {
        min: 1,
        max: hit.maxPlaces || 10
    },
    regenScore: {
        environmental: 85,
        social: 85,
        experience: 85
    },
    images: [],
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
