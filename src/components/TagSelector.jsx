import { useState, useEffect } from 'react';
import { getTags } from '../services/offerService';
import './TagSelector.css';

const TagSelector = ({ selectedTags = [], onChange }) => {
    const [availableTags, setAvailableTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tags = await getTags();
                setAvailableTags(tags || []);
            } catch (error) {
                console.error("Failed to load tags:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTags();
    }, []);

    const handleSelectTag = (tag) => {
        if (!selectedTags.some(t => t.id === tag.id || t.label === tag.label)) {
            // Store full tag object if possible, or minimal object
            onChange([...selectedTags, tag]);
        }
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const handleRemoveTag = (indexToRemove) => {
        onChange(selectedTags.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If valid tag in input and not selected, add it
            // Only allow custom tags if no match? Or always allow custom?
            // User requested "Select Tags (Creation)" so priority is selection.
            // Let's allow custom if it doesn't exist in available
            const trimmed = searchTerm.trim();
            if (trimmed) {
                const existing = availableTags.find(t => t.label.toLowerCase() === trimmed.toLowerCase());
                if (existing) {
                    handleSelectTag(existing);
                } else {
                    // Custom tag
                    handleSelectTag({ label: trimmed, isCustom: true });
                }
            }
        }
    };

    const filteredTags = availableTags.filter(tag =>
        tag.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTags.some(selected => selected.label === tag.label)
    );

    return (
        <div className="tag-selector">
            <div className="tag-selector__selected">
                {selectedTags.map((tag, index) => (
                    <span key={index} className={`tag-chip ${tag.category ? `tag-chip--${tag.category.toLowerCase()}` : ''}`}>
                        {tag.iconUrl && <span className="material-icons tag-chip__icon">{tag.iconUrl}</span>}
                        {tag.label}
                        <button type="button" onClick={() => handleRemoveTag(index)}>×</button>
                    </span>
                ))}
            </div>

            <div className="tag-selector__input-wrapper">
                <input
                    type="text"
                    placeholder="Rechercher ou ajouter un tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    // On blur handling is tricky with click, often better to use click outside listener or timeout
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleKeyDown}
                    className="tag-selector__input"
                />

                {showSuggestions && searchTerm && (
                    <ul className="tag-selector__suggestions">
                        {loading && <li className="tag-suggestion loading">Chargement...</li>}

                        {!loading && filteredTags.length > 0 && filteredTags.map(tag => (
                            <li
                                key={tag.id}
                                className="tag-suggestion"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur
                                    handleSelectTag(tag);
                                }}
                            >
                                {tag.iconUrl && <span className="material-icons">{tag.iconUrl}</span>}
                                <span>{tag.label}</span>
                                {tag.category && <span className="tag-suggestion__cat">{tag.category}</span>}
                            </li>
                        ))}

                        {!loading && filteredTags.length === 0 && searchTerm && (
                            <li className="tag-suggestion no-results">
                                Appuyez sur Entrée pour ajouter "{searchTerm}"
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* Quick access to common categories if input is empty */}
            {!searchTerm && (
                <div className="tag-selector__quick-add">
                    <small>Suggestions : </small>
                    {availableTags.filter(t => !selectedTags.some(s => s.label === t.label)).slice(0, 5).map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            className="tag-quick-btn"
                            onClick={() => handleSelectTag(tag)}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagSelector;
