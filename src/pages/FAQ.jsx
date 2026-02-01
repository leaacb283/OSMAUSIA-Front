import React, { useState } from 'react';
import './FAQ.css';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`faq-item ${isOpen ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                {question}
                <span className="faq-toggle-icon">▼</span>
            </div>
            <div className="faq-answer">
                <p>{answer}</p>
            </div>
        </div>
    );
};

const FAQ = () => {
    const categories = [
        {
            title: "Concept OSMAUSIA",
            items: [
                {
                    question: "C'est quoi le tourisme régénératif ?",
                    answer: "Contrairement au tourisme durable qui vise à minimiser l'impact négatif, le tourisme régénératif va plus loin : il cherche à laisser un lieu dans un meilleur état qu'on ne l'a trouvé, en restaurant activement la nature et en soutenant les économies locales."
                },
                {
                    question: "Comment est calculé le Regen Score ?",
                    answer: "Il est basé sur trois piliers : l'impact environnemental (gestions des déchets, énergie), l'impact social (salaires justes, approvisionnement local) et la qualité de l'expérience vécue par le voyageur."
                }
            ]
        },
        {
            title: "Réservations & Paiements",
            items: [
                {
                    question: "Comment puis-je annuler une réservation ?",
                    answer: "Vous pouvez annuler directement depuis votre 'Tableau de bord'. Les conditions d'annulation (remboursement total ou partiel) dépendent de la politique spécifique de chaque partenaire affichée lors de la réservation."
                },
                {
                    question: "Les paiements sont-ils sécurisés ?",
                    answer: "Oui, nous passons par Stripe, le leader mondial du paiement en ligne. Vos coordonnées bancaires ne transitent jamais par nos serveurs."
                }
            ]
        },
        {
            title: "Partenaires",
            items: [
                {
                    question: "Comment devenir partenaire ?",
                    answer: "Inscrivez-vous via la page 'Devenir Partenaire'. Une fois votre dossier créé, notre équipe l'examinera pour s'assurer que vos offres s'inscrivent bien dans notre charte de tourisme régénératif."
                },
                {
                    question: "Quels sont les frais de commission ?",
                    answer: "OSMAUSIA prélève une commission transparente pour assurer le fonctionnement de la plateforme et le soutien à des projets locaux. Détails disponibles dans votre espace partenaire."
                }
            ]
        }
    ];

    return (
        <div className="faq">
            <div className="container">
                <header className="faq-header">
                    <h1>Foire Aux Questions</h1>
                    <p>Tout ce que vous devez savoir pour voyager avec impact</p>
                </header>

                <div className="faq-container">
                    {categories.map((cat, idx) => (
                        <section key={idx} className="faq-category">
                            <h2>{cat.title}</h2>
                            {cat.items.map((item, i) => (
                                <FAQItem key={i} question={item.question} answer={item.answer} />
                            ))}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ;
