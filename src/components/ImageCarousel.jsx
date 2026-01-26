import { useState, useEffect } from 'react';
import './ImageCarousel.css';

/**
 * ImageCarousel - Display rotating images for hero/explore sections
 * @param {string[]} images - Array of image paths
 * @param {number} interval - Transition interval in ms (default 5000)
 * @param {string} className - Additional CSS class
 */
const ImageCarousel = ({ images, interval = 5000, className = '' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
                setIsTransitioning(false);
            }, 500); // Half the transition time
        }, interval);

        return () => clearInterval(timer);
    }, [images, interval]);

    const goToSlide = (index) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 300);
    };

    return (
        <div className={`image-carousel ${className}`}>
            {/* Images */}
            <div className="carousel__slides">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`carousel__slide ${index === currentIndex ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ))}
            </div>

            {/* Dots */}
            {images.length > 1 && (
                <div className="carousel__dots">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`carousel__dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
