// Password validation utilities for OSMAUSIA
// Requirements: 12+ chars, uppercase, number, special character

export const PASSWORD_REQUIREMENTS = {
    minLength: 12,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true
};

// Check individual password requirements
export const checkPasswordRequirements = (password) => {
    return {
        length: password.length >= PASSWORD_REQUIREMENTS.minLength,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
};

// Validate password meets all requirements
export const validatePassword = (password) => {
    const checks = checkPasswordRequirements(password);
    return Object.values(checks).every(Boolean);
};

// Calculate password strength (0-100)
export const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    const checks = checkPasswordRequirements(password);

    // Basic length scoring
    if (password.length >= 8) strength += 15;
    if (password.length >= 12) strength += 15;
    if (password.length >= 16) strength += 10;

    // Character variety scoring
    if (checks.uppercase) strength += 15;
    if (/[a-z]/.test(password)) strength += 10;
    if (checks.number) strength += 15;
    if (checks.special) strength += 20;

    return Math.min(strength, 100);
};

// Get password strength label
export const getPasswordStrengthLabel = (strength) => {
    if (strength < 40) return 'weak';
    if (strength < 70) return 'medium';
    return 'strong';
};

// Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number (basic international format)
export const validatePhone = (phone) => {
    // Allow formats like: +33 6 12 34 56 78, +44 7700 900123, etc.
    const phoneRegex = /^\+?[0-9\s\-]{10,20}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validate required field
export const validateRequired = (value) => {
    return value && value.trim().length > 0;
};

// Form validation helper
export const validateForm = (values, rules) => {
    const errors = {};

    Object.keys(rules).forEach(field => {
        const value = values[field];
        const fieldRules = rules[field];

        if (fieldRules.required && !validateRequired(value)) {
            errors[field] = 'Ce champ est requis';
        } else if (fieldRules.email && value && !validateEmail(value)) {
            errors[field] = 'Email invalide';
        } else if (fieldRules.phone && value && !validatePhone(value)) {
            errors[field] = 'Numéro de téléphone invalide';
        } else if (fieldRules.password && value && !validatePassword(value)) {
            errors[field] = 'Mot de passe non conforme aux exigences';
        } else if (fieldRules.confirmPassword && value !== values.password) {
            errors[field] = 'Les mots de passe ne correspondent pas';
        } else if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
            errors[field] = `Minimum ${fieldRules.minLength} caractères`;
        }
    });

    return errors;
};

export default {
    validatePassword,
    validateEmail,
    validatePhone,
    validateRequired,
    validateForm,
    checkPasswordRequirements,
    calculatePasswordStrength,
    getPasswordStrengthLabel
};
