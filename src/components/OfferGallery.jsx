import { useState } from 'react';
import './OfferGallery.css';

/**
 * OfferGallery - Image carousel with thumbnails for offer details
 * Features: Main image with navigation, thumbnail strip, lightbox modal
 */
const OfferGallery = ({ images, title = 'Offer' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="offer-gallery offer-gallery--empty">
                <div className="offer-gallery__placeholder">
                    Aucune image disponible
                </div>
            </div>
        );
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleThumbnailClick = (index) => {
        setCurrentIndex(index);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') goToPrev();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') setShowLightbox(false);
    };

    return (
        <>
            <div className="offer-gallery">
                {/* Main Image */}
                <div className="offer-gallery__main">
                    <img
                        src={images[currentIndex]}
                        alt={`${title} - Image ${currentIndex + 1}`}
                        onClick={() => setShowLightbox(true)}
                    />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                className="offer-gallery__nav offer-gallery__nav--prev"
                                onClick={goToPrev}
                                aria-label="Image précédente"
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                className="offer-gallery__nav offer-gallery__nav--next"
                                onClick={goToNext}
                                aria-label="Image suivante"
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    <div className="offer-gallery__counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="offer-gallery__thumbnails">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                className={`offer-gallery__thumb ${idx === currentIndex ? 'active' : ''}`}
                                onClick={() => handleThumbnailClick(idx)}
                            >
                                <img src={img} alt={`Thumbnail ${idx + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {showLightbox && (
                <div
                    className="offer-gallery__lightbox"
                    onClick={() => setShowLightbox(false)}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    <button
                        className="offer-gallery__lightbox-close"
                        onClick={() => setShowLightbox(false)}
                    >
                        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 8l16 16M24 8l-16 16" />
                        </svg>
                    </button>

                    <img
                        src={images[currentIndex]}
                        alt={`${title} - Full size`}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {images.length > 1 && (
                        <>
                            <button
                                className="offer-gallery__lightbox-nav offer-gallery__lightbox-nav--prev"
                                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                            >
                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 28l-12-12 12-12" />
                                </svg>
                            </button>
                            <button
                                className="offer-gallery__lightbox-nav offer-gallery__lightbox-nav--next"
                                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            >
                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 4l12 12-12 12" />
                                </svg>
                            </button>
                        </>
                    )}

                    <div className="offer-gallery__lightbox-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
};

export default OfferGallery;
