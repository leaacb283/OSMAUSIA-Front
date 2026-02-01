import { useState } from 'react';
import './OfferGallery.css';

/**
 * OfferGallery - Adaptive Image Grid
 * Reference: Airbnb / Modern Booking sites
 */
const OfferGallery = ({ images, title = 'Offer' }) => {
    const [showLightbox, setShowLightbox] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setShowLightbox(true);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) {
        return <div className="offer-gallery--empty">Aucune image</div>;
    }

    const count = images.length;

    // Helper to render image button
    const renderImg = (index, className = "") => (
        <img
            src={images[index]}
            alt={title}
            className={`gallery-img ${className}`}
            onClick={() => openLightbox(index)}
        />
    );

    return (
        <>
            <div className={`offer-gallery-container count-${count}`}>
                {/* 5+ Images: Full Bento Grid */}
                {count >= 5 && (
                    <div className="gallery-grid gallery-grid-5">
                        <div className="gallery-main-col">
                            {renderImg(0, "gallery-img-main")}
                        </div>
                        <div className="gallery-sub-col">
                            {renderImg(1)}
                            {renderImg(2, "gallery-img-tr")}
                            {renderImg(3)}
                            {renderImg(4, "gallery-img-br")}
                        </div>
                    </div>
                )}

                {/* 4 Images: 1 Main + 3 Stacked (Custom Grid) or just Show 4 in 2x2? 
                    Let's do 1 Main (Left 60%) + 3 Right (Stacked).
                */}
                {count === 4 && (
                    <div className="gallery-grid gallery-grid-4">
                        <div className="gallery-main-col" style={{ width: '60%' }}>
                            {renderImg(0, "gallery-img-main")}
                        </div>
                        <div className="gallery-sub-col-vertical" style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>{renderImg(1, "gallery-img-tr")}</div>
                            <div style={{ flex: 1, position: 'relative' }}>{renderImg(2)}</div>
                            <div style={{ flex: 1, position: 'relative' }}>{renderImg(3, "gallery-img-br")}</div>
                        </div>
                    </div>
                )}

                {/* 3 Images: 1 Main (Left) + 2 Stacked (Right) */}
                {count === 3 && (
                    <div className="gallery-grid gallery-grid-3">
                        <div className="gallery-main-col" style={{ flex: 2 }}>
                            {renderImg(0, "gallery-img-main")}
                        </div>
                        <div className="gallery-sub-col-vertical" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>{renderImg(1, "gallery-img-tr")}</div>
                            <div style={{ flex: 1, position: 'relative' }}>{renderImg(2, "gallery-img-br")}</div>
                        </div>
                    </div>
                )}

                {/* 2 Images: 50/50 Split */}
                {count === 2 && (
                    <div className="gallery-grid gallery-grid-2" style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>{renderImg(0, "gallery-img-main gallery-img-l")}</div>
                        <div style={{ flex: 1, position: 'relative' }}>{renderImg(1, "gallery-img-r")}</div>
                    </div>
                )}

                {/* 1 Image: Full Width */}
                {count === 1 && (
                    <div className="gallery-single">
                        {renderImg(0, "gallery-img-single")}
                    </div>
                )}

                <button className="btn-show-all" onClick={() => openLightbox(0)}>
                    <span className="material-icons" style={{ fontSize: '16px' }}>grid_view</span>
                    Voir photos
                </button>
            </div>

            {/* Lightbox Modal */}
            {showLightbox && (
                <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
                    <button className="lightbox-close" onClick={() => setShowLightbox(false)}>×</button>

                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-nav prev" onClick={prevImage}>‹</button>
                        <img src={images[currentIndex]} alt={`View ${currentIndex + 1}`} />
                        <button className="lightbox-nav next" onClick={nextImage}>›</button>

                        <div className="lightbox-counter">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OfferGallery;
