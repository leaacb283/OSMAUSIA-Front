import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { setLanguage } from '../i18n';
import './Layout.css';

const Layout = () => {
    const { t, i18n } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setUserMenuOpen(false);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        setLanguage(newLang);
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="layout">
            {/* Header */}
            <header className="header glass">
                <div className="header-container container">
                    {/* Logo */}
                    <Link to="/" className="logo" onClick={closeMobileMenu}>
                        <span className="logo-icon">🌿</span>
                        <span className="logo-text">{t('common.appName')}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            {t('nav.home')}
                        </NavLink>
                        <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            {t('nav.explore')}
                        </NavLink>
                        <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            {t('nav.about')}
                        </NavLink>
                    </nav>

                    {/* Actions */}
                    <div className="header-actions">
                        {/* Language Toggle */}
                        <button
                            className="action-btn"
                            onClick={toggleLanguage}
                            aria-label="Change language"
                            title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'}
                        >
                            {i18n.language === 'fr' ? '🇬🇧' : '🇫🇷'}
                        </button>

                        {/* Theme Toggle */}
                        <button
                            className="action-btn"
                            onClick={toggleTheme}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            title={isDark ? 'Mode clair' : 'Mode sombre'}
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        {/* Auth Buttons or User Menu */}
                        {isAuthenticated ? (
                            <div className="user-menu-container">
                                <button
                                    className="user-menu-trigger"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    aria-expanded={userMenuOpen}
                                >
                                    <span className="user-avatar">
                                        {user?.profile?.firstName?.[0] || user?.profile?.companyName?.[0] || '?'}
                                    </span>
                                    <span className="user-name">
                                        {user?.profile?.firstName || user?.profile?.companyName}
                                    </span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>

                                {userMenuOpen && (
                                    <div className="user-menu">
                                        <Link to="/dashboard" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                                            {t('nav.dashboard')}
                                        </Link>
                                        <Link to="/preferences" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                                            {t('nav.preferences')}
                                        </Link>
                                        <hr className="user-menu-divider" />
                                        <button className="user-menu-item logout" onClick={handleLogout}>
                                            {t('nav.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-ghost btn-sm">
                                    {t('nav.login')}
                                </Link>
                                <Link to="/register/traveler" className="btn btn-primary btn-sm">
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className={`nav-mobile ${mobileMenuOpen ? 'open' : ''}`}>
                    <NavLink to="/" className="nav-mobile-link" onClick={closeMobileMenu}>
                        {t('nav.home')}
                    </NavLink>
                    <NavLink to="/explore" className="nav-mobile-link" onClick={closeMobileMenu}>
                        {t('nav.explore')}
                    </NavLink>
                    <NavLink to="/about" className="nav-mobile-link" onClick={closeMobileMenu}>
                        {t('nav.about')}
                    </NavLink>

                    {isAuthenticated ? (
                        <>
                            <NavLink to="/dashboard" className="nav-mobile-link" onClick={closeMobileMenu}>
                                {t('nav.dashboard')}
                            </NavLink>
                            <NavLink to="/preferences" className="nav-mobile-link" onClick={closeMobileMenu}>
                                {t('nav.preferences')}
                            </NavLink>
                            <button className="nav-mobile-link logout" onClick={handleLogout}>
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="nav-mobile-link" onClick={closeMobileMenu}>
                                {t('nav.login')}
                            </NavLink>
                            <NavLink to="/register/traveler" className="nav-mobile-link highlight" onClick={closeMobileMenu}>
                                {t('nav.register')}
                            </NavLink>
                        </>
                    )}
                </nav>
            </header>

            {/* Main Content */}
            <main className="main">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        {/* About */}
                        <div className="footer-section">
                            <div className="footer-logo">
                                <span className="logo-icon">🌿</span>
                                <span className="logo-text">{t('common.appName')}</span>
                            </div>
                            <p className="footer-about">{t('footer.aboutText')}</p>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-section">
                            <h4>{t('footer.quickLinks')}</h4>
                            <ul>
                                <li><Link to="/explore">{t('nav.explore')}</Link></li>
                                <li><Link to="/about">{t('nav.about')}</Link></li>
                                <li><Link to="/contact">{t('nav.contact')}</Link></li>
                                <li><Link to="/faq">{t('footer.faq')}</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="footer-section">
                            <h4>{t('footer.legal')}</h4>
                            <ul>
                                <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
                                <li><Link to="/terms">{t('footer.terms')}</Link></li>
                                <li><Link to="/cookies">{t('footer.cookies')}</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="footer-section">
                            <h4>{t('footer.contact')}</h4>
                            <ul>
                                <li><a href="mailto:contact@osmausia.com">contact@osmausia.com</a></li>
                                <li><Link to="/support">{t('footer.support')}</Link></li>
                                <li><Link to="/press">{t('footer.press')}</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>{t('footer.copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
