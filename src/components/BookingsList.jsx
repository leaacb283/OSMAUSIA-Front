import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './BookingsList.css';

const BookingsList = ({ bookings, showActions = true }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

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

    // Format date based on locale
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
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

                            {/* Actions */}
                            {showActions && (
                                <div className="booking-card__actions">


                                    {booking.status === 'CONFIRMED' && (
                                        <button className="btn btn-ghost btn-sm">
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
    );
};

export default BookingsList;
