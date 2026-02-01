/**
 * ConfirmModal - Custom confirmation dialog
 * Replaces native browser confirm() with a styled modal
 */

import './ConfirmModal.css';

const ConfirmModal = ({
    isOpen,
    title = 'Confirmation',
    message = 'Êtes-vous sûr de vouloir continuer ?',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    confirmVariant = 'danger', // 'danger' | 'primary' | 'warning'
    onConfirm,
    onCancel,
    isLoading = false
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onCancel();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isLoading) {
            onCancel();
        }
    };

    return (
        <div
            className="confirm-modal-overlay"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className="confirm-modal">
                <div className="confirm-modal__header">
                    <div className={`confirm-modal__icon confirm-modal__icon--${confirmVariant}`}>
                        {confirmVariant === 'danger' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        )}
                        {confirmVariant === 'warning' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        )}
                        {confirmVariant === 'primary' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                        )}
                    </div>
                    <h3 className="confirm-modal__title">{title}</h3>
                </div>

                <p className="confirm-modal__message">{message}</p>

                <div className="confirm-modal__actions">
                    {cancelText && (
                        <button
                            className="confirm-modal__btn confirm-modal__btn--cancel"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                    )}
                    {confirmText && (
                        <button
                            className={`confirm-modal__btn confirm-modal__btn--${confirmVariant}`}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="confirm-modal__spinner"></span>
                            ) : confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
