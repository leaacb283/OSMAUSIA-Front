import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ComingSoon.css';

const ComingSoon = ({ title = "Bientôt disponible", message = "Nous construisons une expérience régénératrice pour vous." }) => {
    const navigate = useNavigate();

    return (
        <div className="coming-soon">
            <div className="coming-soon__content container">
                <h1 className="coming-soon__title">{title}</h1>
                <p className="coming-soon__message">{message}</p>

                <div className="coming-soon__actions">
                    <button onClick={() => navigate('/')} className="btn btn-primary btn-lg">
                        Retour à l'accueil
                    </button>
                    <button onClick={() => navigate('/explore')} className="btn btn-secondary btn-lg" style={{ marginLeft: '1rem' }}>
                        Explorer les offres
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
