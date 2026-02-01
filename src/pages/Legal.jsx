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
                            Le site osmausia.mu est édité par la société OSMAUSIA Ltée, société à responsabilité limitée
                            enregistrée à l'île Maurice sous le numéro BRN C12345678.
                        </p>
                        <p>
                            <strong>Siège social :</strong> Cybercity, Ebene, Maurice.
                        </p>
                    </section>

                    <section className="cgu-section">
                        <h2>2. Directeur de la Publication</h2>
                        <p>Le directeur de la publication est M. Mirac.</p>
                    </section>

                    <section className="cgu-section">
                        <h2>3. Hébergement</h2>
                        <p>
                            Le site est hébergé par DigitalOcean, dont le siège social est situé à New York, USA.
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
                        <p>© 2026 OSMAUSIA Ltée. Tous droits réservés.</p>
                        <p>Contact : hello@osmausia.mu | Port-Louis, Maurice</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Legal;
