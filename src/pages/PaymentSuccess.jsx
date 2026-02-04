/**
 * PaymentSuccess Page - OSMAUSIA
 * Confirmation page after successful payment
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const reservationId = searchParams.get('reservation');
    const [confirmed, setConfirmed] = useState(false);

    // Confirm reservation is done via backend webhooks.
    // We can show the success message immediately as Stripe redirect happens only after success.
    useEffect(() => {
        if (reservationId) {
            console.log('Payment successful for reservation:', reservationId);
            setConfirmed(true);
        }
    }, [reservationId]);

    return (
        <div className="payment-success">
            <div className="container">
                <div className="payment-success__card">
                    <div className="payment-success__icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>

                    <h1 className="payment-success__title">
                        Paiement confirmé !
                    </h1>

                    <p className="payment-success__message">
                        Votre réservation a été confirmée avec succès.
                        Vous recevrez un email de confirmation sous peu.
                    </p>

                    {reservationId && (
                        <div className="payment-success__reference">
                            <span>Numéro de réservation</span>
                            <strong>#{reservationId}</strong>
                        </div>
                    )}

                    <div className="payment-success__next-steps">
                        <h2>Prochaines étapes</h2>
                        <ul>
                            <li>Vérifiez votre email pour les détails de la réservation</li>
                            <li>Notez les dates de votre séjour</li>
                            <li>Préparez votre voyage régénératif !</li>
                        </ul>
                    </div>

                    <div className="payment-success__actions">
                        <Link to="/dashboard" className="btn btn-primary btn-lg">
                            Voir mon tableau de bord
                        </Link>
                        <Link to="/" className="btn btn-secondary">
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="payment-success__trust">
                    <span>Paiement sécurisé</span>
                    <span>Confirmation instantanée</span>
                    <span>Voyage régénératif</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
