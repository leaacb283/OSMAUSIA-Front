import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerTravelerAPI } from '../services/authService';
import {
    validatePassword,
    validateEmail,
    calculatePasswordStrength,
    getPasswordStrengthLabel,
    checkPasswordRequirements
} from '../utils/validation';
import './Auth.css';

const RegisterTraveler = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        language: 'fr',
        terms: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const passwordStrength = calculatePasswordStrength(formData.password);
    const passwordLevel = getPasswordStrengthLabel(passwordStrength);
    const passwordChecks = checkPasswordRequirements(formData.password);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Le prénom est requis';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Le nom est requis';
        }
        if (!validateEmail(formData.email)) {
            newErrors.email = 'Email invalide';
        }
        if (!validatePassword(formData.password)) {
            newErrors.password = t('auth.passwordRequirements');
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        if (!formData.terms) {
            newErrors.terms = 'Vous devez accepter les conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            // Appeler l'API d'inscription
            await registerTravelerAPI(formData);

            // Afficher le message de succès au lieu de connecter automatiquement
            setSuccess(true);

        } catch (error) {
            console.error('Register error:', error);

            let errorMessage = 'Erreur lors de l\'inscription';

            if (error.data?.message) {
                errorMessage = error.data.message;
            } else if (error.data?.fieldErrors?.length > 0) {
                errorMessage = error.data.fieldErrors.map(e => e.message).join('. ');
            } else if (error.status === 409) {
                errorMessage = 'Cet email est déjà utilisé';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setErrors({ submit: errorMessage });
        }

        setLoading(false);
    };

    // Afficher le message de succès
    if (success) {
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
                            </div>

                            <div className="auth-success">
                                <span className="auth-success-icon">📧</span>
                                <h2>Inscription réussie !</h2>
                                <p>
                                    Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
                                    <br /><br />
                                    Veuillez cliquer sur le lien dans l'email pour activer votre compte avant de vous connecter.
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: 'var(--space-6)' }}
                            >
                                Aller à la connexion
                            </Link>
                        </div>
                    </div>

                    <div className="auth-visual-section">
                        <div className="auth-visual-content">
                            <div className="auth-visual-icon">✉️</div>
                            <h2>Vérifiez votre boîte mail</h2>
                            <p>Pensez à vérifier vos spams si vous ne trouvez pas l'email.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Form */}
                <div className="auth-form-section">
                    <div className="auth-form-wrapper">
                        {/* Header */}
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <span className="logo-icon">🌿</span>
                                <span className="logo-text">OSMAUSIA</span>
                            </Link>
                            <h1 className="auth-title">{t('auth.registerTravelerTitle')}</h1>
                            <p className="auth-subtitle">{t('auth.registerTravelerSubtitle')}</p>
                        </div>

                        {/* Type Toggle */}
                        <div className="auth-type-toggle">
                            <Link to="/register/traveler" className="auth-type-btn active">
                                🧳 {t('auth.traveler')}
                            </Link>
                            <Link to="/register/partner" className="auth-type-btn">
                                🏢 {t('auth.partner')}
                            </Link>
                        </div>

                        {/* Error Message */}
                        {errors.submit && (
                            <div className="auth-error">
                                <span>⚠️</span> {errors.submit}
                            </div>
                        )}

                        {/* Form */}
                        <form className="auth-form" onSubmit={handleSubmit}>
                            {/* Name Row */}
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="firstName">{t('auth.firstName')}</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={errors.firstName ? 'error' : ''}
                                        required
                                    />
                                    {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="lastName">{t('auth.lastName')}</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={errors.lastName ? 'error' : ''}
                                        required
                                    />
                                    {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email">{t('auth.email')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('auth.emailPlaceholder')}
                                    className={errors.email ? 'error' : ''}
                                    required
                                />
                                {errors.email && <span className="form-error">{errors.email}</span>}
                            </div>

                            {/* Phone */}
                            <div className="form-group">
                                <label htmlFor="phone">{t('auth.phone')} <small>(optionnel)</small></label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+33612345678"
                                />
                                <span className="form-hint">Format: +33612345678 (sans espaces)</span>
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <label htmlFor="password">{t('auth.password')}</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={errors.password ? 'error' : ''}
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
                                {errors.password && <span className="form-error">{errors.password}</span>}
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
                                    className={errors.confirmPassword ? 'error' : ''}
                                    required
                                />
                                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                            </div>

                            {/* Language */}
                            <div className="form-group">
                                <label htmlFor="language">{t('auth.language')}</label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                >
                                    <option value="fr">{t('auth.languageFr')}</option>
                                    <option value="en">{t('auth.languageEn')}</option>
                                </select>
                            </div>

                            {/* Terms */}
                            <div className="auth-terms">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="terms"
                                        checked={formData.terms}
                                        onChange={handleChange}
                                    />
                                    {t('auth.termsAgree')} <Link to="/terms">{t('auth.termsLink')}</Link> et la <Link to="/privacy">{t('auth.privacyLink')}</Link>
                                </label>
                                {errors.terms && <span className="form-error">{errors.terms}</span>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg auth-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="auth-loading">
                                        <span className="spinner"></span>
                                        Création...
                                    </span>
                                ) : (
                                    t('auth.registerButton')
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="auth-footer">
                            <p>
                                {t('auth.alreadyAccount')}{' '}
                                <Link to="/login" className="auth-link-primary">
                                    {t('auth.loginButton')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="auth-visual-section">
                    <div className="auth-visual-content">
                        <div className="auth-visual-icon">🧳</div>
                        <h2>Devenez un voyageur régénératif</h2>
                        <p>Créez votre compte et accédez à des expériences uniques qui font la différence.</p>

                        <div className="auth-visual-stats">
                            <div className="auth-stat">
                                <span className="auth-stat-value">🌱</span>
                                <span className="auth-stat-label">Impact positif</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-value">🤝</span>
                                <span className="auth-stat-label">Communautés locales</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-value">⭐</span>
                                <span className="auth-stat-label">Expériences uniques</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterTraveler;
