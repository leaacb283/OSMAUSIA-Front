import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <header className="about-hero">
                <div className="container">
                    <h1>Le Tourisme de Demain</h1>
                    <p>Chez OSMAUSIA, nous croyons que voyager peut restaurer le monde.</p>
                </div>
            </header>

            <div className="container about-mission">
                <section className="about-section">
                    <h2>Notre Vision</h2>
                    <p style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                        OSMAUSIA est né d'un constat simple : l'île Maurice est un paradis qui mérite plus que du tourisme durable.
                        Elle a besoin d'un tourisme régénératif qui redonne à la terre et à ses habitants.
                    </p>

                    <div className="about-cards">
                        <div className="about-card">
                            <span className="about-card__icon">🌊</span>
                            <h3>Restaurer la Nature</h3>
                            <p>Nous privilégions des partenaires engagés dans la préservation des lagons, des forêts endémiques et de la biodiversité mauricienne.</p>
                        </div>
                        <div className="about-card">
                            <span className="about-card__icon">🏠</span>
                            <h3>Soutenir le Local</h3>
                            <p>Chaque réservation sur notre plateforme injecte directement des revenus dans l'économie locale et les communautés villageoises.</p>
                        </div>
                        <div className="about-card">
                            <span className="about-card__icon">🧠</span>
                            <h3>Éveiller les Consciences</h3>
                            <p>Nous transformons le voyageur en acteur du changement grâce à une transparence totale sur son impact réel (Regen Score).</p>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <h2>Pourquoi OSMAUSIA ?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginTop: '4rem' }}>
                        <div>
                            <img src="/images/hero/le-morne-aerial.png" alt="Vue aérienne du Morne Maurice" style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-color)' }}>
                                Notre nom fusionne "OSMA" (l'équilibre) et "AUSIA" (l'écoute). Nous sommes le trait d'union entre
                                des voyageurs en quête de sens et des prestataires mauriciens qui œuvrent dans l'ombre pour leur île.
                                <br /><br />
                                Contrairement aux plateformes classiques, nous ne sommes pas seulement un site de réservation.
                                Nous sommes une communauté d'impact, un outil de mesure et un catalyseur pour un avenir plus vert.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
