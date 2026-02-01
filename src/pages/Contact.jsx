import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setSubmitted(true);
    };

    return (
        <div className="contact-page">
            <div className="container">
                <div className="contact-grid">
                    <div className="contact-info">
                        <h1>Contactez-nous</h1>
                        <p>
                            Vous avez une question sur le concept OSMAUSIA ou besoin d'aide pour une réservation ?
                            Notre équipe est là pour vous accompagner dans votre démarche régénérative.
                        </p>

                        <div className="contact-methods">
                            <div className="contact-method">
                                <div className="contact-method__icon">📧</div>
                                <div className="contact-method__content">
                                    <h3>Email</h3>
                                    <p>hello@osmausia.mu</p>
                                </div>
                            </div>
                            <div className="contact-method">
                                <div className="contact-method__icon">🏢</div>
                                <div className="contact-method__content">
                                    <h3>Siège social</h3>
                                    <p>Cybercity, Ebene, Île Maurice</p>
                                </div>
                            </div>
                            <div className="contact-method">
                                <div className="contact-method__icon">🤝</div>
                                <div className="contact-method__content">
                                    <h3>Partenariats</h3>
                                    <p>partners@osmausia.mu</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-card">
                        {submitted ? (
                            <div className="contact-success">
                                <span className="contact-success-icon">🌿</span>
                                <h2>Message envoyé !</h2>
                                <p>Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.</p>
                                <button
                                    className="btn btn-primary btn-lg"
                                    style={{ marginTop: '2rem' }}
                                    onClick={() => setSubmitted(false)}
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Nom complet</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="votre@email.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="subject">Sujet</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Sélectionnez un sujet</option>
                                        <option value="reservation">Aide à la réservation</option>
                                        <option value="partner">Devenir Partenaire</option>
                                        <option value="tech">Problème technique</option>
                                        <option value="other">Autre demande</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
