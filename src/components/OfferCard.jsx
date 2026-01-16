import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RegenScore from './RegenScore';
import { calculateRegenScore } from '../data/mockOffers';
import './OfferCard.css';

const OfferCard = ({ offer, featured = false }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    const title = offer.title[lang] || offer.title.fr;
    const description = offer.description[lang] || offer.description.fr;
    const totalScore = calculateRegenScore(offer.regenScore);

    // Badge based on category
    const categoryBadges = {
        nature: { label: t('home.filterNature'), class: 'badge-nature', icon: '🌿' },
        social: { label: t('home.filterSocial'), class: 'badge-social', icon: '🤝' },
        culture: { label: t('home.filterCulture'), class: 'badge-culture', icon: '🎭' }
    };

    const badge = categoryBadges[offer.category];

    // Type label
    const typeLabels = {
        hebergement: lang === 'fr' ? 'Hébergement' : 'Accommodation',
        activite: lang === 'fr' ? 'Activité' : 'Activity'
    };

    // Price unit
    const priceUnit = offer.price.unit === 'night'
        ? t('common.perNight')
        : t('common.perPerson');

    return (
        <article className={`offer-card ${featured ? 'offer-card--featured' : ''}`}>
            {/* Image */}
            <div className="offer-card__image-container">
                <div
                    className="offer-card__image"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7)), url(${offer.images[0] || '/images/placeholder.jpg'})`
                    }}
                >
                    {/* Fallback gradient for demo */}
                    <div className="offer-card__image-fallback" data-category={offer.category} />
                </div>

                {/* Category Badge */}
                <span className={`offer-card__badge ${badge.class}`}>
                    {badge.icon} {badge.label}
                </span>

                {/* RegenScore */}
                <div className="offer-card__score">
                    <RegenScore
                        environmental={offer.regenScore.environmental}
                        social={offer.regenScore.social}
                        experience={offer.regenScore.experience}
                        size="small"
                        showLabel={false}
                    />
                </div>

                {/* Partner */}
                <div className="offer-card__partner">
                    {offer.partnerName}
                </div>
            </div>

            {/* Content */}
            <div className="offer-card__content">
                <div className="offer-card__type">{typeLabels[offer.type]}</div>

                <h3 className="offer-card__title">{title}</h3>

                <p className="offer-card__location">
                    📍 {offer.location.city}, {offer.location.country}
                </p>

                <p className="offer-card__description">{description}</p>

                {/* Tags */}
                <div className="offer-card__tags">
                    {offer.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="offer-card__tag">
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Footer */}
                <div className="offer-card__footer">
                    <div className="offer-card__price">
                        <span className="offer-card__price-from">{t('common.from')}</span>
                        <span className="offer-card__price-amount">
                            {offer.price.amount}€
                        </span>
                        <span className="offer-card__price-unit">{priceUnit}</span>
                    </div>

                    <Link to={`/offers/${offer.id}`} className="btn btn-primary btn-sm">
                        {t('common.viewMore')}
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default OfferCard;
