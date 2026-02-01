import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                // Redirect based on role
                if (result.user.role === 'admin') {
                    navigate('/admin');
                } else if (result.user.role === 'partner') {
                    navigate('/partner/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                // Afficher directement le message d'erreur (déjà en français depuis l'API)
                setError(result.error || 'Identifiants incorrects');
            }
        } catch (err) {
            console.error('Login unexpected error:', err);
            setError('Une erreur inattendue est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Form */}
                <div className="auth-form-section">
                    <div className="auth-form-wrapper">
                        {/* Header */}
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <span className="logo-text">OSMAUSIA</span>
                            </Link>
                            <h1 className="auth-title">{t('auth.loginTitle')}</h1>
                            <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form className="auth-form" onSubmit={handleSubmit}>
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
                                    required
                                    autoComplete="email"
                                />
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
                                    placeholder={t('auth.passwordPlaceholder')}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="form-row">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                    />
                                    <span className="checkbox-custom"></span>
                                    {t('auth.rememberMe')}
                                </label>
                                <Link to="/forgot-password" className="auth-link">
                                    {t('auth.forgotPassword')}
                                </Link>
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
                                        Connexion...
                                    </span>
                                ) : (
                                    t('auth.loginButton')
                                )}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="auth-footer">
                            <p>
                                {t('auth.noAccount')}{' '}
                                <Link to="/register/traveler" className="auth-link-primary">
                                    {t('auth.createAccount')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="auth-visual-section">
                    <div className="auth-visual-content">
                        <div className="auth-visual-icon"></div>
                        <h2>Voyagez avec impact</h2>
                        <p>Découvrez des expériences authentiques qui régénèrent les communautés et l'environnement.</p>

                        <div className="auth-visual-stats">
                            <div className="auth-stat">
                                <span className="auth-stat-value">5000+</span>
                                <span className="auth-stat-label">Voyageurs engagés</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-value">150+</span>
                                <span className="auth-stat-label">Partenaires certifiés</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-value">12T</span>
                                <span className="auth-stat-label">CO₂ compensé</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
