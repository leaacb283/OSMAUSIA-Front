/**
 * PaymentSuccess Page - OSMAUSIA
 * Confirmation page after successful payment
 */

import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const reservationId = searchParams.get('reservation');

    // Confetti animation effect
    useEffect(() => {
        // Could add confetti library here for celebration effect
        console.log('Payment successful for reservation:', reservationId);
    }, [reservationId]);

    return (
        <div className="payment-success">
            <div className="container">
                <div className="payment-success__card">
                    <div className="payment-success__icon">✅</div>

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
                            <li>📧 Vérifiez votre email pour les détails de la réservation</li>
                            <li>📅 Notez les dates de votre séjour</li>
                            <li>🌴 Préparez votre voyage régénératif !</li>
                        </ul>
                    </div>

                    <div className="payment-success__actions">
                        <Link to="/my-reservations" className="btn btn-primary btn-lg">
                            Voir mes réservations
                        </Link>
                        <Link to="/" className="btn btn-secondary">
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="payment-success__trust">
                    <span>🔒 Paiement sécurisé</span>
                    <span>✓ Confirmation instantanée</span>
                    <span>💚 Voyage régénératif</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
