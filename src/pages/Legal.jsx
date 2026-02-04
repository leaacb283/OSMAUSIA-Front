import React from 'react';
import './CGU.css';

const Legal = () => {
    return (
        <div className="cgu">
            <div className="container">
                <header className="cgu-header">
                    <h1>Mentions Légales</h1>
                    <p>Dernière mise à jour : 1er février 2026</p>
                </header>

                <div className="cgu-content">
                    <section className="cgu-section">
                        <h2>1. Éditeur du Site</h2>
                        <p>
                            Le site osmausia.com est édité par l'entreprise OSMAUSIA, enregistrée en France.
                        </p>
                        <p>
                            <strong>Siège social :</strong> Rouen, France.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>2. Directeur de la Publication</h2>
                        <p>Le directeur de la publication est le représentant légal de OSMAUSIA.</p>
                    </section>

                    <section className="cgu-section">
                        <h2>3. Hébergement</h2>
                        <p>
                            Le site est hébergé par Infomaniak, dont le siège social est situé à Genève, Suisse.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>4. Propriété Intellectuelle</h2>
                        <p>
                            La structure générale du site, ainsi que les textes, graphiques, images, sons et vidéos la composant,
                            sont la propriété de l'éditeur ou de ses partenaires. Toute représentation et/ou reproduction
                            partielle ou totale des contenus sans autorisation préalable est interdite.
                        </p>
                    </section>

                    <footer className="cgu-footer">
                        <p>© 2026 OSMAUSIA. Tous droits réservés.</p>
                        <p>Contact : contact@osmausia.com | Rouen, France</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Legal;
