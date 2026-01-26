/**
 * Reservation Service - OSMAUSIA
 * API calls for creating and managing reservations
 */

import api from './api';

/**
 * Create an accommodation reservation
 * @param {Object} data - Reservation data
 * @param {number} data.hebergementId - ID of the accommodation
 * @param {string} data.checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} data.checkOutDate - Check-out date (YYYY-MM-DD)
 * @param {number} data.guestCount - Number of guests
 * @returns {Promise<Reservation>}
 */
export const createAccommodationReservation = async (data) => {
    const response = await api.post('/reservations/accommodation', data);
    return response.data;
};

/**
 * Create an activity reservation
 * @param {Object} data - Reservation data
 * @param {number} data.activityId - ID of the activity
 * @param {string} data.startDateTime - Activity start time (ISO format)
 * @param {number} data.guestCount - Number of participants
 * @returns {Promise<Reservation>}
 */
export const createActivityReservation = async (data) => {
    const response = await api.post('/reservations/activity', data);
    return response.data;
};

/**
 * Get current user's reservations
 * @returns {Promise<Reservation[]>}
 */
export const getMyReservations = async () => {
    const response = await api.get('/reservations/my');
    return response.data;
};

/**
 * Get a specific reservation by ID
 * @param {number} id - Reservation ID
 * @returns {Promise<Reservation>}
 */
export const getReservationById = async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
};

/**
 * Cancel a reservation
 * @param {number} id - Reservation ID
 * @returns {Promise<void>}
 */
export const cancelReservation = async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
};

/**
 * Reservation status labels with colors
 */
export const RESERVATION_STATUS = {
    CREATED: { label: 'Créée', color: '#3498db', icon: '📝' },
    PENDING_PAYMENT: { label: 'En attente de paiement', color: '#f39c12', icon: '⏳' },
    CONFIRMED: { label: 'Confirmée', color: '#27ae60', icon: '✅' },
    CANCELLED: { label: 'Annulée', color: '#e74c3c', icon: '❌' },
};

export default {
    createAccommodationReservation,
    createActivityReservation,
    getMyReservations,
    getReservationById,
    cancelReservation,
    RESERVATION_STATUS,
};
