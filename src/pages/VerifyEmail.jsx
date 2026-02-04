import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { verifyEmailAPI } from '../services/authService';
import './Auth.css';

const VerifyEmail = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (!token) {
            setError('Token de vérification manquant.');
            return;
        }

        setLoading(true);
        setStarted(true);
        setError('');

        try {
            await verifyEmailAPI(token);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Le lien de vérification a expiré ou est invalide.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-form-section">
                    <div className="auth-form-wrapper">
                        {/* Header */}
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <span className="logo-text">OSMAUSIA</span>
                            </Link>
                            <h1 className="auth-title">Vérification de compte</h1>
                        </div>

                        {!started ? (
                            <div className="auth-manual-trigger" style={{ textAlign: 'center' }}>
                                <p style={{ marginBottom: 'var(--space-6)' }}>
                                    Cliquez sur le bouton ci-dessous pour finaliser l'activation de votre compte OSMAUSIA.
                                </p>
                                <button
                                    onClick={handleVerify}
                                    className="btn btn-primary btn-lg"
                                    style={{ width: '100%' }}
                                    disabled={!token}
                                >
                                    Activer mon compte
                                </button>
                                {!token && (
                                    <p style={{ color: 'var(--error)', marginTop: 'var(--space-2)', fontSize: '0.8rem' }}>
                                        Lien d'activation invalide.
                                    </p>
                                )}
                            </div>
                        ) : loading ? (
                            <div className="auth-loading-state" style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
                                <div className="spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
                                <p>Vérification de votre compte en cours...</p>
                            </div>
                        ) : success ? (
                            <div className="auth-success" style={{ textAlign: 'center' }}>
                                <h2>Compte activé</h2>
                                <p style={{ marginBottom: 'var(--space-6)' }}>
                                    Félicitations, votre compte a été vérifié avec succès.
                                    Vous pouvez maintenant vous connecter et profiter de l'expérience OSMAUSIA.
                                </p>
                                <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                    Se connecter
                                </Link>
                            </div>
                        ) : (
                            <div className="auth-error-state" style={{ textAlign: 'center' }}>
                                <h2 style={{ color: 'var(--error)' }}>Échec de la vérification</h2>
                                <p style={{ marginBottom: 'var(--space-6)' }}>
                                    {error}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    <button onClick={() => setStarted(false)} className="btn btn-primary" style={{ width: '100%' }}>
                                        Réessayer
                                    </button>
                                    <Link to="/" className="btn btn-ghost" style={{ width: '100%' }}>
                                        Retour à l'accueil
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Visual Section */}
                <div className="auth-visual-section">
                    <div className="auth-visual-content">
                        <h2>Voyagez en conscience</h2>
                        <p>
                            Votre compte est la porte d'entrée vers une nouvelle façon de découvrir le monde.
                            Merci de nous aider à construire un tourisme plus régénératif.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
