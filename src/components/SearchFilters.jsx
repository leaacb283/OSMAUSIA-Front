/**
 * SearchFilters - Simplified filtering component for search results
 * Filters by price range and regen score only
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SearchFilters.css';

const SearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
    const { t } = useTranslation();

    const [filters, setFilters] = useState({
        priceMin: initialFilters.priceMin || '',
        priceMax: initialFilters.priceMax || '',
        regenScoreMin: initialFilters.regenScoreMin || 0,
    });

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only send non-empty filters
            const activeFilters = {};
            if (filters.priceMin) activeFilters.priceMin = Number(filters.priceMin);
            if (filters.priceMax) activeFilters.priceMax = Number(filters.priceMax);
            if (filters.regenScoreMin > 0) activeFilters.regenScoreMin = Number(filters.regenScoreMin);

            onFiltersChange(activeFilters);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters, onFiltersChange]);

    const clearFilters = () => {
        setFilters({
            priceMin: '',
            priceMax: '',
            regenScoreMin: 0,
        });
    };

    const activeCount = [
        filters.priceMin,
        filters.priceMax,
        filters.regenScoreMin > 0
    ].filter(Boolean).length;

    return (
        <div className="search-filters search-filters--expanded">
            <div className="search-filters__content">
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

                {/* Regen Score - Segmented Buttons */}
                <div className="search-filters__group">
                    <label className="search-filters__label">Score régénératif</label>
                    <div className="search-filters__segments">
                        {[
                            { value: 0, label: 'Tous' },
                            { value: 20, label: '20+' },
                            { value: 40, label: '40+' },
                            { value: 60, label: '60+' },
                            { value: 80, label: '80+' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`search-filters__segment ${filters.regenScoreMin === option.value ? 'search-filters__segment--active' : ''
                                    }`}
                                onClick={() => setFilters(prev => ({ ...prev, regenScoreMin: option.value }))}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;
