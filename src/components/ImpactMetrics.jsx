import { useTranslation } from 'react-i18next';
import './ImpactMetrics.css';

const ImpactMetrics = ({ impact, showDetails = false, available = true }) => {
    const { t } = useTranslation();

    // Sample impact data structure
    const metrics = [
        {
            id: 'co2',
            icon: '🌱',
            value: impact?.co2Saved || 0,
            label: t('dashboard.co2Saved'),
            color: 'nature',
            suffix: 'kg'
        },
        {
            id: 'local',
            icon: '💚',
            value: impact?.localSpend || 0,
            label: t('dashboard.localSpend'),
            color: 'primary',
            suffix: '€'
        },
        {
            id: 'communities',
            icon: '🤝',
            value: impact?.communitiesSupported || 0,
            label: t('dashboard.communitiesSupported'),
            color: 'social'
        },
        {
            id: 'trees',
            icon: '🌳',
            value: impact?.treesPlanted || 0,
            label: t('dashboard.treesPlanted'),
            color: 'nature'
        }
    ];

    if (!available) {
        return (
            <div className="impact-metrics impact-metrics--unavailable">
                <div className="impact-metrics__unavailable">
                    <span className="impact-metrics__unavailable-icon"></span>
                    <p className="impact-metrics__unavailable-text">
                        {t('dashboard.impactAvailable')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`impact-metrics ${showDetails ? 'impact-metrics--detailed' : ''}`}>
            <div className="impact-metrics__grid">
                {metrics.map((metric) => (
                    <div
                        key={metric.id}
                        className={`impact-metric impact-metric--${metric.color}`}
                    >
                        <span className="impact-metric__icon">{metric.icon}</span>
                        <div className="impact-metric__content">
                            <span className="impact-metric__value">
                                {metric.value.toLocaleString()}
                                {metric.suffix && <small>{metric.suffix}</small>}
                            </span>
                            <span className="impact-metric__label">{metric.label}</span>
                        </div>

                        {/* Animated background */}
                        <div className="impact-metric__bg" />
                    </div>
                ))}
            </div>

            {/* Total Impact Score */}
            {showDetails && (
                <div className="impact-metrics__summary">
                    <div className="impact-metrics__total">
                        <span className="impact-metrics__total-label">{t('dashboard.impactTitle')}</span>
                        <div className="impact-metrics__total-score">
                            <span className="impact-metrics__total-value">
                                {calculateImpactScore(impact)}
                            </span>
                            <span className="impact-metrics__total-max">/100</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="impact-metrics__progress">
                        <div
                            className="impact-metrics__progress-bar"
                            style={{ width: `${calculateImpactScore(impact)}%` }}
                        />
                    </div>

                    <p className="impact-metrics__encouragement">
                        {getEncouragementMessage(calculateImpactScore(impact))}
                    </p>
                </div>
            )}
        </div>
    );
};

// Calculate overall impact score (0-100)
const calculateImpactScore = (impact) => {
    if (!impact) return 0;

    // Simple scoring based on activity
    let score = 0;

    if (impact.co2Saved > 0) score += Math.min(25, impact.co2Saved / 10);
    if (impact.localSpend > 0) score += Math.min(25, impact.localSpend / 100);
    if (impact.communitiesSupported > 0) score += Math.min(25, impact.communitiesSupported * 5);
    if (impact.treesPlanted > 0) score += Math.min(25, impact.treesPlanted * 5);

    return Math.round(Math.min(100, score));
};

// Get encouragement message based on score
const getEncouragementMessage = (score) => {
    if (score >= 80) return "🌟 Vous êtes un champion du tourisme régénératif !";
    if (score >= 50) return "🌱 Bel impact ! Continuez sur cette lancée.";
    if (score >= 20) return "🚀 Bon début ! Chaque voyage compte.";
    return "🌍 Commencez votre aventure régénérative !";
};

export default ImpactMetrics;
