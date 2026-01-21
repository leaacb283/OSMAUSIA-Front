import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPasswordAPI } from '../services/authService';
import './Auth.css';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await forgotPasswordAPI(email);
            setSuccess(true);
        } catch (err) {
            // On affiche toujours succès pour ne pas révéler si l'email existe
            setSuccess(true);
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-form-section">
                    <div className="auth-form-wrapper">
                        {/* Header */}
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <span className="logo-icon">🌿</span>
                                <span className="logo-text">OSMAUSIA</span>
                            </Link>
                            <h1 className="auth-title">Mot de passe oublié</h1>
                            <p className="auth-subtitle">
                                Entrez votre email pour recevoir un lien de réinitialisation
                            </p>
                        </div>

                        {success ? (
                            <div className="auth-success">
                                <span className="auth-success-icon">📧</span>
                                <h2>Email envoyé !</h2>
                                <p>
                                    Si un compte existe avec cette adresse, vous recevrez un email
                                    avec les instructions pour réinitialiser votre mot de passe.
                                </p>
                                <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-6)' }}>
                                    Retour à la connexion
                                </Link>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="auth-error">
                                        <span>⚠️</span> {error}
                                    </div>
                                )}

                                <form className="auth-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="votre@email.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg auth-submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="auth-loading">
                                                <span className="spinner"></span>
                                                Envoi...
                                            </span>
                                        ) : (
                                            'Envoyer le lien'
                                        )}
                                    </button>
                                </form>

                                <div className="auth-footer">
                                    <p>
                                        <Link to="/login" className="auth-link-primary">
                                            ← Retour à la connexion
                                        </Link>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Visual Section */}
                <div className="auth-visual-section">
                    <div className="auth-visual-content">
                        <div className="auth-visual-icon">🔐</div>
                        <h2>Sécurité avant tout</h2>
                        <p>
                            Nous prenons la sécurité de votre compte très au sérieux.
                            Le lien de réinitialisation expire après 24 heures.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
