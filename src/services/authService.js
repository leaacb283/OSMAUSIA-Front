/**
 * Auth Service - OSMAUSIA
 * Gestion de l'authentification avec l'API backend
 */

import api from './api';

/**
 * Connexion utilisateur
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<AuthResponse>}
 */
export const loginAPI = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
};

/**
 * Inscription voyageur
 * @param {Object} userData - Données du formulaire
 * @returns {Promise<AuthResponse>}
 */
export const registerTravelerAPI = async (userData) => {
    // Nettoyer et formater le numéro de téléphone (supprimer espaces)
    const cleanPhone = userData.phone ? userData.phone.replace(/\s/g, '') : null;

    // Mapper les données frontend vers le format attendu par l'API
    const payload = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: cleanPhone || undefined, // Ne pas envoyer si vide
        languagePref: (userData.language || 'fr').toUpperCase(), // fr → FR
    };

    const { data } = await api.post('/auth/register/traveler', payload);
    return data;
};

/**
 * Inscription partenaire
 * @param {Object} partnerData - Données du formulaire
 * @returns {Promise<AuthResponse>}
 */
export const registerProviderAPI = async (partnerData) => {
    // Mapper les données frontend vers le format attendu par l'API
    const typeMapping = {
        hebergeur: 'HEBERGEUR',
        guide: 'GUIDE',
        mixte: 'HEBERGEUR', // Par défaut si mixte (à adapter selon backend)
    };

    const payload = {
        email: partnerData.email,
        password: partnerData.password,
        companyName: partnerData.companyName,
        typeProvider: typeMapping[partnerData.partnerType] || 'HEBERGEUR',
        regenCommit: partnerData.regenCommit || null,
    };

    const { data } = await api.post('/auth/register/provider', payload);
    return data;
};

/**
 * Déconnexion
 * @returns {Promise<void>}
 */
export const logoutAPI = async () => {
    await api.post('/auth/logout');
};

/**
 * Demande de réinitialisation de mot de passe
 * @param {string} email 
 * @returns {Promise<{message: string}>}
 */
export const forgotPasswordAPI = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
};

/**
 * Réinitialisation du mot de passe avec token
 * @param {string} token - Token reçu par email
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Promise<{message: string}>}
 */
export const resetPasswordAPI = async (token, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
};

/**
 * Vérification email (appelé depuis le lien dans l'email)
 * @param {string} token 
 * @returns {Promise<{message: string}>}
 */
export const verifyEmailAPI = async (token) => {
    const { data } = await api.get(`/auth/verify-email?token=${token}`);
    return data;
};

/**
 * Mapper la réponse API vers le format utilisateur local
 * @param {AuthResponse} apiResponse 
 * @returns {User}
 */
export const mapApiResponseToUser = (apiResponse) => {
    return {
        id: apiResponse.userId,
        email: apiResponse.email,
        token: apiResponse.token, // Store JWT for WebSocket communication
        role: apiResponse.userType === 'PROVIDER' ? 'partner' : 'traveler',
        profile: {
            firstName: apiResponse.firstName || null,
            lastName: apiResponse.lastName || null,
            companyName: apiResponse.companyName || null,
            createdAt: new Date().toISOString(),
        },
        // Initialiser les préférences par défaut
        preferences: {
            newsletter: true,
            notifications: true,
            dataSharing: false,
        },
    };
};

export default {
    loginAPI,
    registerTravelerAPI,
    registerProviderAPI,
    logoutAPI,
    forgotPasswordAPI,
    resetPasswordAPI,
    verifyEmailAPI,
    mapApiResponseToUser,
};
