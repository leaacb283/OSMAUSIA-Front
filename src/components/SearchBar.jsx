import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SearchBar.css';

const SearchBar = ({ onSearch, variant = 'hero' }) => {
    const { t } = useTranslation();
    const [destination, setDestination] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.({
            destination,
            checkIn,
            checkOut,
            guests
        });
    };

    // Get tomorrow's date for min check-in
    const getTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <form className={`search-bar search-bar--${variant}`} onSubmit={handleSubmit}>
            {/* Destination */}
            <div className="search-bar__field search-bar__field--destination">
                <label htmlFor="destination" className="search-bar__label">
                    <span className="search-bar__icon"></span>
                    {t('home.searchPlaceholder').split('?')[0]}
                </label>
                <input
                    type="text"
                    id="destination"
                    className="search-bar__input"
                    placeholder={t('home.searchPlaceholder')}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
            </div>

            {/* Divider */}
            <div className="search-bar__divider" />

            {/* Check-in Date */}
            <div className="search-bar__field search-bar__field--date">
                <label htmlFor="check-in" className="search-bar__label">
                    <span className="search-bar__icon"></span>
                    {t('home.searchDate')}
                </label>
                <input
                    type="date"
                    id="check-in"
                    className="search-bar__input"
                    value={checkIn}
                    min={getTomorrow()}
                    onChange={(e) => setCheckIn(e.target.value)}
                />
            </div>

            {/* Divider */}
            <div className="search-bar__divider" />

            {/* Check-out Date */}
            <div className="search-bar__field search-bar__field--date">
                <label htmlFor="check-out" className="search-bar__label">
                    <span className="search-bar__icon"></span>
                    {t('home.searchDate')}
                </label>
                <input
                    type="date"
                    id="check-out"
                    className="search-bar__input"
                    value={checkOut}
                    min={checkIn || getTomorrow()}
                    onChange={(e) => setCheckOut(e.target.value)}
                />
            </div>

            {/* Divider */}
            <div className="search-bar__divider" />

            {/* Guests */}
            <div className="search-bar__field search-bar__field--guests">
                <label htmlFor="guests" className="search-bar__label">
                    <span className="search-bar__icon"></span>
                    {t('home.searchGuests')}
                </label>
                <div className="search-bar__guests-control">
                    <button
                        type="button"
                        className="search-bar__guests-btn"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        aria-label="Decrease guests"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        id="guests"
                        className="search-bar__input search-bar__guests-input"
                        value={guests}
                        min={1}
                        max={20}
                        onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                    />
                    <button
                        type="button"
                        className="search-bar__guests-btn"
                        onClick={() => setGuests(Math.min(20, guests + 1))}
                        aria-label="Increase guests"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Search Button */}
            <button type="submit" className="search-bar__submit btn btn-primary">
                <span className="search-bar__submit-icon"></span>
                <span className="search-bar__submit-text">{t('home.searchButton')}</span>
            </button>
        </form>
    );
};

export default SearchBar;
