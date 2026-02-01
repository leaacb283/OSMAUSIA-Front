import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    const loadScripts = () => {
        if (window.cookies_loaded) return;

        console.log('🍪 Consentement accordé : Chargement des scripts tiers (GA, Pixel...)');

        // Exemple Google Analytics (à décommenter et configurer)
        /*
        const script = document.createElement('script');
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX";
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
        */

        window.cookies_loaded = true;
    };

    useEffect(() => {
        const consent = localStorage.getItem('osmausia-cookie-consent');
        if (!consent) {
            // Show after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        } else if (consent === 'accepted') {
            loadScripts();
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('osmausia-cookie-consent', 'accepted');
        setIsVisible(false);
        loadScripts();
    };

    const handleRequiredOnly = () => {
        localStorage.setItem('osmausia-cookie-consent', 'required');
        setIsVisible(false);
        // Si des scripts étaient chargés, il faudrait idéalement recharger la page
        // window.location.reload(); 
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent">
            <div className="cookie-consent__content">
                <div className="cookie-consent__text">
                    <h3>🍪 Nous respectons votre vie privée</h3>
                    <p>
                        Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic.
                        <br />
                        Vous pouvez choisir de tout accepter ou de n'utiliser que les cookies essentiels.
                    </p>
                    <Link to="/cookies" className="cookie-consent__link">
                        En savoir plus
                    </Link>
                </div>
                <div className="cookie-consent__actions">
                    <button
                        className="btn btn-outline btn-sm cookie-btn"
                        onClick={handleRequiredOnly}
                    >
                        Essentiels seulement
                    </button>
                    <button
                        className="btn btn-primary btn-sm cookie-btn"
                        onClick={handleAccept}
                    >
                        Tout accepter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
