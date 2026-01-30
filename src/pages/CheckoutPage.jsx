/**
 * CheckoutPage - OSMAUSIA
 * Stripe payment integration with Elements
 * Note: Requires @stripe/stripe-js and @stripe/react-stripe-js
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReservationById } from '../services/reservationService';
import { createPaymentIntent, getStripePublicKey, simulatePaymentSuccess } from '../services/paymentService';
import './CheckoutPage.css';

// Stripe will be loaded dynamically if available
let stripePromise = null;

const CheckoutPage = () => {
    const { reservationId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [stripeError, setStripeError] = useState(null);
    const [stripeLoaded, setStripeLoaded] = useState(false);

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/checkout/${reservationId}` } });
        }
    }, [isAuthenticated, navigate, reservationId]);

    // Load Stripe dynamically
    useEffect(() => {
        const loadStripe = async () => {
            try {
                const stripeKey = getStripePublicKey();
                if (!stripeKey) {
                    setStripeError('Configuration Stripe manquante. Ajoutez VITE_STRIPE_PUBLIC_KEY dans .env');
                    return;
                }

                // Dynamically import Stripe
                const { loadStripe } = await import('@stripe/stripe-js');
                stripePromise = loadStripe(stripeKey);
                setStripeLoaded(true);
            } catch (err) {
                console.error('Failed to load Stripe:', err);
                setStripeError('Impossible de charger Stripe. Installez @stripe/stripe-js avec: npm install @stripe/stripe-js @stripe/react-stripe-js');
            }
        };

        loadStripe();
    }, []);

    // Fetch reservation and create payment intent
    useEffect(() => {
        const initCheckout = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                // Get reservation details
                const reservationData = await getReservationById(reservationId);
                setReservation(reservationData);

                // Create payment intent
                const { clientSecret: secret } = await createPaymentIntent(reservationId);
                setClientSecret(secret);
            } catch (err) {
                console.error('Checkout init error:', err);
                setError(err.message || 'Erreur lors du chargement du paiement');
            } finally {
                setLoading(false);
            }
        };

        initCheckout();
    }, [reservationId, isAuthenticated]);

    // Handle manual test payment (fallback when Stripe not installed)
    const handleTestPayment = async () => {
        setPaymentLoading(true);
        try {
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Notify backend that simulation was successful
            await simulatePaymentSuccess(reservationId);

            // Redirect to success page
            navigate('/payment/success?reservation=' + reservationId);
        } catch (err) {
            setError('Erreur de paiement test');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Format date - parse manually to avoid UTC offset issues
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // Parse YYYY-MM-DD manually to avoid UTC offset
        const [year, month, day] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="checkout checkout--loading">
                <div className="container">
                    <div className="checkout__spinner"></div>
                    <p>Préparation du paiement...</p>
                </div>
            </div>
        );
    }

    if (error && !reservation) {
        return (
            <div className="checkout checkout--error">
                <div className="container">
                    <h1>❌ Erreur</h1>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/my-reservations')}>
                        Voir mes réservations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout">
            <div className="container">
                <header className="checkout__header">
                    <h1>
                        {reservation?.status === 'CONFIRMED'
                            ? 'Détails de votre réservation'
                            : 'Finaliser votre réservation'}
                    </h1>
                    <p>
                        {reservation?.status === 'CONFIRMED'
                            ? 'Recapitulatif de votre séjour confirmé'
                            : 'Vérifiez les détails et procédez au paiement sécurisé'}
                    </p>
                </header>

                <div className="checkout__content">
                    {/* Reservation Summary */}
                    <div className="checkout__summary">
                        <h2>Récapitulatif</h2>

                        <div className="checkout__details">
                            <div className="checkout__detail-row">
                                <span>Hébergement</span>
                                <span>{reservation?.hebergementTitle || `Réservation #${reservationId}`}</span>
                            </div>

                            {reservation?.checkInDate && (
                                <div className="checkout__detail-row">
                                    <span>Dates</span>
                                    <span>
                                        {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                                    </span>
                                </div>
                            )}

                            <div className="checkout__detail-row">
                                <span>Voyageurs</span>
                                <span>{reservation?.guestCount || 2} personne(s)</span>
                            </div>

                            <div className="checkout__detail-row checkout__detail-row--total">
                                <span>Total à payer</span>
                                <span className="checkout__total">{reservation?.totalPrice || 0} €</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    {/* Payment Form OR Confirmation Status */}
                    <div className="checkout__payment">
                        {reservation?.status === 'CONFIRMED' ? (
                            <div className="checkout__confirmation-status">
                                <div className="status-badge success">
                                    ✅ Réservation confirmée
                                </div>
                                <p className="confirmation-text">
                                    Votre séjour est validé. Vous recevrez un email récapitulatif prochainement.
                                </p>
                                <div className="checkout__actions">
                                    <button className="btn btn-primary" onClick={() => window.print()}>
                                        🖨️ Imprimer la confirmation
                                    </button>
                                    <button className="btn btn-secondary">
                                        📧 Contacter l'hôte
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2>Paiement sécurisé</h2>

                                {stripeError ? (
                                    <div className="checkout__stripe-warning">
                                        <p>⚠️ {stripeError}</p>
                                        <p className="checkout__test-info">
                                            Mode test disponible pour la démonstration :
                                        </p>
                                        <button
                                            className="btn btn-primary btn-lg"
                                            onClick={handleTestPayment}
                                            disabled={paymentLoading}
                                        >
                                            {paymentLoading ? 'Paiement en cours...' : '💳 Simuler le paiement (Test)'}
                                        </button>
                                    </div>
                                ) : stripeLoaded && clientSecret ? (
                                    <div className="checkout__stripe-form">
                                        {/* 
                                         * When Stripe is installed, use:
                                         * <Elements stripe={stripePromise} options={{ clientSecret }}>
                                         *   <PaymentForm />
                                         * </Elements>
                                         */}
                                        <div className="checkout__stripe-placeholder">
                                            <p>🔒 Formulaire de paiement Stripe</p>
                                            <p className="checkout__stripe-note">
                                                Carte de test : 4242 4242 4242 4242
                                            </p>
                                            <button
                                                className="btn btn-primary btn-lg"
                                                onClick={handleTestPayment}
                                                disabled={paymentLoading}
                                            >
                                                {paymentLoading ? 'Paiement en cours...' : 'Payer ' + (reservation?.totalPrice || 0) + ' €'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="checkout__loading-payment">
                                        <div className="checkout__spinner checkout__spinner--small"></div>
                                        <p>Chargement du formulaire de paiement...</p>
                                    </div>
                                )}

                                <div className="checkout__security">
                                    <span>🔐</span>
                                    <span>Paiement sécurisé par Stripe</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Back Link */}
                <div className="checkout__back">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        ← Retour
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
