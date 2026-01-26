/**
 * SearchFilters - Advanced filtering component for search results
 * Allows filtering by price range, city, and eco tags
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SearchFilters.css';

// Tags disponibles (from backend TAG table)
const AVAILABLE_TAGS = [
    { id: 'PISCINE', label: 'Piscine', icon: '🏊' },
    { id: 'VUE_MER', label: 'Vue mer', icon: '🌊' },
    { id: 'WIFI', label: 'WiFi', icon: '📶' },
    { id: 'ECO', label: 'Éco-responsable', icon: '🌱' },
    { id: 'CUISINE', label: 'Cuisine équipée', icon: '🍳' },
    { id: 'PARKING', label: 'Parking', icon: '🅿️' },
];

const SearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const [filters, setFilters] = useState({
        city: initialFilters.city || '',
        priceMin: initialFilters.priceMin || '',
        priceMax: initialFilters.priceMax || '',
        tags: initialFilters.tags || [],
    });

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only send non-empty filters
            const activeFilters = {};
            if (filters.city) activeFilters.city = filters.city;
            if (filters.priceMin) activeFilters.priceMin = Number(filters.priceMin);
            if (filters.priceMax) activeFilters.priceMax = Number(filters.priceMax);
            if (filters.tags.length > 0) activeFilters.tags = filters.tags;

            onFiltersChange(activeFilters);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters, onFiltersChange]);

    const handleTagToggle = (tagId) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter(t => t !== tagId)
                : [...prev.tags, tagId]
        }));
    };

    const clearFilters = () => {
        setFilters({
            city: '',
            priceMin: '',
            priceMax: '',
            tags: [],
        });
    };

    const activeCount = [
        filters.city,
        filters.priceMin,
        filters.priceMax,
        filters.tags.length > 0
    ].filter(Boolean).length;

    return (
        <div className={`search-filters ${isExpanded ? 'search-filters--expanded' : ''}`}>
            <button
                className="search-filters__toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="search-filters__toggle-icon">⚙️</span>
                <span>Filtres</span>
                {activeCount > 0 && (
                    <span className="search-filters__badge">{activeCount}</span>
                )}
                <span className={`search-filters__chevron ${isExpanded ? 'search-filters__chevron--up' : ''}`}>
                    ▼
                </span>
            </button>

            {isExpanded && (
                <div className="search-filters__content">
                    {/* City Filter */}
                    <div className="search-filters__group">
                        <label className="search-filters__label">Ville</label>
                        <input
                            type="text"
                            className="search-filters__input"
                            placeholder="Ex: Marseille"
                            value={filters.city}
                            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                        />
                    </div>

                    {/* Price Range */}
                    <div className="search-filters__group">
                        <label className="search-filters__label">Prix par nuit (€)</label>
                        <div className="search-filters__price-range">
                            <input
                                type="number"
                                className="search-filters__input search-filters__input--small"
                                placeholder="Min"
                                min="0"
                                value={filters.priceMin}
                                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                            />
                            <span className="search-filters__separator">—</span>
                            <input
                                type="number"
                                className="search-filters__input search-filters__input--small"
                                placeholder="Max"
                                min="0"
                                value={filters.priceMax}
                                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="search-filters__group">
                        <label className="search-filters__label">Équipements & Services</label>
                        <div className="search-filters__tags">
                            {AVAILABLE_TAGS.map(tag => (
                                <button
                                    key={tag.id}
                                    className={`search-filters__tag ${filters.tags.includes(tag.id) ? 'search-filters__tag--active' : ''}`}
                                    onClick={() => handleTagToggle(tag.id)}
                                >
                                    <span>{tag.icon}</span>
                                    <span>{tag.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {activeCount > 0 && (
                        <button className="search-filters__clear" onClick={clearFilters}>
                            ✕ Effacer les filtres
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchFilters;
