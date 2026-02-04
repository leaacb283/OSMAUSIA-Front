/**
 * Partner Dashboard - OSMAUSIA
 * Dashboard for partners to manage their offers
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { createHebergement, updateHebergement, getAllHebergements, uploadFile, getProviderEtablissements, createEtablissement, getProviderActivities, createActivite, updateActivite, deleteHebergement, deleteActivite } from '../services/offerService';
import { getReceivedReservations } from '../services/reservationService';
import { calculateRegenScore } from '../utils/scoreUtils';
import ConfirmModal from '../components/ConfirmModal';
import TagSelector from '../components/TagSelector';
import './PartnerDashboard.css';



// Mapper DTO backend vers format frontend
const mapDTOToOffer = (dto) => {
    const isActivity = !!dto.idActivity || (dto.pricePerson !== undefined);
    const rawId = dto.id || dto.idHebergement || dto.idActivity;
    return {
        // Préfixer l'ID pour éviter les collisions entre types dans le dashboard
        id: isActivity ? `act_${rawId}` : `heb_${rawId}`,
        rawId: rawId,
        title: { fr: dto.title || dto.name, en: dto.title || dto.name },
        type: isActivity ? 'activite' : 'hebergement',
        category: dto.category || 'nature',
        partnerId: dto.etablissement?.provider?.id,
        partnerName: dto.etablissement?.provider?.companyName,
        // ... rest of mapping
        location: {
            city: dto.city || dto.locationDTO?.city || dto.etablissement?.city || 'Île Maurice',
            country: 'Île Maurice',
            coordinates: {
                lat: dto.etablissement?.latitude || -20.0,
                lng: dto.etablissement?.longitude || 57.5
            }
        },
        description: {
            fr: dto.description || dto.storyContent || dto.hDescription || '',
            en: dto.description || dto.storyContent || dto.hDescription || ''
        },
        price: {
            amount: dto.basePrice || dto.price || dto.pricePerson || 0,
            currency: 'EUR',
            unit: isActivity ? 'person' : 'night'
        },
        capacity: { min: 1, max: dto.maxGuests || dto.nbrMaxPlaces || 10 },
        regenScore: {
            environmental: dto.regenScore || 80,
            social: dto.regenScore || 80,
            experience: dto.regenScore || 80
        },
        images: dto.medias?.length > 0
            ? dto.medias.sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)).map(m => m.url)
            : ['/images/offers/default.jpg'],
        medias: dto.medias || [], // Keep original structure for editing
        featured: false,
        available: true,
        tags: dto.tags || [], // Now a list of TagDTO objects from backend
        etablissementId: dto.etablissement?.id || dto.etablissementId
    };
};

const PartnerDashboard = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Commencer avec une liste vide - les offres seront chargées depuis l'API
    const [offers, setOffers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [etablissements, setEtablissements] = useState([]);
    const [loadingEtabs, setLoadingEtabs] = useState(false);
    const [showEtabForm, setShowEtabForm] = useState(false);
    const [newEtab, setNewEtab] = useState({ name: '', address: '', city: '' });

    const [newOffer, setNewOffer] = useState({
        title: '',
        type: 'hebergement',
        category: 'nature',
        description: '',
        price: '',
        city: '',
        country: 'Île Maurice',
        capacity: 2,
        environmental: 80,
        social: 80,
        experience: 80,
        medias: [], // Array of { url, type: 'IMAGE', isCover: boolean }
        tags: [],
        etablissementId: '' // Selected establishment ID
    });
    const [createError, setCreateError] = useState('');

    // Delete confirmation modal state
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, offerId: null, offerTitle: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const [notice, setNotice] = useState({ isOpen: false, title: '', message: '', variant: 'primary' });
    const [bookingsCount, setBookingsCount] = useState(0);

    // Charger les offres et établissements au montage
    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                try {
                    // Charger offres (Hebergements + Activites)
                    const [hebergements, activities] = await Promise.all([
                        getAllHebergements(),
                        getProviderActivities(user.id)
                    ]);

                    const myHebergements = (hebergements || []).filter(o =>
                        o.etablissement?.provider?.id === user.id ||
                        o.etablissement?.provider?.email === user.email
                    );

                    // Activités are usually already filtered by provider in the endpoint
                    const myActivities = activities || [];

                    const mappedHebergements = myHebergements.map(mapDTOToOffer);
                    const mappedActivities = myActivities.map(mapDTOToOffer);

                    setOffers([...mappedHebergements, ...mappedActivities]);
                } catch (err) {
                    console.error("Erreur chargement offres:", err);
                }

                try {
                    // Charger établissements
                    const etabs = await getProviderEtablissements(user.id);
                    setEtablissements(etabs);
                } catch (error) {
                    console.error("Erreur chargement établissements:", error);
                }
            }
        };
        fetchData();
    }, [user]);

    // Fetch bookings count for provider
    useEffect(() => {
        const fetchBookingsCount = async () => {
            try {
                const reservations = await getReceivedReservations();
                setBookingsCount(reservations?.length || 0);
            } catch (err) {
                console.error('Failed to fetch reservations count:', err);
                setBookingsCount(0);
            }
        };
        if (user?.id) {
            fetchBookingsCount();
        }
    }, [user]);

    // Redirect if not authenticated or not a partner
    if (!isAuthenticated) {
        return (
            <div className="partner-dashboard">
                <div className="container">
                    <div className="partner-not-auth">
                        <span className="partner-not-auth__icon"></span>
                        <h2>Accès réservé aux partenaires</h2>
                        <p>Veuillez vous connecter pour accéder à votre dashboard.</p>
                        <Link to="/login" className="btn btn-primary">Se connecter</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleOpenCreate = () => {
        setNewOffer({
            title: '',
            type: 'hebergement',
            category: 'nature',
            description: '',
            price: '',
            city: '',
            country: 'Île Maurice',
            capacity: 2,
            environmental: 80,
            social: 80,
            experience: 80,
            medias: [],
            tags: [],
            etablissementId: etablissements.length > 0 ? etablissements[0].id : ''
        });
        // Si aucun établissement, ouvrir le formulaire de création
        if (etablissements.length === 0) {
            setShowEtabForm(true);
        } else {
            setShowEtabForm(false);
        }
        setIsEditing(false);
        setEditingId(null);
        setShowCreateModal(true);
    };

    const handleEditOffer = (offer) => {
        console.log("Editing offer:", offer);
        setNewOffer({
            title: offer.title.fr,
            type: offer.type,
            category: offer.category,
            description: offer.description.fr,
            price: offer.price.amount,
            city: offer.location.city,
            country: offer.location.country,
            capacity: offer.capacity.max,
            environmental: offer.regenScore.environmental,
            social: offer.regenScore.social,
            experience: offer.regenScore.experience,
            medias: offer.medias || [],
            tags: offer.tags || [],
            etablissementId: offer.etablissementId || (etablissements.length > 0 ? etablissements[0].id : '')
        });
        setShowEtabForm(false);
        setIsEditing(true);
        setEditingId(offer.id);
        setShowCreateModal(true);
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Validation taille (Max 1MB par fichier - Limite Spring Boot par défaut)
        const MAX_SIZE = 1 * 1024 * 1024; // 1MB
        const oversizedFiles = files.filter(f => f.size > MAX_SIZE);

        if (oversizedFiles.length > 0) {
            setCreateError(`Certaines images sont trop volumineuses (Max 1 Mo). Veuillez les compresser.`);
            e.target.value = ''; // Reset input
            return;
        }

        setImageUploading(true);
        try {
            // Upload all files in parallel
            const uploadPromises = files.map(file => uploadFile(file));
            const urls = await Promise.all(uploadPromises);

            // Create media objects
            const newMedias = urls.map((url, index) => ({
                url: url,
                type: 'IMAGE',
                isCover: newOffer.medias.length === 0 && index === 0 // First of batch is cover if no existing media
            }));

            setNewOffer(prev => ({
                ...prev,
                medias: [...prev.medias, ...newMedias]
            }));
            setCreateError(''); // Clear previous errors
        } catch (err) {
            console.error('Upload failed:', err);
            setCreateError('Échec du téléchargement des images.');
        } finally {
            setImageUploading(false);
            // Clear input so same files can be selected again if needed
            e.target.value = '';
        }
    };
    // ... handlesetCover ...
    // ... handleRemoveImage ...
    // ... handleCreateOffer ... matches lines 244-279
    // ... handleDeleteOffer ...
    // ... stats ...
    // ... return ...
    // ... render lines ...
    <div className="form-group">
        <label>Photos</label>
        <div className="partner-media-upload">
            <div className="partner-media-preview">
                {newOffer.medias.map((media, idx) => (
                    <div key={idx} className="media-item">
                        <img src={media.url} alt={`Photo ${idx + 1}`} />
                        {media.isCover && <span className="cover-badge">Couverture</span>}
                        <div className="media-actions">
                            {!media.isCover && (
                                <button type="button" onClick={() => handleSetCover(idx)} title="Définir comme couverture">★</button>
                            )}
                            <button type="button" onClick={() => handleRemoveImage(idx)} title="Supprimer">✕</button>
                        </div>
                    </div>
                ))}
                <label className="media-upload-btn">
                    {imageUploading ? '...' : '+'}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>
            <small>Ajoutez des photos pour mettre en valeur votre offre. La première photo servira de couverture.</small>
        </div>
    </div>

    const handleSetCover = (index) => {
        setNewOffer(prev => ({
            ...prev,
            medias: prev.medias.map((m, idx) => ({
                ...m,
                isCover: idx === index
            }))
        }));
    };

    const handleRemoveImage = (index) => {
        setNewOffer(prev => ({
            ...prev,
            medias: prev.medias.filter((_, idx) => idx !== index)
        }));
    };

    const handleCreateEtablissement = async (e) => {
        e.preventDefault();
        try {
            setLoadingEtabs(true);
            // Calcul de la moyenne régénérative pour l'établissement
            // Calcul de la moyenne régénérative pour l'établissement
            const avgScore = calculateRegenScore({
                environmental: parseInt(newOffer.environmental),
                social: parseInt(newOffer.social),
                experience: parseInt(newOffer.experience)
            });
            const created = await createEtablissement({ ...newEtab, regenScore: avgScore }, user);
            setEtablissements([...etablissements, created]);
            setNewOffer(prev => ({ ...prev, etablissementId: created.id, city: created.city }));
            setShowEtabForm(false);
            setNewEtab({ name: '', address: '', city: '' });
        } catch (err) {
            console.error(err);
            setCreateError("Erreur lors de la création de l'établissement");
        } finally {
            setLoadingEtabs(false);
        }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        setCreateError('');

        // Step 1: Check establishment
        if (!newOffer.etablissementId) {
            setCreateError('Veuillez sélectionner ou créer un établissement (Lieu).');
            return;
        }

        // Validation
        if (!newOffer.title.trim() || !newOffer.description.trim() || !newOffer.price) {
            setCreateError('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        try {
            let resultDTO;
            // Extract raw ID if editing
            const rawId = isEditing ? editingId.split('_')[1] : null;
            console.log("Action:", isEditing ? "Updating" : "Creating", "Type:", newOffer.type, "RawID:", rawId);

            // Prepare data for API
            const offerData = {
                ...newOffer,
                tags: newOffer.tags
            };

            if (isEditing) {
                if (newOffer.type === 'activite') {
                    resultDTO = await updateActivite(rawId, offerData, user);
                } else {
                    resultDTO = await updateHebergement(rawId, offerData, user);
                }
                // Update local list
                setOffers(prev => prev.map(o => o.id === editingId ? mapDTOToOffer(resultDTO) : o));
            } else {
                if (newOffer.type === 'activite') {
                    resultDTO = await createActivite(offerData, user);
                } else {
                    resultDTO = await createHebergement(offerData, user);
                }
                setOffers([mapDTOToOffer(resultDTO), ...offers]);
            }

            setShowCreateModal(false);
            setCreateError('');
            // Reset logic moved to handleOpenCreate
        } catch (error) {
            console.error('Erreur action offre:', error);
            setCreateError(error.message || "Erreur lors de l'enregistrement de l'offre");
        }
    };

    const handleDeleteOffer = async (offerId) => {
        // Find the offer to get its title for confirmation
        const offerToDelete = offers.find(o => o.id === offerId);
        const offerTitle = offerToDelete?.title?.fr || offerToDelete?.title || 'cette offre';
        setDeleteConfirm({ isOpen: true, offerId, offerTitle });
    };

    const confirmDelete = async () => {
        const offerId = deleteConfirm.offerId;
        if (!offerId) return;

        setIsDeleting(true);
        try {
            const [type, rawId] = offerId.split('_');
            console.log("Deleting:", type, rawId);

            if (type === 'act') {
                await deleteActivite(rawId);
            } else {
                await deleteHebergement(rawId);
            }

            setOffers(prev => prev.filter(o => o.id !== offerId));
            setCreateError('');
            setDeleteConfirm({ isOpen: false, offerId: null, offerTitle: '' });
        } catch (err) {
            console.error("Erreur suppression:", err);
            // Extract the actual error message from backend response
            const errorMessage = err.response?.data?.message || err.message || "Erreur lors de la suppression de l'offre.";
            setNotice({
                isOpen: true,
                title: "Oups !",
                message: errorMessage,
                variant: "danger"
            });
            setDeleteConfirm({ isOpen: false, offerId: null, offerTitle: '' });
        } finally {
            setIsDeleting(false);
        }
    };

    const stats = {
        totalOffers: offers.length,
        activeOffers: offers.filter(o => o.available).length,
        totalViews: 0,  // TODO: Fetch from analytics API
        totalBookings: bookingsCount // Now from API
    };

    return (
        <div className="partner-dashboard">
            {/* Header */}
            <header className="partner-header">
                <div className="container">
                    <div className="partner-header__content">
                        <div className="partner-header__info">
                            <div className="partner-header__text">
                                <h1>Espace partenaire</h1>
                                <p style={{ fontSize: '1.1rem', color: '#ffffff', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                                    {new Date().toLocaleDateString(user?.profile?.language === 'en' ? 'en-GB' : 'fr-FR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="partner-header__actions">
                                <Link to="/messages" className="btn btn-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>



            {/* Stats */}
            < section className="partner-stats" >
                <div className="container">
                    <div className="partner-stats__grid">
                        <div className="partner-stat-card">
                            <span className="partner-stat-card__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                            </span>
                            <div className="partner-stat-card__content">
                                <span className="partner-stat-card__value">{stats.totalOffers}</span>
                                <span className="partner-stat-card__label">Offres totales</span>
                            </div>
                        </div>
                        <div className="partner-stat-card">
                            <span className="partner-stat-card__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </span>
                            <div className="partner-stat-card__content">
                                <span className="partner-stat-card__value">{stats.activeOffers}</span>
                                <span className="partner-stat-card__label">Offres actives</span>
                            </div>
                        </div>

                        <Link to="/partner/reservations" className="partner-stat-card clickable">
                            <span className="partner-stat-card__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </span>
                            <div className="partner-stat-card__content">
                                <span className="partner-stat-card__value">{stats.totalBookings}</span>
                                <span className="partner-stat-card__label">Réservations (Voir)</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section >

            {/* Offers List */}
            < section className="partner-offers" >
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 className="partner-offers__title" style={{ margin: 0 }}>Mes offres</h2>
                        <button className="btn btn-primary" onClick={() => {
                            setNewOffer({
                                title: '',
                                description: '',
                                type: 'hebergement',
                                category: 'nature',
                                price: '',
                                capacity: '',
                                city: '',
                                country: 'Île Maurice',
                                medias: [],
                                tags: [],
                                environmental: 50,
                                social: 50,
                                experience: 50
                            });
                            setIsEditing(false);
                            setShowCreateModal(true);
                        }}>
                            + Créer une offre
                        </button>
                    </div>

                    {offers.length === 0 ? (
                        <div className="partner-offers__empty">
                            <span className="partner-offers__empty-icon"></span>
                            <p>Vous n'avez pas encore créé d'offre.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Créer ma première offre
                            </button>
                        </div>
                    ) : (
                        <div className="partner-offers__list">
                            {offers.map(offer => (
                                <div key={offer.id} className="partner-offer-card">
                                    <div className="partner-offer-card__image">
                                        {offer.medias && offer.medias.length > 0 ? (
                                            <img src={offer.medias[0].url} alt={offer.title.fr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="partner-offer-card__placeholder" style={{ width: '100%', height: '100%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                                <span className="material-icons">image_not_supported</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="partner-offer-card__content">
                                        <div className="partner-offer-card__header">
                                            <h3><Link to={`/offer/${offer.type}/${offer.rawId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{offer.title.fr}</Link></h3>
                                            <span className={`partner-offer-card__status ${offer.available ? 'active' : 'inactive'}`}>
                                                {offer.available ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="partner-offer-card__location">
                                            {offer.location.city}, {offer.location.country}
                                        </p>
                                        <div className="partner-offer-card__meta">
                                            <span className="partner-offer-card__price">
                                                {offer.price.amount}€/{offer.price.unit === 'night' ? 'nuit' : 'pers.'}
                                            </span>
                                            <span className="partner-offer-card__score">
                                                Score: {calculateRegenScore(offer.regenScore)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="partner-offer-card__actions">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEditOffer(offer)}
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => handleDeleteOffer(offer.id)}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section >

            {/* Create Offer Modal */}
            {
                showCreateModal && (
                    <div className="partner-modal-overlay">
                        <div className="partner-modal" onClick={e => e.stopPropagation()}>
                            <div className="partner-modal__header">
                                <h2>{isEditing ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}</h2>
                                <button
                                    className="partner-modal__close"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            {createError && (
                                <div className="partner-modal__error">
                                    {createError}
                                </div>
                            )}

                            <form className="partner-modal__form" onSubmit={handleCreateOffer}>
                                <div className="form-group">
                                    <label htmlFor="title">Titre de l'offre *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={newOffer.title}
                                        onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                                        placeholder="Ex: Éco-lodge Vue Océan"
                                        required
                                    />
                                </div>

                                {/* Etablissement Selection */}
                                <div className="form-group etablissement-section">
                                    <label>Établissement (Lieu) *</label>

                                    {!showEtabForm ? (
                                        <div className="etablissement-select-row" style={{ display: 'flex', gap: '10px' }}>
                                            <select
                                                value={newOffer.etablissementId}
                                                onChange={(e) => setNewOffer({ ...newOffer, etablissementId: e.target.value })}
                                                required
                                                style={{ flex: 1 }}
                                            >
                                                <option value="">-- Sélectionner un lieu --</option>
                                                {etablissements.map(etab => (
                                                    <option key={etab.id} value={etab.id}>{etab.name} ({etab.city})</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setShowEtabForm(true)}
                                            >
                                                + Nouveau
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="new-etablissement-form">
                                            <h4>Nouvel Établissement</h4>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="Nom de l'établissement (ex: Villa Sunset)"
                                                    value={newEtab.name}
                                                    onChange={e => setNewEtab({ ...newEtab, name: e.target.value })}
                                                    required={showEtabForm}
                                                />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        placeholder="Ville"
                                                        value={newEtab.city}
                                                        onChange={e => setNewEtab({ ...newEtab, city: e.target.value })}
                                                        required={showEtabForm}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        placeholder="Adresse"
                                                        value={newEtab.address}
                                                        onChange={e => setNewEtab({ ...newEtab, address: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handleCreateEtablissement}
                                                    disabled={loadingEtabs || !newEtab.name || !newEtab.city}
                                                >
                                                    {loadingEtabs ? '...' : 'Enregistrer le lieu'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => setShowEtabForm(false)}
                                                    disabled={etablissements.length === 0} // Can't cancel if no etabs exist
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="type">Type {isEditing && <small>(Non modifiable)</small>}</label>
                                        <select
                                            id="type"
                                            value={newOffer.type}
                                            onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value })}
                                            disabled={isEditing}
                                            style={isEditing ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                                        >
                                            <option value="hebergement">Hébergement</option>
                                            <option value="activite">Activité</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="category">Catégorie</label>
                                        <select
                                            id="category"
                                            value={newOffer.category}
                                            onChange={(e) => setNewOffer({ ...newOffer, category: e.target.value })}
                                        >
                                            <option value="nature">Nature</option>
                                            <option value="culture">Culture</option>
                                            <option value="social">Social</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tags Configuration */}
                                <div className="form-group compact-form-group">
                                    <label>Tags (Spécialités, Équipements...)</label>
                                    <TagSelector
                                        selectedTags={newOffer.tags}
                                        onChange={(updatedTags) => setNewOffer(prev => ({ ...prev, tags: updatedTags }))}
                                    />
                                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                                        Sélectionnez des tags existants ou créez-en de nouveaux.
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description *</label>
                                    <textarea
                                        id="description"
                                        value={newOffer.description}
                                        onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                        placeholder="Décrivez votre offre..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">Ville *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            value={newOffer.city}
                                            onChange={(e) => setNewOffer({ ...newOffer, city: e.target.value })}
                                            placeholder="Ex: Grand Baie"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="country">Pays</label>
                                        <input
                                            type="text"
                                            id="country"
                                            value={newOffer.country}
                                            onChange={(e) => setNewOffer({ ...newOffer, country: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="price">Prix (€) *</label>
                                        <input
                                            type="number"
                                            id="price"
                                            value={newOffer.price}
                                            onChange={(e) => setNewOffer({ ...newOffer, price: e.target.value })}
                                            placeholder="120"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="capacity">Capacité max</label>
                                        <input
                                            type="number"
                                            id="capacity"
                                            value={newOffer.capacity}
                                            onChange={(e) => setNewOffer({ ...newOffer, capacity: e.target.value })}
                                            min="1"
                                            max="50"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Score Régénératif</label>
                                    <div className="regen-score-inputs">
                                        <div className="regen-score-input">
                                            <label>Environnement</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={newOffer.environmental}
                                                onChange={(e) => setNewOffer({ ...newOffer, environmental: e.target.value })}
                                                style={{ '--value': `${newOffer.environmental}%` }}
                                            />
                                            <span>{newOffer.environmental}%</span>
                                        </div>
                                        <div className="regen-score-input">
                                            <label>Social</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={newOffer.social}
                                                onChange={(e) => setNewOffer({ ...newOffer, social: e.target.value })}
                                                style={{ '--value': `${newOffer.social}%` }}
                                            />
                                            <span>{newOffer.social}%</span>
                                        </div>
                                        <div className="regen-score-input">
                                            <label>Expérience</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={newOffer.experience}
                                                onChange={(e) => setNewOffer({ ...newOffer, experience: e.target.value })}
                                                style={{ '--value': `${newOffer.experience}%` }}
                                            />
                                            <span>{newOffer.experience}%</span>
                                        </div>
                                    </div>
                                    <div className="regen-score-average-info" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', color: '#2e7d32', border: '1px solid #c8e6c9' }}>
                                        Moyenne régénérative : {calculateRegenScore({
                                            environmental: parseInt(newOffer.environmental),
                                            social: parseInt(newOffer.social),
                                            experience: parseInt(newOffer.experience)
                                        })}%
                                    </div>
                                </div>

                                {/* Image Upload Section */}
                                <div className="form-group">
                                    <label>Photos</label>
                                    <div className="partner-media-upload">
                                        <div className="partner-media-preview">
                                            {newOffer.medias.map((media, idx) => (
                                                <div key={idx} className="media-item">
                                                    <img src={media.url} alt={`Photo ${idx + 1}`} />
                                                    {media.isCover && <span className="cover-badge">Couverture</span>}
                                                    <div className="media-actions">
                                                        {!media.isCover && (
                                                            <button type="button" onClick={() => handleSetCover(idx)} title="Définir comme couverture">★</button>
                                                        )}
                                                        <button type="button" onClick={() => handleRemoveImage(idx)} title="Supprimer">✕</button>
                                                    </div>
                                                </div>
                                            ))}
                                            <label className="media-upload-btn">
                                                {imageUploading ? '...' : '+'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    disabled={imageUploading}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        </div>
                                        <small>Ajoutez des photos pour mettre en valeur votre offre. La première photo servira de couverture.</small>
                                    </div>
                                </div>

                                <div className="partner-modal__actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={imageUploading}>
                                        {isEditing ? 'Mettre à jour' : 'Créer l\'offre'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                title="Supprimer l'offre"
                message={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm.offerTitle}" ?`}
                confirmText="Supprimer"
                cancelText="Annuler"
                confirmVariant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, offerId: null, offerTitle: '' })}
                isLoading={isDeleting}
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
        </div >
    );
};

export default PartnerDashboard;
