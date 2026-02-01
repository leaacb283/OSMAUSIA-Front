import React from 'react';
import './CGU.css';

const CGU = () => {
    return (
        <div className="cgu">
            <div className="container">
                <header className="cgu-header">
                    <h1>Conditions Générales d'Utilisation</h1>
                    <p>Dernière mise à jour : 1er février 2026</p>
                </header>

                <div className="cgu-content">
                    <section className="cgu-section">
                        <h2>1. Objet</h2>
                        <p>
                            Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions dans lesquelles l'entreprise OSMAUSIA met à la disposition de ses utilisateurs son site internet et les services disponibles sur celui-ci.
                        </p>
                        <p>
                            En accédant au site OSMAUSIA, l'utilisateur accepte sans réserve les présentes CGU.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>2. Définitions</h2>
                        <ul className="cgu-list">
                            <li><strong>Utilisateur :</strong> Toute personne accédant au site, qu'elle soit simple visiteur, voyageur ou partenaire.</li>
                            <li><strong>Plateforme :</strong> Le site internet osmausia.mu et ses services associés.</li>
                            <li><strong>Offre :</strong> Tout hébergement ou activité proposé par un Partenaire sur la Plateforme.</li>
                            <li><strong>Régénératif :</strong> Concept de tourisme visant non seulement à préserver mais à restaurer activement les écosystèmes et les communautés locales.</li>
                        </ul>
                    </section>

                    <section className="cgu-section">
                        <h2>3. Services OSMAUSIA</h2>
                        <p>
                            OSMAUSIA est une plateforme de mise en relation entre des voyageurs conscients et des prestataires mauriciens proposant des expériences de tourisme régénératif.
                        </p>
                        <p>
                            Nos services incluent :
                        </p>
                        <ul className="cgu-list">
                            <li>La consultation des offres d'hébergements et d'activités.</li>
                            <li>Le système de réservation en ligne.</li>
                            <li>La gestion des paiements via notre partenaire Stripe.</li>
                            <li>Le calcul du "Regen Score" pour chaque offre.</li>
                        </ul>
                    </section>

                    <section className="cgu-section">
                        <h2>4. Inscription et Sécurité</h2>
                        <p>
                            Pour bénéficier de certains services (réservation, mise en favoris), l'utilisateur doit créer un compte. Il s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>5. Réservations et Paiements</h2>
                        <p>
                            Toute réservation effectuée sur la plateforme vaut engagement. Les modalités de paiement sont gérées par Stripe. En cas d'annulation, les conditions spécifiques de l'offre s'appliquent.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>6. Responsabilité</h2>
                        <p>
                            OSMAUSIA agit en tant qu'intermédiaire. Nous nous efforçons de garantir la qualité des partenaires, mais nous ne saurions être tenus responsables des litiges survenant directement entre le voyageur et le partenaire lors de l'exécution de la prestation.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>7. Propriété Intellectuelle</h2>
                        <p>
                            Tous les éléments du site OSMAUSIA (logos, textes, designs) sont protégés par le droit d'auteur. Toute reproduction sans accord préalable est strictement interdite.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>8. Droit Applicable</h2>
                        <p>
                            Les présentes CGU sont régies par le droit mauricien. En cas de litige, les tribunaux de Port-Louis seront seuls compétents.
                        </p>
                    </section>

                    <footer className="cgu-footer">
                        <p>© 2026 OSMAUSIA Ltée. Tous droits réservés.</p>
                        <p>Contact : hello@osmausia.mu | Port-Louis, Maurice</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default CGU;
