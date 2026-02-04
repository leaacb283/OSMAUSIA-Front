import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { setLanguage } from '../i18n';
import { getUnreadCount } from '../services/messagingService';
import CookieConsent from './CookieConsent';
import './Layout.css';

const Layout = () => {
    const { t, i18n } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread messages count
    useEffect(() => {
        if (isAuthenticated) {
            const fetchUnread = async () => {
                const count = await getUnreadCount();
                setUnreadCount(count);
            };
            fetchUnread();
            // Refresh every 30 seconds
            const interval = setInterval(fetchUnread, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // Listen for message updates (read status changes)
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleMessageUpdate = () => {
            getUnreadCount().then(count => setUnreadCount(count));
        };

        window.addEventListener('osmausia:messages-updated', handleMessageUpdate);
        return () => window.removeEventListener('osmausia:messages-updated', handleMessageUpdate);
    }, [isAuthenticated]);

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
                        <img src={`${import.meta.env.BASE_URL}/images/osmausia-logo.png`} alt="OSMAUSIA" className="logo-img" />
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            <span style={{ marginLeft: '5px', fontSize: '0.8rem' }}>{i18n.language.toUpperCase()}</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            className="action-btn"
                            onClick={toggleTheme}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            title={isDark ? 'Mode clair' : 'Mode sombre'}
                        >
                            {isDark ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                            )}
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
                                        {user?.profile?.firstName?.[0] || user?.profile?.companyName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                                    </span>
                                    <span className="user-name">
                                        {user?.profile?.firstName || user?.profile?.companyName || user?.email?.split('@')[0]}
                                    </span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>

                                {userMenuOpen && (
                                    <div className="user-menu">
                                        <Link to={user?.role === 'partner' ? '/partner/dashboard' : '/dashboard'} className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                                            {t('nav.dashboard')}
                                        </Link>
                                        <Link to="/profile" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                                            Profil
                                        </Link>
                                        <Link to="/messages" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                                            Messages
                                            {unreadCount > 0 && (
                                                <span className="unread-badge">{unreadCount}</span>
                                            )}
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
                            <NavLink to={user?.role === 'partner' ? '/partner/dashboard' : '/dashboard'} className="nav-mobile-link" onClick={closeMobileMenu}>
                                {t('nav.dashboard')}
                            </NavLink>
                            <NavLink to="/messages" className="nav-mobile-link" onClick={closeMobileMenu}>
                                Messages
                            </NavLink>
                            <NavLink to="/profile" className="nav-mobile-link" onClick={closeMobileMenu}>
                                Profil
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
                                <li><Link to="/terms">{t('footer.terms')}</Link></li>
                                <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
                                <li><Link to="/legal">{t('footer.legal')}</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="footer-section">
                            <h4>{t('footer.contact')}</h4>
                            <ul>
                                <li><a href="mailto:contact@osmausia.com">contact@osmausia.com</a></li>
                                <li><Link to="/contact">Formulaire de contact</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>{t('footer.copyright')}</p>
                    </div>
                </div>
            </footer>
            <CookieConsent />
        </div>
    );
};

export default Layout;
