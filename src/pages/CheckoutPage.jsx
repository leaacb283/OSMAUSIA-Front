/**
 * CheckoutPage - OSMAUSIA
 * Professional Stripe Elements integration
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { getReservationById } from '../services/reservationService';
import { createPaymentIntent, getStripePublicKey, simulatePaymentSuccess } from '../services/paymentService';
import './CheckoutPage.css';

// Initialize Stripe with public key
const stripePublicKey = getStripePublicKey();
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

/**
 * Inner payment form component that uses Stripe hooks
 */
const PaymentForm = ({ reservation, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setMessage('');

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/success?reservation=${reservation.id}`,
                },
                redirect: 'if_required', // Stay on page if no redirect needed (card payments)
            });

            if (error) {
                // Show error to customer
                if (error.type === 'card_error' || error.type === 'validation_error') {
                    setMessage(error.message);
                } else {
                    setMessage('Une erreur est survenue lors du paiement.');
                }
                onError?.(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Payment succeeded without redirect
                onSuccess?.(paymentIntent);
            }
        } catch (err) {
            setMessage('Erreur de connexion au serveur de paiement.');
            onError?.(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-payment-form">
            <PaymentElement
                options={{
                    layout: 'tabs',
                    paymentMethodOrder: ['card', 'klarna', 'paypal'],
                }}
            />

            {message && (
                <div className="payment-error-message" role="alert">
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="btn btn-primary btn-lg btn-block stripe-submit-btn"
            >
                {isProcessing ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Traitement en cours...
                    </>
                ) : (
                    <>Payer {reservation?.totalPrice || 0} €</>
                )}
            </button>

            <p className="checkout__security-hint">
                Paiement 100% sécurisé par Stripe
            </p>
        </form>
    );
};

/**
 * Main Checkout Page Component
 */
const CheckoutPage = () => {
    const { reservationId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [stripeReady, setStripeReady] = useState(false);
    const [simulationMode, setSimulationMode] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/checkout/${reservationId}` } });
        }
    }, [isAuthenticated, navigate, reservationId]);

    // Initialize checkout
    useEffect(() => {
        const initCheckout = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            setError(null);
            try {
                // Get reservation details
                const reservationData = await getReservationById(reservationId);
                setReservation(reservationData);

                // Check if already paid
                if (reservationData.status === 'CONFIRMED') {
                    setLoading(false);
                    return;
                }

                // Create payment intent
                const result = await createPaymentIntent(reservationId);

                // Check if backend returned an error
                if (result.error) {
                    throw new Error(result.error);
                }

                setClientSecret(result.clientSecret);

                // Check if Stripe is available
                if (stripePromise) {
                    setStripeReady(true);
                } else {
                    console.warn('Stripe not configured, using simulation mode');
                    setSimulationMode(true);
                }
            } catch (err) {
                console.error('Checkout init error:', err);
                // Show the actual error message from backend
                setError(err.response?.data?.error || err.message || 'Erreur lors du chargement du paiement');
            } finally {
                setLoading(false);
            }
        };

        initCheckout();
    }, [reservationId, isAuthenticated]);

    // Handle payment success
    const handlePaymentSuccess = async (paymentIntent) => {
        console.log('Payment succeeded:', paymentIntent.id);

        // In dev/localhost, webhooks don't work, so we manually confirm the reservation
        // This is safe because Stripe already confirmed the payment
        try {
            await simulatePaymentSuccess(reservationId);
            console.log('Reservation confirmed via API');
        } catch (err) {
            console.warn('Could not confirm via API (webhook may handle it):', err);
        }

        navigate(`/payment/success?reservation=${reservationId}`);
    };

    // Handle payment error
    const handlePaymentError = (errorMessage) => {
        console.error('Payment failed:', errorMessage);
    };

    // Handle simulation payment (fallback)
    const handleSimulationPayment = async () => {
        setPaymentLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await simulatePaymentSuccess(reservationId);
            navigate(`/payment/success?reservation=${reservationId}`);
        } catch (err) {
            setError('Erreur de paiement simulation');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Format date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Stripe Elements options
    const elementsOptions = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#0ea5e9',
                colorBackground: '#ffffff',
                colorText: '#1e293b',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            },
            rules: {
                '.Input': {
                    border: '1px solid #e2e8f0',
                    boxShadow: 'none',
                },
                '.Input:focus': {
                    border: '2px solid #0ea5e9',
                    boxShadow: '0 0 0 1px #0ea5e9',
                },
                '.Label': {
                    fontWeight: '500',
                    color: '#475569',
                },
                '.Tab': {
                    border: '1px solid #e2e8f0',
                },
                '.Tab--selected': {
                    borderColor: '#0ea5e9',
                },
            },
        },
    };

    // Loading state
    if (loading) {
        return (
            <div className="checkout checkout--loading">
                <div className="container">
                    <div className="checkout__spinner"></div>
                    <p>Préparation du paiement sécurisé...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !reservation) {
        return (
            <div className="checkout checkout--error">
                <div className="container">
                    <h1>Erreur</h1>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
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
                            ? 'Réservation confirmée'
                            : 'Finaliser votre réservation'}
                    </h1>
                    <p>
                        {reservation?.status === 'CONFIRMED'
                            ? 'Votre paiement a été accepté'
                            : 'Paiement 100% sécurisé par Stripe'}
                    </p>
                </header>

                <div className="checkout__content">
                    {/* Reservation Summary */}
                    <div className="checkout__summary">
                        <h2>Récapitulatif</h2>

                        <div className="checkout__details">
                            <div className="checkout__detail-row">
                                <span>Hébergement</span>
                                <span>{reservation?.hebergementTitle || reservation?.activiteName || `Réservation #${reservationId}`}</span>
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
                                <span>Total</span>
                                <span className="checkout__total">{reservation?.totalPrice || 0} €</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="checkout__payment">
                        {reservation?.status === 'CONFIRMED' ? (
                            /* Already Paid */
                            <div className="checkout__confirmation-status">
                                <div className="status-badge success">
                                    Paiement confirmé
                                </div>
                                <p className="confirmation-text">
                                    Votre réservation est validée. Un email de confirmation vous a été envoyé.
                                </p>
                                <div className="checkout__actions">
                                    <button className="btn btn-primary" onClick={() => window.print()}>
                                        Imprimer
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                                        Mes réservations
                                    </button>
                                </div>
                            </div>
                        ) : stripeReady && clientSecret ? (
                            /* Real Stripe Elements */
                            <div className="checkout__stripe-elements">
                                <h2>Paiement sécurisé</h2>
                                <Elements stripe={stripePromise} options={elementsOptions}>
                                    <PaymentForm
                                        reservation={reservation}
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                    />
                                </Elements>
                            </div>
                        ) : simulationMode || !stripePublicKey ? (
                            /* Simulation Mode Fallback */
                            <div className="checkout__simulation">
                                <h2>Mode Test</h2>
                                <div className="checkout__stripe-warning">
                                    <p>Stripe non configuré. Mode simulation activé.</p>
                                    <p className="text-muted">
                                        Ajoutez <code>VITE_STRIPE_PUBLIC_KEY=pk_test_...</code> dans votre fichier <code>.env</code>
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary btn-lg btn-block"
                                    onClick={handleSimulationPayment}
                                    disabled={paymentLoading}
                                >
                                    {paymentLoading ? 'Traitement...' : `Simuler le paiement de ${reservation?.totalPrice || 0} €`}
                                </button>
                            </div>
                        ) : (
                            /* Loading payment form */
                            <div className="checkout__loading-payment">
                                <div className="checkout__spinner checkout__spinner--small"></div>
                                <p>Chargement du formulaire sécurisé...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Back Link */}
                <div className="checkout__back">
                    <button className="btn btn-link" onClick={() => navigate(-1)}>
                        ← Retour
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
