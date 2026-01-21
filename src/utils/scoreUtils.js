/**
 * Calcule le score régénératif global à partir des sous-scores
 * @param {Object} scores - Objet contenant les scores { environmental, social, experience }
 * @returns {number} Score moyen arrondi
 */
export const calculateRegenScore = (scores) => {
    if (!scores) return 0;
    const { environmental = 0, social = 0, experience = 0 } = scores;
    return Math.round((environmental + social + experience) / 3);
};
