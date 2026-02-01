import React from 'react';
import './CGU.css'; // Reusing the same professional layout

const Privacy = () => {
    return (
        <div className="cgu">
            <div className="container">
                <header className="cgu-header">
                    <h1>Politique de Confidentialité</h1>
                    <p>Dernière mise à jour : 1er février 2026</p>
                </header>

                <div className="cgu-content">
                    <section className="cgu-section">
                        <h2>1. Introduction</h2>
                        <p>
                            La protection de vos données personnelles est une priorité pour OSMAUSIA. Cette politique détaille comment nous collectons, utilisons et protégeons vos informations dans le cadre de nos services de tourisme régénératif.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>2. Données collectées</h2>
                        <p>Nous collectons les informations suivantes :</p>
                        <ul className="cgu-list">
                            <li><strong>Identité :</strong> Nom, prénom, date de naissance.</li>
                            <li><strong>Contact :</strong> Adresse email, numéro de téléphone.</li>
                            <li><strong>Réservation :</strong> Historique des séjours, préférences de voyage.</li>
                            <li><strong>Paiement :</strong> Informations de facturation (traitées de manière sécurisée par Stripe).</li>
                        </ul>
                    </section>

                    <section className="cgu-section">
                        <h2>3. Utilisation des données</h2>
                        <p>Vos données sont utilisées pour :</p>
                        <ul className="cgu-list">
                            <li>Gérer vos réservations et paiements.</li>
                            <li>Calculer et afficher votre impact régénératif.</li>
                            <li>Assurer la communication entre voyageurs et partenaires.</li>
                            <li>Améliorer nos services grâce à des analyses anonymisées.</li>
                        </ul>
                    </section>

                    <section className="cgu-section">
                        <h2>4. Partage des données</h2>
                        <p>
                            Vos informations ne sont partagées qu'avec les partenaires (hébergeurs/guides) concernés par vos réservations. Nous ne vendons jamais vos données à des tiers.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>5. Vos droits (RGPD)</h2>
                        <p>
                            Conformément aux lois sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits depuis votre espace "Centre de préférences" ou en nous contactant.
                        </p>
                    </section>

                    <section className="cgu-section" id="cookies">
                        <h2>6. Politique des Cookies</h2>
                        <p>
                            Nous utilisons des cookies pour améliorer votre expérience. Un cookie est un petit fichier texte déposé sur votre terminal.
                        </p>
                        <ul className="cgu-list">
                            <li><strong>Cookies Essentiels :</strong> Nécessaires à la connexion et à la sécurité.</li>
                            <li><strong>Cookies de Fonctionnalité :</strong> Mémorisent vos préférences (langue, filtres).</li>
                            <li><strong>Cookies Analytiques :</strong> Nous aident à améliorer le site (anonymisé).</li>
                        </ul>
                        <p>
                            Vous pouvez gérer vos préférences via notre bannière de cookies ou les réglages de votre navigateur.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>7. Sécurité</h2>
                        <p>
                            Nous utilisons des protocoles de chiffrement standards (SSL/TLS) pour protéger vos données lors de leur transmission et de leur stockage.
                        </p>
                    </section>

                    <footer className="cgu-footer">
                        <p>© 2026 OSMAUSIA Ltée. Tous droits réservés.</p>
                        <p>Contact : hello@osmausia.mu</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
