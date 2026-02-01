/**
 * ProviderReservations - OSMAUSIA
 * Vue des réservations reçues pour le partenaire
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReceivedReservations, updateReservationStatus, cancelReservation } from '../services/reservationService';
import ConfirmModal from '../components/ConfirmModal';
import './ProviderReservations.css';

const ProviderReservations = () => {
    const { t } = useTranslation();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelModal, setCancelModal] = useState({ isOpen: false, reservationId: null });
    const [isCancelling, setIsCancelling] = useState(false);
    const [notice, setNotice] = useState({ isOpen: false, title: '', message: '', variant: 'primary' });

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            setLoading(true);
            const data = await getReceivedReservations();
            // Trier par date (plus récent en premier)
            const sorted = data.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
            setReservations(sorted);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les réservations.');
        } finally {
            setLoading(false);
        }
    };

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

    const formatDate = (dateInput) => {
        const d = parseDateHelper(dateInput);
        if (!d || isNaN(d)) return '';
        return d.toLocaleDateString('fr-FR');
    };

    const handleCancelClick = (id) => {
        setCancelModal({ isOpen: true, reservationId: id });
    };

    const handleConfirmCancel = async () => {
        const id = cancelModal.reservationId;
        if (!id) return;

        try {
            setIsCancelling(true);
            await cancelReservation(id);
            setCancelModal({ isOpen: false, reservationId: null });
            loadReservations();

            setNotice({
                isOpen: true,
                title: "Succès",
                message: "La réservation a été annulée. Le client en sera informé.",
                variant: 'success'
            });
        } catch (err) {
            setNotice({
                isOpen: true,
                title: "Erreur",
                message: err.message || "Erreur lors de l'annulation",
                variant: 'danger'
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            'CREATED': 'badge-secondary',
            'PENDING_PAYMENT': 'badge-warning',
            'CONFIRMED': 'badge-success',
            'CANCELLED': 'badge-danger',
            'COMPLETED': 'badge-info',
            'REFUNDED': 'badge-dark'
        };
        return <span className={`badge ${classes[status] || 'badge-secondary'}`}>{status}</span>;
    };

    if (loading) return <div className="container p-5 text-center">Chargement...</div>;

    return (
        <div className="provider-reservations">
            <div className="container">
                <header className="page-header">
                    <h1>Gestion des Réservations</h1>
                    <p>Suivez les réservations de vos hébergements et activités.</p>
                </header>

                {error && <div className="alert alert-danger">{error}</div>}

                {reservations.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucune réservation reçue pour le moment.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Client</th>
                                    <th>Offre</th>
                                    <th>Dates</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(res => (
                                    <tr key={res.id}>
                                        <td>#{res.id}</td>
                                        <td>
                                            {res.travelerName || `Client #${res.travelerId}`}
                                            {res.travelerEmail && (
                                                <>
                                                    <br />
                                                    <small className="text-muted">{res.travelerEmail}</small>
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            {res.hebergementTitle || res.activiteName}
                                            <br />
                                            <small className="text-muted">{res.hebergementId ? 'Hébergement' : 'Activité'}</small>
                                        </td>
                                        <td>
                                            {formatDate(res.checkInDate)}
                                            {res.checkOutDate && ` ➔ ${formatDate(res.checkOutDate)}`}
                                        </td>
                                        <td>{res.totalPrice} €</td>
                                        <td>{getStatusBadge(res.status)}</td>
                                        <td>
                                            {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleCancelClick(res.id)}
                                                >
                                                    Annuler
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={cancelModal.isOpen}
                title="Annuler la réservation"
                message="Êtes-vous sûr de vouloir annuler cette réservation partenaire ? Cette action informera le client."
                confirmText="Confirmer l'annulation"
                cancelText="Retour"
                confirmVariant="danger"
                isLoading={isCancelling}
                onConfirm={handleConfirmCancel}
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

export default ProviderReservations;
