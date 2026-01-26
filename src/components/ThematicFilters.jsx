import { useTranslation } from 'react-i18next';
import './ThematicFilters.css';

const ThematicFilters = ({ activeFilter, onFilterChange }) => {
    const { t } = useTranslation();

    const filters = [
        {
            id: 'nature',
            label: t('home.filterNature'),
            icon: '',
            color: 'nature',
            description: 'Écotourisme, randonnées, biodiversité'
        },
        {
            id: 'social',
            label: t('home.filterSocial'),
            icon: '',
            color: 'social',
            description: 'Communautés locales, commerce équitable'
        },
        {
            id: 'culture',
            label: t('home.filterCulture'),
            icon: '',
            color: 'culture',
            description: 'Artisanat, gastronomie, traditions'
        }
    ];

    return (
        <div className="thematic-filters">
            <h3 className="thematic-filters__title">{t('home.filtersTitle')}</h3>

            <div className="thematic-filters__grid">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        className={`thematic-filter thematic-filter--${filter.color} ${activeFilter === filter.id ? 'active' : ''
                            }`}
                        onClick={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
                        aria-pressed={activeFilter === filter.id}
                    >
                        <span className="thematic-filter__icon">{filter.icon}</span>
                        <span className="thematic-filter__label">{filter.label}</span>
                        <span className="thematic-filter__description">{filter.description}</span>

                        {/* Decorative elements */}
                        <div className="thematic-filter__glow" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThematicFilters;
