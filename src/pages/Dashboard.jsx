import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import BookingsList from '../components/BookingsList';
import ImpactMetrics from '../components/ImpactMetrics';
import { getMyReservations } from '../services/reservationService';
import './Dashboard.css';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, loading: authLoading } = useAuth(); // Rename loading to avoid conflict
    const [activeTab, setActiveTab] = useState('upcoming');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch bookings from API
    const fetchBookings = async () => {
        if (!isAuthenticated) return;
        try {
            const data = await getMyReservations();
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch dashboard bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchBookings();
        }
    }, [isAuthenticated, authLoading]);

    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (authLoading || loading) {
        return (
            <div className="dashboard-loading">
                <span className="spinner"></span>
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    // Helper to parse dates (handles both string and array formats from backend)
    const parseDate = (dateInput) => {
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

    // Get today's date (without time for fair comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter bookings by tab using both STATUS and DATES
    // Upcoming: Active status AND checkout date is in the future (or check-in is in the future)
    const upcomingBookings = bookings.filter(b => {
        const checkOut = parseDate(b.checkOutDate) || parseDate(b.checkInDate);
        const isActiveStatus = ['CREATED', 'PENDING_PAYMENT', 'CONFIRMED'].includes(b.status);
        const isFuture = checkOut && checkOut >= today;
        return isActiveStatus && isFuture;
    });

    // Past: Cancelled/Completed status OR checkout date has passed
    const pastBookings = bookings.filter(b => {
        const checkOut = parseDate(b.checkOutDate) || parseDate(b.checkInDate);
        const isPastStatus = ['CANCELLED', 'COMPLETED'].includes(b.status);
        const isPastDate = checkOut && checkOut < today;
        return isPastStatus || (isPastDate && !['CREATED', 'PENDING_PAYMENT'].includes(b.status));
    });

    const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

    // User impact data
    const impact = user.impact || {
        co2Saved: 0,
        localSpend: 0,
        communitiesSupported: 0,
        treesPlanted: 0
    };

    return (
        <div className="dashboard">
            <div className="container">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>
                            {t('dashboard.welcomeBack')} {user.profile?.firstName || user.profile?.companyName}!
                        </h1>
                        <p className="dashboard-date">
                            {new Date().toLocaleDateString(user.profile?.language === 'en' ? 'en-GB' : 'fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="dashboard-actions">
                        <Link to="/" className="btn btn-primary">
                            {t('dashboard.discoverButton')}
                        </Link>
                    </div>
                </header>

                {/* Stats Cards */}
                <section className="dashboard-stats">
                    <div className="stat-card stat-card--trips">
                        <span className="stat-card__icon"></span>
                        <div className="stat-card__content">
                            <span className="stat-card__value">{user.impact?.totalTrips || 0}</span>
                            <span className="stat-card__label">Voyages régénératifs</span>
                        </div>
                    </div>
                    <div className="stat-card stat-card--pending">
                        <span className="stat-card__icon"></span>
                        <div className="stat-card__content">
                            <span className="stat-card__value">{upcomingBookings.length}</span>
                            <span className="stat-card__label">Réservations à venir</span>
                        </div>
                    </div>
                    <div className="stat-card stat-card--score">
                        <span className="stat-card__icon"></span>
                        <div className="stat-card__content">
                            <span className="stat-card__value">{impact.co2Saved}</span>
                            <span className="stat-card__label">kg CO₂ économisés</span>
                        </div>
                    </div>
                    <div className="stat-card stat-card--communities">
                        <span className="stat-card__icon"></span>
                        <div className="stat-card__content">
                            <span className="stat-card__value">{impact.communitiesSupported}</span>
                            <span className="stat-card__label">Communautés soutenues</span>
                        </div>
                    </div>
                </section>

                {/* Main Content Grid */}
                <div className="dashboard-grid">
                    {/* Bookings Section */}
                    <section className="dashboard-section dashboard-section--bookings">
                        <div className="dashboard-section__header">
                            <h2>{t('dashboard.bookingsTitle')}</h2>
                            <div className="dashboard-tabs">
                                <button
                                    className={`dashboard-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('upcoming')}
                                >
                                    {t('dashboard.upcomingTrips')} ({upcomingBookings.length})
                                </button>
                                <button
                                    className={`dashboard-tab ${activeTab === 'past' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('past')}
                                >
                                    {t('dashboard.pastTrips')} ({pastBookings.length})
                                </button>
                            </div>
                        </div>

                        <BookingsList bookings={displayedBookings} onRefresh={fetchBookings} />
                    </section>

                    {/* Impact Section */}
                    <section className="dashboard-section dashboard-section--impact">
                        <div className="dashboard-section__header">
                            <h2>{t('dashboard.impactTitle')}</h2>
                            <span className="dashboard-section__badge">
                                {t('dashboard.impactMetrics')}
                            </span>
                        </div>

                        <ImpactMetrics
                            impact={impact}
                            showDetails={true}
                            available={user.impact?.totalTrips > 0}
                        />

                        {/* Impact Tips */}
                        <div className="dashboard-tips">
                            <h4>Conseils pour augmenter votre impact</h4>
                            <ul>
                                <li>Privilégiez les transports bas carbone</li>
                                <li>Choisissez des hébergements certifiés</li>
                                <li>Participez à des activités communautaires</li>
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Quick Actions */}
                <section className="dashboard-quick-actions">
                    <h3>Actions rapides</h3>
                    <div className="quick-actions-grid">
                        <Link to="/preferences" className="quick-action">
                            <span className="quick-action__icon"></span>
                            <span className="quick-action__label">Préférences</span>
                        </Link>
                        <Link to="/profile" className="quick-action">
                            <span className="quick-action__icon"></span>
                            <span className="quick-action__label">Profil</span>
                        </Link>
                        <Link to="/support" className="quick-action">
                            <span className="quick-action__icon"></span>
                            <span className="quick-action__label">Support</span>
                        </Link>
                        <Link to="/refer" className="quick-action">
                            <span className="quick-action__icon"></span>
                            <span className="quick-action__label">Parrainage</span>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
