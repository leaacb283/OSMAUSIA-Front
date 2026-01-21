/**
 * Offer Service - OSMAUSIA
 * Gestion des offres (hébergements, activités) via l'API backend
 */

import api from './api';

/**
 * Créer un nouvel hébergement
 * @param {Object} offerData - Données du formulaire
 * @param {Object} user - Utilisateur connecté (pour les infos provider)
 * @returns {Promise<HebergementDTO>}
 */
export const createHebergement = async (offerData, user) => {
    // 1. Construire le ProviderDTO à partir du profil utilisateur
    const providerDTO = {
        id: user.id, // ID du provider
        email: user.email,
        companyName: user.profile?.companyName || 'Mon Entreprise',
        typeProvider: user.profile?.type || 'HEBERGEUR', // 'HEBERGEUR' ou 'GUIDE'
        regenCommit: 'Engagé pour le tourisme durable' // Valeur par défaut ou à récupérer du profil
    };

    // 2. Construire le LocationDTO
    const locationDTO = {
        addressLine: offerData.city, // Simplification pour le moment
        city: offerData.city,
        latitude: -20.0, // Valeurs par défaut (Île Maurice) si pas de géocodage
        longitude: 57.5 // À améliorer avec Google Maps ou API adresse
    };

    // 3. Construire le Payload final (HebergementDTO)
    const payload = {
        title: offerData.title,
        hDescription: offerData.description,
        basePrice: parseFloat(offerData.price),
        maxGuests: parseInt(offerData.capacity),
        regenScore: parseInt(offerData.environmental), // Simplification: on prend l'environnemental comme score global pour l'instant
        isShared: false, // Champ requis par le backend, false par défaut
        providerDTO: providerDTO,
        locationDTO: locationDTO
    };

    const { data } = await api.post('/offer/hebergements', payload);
    return data;
};

/**
 * Récupérer tous les hébergements (pour le dashboard)
 * @returns {Promise<Array>}
 */
export const getAllHebergements = async () => {
    const { data } = await api.get('/offer/hebergements');
    return data;
};
