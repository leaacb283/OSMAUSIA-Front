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
                            <span className="about-card__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                                </svg>
                            </span>
                            <h3>Restaurer la Nature</h3>
                            <p>Nous privilégions des partenaires engagés dans la préservation des lagons, des forêts endémiques et de la biodiversité mauricienne.</p>
                        </div>
                        <div className="about-card">
                            <span className="about-card__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                                </svg>
                            </span>
                            <h3>Soutenir le Local</h3>
                            <p>Chaque réservation sur notre plateforme injecte directement des revenus dans l'économie locale et les communautés villageoises.</p>
                        </div>
                        <div className="about-card">
                            <span className="about-card__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            </span>
                            <h3>Éveiller les Consciences</h3>
                            <p>Nous transformons le voyageur en acteur du changement grâce à une transparence totale sur son impact réel (Regen Score).</p>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <h2>Pourquoi OSMAUSIA ?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginTop: '4rem' }}>
                        <div>
                            <img src={`${import.meta.env.BASE_URL}/images/hero/le-morne-aerial.png`} alt="Vue aérienne du Morne Maurice" style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
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
            </div >
        </div >
    );
};

export default About;
