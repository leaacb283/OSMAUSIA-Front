/**
 * MyReservations Page - OSMAUSIA
 * Displays the traveler's reservations with status and actions
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getMyReservations, RESERVATION_STATUS, cancelReservation } from '../services/reservationService';
import ConfirmModal from '../components/ConfirmModal';
import './MyReservations.css';

const MyReservations = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [cancelModal, setCancelModal] = useState({ isOpen: false, reservationId: null });
    const [isCancelling, setIsCancelling] = useState(false);
    const [notice, setNotice] = useState({ isOpen: false, title: '', message: '', variant: 'primary' });

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/my-reservations' } });
        }
    }, [isAuthenticated, navigate]);

    // Fetch reservations
    useEffect(() => {
        const fetchReservations = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                const data = await getMyReservations();
                setReservations(data);
            } catch (err) {
                console.error('Failed to fetch reservations:', err);
                setError('Impossible de charger vos réservations.');
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [isAuthenticated]);

    // Filter reservations
    const filteredReservations = reservations.filter(res => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return ['CREATED', 'PENDING_PAYMENT', 'CONFIRMED'].includes(res.status);
        if (filter === 'past') return res.status === 'CANCELLED' || new Date(res.checkOutDate) < new Date();
        return true;
    });

    // Helper to parse dates from various formats (string or array)
    const parseDateHelper = (dateInput) => {
        if (!dateInput) return null;
        if (Array.isArray(dateInput)) {
            const [year, month, day] = dateInput;
            return new Date(year, month - 1, day);
        }
        if (typeof dateInput === 'string') {
            const [year, month, day] = dateInput.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        return null;
    };

    // Format date - handle both string "YYYY-MM-DD" and array [year, month, day] formats
    const formatDate = (dateInput) => {
        const d = parseDateHelper(dateInput);
        if (!d || isNaN(d)) return '';
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Calculate nights - handle both string and array date formats
    const calculateNights = (checkIn, checkOut) => {
        const start = parseDateHelper(checkIn);
        const end = parseDateHelper(checkOut);
        if (!start || !end || isNaN(start) || isNaN(end)) return 0;

        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (loading) {
        return (
            <div className="my-reservations my-reservations--loading">
                <div className="container">
                    <div className="my-reservations__spinner"></div>
                    <p>Chargement de vos réservations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-reservations">
            <div className="container">
                {/* Header */}
                <header className="my-reservations__header">
                    <h1>Mes Réservations</h1>
                    <p>Retrouvez ici toutes vos réservations et leur statut</p>
                </header>

                {/* Filters */}
                <div className="my-reservations__filters">
                    <button
                        className={`my-reservations__filter ${filter === 'all' ? 'my-reservations__filter--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Toutes ({reservations.length})
                    </button>
                    <button
                        className={`my-reservations__filter ${filter === 'upcoming' ? 'my-reservations__filter--active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        À venir
                    </button>
                    <button
                        className={`my-reservations__filter ${filter === 'past' ? 'my-reservations__filter--active' : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Passées
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="my-reservations__error">
                        {error}
                    </div>
                )}

                {/* Reservations List */}
                {filteredReservations.length > 0 ? (
                    <div className="my-reservations__list">
                        {filteredReservations.map((reservation) => {
                            const status = RESERVATION_STATUS[reservation.status] || RESERVATION_STATUS.CREATED;
                            const nights = calculateNights(reservation.checkInDate, reservation.checkOutDate);

                            return (
                                <article key={reservation.id} className="reservation-card">
                                    <div className="reservation-card__main">
                                        <div className="reservation-card__image">
                                            {/* Placeholder or actual image */}
                                            <div className="reservation-card__image-placeholder"></div>
                                        </div>

                                        <div className="reservation-card__content">
                                            <h3 className="reservation-card__title">
                                                {reservation.hebergementTitle || `Réservation #${reservation.id}`}
                                            </h3>

                                            <div className="reservation-card__dates">
                                                <span>{formatDate(reservation.checkInDate)}</span>
                                                <span className="reservation-card__arrow">→</span>
                                                <span>{formatDate(reservation.checkOutDate)}</span>
                                                <span className="reservation-card__nights">({nights} nuit{nights > 1 ? 's' : ''})</span>
                                            </div>

                                            <div className="reservation-card__details">
                                                <span>{reservation.guestCount} voyageur{reservation.guestCount > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="reservation-card__side">
                                        <span
                                            className="reservation-card__status"
                                            style={{ backgroundColor: status.color }}
                                        >
                                            {status.icon} {status.label}
                                        </span>

                                        <div className="reservation-card__price">
                                            <span className="reservation-card__price-amount">{reservation.totalPrice} €</span>
                                        </div>

                                        {(reservation.status === 'PENDING_PAYMENT' || reservation.status === 'CREATED') && (
                                            <div className="reservation-card__payment-alert">
                                                <span className="payment-alert__icon">⚠️</span>
                                                <span className="payment-alert__text">Paiement en attente</span>
                                                <Link
                                                    to={`/checkout/${reservation.id}`}
                                                    className="btn btn-primary"
                                                >
                                                    💳 Finaliser le paiement
                                                </Link>
                                            </div>
                                        )}

                                        {/* Bouton Annuler (Visible si pas Confirmée/Annulée/Passée ?) 
                                            Règle : On peut annuler si status != CANCELLED et Date > Now
                                        */}
                                        {reservation.status !== 'CANCELLED' &&
                                            parseDateHelper(reservation.checkInDate) >= todayStart && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    style={{ marginTop: '0.5rem' }}
                                                    onClick={() => setCancelModal({ isOpen: true, reservationId: reservation.id })}
                                                >
                                                    Annuler
                                                </button>
                                            )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="my-reservations__empty">
                        <span className="my-reservations__empty-icon"></span>
                        <h2>Aucune réservation</h2>
                        <p>Vous n'avez pas encore de réservation.</p>
                        <Link to="/explore" className="btn btn-primary">
                            Découvrir nos offres
                        </Link>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={cancelModal.isOpen}
                title="Annuler la réservation"
                message="Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible."
                confirmText="Oui, annuler"
                cancelText="Garder ma réservation"
                confirmVariant="danger"
                isLoading={isCancelling}
                onConfirm={async () => {
                    setIsCancelling(true);
                    try {
                        await cancelReservation(cancelModal.reservationId);
                        const data = await getMyReservations();
                        setReservations(data);
                        setCancelModal({ isOpen: false, reservationId: null });

                        setNotice({
                            isOpen: true,
                            title: "Succès",
                            message: "Réservation annulée avec succès.",
                            variant: 'success'
                        });
                    } catch (e) {
                        console.error(e);
                        setNotice({
                            isOpen: true,
                            title: "Erreur",
                            message: e.message || "Erreur lors de l'annulation",
                            variant: 'danger'
                        });
                    } finally {
                        setIsCancelling(false);
                    }
                }}
                onCancel={() => setCancelModal({ isOpen: false, reservationId: null })}
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
        </div>
    );
};

export default MyReservations;
