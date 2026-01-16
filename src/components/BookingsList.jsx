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
            icon: '⏳'
        },
        confirmed: {
            label: t('booking.statusConfirmed'),
            class: 'badge-confirmed',
            icon: '✓'
        },
        cancelled: {
            label: t('booking.statusCancelled'),
            class: 'badge-cancelled',
            icon: '✕'
        },
        completed: {
            label: t('booking.statusCompleted'),
            class: 'badge-confirmed',
            icon: '★'
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
                <span className="bookings-empty__icon">📭</span>
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
                const status = statusConfig[booking.status];
                const title = booking.offerTitle[lang] || booking.offerTitle.fr;

                return (
                    <article key={booking.id} className="booking-card">
                        {/* Status indicator */}
                        <div className={`booking-card__status-bar status-${booking.status}`} />

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
                                    <span className="booking-card__detail-icon">📅</span>
                                    <span className="booking-card__detail-text">
                                        {booking.dates.checkIn ? (
                                            <>
                                                {formatDate(booking.dates.checkIn)} → {formatDate(booking.dates.checkOut)}
                                                <span className="booking-card__detail-sub">
                                                    ({booking.dates.nights} {booking.dates.nights > 1 ? t('booking.nights') : t('booking.night')})
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                {formatDate(booking.dates.date)}
                                                {booking.dates.duration && (
                                                    <span className="booking-card__detail-sub">
                                                        ({booking.dates.duration})
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* Guests */}
                                <div className="booking-card__detail">
                                    <span className="booking-card__detail-icon">👥</span>
                                    <span className="booking-card__detail-text">
                                        {booking.guests} {booking.guests > 1 ? t('booking.guests') : t('booking.guest')}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="booking-card__detail">
                                    <span className="booking-card__detail-icon">💰</span>
                                    <span className="booking-card__detail-text booking-card__price">
                                        {booking.pricing.total} {booking.pricing.currency}
                                        {booking.pricing.refunded && (
                                            <span className="booking-card__refunded">(Remboursé)</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Impact preview */}
                            {booking.impact && booking.status !== 'cancelled' && (
                                <div className="booking-card__impact">
                                    {booking.impact.co2Saved && (
                                        <span className="booking-card__impact-item">
                                            🌱 -{booking.impact.co2Saved}kg CO₂
                                        </span>
                                    )}
                                    {booking.impact.localRevenue && (
                                        <span className="booking-card__impact-item">
                                            💚 {booking.impact.localRevenue}€ local
                                        </span>
                                    )}
                                    {booking.impact.treesPlanted && (
                                        <span className="booking-card__impact-item">
                                            🌳 {booking.impact.treesPlanted} {lang === 'fr' ? 'arbres' : 'trees'}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Review */}
                            {booking.review && (
                                <div className="booking-card__review">
                                    <div className="booking-card__review-rating">
                                        {'★'.repeat(booking.review.rating)}{'☆'.repeat(5 - booking.review.rating)}
                                    </div>
                                    <p className="booking-card__review-text">
                                        "{booking.review.comment[lang] || booking.review.comment.fr}"
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {showActions && (
                                <div className="booking-card__actions">
                                    <Link
                                        to={`/bookings/${booking.id}`}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        {t('booking.viewDetails')}
                                    </Link>

                                    {booking.status === 'confirmed' && (
                                        <button className="btn btn-ghost btn-sm">
                                            {t('booking.cancelBooking')}
                                        </button>
                                    )}

                                    {booking.status === 'completed' && !booking.review && (
                                        <button className="btn btn-primary btn-sm">
                                            {t('booking.leaveReview')}
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
