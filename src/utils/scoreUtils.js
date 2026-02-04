/**
 * Calcule le score régénératif global à partir des sous-scores
 * @param {Object} scores - Objet contenant les scores { environmental, social, experience }
 * @returns {number} Score moyen arrondi
 */
export const calculateRegenScore = (scores) => {
    if (!scores) return 0;
    const { environmental = 0, social = 0, experience = 0 } = scores;
    // Formule pondérée : 40% Environnement, 30% Social, 30% Expérience
    return Math.round((environmental * 0.4) + (social * 0.3) + (experience * 0.3));
};
