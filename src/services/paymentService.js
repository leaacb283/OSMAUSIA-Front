/**
 * Payment Service - OSMAUSIA
 * API calls for Stripe payment integration
 */

import api from './api';

/**
 * Create a payment intent for a reservation
 * @param {number} reservationId - ID of the reservation to pay for
 * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
 */
export const createPaymentIntent = async (reservationId) => {
    const response = await api.post('/payment/create-intent', { reservationId });
    return response.data;
};

/**
 * Verify payment status (optional, webhook handles this)
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<{status: string}>}
 */
export const verifyPayment = async (paymentIntentId) => {
    const response = await api.get(`/payment/status/${paymentIntentId}`);
    return response.data;
};

/**
 * Get Stripe public key from environment
 * MUST be set in .env as VITE_STRIPE_PUBLIC_KEY
 */
export const getStripePublicKey = () => {
    return import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
};

/**
 * Simulate payment success (Local dev only)
 * @param {number} reservationId 
 */
export const simulatePaymentSuccess = async (reservationId) => {
    const response = await api.post(`/payment/simulate-success/${reservationId}`);
    return response.data;
};


export default {
    createPaymentIntent,
    verifyPayment,
    getStripePublicKey,
    simulatePaymentSuccess,
};
