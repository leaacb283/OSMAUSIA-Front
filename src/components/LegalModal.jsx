/**
 * LegalModal - Modal popup for displaying legal content (CGU, Privacy Policy)
 * Prevents navigation away from registration forms
 */

import { useEffect } from 'react';
import './LegalModal.css';

const LegalModal = ({ isOpen, onClose, title, children }) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="legal-modal-overlay" onClick={onClose}>
            <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
                <header className="legal-modal__header">
                    <h2>{title}</h2>
                    <button className="legal-modal__close" onClick={onClose} aria-label="Fermer">
                        &times;
                    </button>
                </header>
                <div className="legal-modal__content">
                    {children}
                </div>
                <footer className="legal-modal__footer">
                    <button className="btn btn-primary" onClick={onClose}>
                        J'ai compris
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LegalModal;
