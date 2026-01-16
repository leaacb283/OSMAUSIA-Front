import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { setLanguage } from '../i18n';
import './Preferences.css';

const Preferences = () => {
    const { t, i18n } = useTranslation();
    const { user, isAuthenticated, loading, updatePreferences, logout } = useAuth();

    const [preferences, setPreferences] = useState(user?.preferences || {
        newsletter: true,
        notifications: true,
        dataSharing: false
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return (
            <div className="preferences-loading">
                <span className="spinner"></span>
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    const handleToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        setSaved(false);
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleSave = async () => {
        setSaving(true);
        await updatePreferences(preferences);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleDownloadData = () => {
        // Create a JSON file with user data
        const data = JSON.stringify(user, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `osmausia-data-${user.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteAccount = () => {
        // In real app, this would call an API
        logout();
    };

    return (
        <div className="preferences">
            <div className="container">
                {/* Header */}
                <header className="preferences-header">
                    <h1>{t('preferences.title')}</h1>
                    <p>{t('preferences.subtitle')}</p>
                </header>

                {/* Save Success */}
                {saved && (
                    <div className="preferences-saved">
                        ✓ Préférences enregistrées avec succès
                    </div>
                )}

                {/* Personal Info Section */}
                <section className="preferences-section">
                    <h2>
                        <span className="preferences-section__icon">👤</span>
                        {t('preferences.personalInfo')}
                    </h2>

                    <div className="preferences-card">
                        <div className="preferences-info-grid">
                            <div className="preferences-info-item">
                                <label>Nom complet</label>
                                <span>{user.profile?.firstName} {user.profile?.lastName}</span>
                            </div>
                            <div className="preferences-info-item">
                                <label>Email</label>
                                <span>{user.email}</span>
                            </div>
                            <div className="preferences-info-item">
                                <label>Téléphone</label>
                                <span>{user.profile?.phone || '-'}</span>
                            </div>
                            <div className="preferences-info-item">
                                <label>Membre depuis</label>
                                <span>
                                    {new Date(user.profile?.createdAt).toLocaleDateString(
                                        i18n.language === 'fr' ? 'fr-FR' : 'en-GB',
                                        { month: 'long', year: 'numeric' }
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="preferences-language">
                            <label htmlFor="language">{t('auth.language')}</label>
                            <select
                                id="language"
                                value={i18n.language}
                                onChange={handleLanguageChange}
                            >
                                <option value="fr">🇫🇷 Français</option>
                                <option value="en">🇬🇧 English</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="preferences-section">
                    <h2>
                        <span className="preferences-section__icon">🔔</span>
                        {t('preferences.notifications')}
                    </h2>

                    <div className="preferences-card">
                        <div className="preferences-toggle">
                            <div className="preferences-toggle__info">
                                <span className="preferences-toggle__label">
                                    {t('preferences.newsletterLabel')}
                                </span>
                                <span className="preferences-toggle__description">
                                    {t('preferences.newsletterDescription')}
                                </span>
                            </div>
                            <button
                                className={`toggle-switch ${preferences.newsletter ? 'active' : ''}`}
                                onClick={() => handleToggle('newsletter')}
                                aria-pressed={preferences.newsletter}
                            >
                                <span className="toggle-switch__slider" />
                            </button>
                        </div>

                        <div className="preferences-toggle">
                            <div className="preferences-toggle__info">
                                <span className="preferences-toggle__label">
                                    {t('preferences.notificationsLabel')}
                                </span>
                                <span className="preferences-toggle__description">
                                    {t('preferences.notificationsDescription')}
                                </span>
                            </div>
                            <button
                                className={`toggle-switch ${preferences.notifications ? 'active' : ''}`}
                                onClick={() => handleToggle('notifications')}
                                aria-pressed={preferences.notifications}
                            >
                                <span className="toggle-switch__slider" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Privacy Section */}
                <section className="preferences-section">
                    <h2>
                        <span className="preferences-section__icon">🔒</span>
                        {t('preferences.privacy')}
                    </h2>

                    <div className="preferences-card">
                        <div className="preferences-toggle">
                            <div className="preferences-toggle__info">
                                <span className="preferences-toggle__label">
                                    {t('preferences.dataSharingLabel')}
                                </span>
                                <span className="preferences-toggle__description">
                                    {t('preferences.dataSharingDescription')}
                                </span>
                            </div>
                            <button
                                className={`toggle-switch ${preferences.dataSharing ? 'active' : ''}`}
                                onClick={() => handleToggle('dataSharing')}
                                aria-pressed={preferences.dataSharing}
                            >
                                <span className="toggle-switch__slider" />
                            </button>
                        </div>

                        <div className="preferences-actions-row">
                            <button
                                className="btn btn-secondary"
                                onClick={handleDownloadData}
                            >
                                📥 {t('preferences.downloadData')}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="preferences-section preferences-section--danger">
                    <h2>
                        <span className="preferences-section__icon">⚠️</span>
                        Zone dangereuse
                    </h2>

                    <div className="preferences-card preferences-card--danger">
                        <p className="preferences-danger-text">
                            {t('preferences.deleteWarning')}
                        </p>
                        <button
                            className="btn btn-danger"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            🗑️ {t('preferences.deleteAccount')}
                        </button>
                    </div>
                </section>

                {/* Save Button */}
                <div className="preferences-save">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <span className="auth-loading">
                                <span className="spinner"></span>
                                Enregistrement...
                            </span>
                        ) : (
                            <>💾 {t('common.save')}</>
                        )}
                    </button>
                </div>

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3>Supprimer votre compte ?</h3>
                            <p>
                                Cette action est irréversible. Toutes vos données, réservations
                                et historique seront définitivement supprimés.
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDeleteAccount}
                                >
                                    Supprimer définitivement
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Preferences;
