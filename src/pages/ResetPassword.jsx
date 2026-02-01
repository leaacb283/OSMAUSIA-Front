import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPasswordAPI } from '../services/authService';
import {
    validatePassword,
    calculatePasswordStrength,
    getPasswordStrengthLabel,
    checkPasswordRequirements
} from '../utils/validation';
import './Auth.css';

const ResetPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const passwordStrength = calculatePasswordStrength(formData.password);
    const passwordLevel = getPasswordStrengthLabel(passwordStrength);
    const passwordChecks = checkPasswordRequirements(formData.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!validatePassword(formData.password)) {
            setError('Le mot de passe ne respecte pas les exigences de sécurité');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (!token) {
            setError('Token de réinitialisation invalide');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPasswordAPI(token, formData.password);
            setSuccess(true);

            // Rediriger vers login après 3 secondes
            setTimeout(() => {
                navigate('/login?reset=success');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Le lien a expiré ou est invalide');
        }

        setLoading(false);
    };

    // Si pas de token dans l'URL
    if (!token) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-form-section">
                        <div className="auth-form-wrapper">
                            <div className="auth-header">
                                <Link to="/" className="auth-logo">
                                    <span className="logo-icon">🌿</span>
                                    <span className="logo-text">OSMAUSIA</span>
                                </Link>
                                <h1 className="auth-title">Lien invalide</h1>
                            </div>

                            <div className="auth-error" style={{ marginBottom: 'var(--space-6)' }}>
                                <span></span> Le lien de réinitialisation est invalide ou a expiré.
                            </div>

                            <Link to="/forgot-password" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Demander un nouveau lien
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            <h1 className="auth-title">Nouveau mot de passe</h1>
                            <p className="auth-subtitle">
                                Choisissez un nouveau mot de passe sécurisé
                            </p>
                        </div>

                        {success ? (
                            <div className="auth-success">
                                <span className="auth-success-icon"></span>
                                <h2>Mot de passe modifié !</h2>
                                <p>
                                    Votre mot de passe a été réinitialisé avec succès.
                                    Vous allez être redirigé vers la page de connexion...
                                </p>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="auth-error">
                                        <span></span> {error}
                                    </div>
                                )}

                                <form className="auth-form" onSubmit={handleSubmit}>
                                    {/* New Password */}
                                    <div className="form-group">
                                        <label htmlFor="password">Nouveau mot de passe</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        {formData.password && (
                                            <div className="password-strength">
                                                <div className="password-strength-bar">
                                                    <div className={`password-strength-fill ${passwordLevel}`} />
                                                </div>
                                                <span className="password-strength-label">
                                                    Force: {passwordLevel === 'weak' ? 'Faible' : passwordLevel === 'medium' ? 'Moyen' : 'Fort'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="form-hint">
                                            {passwordChecks.length ? '✓' : '○'} 12+ caractères |
                                            {passwordChecks.uppercase ? ' ✓' : ' ○'} Majuscule |
                                            {passwordChecks.number ? ' ✓' : ' ○'} Chiffre |
                                            {passwordChecks.special ? ' ✓' : ' ○'} Spécial
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                            <span className="form-error">Les mots de passe ne correspondent pas</span>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg auth-submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="auth-loading">
                                                <span className="spinner"></span>
                                                Modification...
                                            </span>
                                        ) : (
                                            'Réinitialiser le mot de passe'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* Visual Section */}
                <div className="auth-visual-section">
                    <div className="auth-visual-content">
                        <div className="auth-visual-icon"></div>
                        <h2>Mot de passe sécurisé</h2>
                        <p>
                            Choisissez un mot de passe unique que vous n'utilisez pas sur d'autres sites.
                            Les mots de passe forts protègent vos données.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
