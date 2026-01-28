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
        description: offerData.description,
        basePrice: parseFloat(offerData.price),
        maxGuests: parseInt(offerData.capacity),
        regenScore: parseInt(offerData.environmental), // Simplification: on prend l'environnemental comme score global pour l'instant
        isShared: false, // Champ requis par le backend, false par défaut
        providerDTO: providerDTO,
        locationDTO: locationDTO,
        medias: offerData.medias || [],
        ...(offerData.etablissementId ? { etablissement: { id: offerData.etablissementId } } : {})
    };

    const { data } = await api.post('/offer/hebergements', payload);
    return data;
};

/**
 * Upload a file
 * @param {File} file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/upload', formData);
    return data.fileDownloadUri;
};

/**
 * Mettre à jour un hébergement
 * @param {number} id - ID de l'hébergement
 * @param {Object} offerData - Données du formulaire
 * @param {Object} user - Utilisateur connecté
 * @returns {Promise<HebergementDTO>}
 */
export const updateHebergement = async (id, offerData, user) => {
    // Rebuild payload similar to create (can be refactored to share logic)
    const providerDTO = {
        id: user.id,
        email: user.email,
        companyName: user.profile?.companyName || 'Mon Entreprise',
        typeProvider: user.profile?.type || 'HEBERGEUR',
        regenCommit: 'Engagé pour le tourisme durable'
    };

    const locationDTO = {
        addressLine: offerData.city,
        city: offerData.city,
        latitude: -20.0,
        longitude: 57.5
    };

    const payload = {
        id: id,
        title: offerData.title,
        description: offerData.description,
        basePrice: parseFloat(offerData.price),
        maxGuests: parseInt(offerData.capacity),
        regenScore: parseInt(offerData.environmental),
        isShared: false,
        providerDTO: providerDTO,
        locationDTO: locationDTO,
        medias: offerData.medias || [],
        ...(offerData.etablissementId ? { etablissement: { id: offerData.etablissementId } } : {})
    };

    // Use specific endpoint for update if different, or PUT /hebergements/{id}
    const { data } = await api.put(`/offer/hebergements/${id}`, payload);
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

/**
 * Supprimer un hébergement
 * @param {number} id 
 */
export const deleteHebergement = async (id) => {
    await api.delete(`/offer/hebergements/${id}`);
};

/**
 * Récupérer les établissements d'un provider
 * @param {number} providerId
 * @returns {Promise<Array>}
 */
export const getProviderEtablissements = async (providerId) => {
    try {
        const { data } = await api.get(`/offer/providers/${providerId}/etablissements`);
        return data;
    } catch (error) {
        console.error("Erreur récupération établissements:", error);
        return [];
    }
};

/**
 * Créer un établissement
 * @param {Object} data
 * @param {Object} user
 * @returns {Promise<EtablissementDTO>}
 */
export const createEtablissement = async (data, user) => {
    const payload = {
        name: data.name,
        addressLine: data.address, // Corrected mapping
        city: data.city,
        latitude: -20.0,
        longitude: 57.5,
        regenScore: 80, // Default score
        provider: {
            id: user.id || user.userId,
            email: user.email
        }
    };
    const { data: response } = await api.post('/offer/etablissements', payload);
    return response;
};
/**
 * Récupérer les activités d'un provider
 * @param {number} providerId
 * @returns {Promise<Array>}
 */
export const getProviderActivities = async (providerId) => {
    try {
        const { data } = await api.get(`/offer/providers/${providerId}/activites`);
        return data;
    } catch (error) {
        console.error("Erreur récupération activités:", error);
        return [];
    }
};

/**
 * Créer une nouvelle activité
 * @param {Object} offerData
 * @param {Object} user
 * @returns {Promise<ActiviteDTO>}
 */
export const createActivite = async (offerData, user) => {
    const payload = {
        name: offerData.title,
        storyContent: offerData.description,
        pricePerson: parseFloat(offerData.price),
        durationMin: parseInt(offerData.duration) || 60,
        nbrMaxPlaces: parseInt(offerData.capacity),
        addressLine: offerData.city,
        city: offerData.city,
        latitude: -20.0,
        longitude: 57.5,
        provider: { id: user.id, email: user.email },
        medias: offerData.medias || [],
        ...(offerData.etablissementId ? { etablissement: { id: offerData.etablissementId } } : {})
    };

    const { data } = await api.post('/offer/activites', payload);
    return data;
};

/**
 * Mettre à jour une activité
 * @param {number} id
 * @param {Object} offerData
 * @param {Object} user
 * @returns {Promise<ActiviteDTO>}
 */
export const updateActivite = async (id, offerData, user) => {
    const payload = {
        idActivity: id,
        name: offerData.title,
        storyContent: offerData.description,
        pricePerson: parseFloat(offerData.price),
        durationMin: parseInt(offerData.duration) || 60,
        nbrMaxPlaces: parseInt(offerData.capacity),
        addressLine: offerData.city,
        city: offerData.city,
        latitude: -20.0,
        longitude: 57.5,
        provider: { id: user.id, email: user.email },
        medias: offerData.medias || [],
        ...(offerData.etablissementId ? { etablissement: { id: offerData.etablissementId } } : {})
    };

    const { data } = await api.put(`/offer/activites/${id}`, payload);
    return data;
};

/**
 * Supprimer une activité
 * @param {number} id 
 */
export const deleteActivite = async (id) => {
    await api.delete(`/offer/activites/${id}`);
};
