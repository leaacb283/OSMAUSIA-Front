import { useTranslation } from 'react-i18next';
import { calculateRegenScore } from '../utils/scoreUtils';
import './RegenScore.css';

const RegenScore = ({
    environmental,
    social,
    experience,
    size = 'medium',
    showDetails = false,
    showLabel = true
}) => {
    const { t } = useTranslation();

    const totalScore = calculateRegenScore({ environmental, social, experience });

    // Calculate stroke dasharray for circular progress
    const radius = size === 'small' ? 20 : size === 'large' ? 45 : 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (totalScore / 100) * circumference;

    // Get score level
    const getScoreLevel = (score) => {
        if (score >= 80) return { label: t('regenScore.excellent'), className: 'excellent' };
        if (score >= 60) return { label: t('regenScore.good'), className: 'good' };
        return { label: t('regenScore.average'), className: 'average' };
    };

    const scoreLevel = getScoreLevel(totalScore);

    return (
        <div className={`regen-score regen-score--${size}`}>
            {/* Circular Score Display */}
            <div className={`regen-score__circle ${scoreLevel.className}`}>
                <svg viewBox={`0 0 ${(radius + 6) * 2} ${(radius + 6) * 2}`}>
                    {/* Background circle */}
                    <circle
                        className="regen-score__bg"
                        cx={radius + 6}
                        cy={radius + 6}
                        r={radius}
                        fill="none"
                        strokeWidth={size === 'small' ? 3 : 5}
                    />
                    {/* Progress circle */}
                    <circle
                        className="regen-score__progress"
                        cx={radius + 6}
                        cy={radius + 6}
                        r={radius}
                        fill="none"
                        strokeWidth={size === 'small' ? 3 : 5}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(-90 ${radius + 6} ${radius + 6})`}
                    />
                </svg>
                <div className="regen-score__value">
                    <span className="regen-score__number">{totalScore}</span>
                    {size !== 'small' && <span className="regen-score__max">/100</span>}
                </div>
            </div>

            {/* Label */}
            {showLabel && size !== 'small' && (
                <div className="regen-score__label">
                    <span className={`regen-score__level ${scoreLevel.className}`}>
                        {scoreLevel.label}
                    </span>
                    {size === 'large' && (
                        <span className="regen-score__title">{t('regenScore.title')}</span>
                    )}
                </div>
            )}

            {/* Detailed breakdown */}
            {showDetails && (
                <div className="regen-score__details">
                    <div className="regen-score__detail">
                        <span className="regen-score__detail-label">
                            🌱 {t('regenScore.environmental')}
                        </span>
                        <div className="regen-score__detail-bar">
                            <div
                                className="regen-score__detail-fill environmental"
                                style={{ width: `${environmental}%` }}
                            />
                        </div>
                        <span className="regen-score__detail-value">{environmental}</span>
                    </div>

                    <div className="regen-score__detail">
                        <span className="regen-score__detail-label">
                            🤝 {t('regenScore.social')}
                        </span>
                        <div className="regen-score__detail-bar">
                            <div
                                className="regen-score__detail-fill social"
                                style={{ width: `${social}%` }}
                            />
                        </div>
                        <span className="regen-score__detail-value">{social}</span>
                    </div>

                    <div className="regen-score__detail">
                        <span className="regen-score__detail-label">
                            ⭐ {t('regenScore.experience')}
                        </span>
                        <div className="regen-score__detail-bar">
                            <div
                                className="regen-score__detail-fill experience"
                                style={{ width: `${experience}%` }}
                            />
                        </div>
                        <span className="regen-score__detail-value">{experience}</span>
                    </div>

                    {/* Formula display */}
                    <div className="regen-score__formula">
                        <span>= ({environmental} × 0.4) + ({social} × 0.3) + ({experience} × 0.3)</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegenScore;
