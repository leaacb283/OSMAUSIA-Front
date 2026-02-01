import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cancelReservation } from '../services/reservationService';
import ConfirmModal from './ConfirmModal';
import './BookingsList.css';

const BookingsList = ({ bookings, showActions = true, onRefresh }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });
    const [isCancelling, setIsCancelling] = useState(false);
    const [notice, setNotice] = useState({ isOpen: false, title: '', message: '', variant: 'primary' });

    // Status badge configuration
    const statusConfig = {
        pending: {
            label: t('booking.statusPending'),
            class: 'badge-pending',
            icon: ''
        },
        confirmed: {
            label: t('booking.statusConfirmed'),
            class: 'badge-confirmed',
            icon: ''
        },
        cancelled: {
            label: t('booking.statusCancelled'),
            class: 'badge-cancelled',
            icon: ''
        },
        completed: {
            label: t('booking.statusCompleted'),
            class: 'badge-confirmed',
            icon: ''
        }
    };

    // Format date based on locale - parse manually to avoid UTC issues
    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Parse YYYY-MM-DD manually to avoid UTC offset
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Initiation of cancellation
    const handleCancelClick = (bookingId) => {
        setCancelModal({ isOpen: true, bookingId });
    };

    // Actual cancellation logic
    const handleConfirmCancel = async () => {
        const bookingId = cancelModal.bookingId;
        if (!bookingId) return;

        setIsCancelling(true);
        try {
            await cancelReservation(bookingId);
            setCancelModal({ isOpen: false, bookingId: null });

            setNotice({
                isOpen: true,
                title: "Succès",
                message: "Votre réservation a été annulée avec succès.",
                variant: 'success'
            });

            if (onRefresh) onRefresh();
        } catch (e) {
            console.error(e);
            setNotice({
                isOpen: true,
                title: "Erreur",
                message: e.message || "Une erreur est survenue lors de l'annulation.",
                variant: 'danger'
            });
        } finally {
            setIsCancelling(false);
        }
    };

    if (!bookings || bookings.length === 0) {
        return (
            <div className="bookings-empty">
                <span className="bookings-empty__icon"></span>
                <p className="bookings-empty__text">{t('dashboard.noBookings')}</p>
                <Link to="/" className="btn btn-primary">
                    {t('dashboard.discoverButton')}
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="bookings-list">
                {bookings.map((booking) => {
                    const status = statusConfig[booking.status?.toLowerCase()] || statusConfig.pending;
                    // API keys are flat: hebergementTitle, activiteName
                    const title = booking.hebergementTitle || booking.activiteName || `Réservation #${booking.id}`;

                    return (
                        <article key={booking.id} className="booking-card">
                            {/* Status indicator */}
                            <div className={`booking-card__status-bar status-${booking.status?.toLowerCase()}`} />

                            <div className="booking-card__content">
                                {/* Header */}
                                <div className="booking-card__header">
                                    <div className="booking-card__title-group">
                                        <h4 className="booking-card__title">{title}</h4>
                                        <span className={`badge ${status.class}`}>
                                            {status.icon} {status.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="booking-card__details">
                                    {/* Dates */}
                                    <div className="booking-card__detail">
                                        <span className="booking-card__detail-icon"></span>
                                        <span className="booking-card__detail-text">
                                            {booking.checkInDate ? (
                                                <>
                                                    {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                                                </>
                                            ) : (
                                                <>
                                                    {formatDate(booking.startDateTime)}
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {/* Guests */}
                                    <div className="booking-card__detail">
                                        <span className="booking-card__detail-icon"></span>
                                        <span className="booking-card__detail-text">
                                            {booking.guestCount} {booking.guestCount > 1 ? t('booking.guests') : t('booking.guest')}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="booking-card__detail">
                                        <span className="booking-card__detail-icon"></span>
                                        <span className="booking-card__detail-text booking-card__price">
                                            {booking.totalPrice} €
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Alert for pending reservations */}
                                {(booking.status === 'PENDING_PAYMENT' || booking.status === 'CREATED') && (
                                    <div className="booking-card__payment-alert">
                                        <span className="payment-alert__warning">Paiement requis</span>
                                        <div className="payment-alert__actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleCancelClick(booking.id)}
                                            >
                                                Annuler
                                            </button>
                                            <Link
                                                to={`/checkout/${booking.id}`}
                                                className="btn btn-primary"
                                            >
                                                Finaliser
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Actions - only show for confirmed bookings (not pending payment) */}
                                {showActions && booking.status !== 'PENDING_PAYMENT' && booking.status !== 'CREATED' && (
                                    <div className="booking-card__actions">
                                        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleCancelClick(booking.id)}
                                            >
                                                {t('booking.cancelBooking')}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>

            <ConfirmModal
                isOpen={cancelModal.isOpen}
                title="Annuler la réservation"
                message="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible."
                confirmText="Oui, annuler"
                cancelText="Garder ma réservation"
                confirmVariant="danger"
                isLoading={isCancelling}
                onConfirm={handleConfirmCancel}
                onCancel={() => setCancelModal({ isOpen: false, bookingId: null })}
            />
            <ConfirmModal
                isOpen={notice.isOpen}
                title={notice.title}
                message={notice.message}
                confirmText="Fermer"
                cancelText=""
                confirmVariant={notice.variant}
                onConfirm={() => setNotice(prev => ({ ...prev, isOpen: false }))}
                onCancel={() => setNotice(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
};

export default BookingsList;
